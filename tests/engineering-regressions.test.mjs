import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const BEGIN = '<!-- BEGIN GENERATED:skill-repos -->';
const END = '<!-- END GENERATED:skill-repos -->';

function run(root, script, args = [], options = {}) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script), ...args], {
    cwd: root, encoding: 'utf8', windowsHide: true, ...options,
  });
  if (result.error) throw result.error;
  return result;
}

function git(root, ...args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

async function fixture(t) {
  const temporaryDirectory = path.resolve(os.tmpdir());
  const root = await fs.mkdtemp(path.join(temporaryDirectory, 'everything-engineering-test-'));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(root)), temporaryDirectory);
    assert.match(path.basename(root), /^everything-engineering-test-/);
    await fs.rm(root, { recursive: true, force: true });
  });
  await fs.cp(path.join(ROOT, 'scripts'), path.join(root, 'scripts'), { recursive: true });
  for (const file of ['taxonomy.json', 'data/readme-intro.en.md', 'data/readme-intro.zh.md', 'assets/brand/logo.svg', 'assets/brand/logo-static.svg']) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await fs.copyFile(path.join(ROOT, file), path.join(root, file));
  }
  const taxonomy = JSON.parse(await fs.readFile(path.join(root, 'taxonomy.json'), 'utf8'));
  for (const volume of Object.keys(taxonomy.vols)) await fs.mkdir(path.join(root, volume));
  await fs.writeFile(path.join(root, 'data/skill-repos.meta.md'), '# 技能仓库总目\n\n{{COUNT}} repositories\n');
  await writeRepos(root, [repo('demo/one')]);
  await fs.writeFile(path.join(root, 'README.md'), `${BEGIN}\n${END}\n`);
  await addSkill(root, 'active');
  return root;
}

function repo(name, extra = {}) {
  return { full_name: name, html_url: `https://github.com/${name}`, stars: 1, summary: 'Fixture repository', license: 'MIT', skill_count: '1', status: '仅索引', section: 'other', ...extra };
}

async function writeRepos(root, rows) {
  await fs.writeFile(path.join(root, 'data/skill-repos.jsonl'), rows.map(row => JSON.stringify(row)).join('\n') + '\n');
}

async function addSkill(root, name, extra = {}) {
  const metadata = { name, title: 'Fixture skill', description: 'Fixture skill for an isolated regression; 触发词：fixture-task。', domain: '通用/thinking', status: 'stable', agents: '[codex]', ...extra };
  const directory = path.join(root, '00-meta', name);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'SKILL.md'), `---\n${Object.entries(metadata).map(([key, value]) => `${key}: ${value}`).join('\n')}\n---\n# Fixture\n`);
}

async function snapshot(root, prefix = '') {
  const files = {};
  for (const entry of await fs.readdir(path.join(root, prefix), { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(files, await snapshot(root, relative));
    else files[relative] = createHash('sha256').update(await fs.readFile(path.join(root, relative))).digest('hex');
  }
  return files;
}

test('ENG-01 check compares drift without writing tracked, untracked, or handwritten content', async t => {
  const root = await fixture(t);
  assert.equal(run(root, 'build-all.mjs', ['--lang=en']).status, 0);
  git(root, 'init', '-q');
  git(root, 'add', '--all');
  git(root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture baseline');
  const readme = path.join(root, 'README.md');
  await fs.writeFile(readme, `Handwritten uncommitted sentinel\n${await fs.readFile(readme, 'utf8')}`);
  await fs.writeFile(path.join(root, 'INDEX/untracked-note.txt'), 'Untracked user note\n');
  const before = await snapshot(root);
  const result = run(root, 'check-generated.mjs', ['--lang=en']);
  assert.deepEqual(await snapshot(root), before, 'a check must never change its source checkout');
  assert.equal(result.status, 1, 'template drift must be reported');
  assert.match(result.stderr, /README\.md/);
});

test('ENG-01 clean generated content passes; stale artifacts and new sources fail read-only', async t => {
  const root = await fixture(t);
  assert.equal(run(root, 'build-all.mjs', ['--lang=en']).status, 0);
  git(root, 'init', '-q');
  git(root, 'add', '--all');
  git(root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture baseline');
  assert.equal(run(root, 'check-generated.mjs', ['--lang=en']).status, 0);
  await addSkill(root, 'new-untracked-source');
  const before = await snapshot(root);
  const result = run(root, 'check-generated.mjs', ['--lang=en']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /INDEX/);
  assert.deepEqual(await snapshot(root), before);
});

test('ENG-02 deprecated skills remain inspectable but are excluded from default discovery and installation', async t => {
  const root = await fixture(t);
  await addSkill(root, 'archive', { status: 'deprecated', deprecate_reason: 'Upstream skill removed without replacement.' });
  assert.equal(run(root, 'build-index.mjs', ['--lang=en']).status, 0);
  const market = JSON.parse(await fs.readFile(path.join(root, '.claude-plugin/marketplace.json')));
  assert.deepEqual(market.plugins.flatMap(plugin => plugin.skills), ['./00-meta/active']);
  const search = args => JSON.parse(run(root, 'everything-skills.mjs', args).stdout);
  assert.deepEqual(search(['search', 'fixture-task', '--json']).map(row => row.name), ['active']);
  assert.deepEqual(search(['list', '--json']).map(row => row.name), ['active']);
  assert.deepEqual(search(['search', 'fixture-task', '--include-deprecated', '--json']).map(row => row.name).sort(), ['active', 'archive']);
  assert.equal(search(['why', 'archive', '--json']).skill.id, 'archive');
});

test('ENG-03 duplicate numeric repository identity fails generation and CLI while legacy missing IDs remain valid', async t => {
  const root = await fixture(t);
  await writeRepos(root, [repo('demo/old', { repository_id: 424242 }), repo('demo/new', { repository_id: 424242 })]);
  await fs.mkdir(path.join(root, 'INDEX'));
  await fs.writeFile(path.join(root, 'INDEX/skill-repos.md'), 'Existing directory\n');
  const result = run(root, 'build-skill-repos.mjs', ['--lang=en']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /repository_id.*424242/);
  assert.equal(await fs.readFile(path.join(root, 'INDEX/skill-repos.md'), 'utf8'), 'Existing directory\n');
  const cli = run(root, 'everything-skills.mjs', ['repo', 'demo/new', '--json']);
  assert.equal(cli.status, 1);
  assert.match(cli.stderr, /repository_id/);
  await writeRepos(root, [repo('demo/old'), repo('demo/new', { repository_id: 424242 })]);
  assert.equal(run(root, 'build-skill-repos.mjs', ['--lang=en']).status, 0);
});

for (const [id, fields, error] of [
  ['ENG-04', { status: 'depreacted' }, /status/],
  ['ENG-05 missing class', { domain: '通用' }, /domain/],
  ['ENG-05 empty class', { domain: '通用/' }, /domain/],
  ['ENG-05 extra segment', { domain: '通用/thinking/extra' }, /domain/],
]) test(`${id} is rejected before replacing existing generated artifacts`, async t => {
  const root = await fixture(t);
  assert.equal(run(root, 'build-index.mjs', ['--lang=en']).status, 0);
  await addSkill(root, 'active', fields);
  const before = await snapshot(root, 'INDEX');
  const result = run(root, 'build-index.mjs', ['--lang=en']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, error);
  assert.deepEqual(await snapshot(root, 'INDEX'), before);
});

test('ENG-06 reversed directory markers fail without rewriting README', async t => {
  const root = await fixture(t);
  const malformed = `Handwritten content\n${END}\n${BEGIN}\n`;
  await fs.writeFile(path.join(root, 'README.md'), malformed);
  const result = run(root, 'refresh-readme-skill-repos-directory.mjs', ['--lang=en']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ordered|order|顺序/);
  assert.equal(await fs.readFile(path.join(root, 'README.md'), 'utf8'), malformed);
});

test('ENG-07 boolean switches preserve adjacent search and why positional arguments', async t => {
  const root = await fixture(t);
  assert.equal(run(root, 'build-index.mjs', ['--lang=en']).status, 0);
  const normal = run(root, 'everything-skills.mjs', ['search', 'fixture-task', '--json']);
  const reordered = run(root, 'everything-skills.mjs', ['search', '--json', 'fixture-task']);
  assert.deepEqual(JSON.parse(reordered.stdout), JSON.parse(normal.stdout));
  const why = run(root, 'everything-skills.mjs', ['why', '--json', 'active']);
  assert.equal(why.status, 0, why.stderr);
  assert.equal(JSON.parse(why.stdout).skill.id, 'active');
});

test('ENG-08 failed directory reads stop generation without replacing any existing artifact', async t => {
  const root = await fixture(t);
  await addSkill(root, 'blocked');
  assert.equal(run(root, 'build-index.mjs', ['--lang=en']).status, 0);
  const preload = path.join(root, 'fail-readdir.cjs');
  await fs.writeFile(preload, `const fs = require('node:fs');\nconst original = fs.promises.readdir;\nfs.promises.readdir = function (dir, ...args) {\n  if (String(dir) === process.env.AUDIT_BLOCKED_DIRECTORY) return Promise.reject(Object.assign(new Error('fixture EACCES'), { code: 'EACCES' }));\n  return original.call(this, dir, ...args);\n};\n`);
  const before = await snapshot(root);
  const result = run(root, 'build-index.mjs', ['--lang=en'], { env: { ...process.env, NODE_OPTIONS: `--require=${preload}`, AUDIT_BLOCKED_DIRECTORY: path.join(root, '00-meta/blocked') } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /EACCES/);
  assert.deepEqual(await snapshot(root), before);
});

test('repository directory counts describe entries and surface unavailable or archived upstream snapshots', async t => {
  const root = await fixture(t);
  await writeRepos(root, [
    repo('demo/unavailable', { upstream_snapshot: { checked_at: '2026-10-23', state: 'unavailable' } }),
    repo('demo/archived', { upstream_snapshot: { checked_at: '2026-10-23', state: 'archived' } }),
  ]);
  const build = run(root, 'build-skill-repos.mjs', ['--lang=zh']);
  assert.equal(build.status, 0, build.stderr);
  assert.match(build.stdout, /目录记录/);
  const index = await fs.readFile(path.join(root, 'INDEX/skill-repos.md'), 'utf8');
  assert.match(index, /不可访问/);
  assert.match(index, /已归档/);
  assert.equal(run(root, 'refresh-readme-skill-repos-directory.mjs', ['--lang=en']).status, 0);
  const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8');
  assert.match(readme, /indexed entries/);
  assert.match(readme, /upstream unavailable/);
  assert.match(readme, /upstream archived/);
});
