#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARRAY_FIELDS = ['agents', 'requires', 'related', 'combines_with', 'supersedes', 'tags', 'tools', 'triggers'];
// Keep source discovery aligned with build-index.mjs. The root template is
// inspected separately; generated/support trees are not distribution sources.
const SKIP_DIRS = new Set(['_template', 'INDEX', 'node_modules', '.git', 'scripts', 'assets', 'en']);
const MANIFEST = '.claude-plugin/marketplace.json';
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const slash = value => value.split(path.sep).join('/');

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

/** Validate installation metadata only; never execute a skill or a helper. */
export async function checkDistribution(root = DEFAULT_ROOT) {
  const errors = [];
  const counts = { volumes: 0, sourceSkills: 0, parsedSkills: 0, activeSkills: 0, deprecatedSkills: 0, templates: 0, manifestSkills: 0 };
  const activePaths = new Set();
  const manifestPaths = new Set();
  const fail = (code, file, message) => errors.push({ code, path: file, message });
  const result = () => ({ errors, counts, activePaths: [...activePaths].sort(), manifestPaths: [...manifestPaths].sort() });
  let realRoot;
  try {
    realRoot = await fs.realpath(path.resolve(root));
  } catch (error) {
    fail('ROOT', '.', `Cannot read repository root: ${error.message}`);
    return result();
  }

  async function readLocal(relative) {
    const file = path.join(realRoot, relative);
    const stat = await fs.lstat(file);
    if (!stat.isFile()) throw new Error('expected a regular file, not a directory or symbolic link');
    if (!isWithin(realRoot, await fs.realpath(file))) throw new Error('file resolves outside the repository');
    return fs.readFile(file, 'utf8');
  }

  async function readJson(relative, code) {
    try { return JSON.parse(await readLocal(relative)); }
    catch (error) { fail(code, relative, `Cannot read JSON: ${error.message}`); return null; }
  }

  const taxonomy = await readJson('taxonomy.json', 'TAXONOMY');
  if (!isObject(taxonomy) || !isObject(taxonomy.vols) || Object.keys(taxonomy.vols).length === 0) {
    if (taxonomy !== null) fail('TAXONOMY', 'taxonomy.json', 'Expected a nonempty vols object');
    return result();
  }
  const volumes = Object.keys(taxonomy.vols).sort();
  counts.volumes = volumes.length;
  const files = [];

  async function collect(relative) {
    try {
      const directory = path.join(realRoot, relative);
      const stat = await fs.lstat(directory);
      if (!stat.isDirectory() || !isWithin(realRoot, await fs.realpath(directory))) throw new Error('expected a local volume directory');
      const entries = (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) {
        const child = `${relative}/${entry.name}`;
        if (entry.isSymbolicLink()) fail('SOURCE_SCOPE', child, 'Symbolic links cannot stand in for scanned skill sources');
        else if (entry.isDirectory()) {
          if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
          try {
            // Both .git directories and worktree .git files mark a checkout.
            await fs.access(path.join(realRoot, child, '.git'));
            continue;
          } catch (error) {
            if (error.code !== 'ENOENT') {
              fail('SOURCE_READ', child, `Cannot inspect Git metadata: ${error.code || error.message}`);
              continue;
            }
          }
          await collect(child);
        }
        else if (entry.isFile() && entry.name === 'SKILL.md') files.push(child);
      }
    } catch (error) {
      fail('SOURCE_READ', relative, `Cannot scan skill sources: ${error.message}`);
    }
  }

  for (const volume of volumes) {
    if (!/^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(volume)) fail('TAXONOMY', 'taxonomy.json', `Invalid volume directory: ${volume}`);
    else await collect(volume);
  }
  counts.sourceSkills = files.length;

  async function inspect(relative, template = false) {
    let raw;
    try { raw = await readLocal(relative); }
    catch (error) { fail('SOURCE_READ', relative, `Cannot read skill: ${error.message}`); return; }
    if (template) counts.templates += 1;

    // gray-matter also has executable frontmatter engines. Accept the plain
    // YAML delimiter only, so an untrusted ---js header is never dispatched.
    if (!/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(raw)) {
      fail('FRONTMATTER', relative, 'Expected a complete YAML frontmatter block delimited by plain --- lines');
      return;
    }
    let data;
    try { data = matter(raw, { language: 'yaml' }).data; }
    catch (error) {
      const line = Number.isInteger(error.mark?.line) ? ` (frontmatter line ${error.mark.line + 1})` : '';
      fail('YAML_PARSE', relative, `${error.reason || error.message}${line}`);
      return;
    }
    if (!isObject(data)) { fail('YAML_SCHEMA', relative, 'Frontmatter must be a YAML mapping'); return; }
    counts.parsedSkills += 1;
    for (const field of ['name', 'description']) {
      if (typeof data[field] !== 'string' || data[field].trim() === '') fail('STRING_TYPE', relative, `${field} must be a nonempty string`);
    }
    for (const field of ARRAY_FIELDS) {
      if (Object.hasOwn(data, field) && (!Array.isArray(data[field]) || data[field].some(value => typeof value !== 'string'))) {
        fail('ARRAY_TYPE', relative, `${field} must be string[]`);
      }
    }
    if (Object.hasOwn(data, 'metadata') && !isObject(data.metadata)) fail('METADATA_TYPE', relative, 'metadata must be a YAML mapping');
    const internal = isObject(data.metadata) ? data.metadata.internal : undefined;
    if (internal !== undefined && typeof internal !== 'boolean') fail('INTERNAL_TYPE', relative, 'metadata.internal must be a boolean');
    const deprecated = data.status === 'deprecated';
    if (template || deprecated) {
      if (!template) counts.deprecatedSkills += 1;
      if (internal !== true) fail('INTERNAL_REQUIRED', relative, `${template ? 'The template' : 'A deprecated skill'} must set nested metadata.internal: true`);
    } else {
      counts.activeSkills += 1;
      activePaths.add(path.posix.dirname(relative));
      if (internal === true) fail('ACTIVE_HIDDEN', relative, 'An active source skill must not set metadata.internal: true');
    }
  }
  for (const file of files) await inspect(file);
  await inspect('_template/SKILL.md', true);

  const manifest = await readJson(MANIFEST, 'MANIFEST_JSON');
  if (!isObject(manifest) || !Array.isArray(manifest.plugins)) {
    if (manifest !== null) fail('MANIFEST_SCHEMA', MANIFEST, 'Expected a plugins array');
  } else {
    const pluginNames = new Set();
    for (const [index, plugin] of manifest.plugins.entries()) {
      const label = `plugins[${index}]`;
      if (!isObject(plugin)) { fail('MANIFEST_SCHEMA', MANIFEST, `${label} must be an object`); continue; }
      if (typeof plugin.name !== 'string' || !volumes.includes(plugin.name)) fail('MANIFEST_VOLUME', MANIFEST, `${label}.name must name a taxonomy volume`);
      if (pluginNames.has(plugin.name)) fail('MANIFEST_PLUGIN_DUPLICATE', MANIFEST, `Duplicate plugin: ${plugin.name}`);
      pluginNames.add(plugin.name);
      // This repository's volume manifests list paths relative to the source
      // root. A different source could make identical text install other files.
      if (typeof plugin.source !== 'string' || path.resolve(realRoot, plugin.source) !== realRoot) {
        fail('MANIFEST_SOURCE', MANIFEST, `${label}.source must resolve to this repository root`);
        continue;
      }
      if (!Array.isArray(plugin.skills)) { fail('MANIFEST_SCHEMA', MANIFEST, `${label}.skills must be an array`); continue; }
      counts.manifestSkills += plugin.skills.length;
      for (const value of plugin.skills) {
        if (typeof value !== 'string' || value.trim() === '' || /[\\\u0000-\u001f:?#]/.test(value) || path.posix.isAbsolute(value)) {
          fail('MANIFEST_PATH', MANIFEST, `${label}.skills entries must be local relative directory paths`);
          continue;
        }
        const absolute = path.resolve(realRoot, value);
        if (!isWithin(realRoot, absolute) || absolute === realRoot) { fail('MANIFEST_PATH', MANIFEST, `${label}.skills path escapes its skill scope: ${value}`); continue; }
        const relative = slash(path.relative(realRoot, absolute));
        if (manifestPaths.has(relative)) fail('MANIFEST_DUPLICATE', relative, 'Skill directory is listed more than once in the marketplace');
        manifestPaths.add(relative);
        if (!relative.startsWith(`${plugin.name}/`)) fail('MANIFEST_VOLUME', relative, `Skill directory does not belong to plugin ${plugin.name}`);
      }
    }
  }
  for (const relative of [...activePaths].sort()) {
    if (!manifestPaths.has(relative)) fail('MANIFEST_MISSING', relative, 'Active source skill is missing from marketplace plugins');
  }
  for (const relative of [...manifestPaths].sort()) {
    if (!activePaths.has(relative)) fail('MANIFEST_EXTRA', relative, 'Marketplace entry is not an active source skill');
  }
  return result();
}

async function main(args) {
  let root = DEFAULT_ROOT;
  if (args.length === 2 && args[0] === '--root') root = path.resolve(args[1]);
  else if (args.length === 1 && !args[0].startsWith('-')) root = path.resolve(args[0]);
  else if (args.length !== 0) {
    console.error('Usage: node scripts/check-skill-distribution.mjs [--root DIRECTORY]');
    return 2;
  }
  const report = await checkDistribution(root);
  console.log(`Skill distribution counts: ${JSON.stringify(report.counts)}`);
  for (const error of report.errors) console.error(`[${error.code}] ${error.path}: ${error.message}`);
  if (report.errors.length) console.error(`Skill distribution failed: ${report.errors.length} error(s).`);
  else console.log('Skill distribution passed: YAML, visibility, active sources and marketplace paths agree.');
  return report.errors.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
