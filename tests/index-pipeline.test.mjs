import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GENERATED = [
  'INDEX/catalog.md', 'INDEX/tags.md', 'INDEX/tools.md', 'INDEX/graph.md',
  'INDEX/graph.json', 'INDEX/search.json', 'INDEX/sources.md',
  'INDEX/quality.json',
  'INDEX/task-rankings.md',
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

test('task rankings bind reviewed bodies and reject stale, ambiguous or unknown entries without writes', async t => {
  const root = await fixture(t);
  const filename = await addSkill(root, 'alpha');
  await addSkill(root, 'retired', {status:'deprecated', deprecate_reason:'Historical test entry'});
  await fs.mkdir(path.join(root, 'data'));
  const entry = {skill:'alpha', sha256:createHash('sha256').update(await fs.readFile(filename)).digest('hex'), reason:'适用范围', reason_en:'Task fit'};
  const group = {id:'fixture-task', title:'任务', title_en:'Task', reviewed_at:'2026-11-15', triggers:['make slides'], entries:[entry]};
  const write = value => fs.writeFile(path.join(root, 'data/skill-rankings.json'), JSON.stringify(value));
  await write([group]);
  assert.equal(generate(root).status, 0);
  const stored = (await json(root, 'INDEX/search.json')).find(row => row.name === 'alpha');
  assert.equal(stored.task_rankings[0].rank, 1);
  const previous = await fs.readFile(path.join(root, 'INDEX/search.json'));
  for (const bad of [
    [{...group, entries:[{...entry, sha256:'0'.repeat(64)}]}],
    [{...group, entries:[{...entry, skill:'missing'}]}],
    [{...group, entries:[{...entry, skill:'retired'}]}],
    [{...group, entries:[entry, entry]}],
    [group, {...group, id:'other-task'}],
    [{...group, triggers:[]}],
  ]) {
    await write(bad);
    const result = generate(root);
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stderr, /skill-rankings/);
    assert.deepEqual(await fs.readFile(path.join(root, 'INDEX/search.json')), previous);
  }
});

test('library ranking review requires complete current/archive coverage and truthful group membership', async t => {
  const root = await fixture(t);
  const hashes = {};
  for (const name of ['alpha', 'beta', 'unique', 'retired']) {
    const file = await addSkill(root, name, name === 'retired' ? {status:'deprecated', deprecate_reason:'Historical fixture'} : {});
    hashes[name] = createHash('sha256').update(await fs.readFile(file)).digest('hex');
  }
  await fs.mkdir(path.join(root, 'data'));
  const group = {id:'compare-task', title:'比较任务', title_en:'Compare task', reviewed_at:'2026-11-15', triggers:['compare task'], entries:['alpha','beta'].map(skill => ({skill,sha256:hashes[skill],reason:'任务适配',reason_en:'Task fit'}))};
  await fs.writeFile(path.join(root, 'data/skill-rankings.json'), JSON.stringify([group]));
  const record = name => ({name,sha256:hashes[name],task:'任务与产物',decision:name === 'unique' ? 'distinct' : 'ranked',review_scope:name === 'unique' ? 'metadata-and-usage-section' : 'full-body-comparison',reason:'已比较任务范围与交付物',compared_with:[]});
  const review = {schema_version:1,baseline_commit:'a'.repeat(40),completed_at:'2026-11-15T05:00:00Z',method:'Static task boundaries; full bodies for ranked alternatives.',skills:['alpha','beta','unique'].map(record),archived:[{name:'retired',sha256:hashes.retired,reason:'归档不参与推荐'}]};
  const write = data => fs.writeFile(path.join(root, 'data/skill-ranking-review.json'), JSON.stringify(data));
  await write(review);
  assert.equal(generate(root).status, 0);
  const previous = await fs.readFile(path.join(root, 'INDEX/search.json'));
  for (const mutate of [
    data => data.skills.pop(),
    data => {data.skills[2].sha256 = '0'.repeat(64);},
    data => {data.skills[0].decision = 'distinct';},
    data => {data.archived = [];},
    data => {data.skills[2].decision = 'ranked';},
    data => {data.skills[0].review_scope = 'metadata-and-usage-section';},
    data => {data.skills[2].compared_with = ['missing'];},
  ]) {
    const invalid = structuredClone(review); mutate(invalid); await write(invalid);
    const result = generate(root);
    assert.equal(result.status, 1, 'Incomplete or contradictory library review must fail');
    assert.match(result.stderr, /skill-ranking-review/);
    assert.deepEqual(await fs.readFile(path.join(root, 'INDEX/search.json')), previous);
  }
  await write(review);
  assert.equal(generate(root).status, 0);
  const index = await fs.readFile(path.join(root, 'INDEX/task-rankings.md'), 'utf8');
  assert.match(index, /3.*现行|现行.*3/);
  assert.ok(index.includes('alpha') && index.includes('beta'));
});

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

test('source index separates historical declarations from reviewed reference license scope', async t => {
  const root = await fixture(t);
  await addSkill(root, 'scoped', { source: 'demo/library', source_license: 'MIT', source_license_scope: '"Fixed comparison file: BSD-3-Clause; original adaptation revision unrecorded"' });
  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  const sources = await fs.readFile(path.join(root, 'INDEX/sources.md'), 'utf8');
  assert.match(sources, /`MIT`/);
  assert.match(sources, /Fixed comparison file: BSD-3-Clause; original adaptation revision unrecorded/);
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
  await addSkill(root, 'old', { status: 'deprecated', supersedes: '[middle]', deprecate_reason: 'Archived upstream entry.' });
  await addSkill(root, 'middle', { status: 'deprecated', supersedes: '[old]', deprecate_reason: 'Archived upstream entry.' });
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

test('quality metadata stays conservative and is embedded in search records', async t => {
  const root = await fixture(t);
  await addSkill(root, 'quality-base');
  await addSkill(root, 'quality-target', {
    requires: '[quality-base]', tools: '[python]', source: 'example/fixture', source_license: 'MIT',
  });
  await fs.mkdir(path.join(root, 'data'), { recursive: true });
  await fs.writeFile(path.join(root, 'data/quality-overrides.json'), JSON.stringify({
    schema_version: 1,
    skills: {
      'quality-target': {
        review_status: 'reviewed', last_reviewed: '2026-10-18', source_freshness: 'fresh',
        license_confidence: 'verified', capabilities: ['read-only'], security_risk: 'review',
        dependencies: { runtime: ['python'] },
      },
    },
  }));
  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  const quality = await json(root, 'INDEX/quality.json');
  const target = quality.skills.find(record => record.name === 'quality-target');
  assert.deepEqual(target.quality, {
    review_status: 'reviewed', last_reviewed: '2026-10-18', source_type: 'curated',
    source_freshness: 'fresh', license_confidence: 'verified',
    dependencies: { skills: ['quality-base'], tools: ['python'], runtime: ['python'] },
    capabilities: ['read-only'], maturity: 'stable', security_risk: 'review',
  });
  const search = (await json(root, 'INDEX/search.json')).find(record => record.name === 'quality-target');
  assert.deepEqual(search.quality, target.quality);
  const conservative = quality.skills.find(record => record.name === 'quality-base').quality;
  assert.equal(conservative.review_status, 'unreviewed');
  assert.equal(conservative.source_freshness, 'unknown');
  assert.equal(conservative.security_risk, 'unknown');

  await fs.writeFile(path.join(root, 'data/quality-overrides.json'), JSON.stringify({
    schema_version: 1, skills: { 'quality-target': { securty_risk: 'low' } },
  }));
  const invalid = generate(root);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /不是受支持的质量字段/);
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

test('native block arrays preserve English triggers and decode quoted scalar escapes', async t => {
  const root = await fixture(t);
  await addSkill(root, 'native-oauth', {
    title: String.raw`"Zoom \"OAuth\" route"`,
    description: String.raw`"Choose \"OAuth\" after routing.\nUse scoped tokens."`,
    agents: '\n  - codex',
    triggers: String.raw`
  - zoom oauth
  - zoom authentication
  - 'don''t retry'
  - "quoted \"OAuth\""`,
    tools: String.raw`
  - "C:\\tools"
  - 'OAuth client'`,
  });
  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  const record = (await json(root, 'INDEX/search.json'))[0];
  assert.equal(record.title, 'Zoom "OAuth" route');
  assert.equal(record.description, 'Choose "OAuth" after routing.\nUse scoped tokens.');
  assert.deepEqual(record.triggers, ['zoom oauth', 'zoom authentication', "don't retry", 'quoted "OAuth"']);
  const tools = await fs.readFile(path.join(root, 'INDEX/tools.md'), 'utf8');
  assert.ok(tools.includes('C:\\tools'));
});

test('literal and folded descriptions preserve paragraph breaks and stop at the next top-level key', async t => {
  const root = await fixture(t);
  await addSkill(root, 'literal-description', {
    description: '|-\n  First line.\n  Second line.\n\n  action: keep this text.',
  });
  await addSkill(root, 'folded-description', {
    description: '>\n  First line.\n  Second line.\n\n  Last paragraph.',
  });
  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  const records = new Map((await json(root, 'INDEX/search.json')).map(record => [record.name, record]));
  assert.equal(records.get('literal-description').description, 'First line.\nSecond line.\n\naction: keep this text.');
  assert.equal(records.get('folded-description').description, 'First line. Second line.\nLast paragraph.\n');
  for (const record of records.values()) {
    assert.equal(record.domain, '通用/thinking');
    assert.equal(record.status, 'stable');
  }
});

test('native block arrays reject unquoted numeric and boolean elements', async t => {
  const root = await fixture(t);
  await addSkill(root, 'numeric-trigger', { triggers: '\n  - 1099\n  - true\n  - "4709"' });
  const result = generate(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /triggers/);
  await assert.rejects(fs.access(path.join(root, 'INDEX/search.json')));
});

test('terminal archives require an explicit nonempty string reason and expose it in search', async t => {
  const root = await fixture(t);
  const reason = 'Upstream skill removed without a replacement.';
  await addSkill(root, 'archive', { status: 'deprecated', deprecate_reason: reason });
  await addSkill(root, 'active');
  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  const records = new Map((await json(root, 'INDEX/search.json')).map(record => [record.name, record]));
  assert.equal(records.get('archive').status, 'deprecated');
  assert.equal(records.get('archive').deprecate_reason, reason);
  assert.equal(Object.hasOwn(records.get('active'), 'deprecate_reason'), false);
  assert.ok((await json(root, 'INDEX/graph.json')).nodes.some(node => node.id === 'archive'));
  for (const invalidReason of ['123', 'null', '""', '[not-a-string]']) {
    await addSkill(root, 'archive', { status: 'deprecated', deprecate_reason: invalidReason });
    const invalid = generate(root);
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /deprecate_reason/);
  }
});

test('active recommendations and dependencies cannot point to terminal archives', async t => {
  const root = await fixture(t);
  await addSkill(root, 'archive', { status: 'deprecated', deprecate_reason: 'Upstream skill removed without a replacement.' });
  for (const field of ['requires', 'related', 'combines_with'])
    await addSkill(root, `active-${field.replaceAll('_', '-')}`, { [field]: '[archive]' });
  const result = generate(root);
  assert.equal(result.status, 1);
  for (const field of ['requires', 'related', 'combines_with'])
    assert.ok(result.stderr.includes(`${field} 指向已弃用技能 "archive"`), result.stderr);
  await assert.rejects(fs.access(path.join(root, 'INDEX/search.json')));
});
