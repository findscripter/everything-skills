import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { search, githubPath, commands } from '../site/search.mjs';
import { searchRows } from '../scripts/everything-skills.mjs';

const rows = JSON.parse(await readFile(new URL('../INDEX/search.json', import.meta.url), 'utf8'));

test('site task recommendations preserve filters, exact IDs and unrelated searches', () => {
  const fixtures = ['alpha', 'beta', 'retired'].map((name, index) => ({ name, description: 'fixture task', vol: index === 0 ? '00-meta' : '01-documents', status: name === 'retired' ? 'deprecated' : 'stable', task_rankings: [{ task:'fixture-task', title:'任务', title_en:'Task', triggers:['fixture task'], rank:index === 0 ? 2 : 1, reason:'范围', reason_en:'Scope' }] }));
  assert.deepEqual(search(fixtures, 'fixture task').map(row => row.name), ['beta', 'alpha']);
  assert.equal(search(fixtures, 'fixture task')[0].recommendation.rank, 1);
  assert.deepEqual(search(fixtures, 'fixture task', {category:'00-meta'}).map(row => row.name), ['alpha']);
  assert.equal(search(fixtures, 'alpha')[0].name, 'alpha');
  assert.ok(search(fixtures, 'fixture').every(row => !row.recommendation));
});

test('reviewed PPT tasks have the same first choice in the CLI and published site', async () => {
  const build = spawnSync(process.execPath, ['scripts/build-site.mjs'], {cwd:new URL('..', import.meta.url), encoding:'utf8', windowsHide:true});
  assert.equal(build.status, 0, build.stderr);
  const published = JSON.parse(await readFile(new URL('../_site/catalog.json', import.meta.url), 'utf8')).skills;
  for (const [query, expected] of [['做PPT','pptx-document-processing'], ['用Python生成PPT','python-pptx-deck-generator'], ['投行模板填充','ib-pitch-deck-builder']]) {
    const cli = searchRows(rows, query, 2), site = search(published, query).slice(0, 2);
    assert.equal(cli[0].row.name, expected);
    assert.equal(site[0].name, expected);
    assert.deepEqual(site.map(row => row.name), cli.map(item => item.row.name));
    assert.equal(site[0].recommendation.rank, 1);
  }
  const html = search(published, 'HTML幻灯片')[0];
  assert.equal(html.name, 'html-animated-slides');
  assert.ok(!html.recommendation);
  assert.equal(searchRows(rows, 'pitch-deck-refresh', 1)[0].row.name, 'pitch-deck-refresh');
});
test('site search finds the actual API review skill from English and Chinese tasks', () => {
  for (const query of ['api review', 'API 设计评审']) assert.equal(search(rows, query)[0].name, 'api-design-reviewer');
});
test('volume filters intersect task search and archived entries stay out of discovery', () => {
  const results = search(rows, '论文', { category: '09-verticals' });
  assert.ok(results.length > 0);
  assert.ok(results.every(row => row.vol === '09-verticals' && row.status !== 'deprecated'));
  assert.ok(search(rows, '').every(row => row.status !== 'deprecated'));
  const archived = rows.find(row => row.status === 'deprecated');
  assert.ok(archived);
  assert.ok(!search(rows, archived.name).some(row => row.name === archived.name));
});
test('repository discovery searches both native and translated summaries within a category', () => {
  const fixtures = [{ full_name:'example/papers', summary:'Read scientific papers', summary_zh:'科研论文', section:'vertical' }, { full_name:'example/editor', summary:'An editor', section:'infra' }];
  assert.equal(search(fixtures, '论文', { mode:'repos', category:'vertical' })[0].full_name, 'example/papers');
  assert.deepEqual(search(fixtures, 'papers', { mode:'repos', category:'infra' }), []);
});
test('published catalog preserves upstream status and keeps historical/unavailable repos out of default search', async () => {
  const build = spawnSync(process.execPath, ['scripts/build-site.mjs'], { cwd:new URL('..', import.meta.url), encoding:'utf8', windowsHide:true });
  assert.equal(build.status, 0, build.stderr);
  const published = JSON.parse(await readFile(new URL('../_site/catalog.json', import.meta.url), 'utf8'));
  const knownHistorical = published.repositories.find(row => row.full_name === 'KieranGao/general-readme-skill');
  assert.equal(knownHistorical.recommendation, 'historical-only');
  assert.equal(knownHistorical.upstream_state, 'unavailable');
  assert.deepEqual(search([knownHistorical], 'general-readme', { mode:'repos' }), []);
  assert.deepEqual(search([{ full_name:'example/missing', upstream_state:'unavailable' }], '', { mode:'repos' }), []);
  assert.equal(published.stats.repositories, published.repositories.length);
  assert.equal(published.outcome.after, published.outcome.active + published.outcome.archived + published.outcome.templates);
  const html = await readFile(new URL('../_site/index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../_site/app.mjs', import.meta.url), 'utf8');
  // Every cached dependency URL must identify the bytes served by this build.
  const searchSource = await readFile(new URL('../_site/search.mjs', import.meta.url), 'utf8');
  for (const [parent, filename] of [[html, 'app.mjs'], [html, 'styles.css'], [app, 'search.mjs'], [app, 'catalog.json'], [searchSource, 'skill-ranking.mjs']]) {
    const bytes = await readFile(new URL(`../_site/${filename}`, import.meta.url));
    const fingerprint = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
    assert.ok(parent.includes(`${filename}?v=${fingerprint}`), `Unversioned or stale ${filename}`);
  }
});
test('links and install commands reject traversal and command injection', () => {
  assert.equal(githubPath('02-engineering/api-design-reviewer/SKILL.md'), 'https://github.com/findscripter/everything-skills/blob/main/02-engineering/api-design-reviewer/SKILL.md');
  for (const path of ['../secret', '/secret', 'file\\secret', 'a/../b', 'a//b']) assert.throws(() => githubPath(path));
  assert.match(commands('02-engineering'), /02-engineering@everything-skills$/);
  for (const volume of ['02-engineering\nrun bad', '../../x', '$(bad)']) assert.throws(() => commands(volume));
});
test('page links to the real outcome and teaching cases without HTML injection', async () => {
  const html = await readFile(new URL('../site/index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../site/app.mjs', import.meta.url), 'utf8');
  for (const name of ['nix-discovery', 'repository-onboarding', 'paper-reading', 'api-review']) assert.ok(html.includes(`/examples/${name}`));
  assert.ok(html.includes('role="search"'));
  assert.ok(html.includes('aria-live="polite"'));
  assert.ok(!app.includes('.innerHTML'));
});
