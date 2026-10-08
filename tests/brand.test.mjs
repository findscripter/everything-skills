import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'everything-brand-test-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  for (const folder of ['scripts', 'data', 'INDEX', '.claude-plugin', 'assets/brand'])
    await fs.mkdir(path.join(dir, folder), { recursive: true });
  for (const file of ['scripts/build-brand.mjs', 'scripts/load-skill-repos.mjs', 'assets/brand/logo.svg', 'assets/brand/logo-static.svg'])
    await fs.copyFile(path.join(ROOT, file), path.join(dir, file));
  const write = (name, value) => fs.writeFile(path.join(dir, name), JSON.stringify(value));
  await write('INDEX/search.json', [{ name: 'alpha' }, { name: 'beta' }]);
  await write('INDEX/graph.json', { nodes: [{ id: 'alpha' }, { id: 'beta' }], edges: [{ from: 'alpha', to: 'beta' }] });
  await write('.claude-plugin/marketplace.json', { plugins: [{ name: '00-meta' }] });
  await fs.writeFile(path.join(dir, 'data/skill-repos.jsonl'), JSON.stringify({ full_name: 'demo/one', html_url: 'https://github.com/demo/one', stars: 1, summary: 'Demo catalog record', license: 'MIT', skill_count: '1', status: '仅索引', section: 'other' }) + '\n');
  await fs.writeFile(path.join(dir, 'README.md'), 'Handwritten introduction\n<!-- BEGIN GENERATED:brand -->\n<!-- END GENERATED:brand -->\nHandwritten footer\n<!-- BEGIN GENERATED:skill-repos -->\nDo not touch this catalog.\n<!-- END GENERATED:skill-repos -->\n');
  return { dir, write, run: (lang = 'zh') => spawnSync(process.execPath, [path.join(dir, 'scripts/build-brand.mjs'), `--lang=${lang}`], { encoding: 'utf8', windowsHide: true }) };
}

test('brand counters follow data updates and preserve handwritten/catalog content', async t => {
  const f = await fixture(t);
  assert.equal(f.run().status, 0);
  let readme = await fs.readFile(path.join(f.dir, 'README.md'), 'utf8');
  assert.match(readme, /2 skills · 1 volumes · 1 relation edges · 1 indexed repositories/);
  assert.ok(readme.startsWith('Handwritten introduction\n'));
  assert.ok(readme.endsWith('Handwritten footer\n<!-- BEGIN GENERATED:skill-repos -->\nDo not touch this catalog.\n<!-- END GENERATED:skill-repos -->\n'));
  const row = { full_name: 'demo/two', html_url: 'https://github.com/demo/two', stars: 2, summary: 'Second demo', license: 'MIT', skill_count: '1', status: '仅索引', section: 'other' };
  await fs.writeFile(path.join(f.dir, 'data/skill-repos.part1.jsonl'), JSON.stringify(row) + '\n');
  assert.equal(f.run('en').status, 0);
  readme = await fs.readFile(path.join(f.dir, 'README.md'), 'utf8');
  assert.match(readme, /2 indexed repositories/);
  assert.match(readme, /Skill catalog/);
  assert.match(await fs.readFile(path.join(f.dir, 'assets/brand/stats.svg'), 'utf8'), /2 indexed external repositories/);
});

test('invalid brand boundaries fail before creating assets or rewriting README', async t => {
  const f = await fixture(t);
  const malformed = '<!-- END GENERATED:brand -->\n<!-- BEGIN GENERATED:brand -->';
  await fs.writeFile(path.join(f.dir, 'README.md'), malformed);
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ordered pair/);
  assert.equal(await fs.readFile(path.join(f.dir, 'README.md'), 'utf8'), malformed);
  assert.deepEqual((await fs.readdir(path.join(f.dir, 'assets/brand'))).sort(), ['logo-static.svg', 'logo.svg']);
});

test('inconsistent skill and graph indexes fail without replacing generated assets', async t => {
  const f = await fixture(t);
  await f.write('INDEX/graph.json', { nodes: [], edges: [] });
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /indexes must agree/);
  assert.deepEqual((await fs.readdir(path.join(f.dir, 'assets/brand'))).sort(), ['logo-static.svg', 'logo.svg']);
});

test('static and mobile exports are standalone; animated exports honor reduced motion', async t => {
  const f = await fixture(t);
  assert.equal(f.run().status, 0);
  for (const file of ['hero-static.svg', 'hero-mobile-static.svg', 'workflow-static.svg', 'logo-static.svg', 'stats-mobile.svg']) {
    const svg = await fs.readFile(path.join(f.dir, 'assets/brand', file), 'utf8');
    assert.doesNotMatch(svg, /@keyframes|<animate\b|<script\b|<foreignObject\b/);
  }
  for (const file of ['hero.svg', 'workflow.svg', 'logo.svg']) {
    const svg = await fs.readFile(path.join(f.dir, 'assets/brand', file), 'utf8');
    assert.match(svg, /prefers-reduced-motion/);
    assert.doesNotMatch(svg, /<script\b|<foreignObject\b|(?:href|src)=["']https?:/);
  }
});
