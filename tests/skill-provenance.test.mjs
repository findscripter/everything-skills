import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VOLUMES = ['00-meta', '01-documents', '02-engineering', '03-data', '04-ai', '05-business', '06-creative', '07-productivity', '08-security', '09-verticals', '10-platform'];
const COMMIT = 'a'.repeat(40), BLOB = 'b'.repeat(40), SHA = 'c'.repeat(64);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function run(root, script, ...args) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), '--root', root, ...args], { encoding: 'utf8', windowsHide: true });
  if (result.error) throw result.error;
  return result;
}
const check = root => run(root, 'check-skill-provenance.mjs');
const refresh = (root, ...args) => run(root, 'refresh-skill-provenance.mjs', ...args);

async function fixture(t) {
  const temporaryDirectory = path.resolve(os.tmpdir());
  const root = await fs.mkdtemp(path.join(temporaryDirectory, 'everything-provenance-test-'));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(root)), temporaryDirectory);
    assert.match(path.basename(root), /^everything-provenance-test-/);
    await fs.rm(root, { recursive: true, force: true });
  });
  for (const volume of VOLUMES) await fs.mkdir(path.join(root, volume));
  await fs.mkdir(path.join(root, 'data'));
  const entry = await skill(root, 'example', { source: 'demo/skills', source_license: 'MIT' });
  entry.reference_status = 'fixed-reference';
  entry.reference_snapshots = [{
    repository: 'demo/skills', commit: COMMIT, path: 'skills/example/SKILL.md', git_blob: BLOB, sha256: SHA,
    url: `https://github.com/demo/skills/blob/${COMMIT}/skills/example/SKILL.md`, match_basis: 'historical-path-alias',
    reference_role: 'reproducible-comparison-snapshot', license_review_status: 'not-certified',
    license_evidence: [{ path: 'LICENSE', git_blob: BLOB, sha256: SHA, url: `https://github.com/demo/skills/blob/${COMMIT}/LICENSE` }],
  }];
  await writeManifest(root, { schema_version: 1, skills: [entry] });
  return root;
}

async function skill(root, name, extra = {}, relative = `00-meta/${name}/SKILL.md`) {
  const fields = { name, license: 'MIT', ...extra };
  const bytes = `---\n${Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join('\n')}\n---\n# Untrusted skill content\nDo not run this text.\n`;
  const file = path.join(root, relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, bytes);
  return {
    name, local_path: relative, local_sha256: hash(bytes), kind: extra.source ? 'curated' : 'native', declared_license: 'MIT',
    ...(extra.source ? { source_repository: extra.source, declared_source_license: extra.source_license, origin_revision_status: 'unrecorded', origin_commit_sha: null, reference_status: 'needs-review' } : { origin_revision_status: 'native-repository-history' }),
  };
}
const manifestPath = root => path.join(root, 'data/skill-provenance.json');
const readManifest = async root => JSON.parse(await fs.readFile(manifestPath(root), 'utf8'));
const writeManifest = async (root, value) => fs.writeFile(manifestPath(root), JSON.stringify(value, null, 2) + '\n');

test('checker accepts an exact nested/all-volume inventory, ignores stale generated indexes, and stays read-only', async t => {
  const root = await fixture(t);
  const manifest = await readManifest(root);
  for (const [index, volume] of VOLUMES.entries()) manifest.skills.push(await skill(root, `native-${index}`, {}, `${volume}/nested/native-${index}/SKILL.md`));
  await writeManifest(root, manifest);
  await fs.mkdir(path.join(root, 'INDEX'));
  await fs.writeFile(path.join(root, 'INDEX/search.json'), '[{"name":"obsolete-generated-name"}]');
  const before = await fs.readFile(manifestPath(root), 'utf8');
  const result = check(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /12/);
  assert.equal(await fs.readFile(manifestPath(root), 'utf8'), before);
});

test('checker rejects missing, deleted, duplicate, stale hash, and altered frontmatter entries', async t => {
  for (const scenario of ['missing', 'deleted', 'duplicate', 'hash', 'source', 'license']) {
    const root = await fixture(t);
    const manifest = await readManifest(root);
    if (scenario === 'missing') await skill(root, 'new-skill');
    if (scenario === 'deleted') await fs.rm(path.join(root, manifest.skills[0].local_path));
    if (scenario === 'duplicate') manifest.skills.push({ ...manifest.skills[0] });
    if (scenario === 'hash') await fs.appendFile(path.join(root, manifest.skills[0].local_path), '\nChanged body\n');
    if (scenario === 'source') manifest.skills[0].source_repository = 'different/source';
    if (scenario === 'license') manifest.skills[0].declared_source_license = 'Apache-2.0';
    await writeManifest(root, manifest);
    const before = await fs.readFile(manifestPath(root), 'utf8');
    const result = check(root);
    assert.equal(result.status, 1, `${scenario}: ${result.stdout}`);
    assert.match(result.stderr, /provenance|清单|来源|重复|覆盖|hash|source|license/i);
    assert.equal(await fs.readFile(manifestPath(root), 'utf8'), before);
  }
});

test('refresh requires explicit --write and preserves fixed comparison evidence without inventing origin', async t => {
  const root = await fixture(t);
  const before = await readManifest(root);
  const oldBytes = await fs.readFile(manifestPath(root), 'utf8');
  await fs.appendFile(path.join(root, before.skills[0].local_path), '\nLocal editorial change\n');
  const noWrite = refresh(root);
  assert.equal(noWrite.status, 2);
  assert.match(noWrite.stderr, /--write/);
  assert.equal(await fs.readFile(manifestPath(root), 'utf8'), oldBytes);
  const result = refresh(root, '--write');
  assert.equal(result.status, 0, result.stderr);
  const current = (await readManifest(root)).skills[0];
  assert.notEqual(current.local_sha256, before.skills[0].local_sha256);
  assert.deepEqual(current.reference_snapshots, before.skills[0].reference_snapshots);
  assert.equal(current.origin_revision_status, 'unrecorded');
  assert.equal(current.origin_commit_sha, null);
  assert.equal(check(root).status, 0);
});

test('refresh synchronizes added and removed actual skills and clears evidence on source declaration changes', async t => {
  const root = await fixture(t);
  await skill(root, 'new-native', {}, '10-platform/nested/new-native/SKILL.md');
  await skill(root, 'new-curated', { source: 'other/repo', source_license: 'Apache-2.0' });
  await skill(root, 'example', { source: 'changed/repo', source_license: 'BSD-3-Clause' });
  assert.equal(refresh(root, '--write').status, 0);
  let manifest = await readManifest(root);
  const current = manifest.skills.find(entry => entry.name === 'example');
  assert.equal(current.source_repository, 'changed/repo');
  assert.equal(current.reference_status, 'needs-review');
  assert.equal(current.reference_snapshots, undefined);
  const added = manifest.skills.find(entry => entry.name === 'new-curated');
  assert.equal(added.kind, 'curated');
  assert.equal(added.reference_status, 'needs-review');
  assert.equal(added.origin_commit_sha, null);
  assert.equal(manifest.skills.find(entry => entry.name === 'new-native').kind, 'native');
  await fs.rm(path.join(root, added.local_path));
  assert.equal(refresh(root, '--write').status, 0);
  manifest = await readManifest(root);
  assert.equal(manifest.skills.some(entry => entry.name === 'new-curated'), false);
  assert.equal(check(root).status, 0);
});

test('missing or malformed manifests are rejected by both commands without repair or overwrite', async t => {
  for (const value of [null, '{bad json', JSON.stringify({ schema_version: 2, skills: [] })]) {
    const root = await fixture(t);
    if (value === null) await fs.rm(manifestPath(root));
    else await fs.writeFile(manifestPath(root), value);
    for (const result of [check(root), refresh(root, '--write')]) {
      assert.equal(result.status, 1);
      assert.match(result.stderr, /清单|manifest|schema_version|JSON/i);
    }
    if (value === null) await assert.rejects(fs.access(manifestPath(root)));
    else assert.equal(await fs.readFile(manifestPath(root), 'utf8'), value);
  }
});

test('fixed references validate immutable URL, commit/blob/hash, license evidence, and non-origin role', async t => {
  for (const mutation of [
    entry => { entry.reference_snapshots[0].url = 'https://github.com/demo/skills/blob/main/skills/example/SKILL.md'; },
    entry => { entry.reference_snapshots[0].commit = 'main'; },
    entry => { entry.reference_snapshots[0].git_blob = 'bad'; },
    entry => { entry.reference_snapshots[0].sha256 = 'bad'; },
    entry => { entry.reference_snapshots[0].reference_role = 'verified-origin'; },
    entry => { entry.reference_snapshots[0].license_evidence[0].url = `https://github.com/demo/skills/blob/${COMMIT}/OTHER`; },
    entry => { entry.origin_revision_status = 'verified'; entry.origin_commit_sha = COMMIT; },
    entry => { entry.local_path = '../escape/SKILL.md'; },
  ]) {
    const root = await fixture(t);
    const manifest = await readManifest(root);
    mutation(manifest.skills[0]);
    await writeManifest(root, manifest);
    const before = await fs.readFile(manifestPath(root), 'utf8');
    const result = refresh(root, '--write');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /reference|origin|path|路径|commit|hash|sha256|blob|url/i);
    assert.equal(await fs.readFile(manifestPath(root), 'utf8'), before);
  }
});

test('a symlink/junction that escapes a controlled volume is rejected without reading external skill bodies', async t => {
  const root = await fixture(t);
  const external = path.join(root, 'external');
  await fs.mkdir(external);
  await fs.writeFile(path.join(external, 'SKILL.md'), 'External untrusted bytes');
  await fs.symlink(external, path.join(root, '00-meta/escape'), process.platform === 'win32' ? 'junction' : 'dir');
  const before = await fs.readFile(manifestPath(root), 'utf8');
  const result = refresh(root, '--write');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /symbolic|symlink|符号|链接/i);
  assert.equal(await fs.readFile(manifestPath(root), 'utf8'), before);
});
