// Local-only provenance contract. Comparison snapshots never certify adaptation origins.
import { promises as fs } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VOLUMES = ['00-meta', '01-documents', '02-engineering', '03-data', '04-ai', '05-business', '06-creative', '07-productivity', '08-security', '09-verticals', '10-platform'];
const SKIP = new Set(['_template', 'INDEX', 'node_modules', 'scripts', 'assets', 'en']);
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const HASH40 = /^[a-f0-9]{40}$/;
const HASH64 = /^[a-f0-9]{64}$/;
const STATUSES = new Set(['needs-review', 'path-unresolved', 'fixed-reference', 'ambiguous-fixed-candidates', 'snapshot-unavailable']);
const fail = message => { throw new Error(`provenance 清单: ${message}`); };
const string = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function argumentsFor(argv, { writable = false } = {}) {
  let root = ROOT, write = false;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--root' && argv[index + 1]) root = path.resolve(argv[++index]);
    else if (arg.startsWith('--root=')) root = path.resolve(arg.slice(7));
    else if (writable && arg === '--write') write = true;
    else fail(`未知或缺少参数: ${arg}`);
  }
  return { root, write };
}

function safeRelative(value, label) {
  if (!string(value) || value.includes('\\') || /[\x00-\x1f:?#]/.test(value) || value.startsWith('/') || value.split('/').some(segment => !segment || segment === '.' || segment === '..'))
    fail(`${label} path 须为不含越界片段的相对 POSIX 路径`);
  return value;
}

function fixedUrl(url, repository, commit, relative, label) {
  let parsed;
  try { parsed = new URL(url); } catch { fail(`${label} url 无效`); }
  let decoded;
  try { decoded = decodeURIComponent(parsed.pathname); } catch { fail(`${label} url 编码无效`); }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com' || parsed.port || parsed.username || parsed.password || parsed.search || parsed.hash || decoded !== `/${repository}/blob/${commit}/${relative}`)
    fail(`${label} url 必须与 repository/完整 commit/path 固定对应`);
}

function validateSnapshot(snapshot, entry, label) {
  if (!object(snapshot) || !REPOSITORY.test(snapshot.repository || '')) fail(`${label} reference repository 无效`);
  if (![entry.source_repository, entry.canonical_repository].includes(snapshot.repository)) fail(`${label} reference repository 与声明来源不同`);
  if (!HASH40.test(snapshot.commit || '')) fail(`${label} reference commit 须为完整 40 位 hash`);
  if (!HASH40.test(snapshot.git_blob || '')) fail(`${label} reference git_blob 须为完整 40 位 hash`);
  if (!HASH64.test(snapshot.sha256 || '')) fail(`${label} reference sha256 须为完整 64 位 hash`);
  safeRelative(snapshot.path, `${label} reference`);
  fixedUrl(snapshot.url, snapshot.repository, snapshot.commit, snapshot.path, `${label} reference`);
  if (snapshot.reference_role !== 'reproducible-comparison-snapshot') fail(`${label} reference_role 只能表达比较快照，不能冒充 origin`);
  if (!string(snapshot.match_basis)) fail(`${label} reference match_basis 缺失`);
  if (!Array.isArray(snapshot.license_evidence) || !snapshot.license_evidence.length) fail(`${label} reference license_evidence 须为非空数组`);
  for (const [index, evidence] of snapshot.license_evidence.entries()) {
    const context = `${label} reference license_evidence[${index}]`;
    if (!object(evidence) || !HASH40.test(evidence.git_blob || '') || !HASH64.test(evidence.sha256 || '')) fail(`${context} git_blob/sha256 无效`);
    safeRelative(evidence.path, context);
    fixedUrl(evidence.url, snapshot.repository, snapshot.commit, evidence.path, context);
  }
}

export function validateManifest(manifest) {
  if (!object(manifest) || manifest.schema_version !== 1 || !Array.isArray(manifest.skills)) fail('schema_version 必须为 1，skills 必须为数组');
  const names = new Set(), paths = new Set();
  for (const entry of manifest.skills) {
    if (!object(entry) || !string(entry.name)) fail('每条记录须有 name');
    const label = entry.name;
    safeRelative(entry.local_path, `${label} local_path`);
    const parts = entry.local_path.split('/');
    if (!VOLUMES.includes(parts[0]) || parts.length < 3 || parts.at(-1) !== 'SKILL.md' || parts.at(-2) !== entry.name) fail(`${label} local_path 必须对应受控卷内的同名技能`);
    if (names.has(entry.name) || paths.has(entry.local_path)) fail(`${label} 重复 name/local_path`);
    names.add(entry.name); paths.add(entry.local_path);
    if (!HASH64.test(entry.local_sha256 || '')) fail(`${label} local_sha256 无效`);
    if (!Object.hasOwn(entry, 'declared_license') || !(entry.declared_license === null || string(entry.declared_license))) fail(`${label} declared_license 须为字符串或显式 null`);
    if (entry.kind === 'curated') {
      if (!REPOSITORY.test(entry.source_repository || '')) fail(`${label} source_repository 须为 owner/repo`);
      if (!Object.hasOwn(entry, 'declared_source_license') || !(entry.declared_source_license === null || string(entry.declared_source_license))) fail(`${label} declared_source_license 须为字符串或显式 null`);
      if (entry.origin_revision_status !== 'unrecorded' || entry.origin_commit_sha !== null) fail(`${label} origin 未记录；reference 不能提升为 verified origin`);
      if (!STATUSES.has(entry.reference_status)) fail(`${label} reference_status 未知`);
      if (entry.canonical_repository !== undefined && !REPOSITORY.test(entry.canonical_repository)) fail(`${label} canonical_repository 无效`);
      if (entry.repository_id !== undefined && (!Number.isSafeInteger(entry.repository_id) || entry.repository_id <= 0)) fail(`${label} repository_id 无效`);
      const snapshots = entry.reference_snapshots;
      if (snapshots !== undefined && !Array.isArray(snapshots)) fail(`${label} reference_snapshots 须为数组`);
      if (entry.reference_status === 'fixed-reference' && snapshots?.length !== 1) fail(`${label} fixed-reference 须有一个 reference snapshot`);
      if (entry.reference_status === 'ambiguous-fixed-candidates' && !(snapshots?.length > 1)) fail(`${label} ambiguous-fixed-candidates 须有多个 reference snapshots`);
      if (!['fixed-reference', 'ambiguous-fixed-candidates'].includes(entry.reference_status) && snapshots?.length) fail(`${label} reference_status 与 reference_snapshots 不一致`);
      for (const [index, snapshot] of (snapshots || []).entries()) validateSnapshot(snapshot, entry, `${label}[${index}]`);
    } else if (entry.kind === 'native') {
      if (entry.origin_revision_status !== 'native-repository-history') fail(`${label} native origin_revision_status 无效`);
      if (entry.source_repository !== undefined || entry.declared_source_license !== undefined || entry.reference_snapshots !== undefined || entry.origin_commit_sha !== undefined) fail(`${label} native 不得携带 curated 来源/快照/origin 字段`);
    } else fail(`${label} kind 只能是 native 或 curated`);
  }
  return manifest;
}

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}

async function manifestFile(root) {
  const realRoot = await fs.realpath(root);
  for (const relative of ['data', 'data/skill-provenance.json']) {
    const target = path.join(root, relative);
    const stat = await fs.lstat(target);
    if (stat.isSymbolicLink() || !inside(realRoot, await fs.realpath(target))) fail(`${relative} 符号链接/路径越界`);
  }
  return path.join(root, 'data/skill-provenance.json');
}

export async function loadManifest(root) {
  let raw;
  try { raw = await fs.readFile(await manifestFile(root), 'utf8'); }
  catch (error) { fail(`无法读取 manifest data/skill-provenance.json: ${error.message}`); }
  let manifest;
  try { manifest = JSON.parse(raw); } catch (error) { fail(`manifest JSON 无效: ${error.message}`); }
  return validateManifest(manifest);
}

function metadata(bytes, relative) {
  const text = bytes.toString('utf8').replace(/^\uFEFF/, '');
  const header = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!header) fail(`${relative} 缺少闭合 frontmatter`);
  const fields = {};
  for (const line of header[1].split(/\r?\n/)) {
    const match = line.match(/^(name|license|source|source_license):\s*(.*?)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    if (Object.hasOwn(fields, key)) fail(`${relative} frontmatter 重复 ${key}`);
    let value = raw;
    if (raw.startsWith('"')) {
      try { value = JSON.parse(raw); } catch { fail(`${relative} ${key} 引号无效`); }
    } else if (raw.startsWith("'")) {
      if (!raw.endsWith("'")) fail(`${relative} ${key} 引号无效`);
      value = raw.slice(1, -1).replaceAll("''", "'");
    }
    if (!string(value) || /^[\[{|>]/.test(value) || /^(null|~)$/i.test(value)) fail(`${relative} ${key} 必须为单行非空字符串`);
    fields[key] = value;
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fields.name || '') || fields.name !== relative.split('/').at(-2)) fail(`${relative} name 缺失或与目录不同`);
  const curated = fields.source !== undefined;
  if (curated && !REPOSITORY.test(fields.source)) fail(`${relative} source 须为 owner/repo`);
  return {
    name: fields.name, local_path: relative, local_sha256: createHash('sha256').update(bytes).digest('hex'),
    kind: curated ? 'curated' : 'native', declared_license: fields.license ?? null,
    ...(curated ? { source_repository: fields.source, declared_source_license: fields.source_license ?? null } : {}),
  };
}

export async function scanSkills(root) {
  const realRoot = await fs.realpath(root), entries = [], names = new Set();
  async function walk(relative) {
    const directory = path.join(root, relative);
    if ((await fs.lstat(directory)).isSymbolicLink() || !inside(realRoot, await fs.realpath(directory))) fail(`${relative} 符号链接/路径越界`);
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const child = `${relative}/${entry.name}`;
      if (entry.isSymbolicLink()) fail(`${child} 符号链接不属于正式技能源`);
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || SKIP.has(entry.name)) continue;
        try { await fs.lstat(path.join(root, child, '.git')); continue; }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
        await walk(child);
      } else if (entry.name === 'SKILL.md') {
        const record = metadata(await fs.readFile(path.join(root, child)), child);
        if (names.has(record.name)) fail(`${record.name} 实际文件 name 重复`);
        names.add(record.name); entries.push(record);
      }
    }
  }
  for (const volume of VOLUMES) await walk(volume);
  return entries.sort((a, b) => a.local_path.localeCompare(b.local_path));
}

export function compareManifest(manifest, actual) {
  const recorded = new Map(manifest.skills.map(entry => [entry.local_path, entry]));
  const issues = [];
  for (const entry of actual) {
    const old = recorded.get(entry.local_path);
    if (!old) { issues.push(`${entry.local_path}: 清单覆盖缺失`); continue; }
    recorded.delete(entry.local_path);
    for (const key of ['name', 'local_sha256', 'kind', 'declared_license', 'source_repository', 'declared_source_license'])
      if (old[key] !== entry[key]) issues.push(`${entry.local_path}: ${key} 与实际来源/frontmatter/hash 不一致`);
  }
  for (const relative of recorded.keys()) issues.push(`${relative}: 清单记录已无实际技能`);
  if (issues.length) fail(issues.join('\n'));
}

export function refreshManifest(manifest, actual) {
  const oldByName = new Map(manifest.skills.map(entry => [entry.name, entry]));
  const skills = actual.map(entry => {
    const old = oldByName.get(entry.name);
    if (old && old.kind === entry.kind && old.source_repository === entry.source_repository && old.declared_source_license === entry.declared_source_license)
      return { ...old, ...entry };
    return { ...entry, ...(entry.kind === 'curated'
      ? { origin_revision_status: 'unrecorded', origin_commit_sha: null, reference_status: 'needs-review' }
      : { origin_revision_status: 'native-repository-history' }) };
  });
  const summary = {};
  for (const entry of skills) {
    const status = entry.kind === 'native' ? 'native' : entry.reference_status;
    summary[status] = (summary[status] || 0) + 1;
  }
  return validateManifest({ ...manifest, refreshed_at: new Date().toISOString(), summary, skills });
}

export async function writeManifest(root, manifest) {
  const target = await manifestFile(root); // Recheck the destination before any mutation.
  const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporary, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
    await fs.rename(temporary, target);
  } finally { await fs.rm(temporary, { force: true }); }
}
