import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GENERATED = [
  'INDEX/catalog.md', 'INDEX/tags.md', 'INDEX/tools.md', 'INDEX/graph.md',
  'INDEX/graph.json', 'INDEX/search.json', 'INDEX/sources.md',
  '.claude-plugin/marketplace.json', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md',
  'gemini-extension.json',
];

async function fixture(t) {
  const temporaryDirectory = path.resolve(os.tmpdir());
  const root = await fs.mkdtemp(path.join(temporaryDirectory, 'everything-skills-index-test-'));
  t.after(async () => {
    // Check the resolved target before recursively removing this isolated fixture.
    assert.equal(path.dirname(path.resolve(root)), temporaryDirectory);
    assert.match(path.basename(root), /^everything-skills-index-test-/);
    await fs.rm(root, { recursive: true, force: true });
  });
  await fs.mkdir(path.join(root, 'scripts'));
  await fs.copyFile(path.join(ROOT, 'scripts/build-index.mjs'), path.join(root, 'scripts/build-index.mjs'));
  const taxonomy = await fs.readFile(path.join(ROOT, 'taxonomy.json'), 'utf8');
  await fs.writeFile(path.join(root, 'taxonomy.json'), taxonomy);
  for (const volume of Object.keys(JSON.parse(taxonomy).vols))
    await fs.mkdir(path.join(root, volume));
  return root;
}

async function addSkill(root, name, fields = {}, directory = `00-meta/${name}`) {
  const metadata = {
    name, title: 'Fixture skill',
    description: '用于索引行为验证；触发词：fallback、默认词。',
    domain: '通用/thinking', status: 'stable', agents: '[codex]',
    ...fields,
  };
  const target = path.join(root, directory, 'SKILL.md');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `---\n${Object.entries(metadata).map(([key, value]) => `${key}: ${value}`).join('\n')}\n---\n# Fixture skill\n`);
  return target;
}

function generate(root) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/build-index.mjs'), '--lang=zh'], {
    cwd: root, encoding: 'utf8', windowsHide: true,
  });
  if (result.error) throw result.error;
  return result;
}

async function json(root, relativePath) {
  return JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
}

test('explicit triggers retain English phrases and override description fallback', async t => {
  const root = await fixture(t);
  await addSkill(root, 'reflect', { triggers: '[step back, zoom out, reflect, "inspect, explain", "123"]' });
  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual((await json(root, 'INDEX/search.json'))[0].triggers, ['step back', 'zoom out', 'reflect', 'inspect, explain', '123']);
});

test('description supplies triggers only when the explicit field is absent', async t => {
  const root = await fixture(t);
  await addSkill(root, 'fallback');
  await addSkill(root, 'empty', { triggers: '[]' });
  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  const records = new Map((await json(root, 'INDEX/search.json')).map(record => [record.name, record]));
  assert.deepEqual(records.get('fallback').triggers, ['fallback', '默认词']);
  assert.deepEqual(records.get('empty').triggers, []);
});

test('new skills supersede old skills and deprecated chains reach an active successor', async t => {
  const root = await fixture(t);
  await addSkill(root, 'old', { status: 'deprecated' });
  await addSkill(root, 'middle', { status: 'deprecated', supersedes: '[old]' });
  await addSkill(root, 'current', { supersedes: '[middle]' });
  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal((await json(root, 'INDEX/search.json')).length, 3);
});

test('deprecated skills without an active successor and replacement cycles are rejected', async t => {
  const root = await fixture(t);
  await addSkill(root, 'old', { status: 'deprecated', supersedes: '[middle]' });
  await addSkill(root, 'middle', { status: 'deprecated', supersedes: '[old]' });
  await addSkill(root, 'orphan', { status: 'deprecated' });
  await addSkill(root, 'current', { supersedes: '[middle]' });
  const result = generate(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /supersedes.*成环/);
  assert.match(result.stderr, /orphan.*继任/);
});

test('nested skill folders keep real paths in search, markdown indexes, and plugin entries', async t => {
  const root = await fixture(t);
  const relativePath = '00-meta/thinking/nested/SKILL.md';
  await addSkill(root, 'nested', { tags: '[fixture]', tools: '[fixture-tool]', source: 'example/fixture', source_license: 'MIT' }, '00-meta/thinking/nested');
  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal((await json(root, 'INDEX/search.json'))[0].path, relativePath);
  await fs.access(path.join(root, relativePath));
  for (const index of ['catalog', 'tags', 'tools', 'sources'])
    assert.ok((await fs.readFile(path.join(root, `INDEX/${index}.md`), 'utf8')).includes(`../${relativePath}`));
  assert.deepEqual((await json(root, '.claude-plugin/marketplace.json')).plugins[0].skills, ['./00-meta/thinking/nested']);
});

test('scalar values for array fields fail validation instead of silently losing graph edges', async t => {
  const root = await fixture(t);
  const fields = ['agents', 'requires', 'related', 'combines_with', 'supersedes', 'tags', 'tools', 'triggers'];
  for (const field of fields) await addSkill(root, `invalid-${field.replaceAll('_', '-')}`, { [field]: 'missing-target' });
  const result = generate(root);
  assert.equal(result.status, 1);
  for (const field of fields) assert.ok(result.stderr.includes(`"${field}"`), result.stderr);
  await assert.rejects(fs.access(path.join(root, 'INDEX/search.json')));
});

test('array elements must be nonempty strings', async t => {
  const root = await fixture(t);
  await addSkill(root, 'invalid-elements', { triggers: '[123, true, null, ""]' });
  const result = generate(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /triggers/);
});

test('invalid input leaves every existing generated artifact unchanged', async t => {
  const root = await fixture(t);
  await addSkill(root, 'dangling', { requires: '[missing-target]' });
  for (const file of GENERATED) {
    const target = path.join(root, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, `existing artifact: ${file}\n`);
  }
  const result = generate(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /悬空互见/);
  for (const file of GENERATED)
    assert.equal(await fs.readFile(path.join(root, file), 'utf8'), `existing artifact: ${file}\n`);
  assert.deepEqual((await fs.readdir(path.join(root, 'INDEX'))).sort(), GENERATED.filter(file => file.startsWith('INDEX/')).map(file => path.basename(file)).sort());
});

test('third-party sources require an explicit source license', async t => {
  const root = await fixture(t);
  await addSkill(root, 'unlicensed', { source: 'example/fixture' });
  const result = generate(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /source_license/);
  await assert.rejects(fs.access(path.join(root, 'INDEX/search.json')));
});
