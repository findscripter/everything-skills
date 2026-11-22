import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { search, githubPath, commands, popularRepositories, popularSkills } from '../site/search.mjs';
import { searchRows } from '../scripts/everything-skills.mjs';
import { loadSkillRepos } from '../scripts/load-skill-repos.mjs';

const rows = JSON.parse(await readFile(new URL('../INDEX/search.json', import.meta.url), 'utf8'));

test('site task recommendations preserve filters, exact IDs and unrelated searches', () => {
  const fixtures = ['alpha', 'beta', 'retired'].map((name, index) => ({ name, description: 'fixture task', vol: index === 0 ? '00-meta' : '01-documents', status: name === 'retired' ? 'deprecated' : 'stable', task_rankings: [{ task:'fixture-task', title:'任务', title_en:'Task', triggers:['fixture task'], rank:index === 0 ? 2 : 1, reason:'范围', reason_en:'Scope' }] }));
  assert.deepEqual(search(fixtures, 'fixture task').map(row => row.name), ['beta', 'alpha']);
  assert.equal(search(fixtures, 'fixture task')[0].recommendation.rank, 1);
  assert.deepEqual(search(fixtures, 'fixture task', {category:'00-meta'}).map(row => row.name), ['alpha']);
  assert.equal(search(fixtures, 'alpha')[0].name, 'alpha');
  assert.ok(search(fixtures, 'fixture').every(row => !row.recommendation));
});

test('PPT search preserves file recommendations and the independent Python-script deliverable', async () => {
  const build = spawnSync(process.execPath, ['scripts/build-site.mjs'], {cwd:new URL('..', import.meta.url), encoding:'utf8', windowsHide:true});
  assert.equal(build.status, 0, build.stderr);
  const published = JSON.parse(await readFile(new URL('../_site/catalog.json', import.meta.url), 'utf8')).skills;
  for (const [query, expected] of [['做PPT','pptx-document-processing'], ['用Python生成PPT','python-pptx-deck-generator'], ['投行模板填充','ib-pitch-deck-builder']]) {
    const cli = searchRows(rows, query, 2), site = search(published, query).slice(0, 2);
    assert.equal(cli[0].row.name, expected);
    assert.equal(site[0].name, expected);
    if (query === '用Python生成PPT') {
      assert.ok(!site[0].recommendation && !cli[0].recommendation);
    } else {
      assert.deepEqual(site.map(row => row.name), cli.map(item => item.row.name));
      assert.equal(site[0].recommendation.rank, 1);
    }
  }
  const html = search(published, 'HTML幻灯片')[0];
  assert.equal(html.name, 'html-animated-slides');
  assert.ok(!html.recommendation);
  assert.equal(search(published, '做 PPT')[0].recommendation?.rank, 1);
  assert.equal(searchRows(rows, 'pitch-deck-refresh', 1)[0].row.name, 'pitch-deck-refresh');
});

test('every registered task group reaches its declared first choice in both search consumers', async () => {
  const groups = JSON.parse(await readFile(new URL('../data/skill-rankings.json', import.meta.url), 'utf8'));
  const review = JSON.parse(await readFile(new URL('../data/skill-ranking-review.json', import.meta.url), 'utf8'));
  const current = rows.filter(row => row.status !== 'deprecated');
  assert.deepEqual(review.skills.map(row => row.name).sort(), current.map(row => row.name).sort());
  for (const group of groups) {
    const query = group.triggers[0];
    const exact = current.find(row => row.name.toLowerCase() === query.trim().toLowerCase());
    const expected = exact?.name || group.entries[0].skill;
    const cli = searchRows(rows, query, 1)[0];
    const site = search(rows, query)[0];
    assert.equal(cli.row.name, expected, `${group.id}: CLI`);
    assert.equal(site.name, expected, `${group.id}: site`);
    assert.equal(cli.recommendation.task, group.id);
    assert.equal(site.recommendation.task, group.id);
    for (const entry of group.entries) assert.ok(review.skills.some(row => row.name === entry.skill && row.decision === 'ranked' && row.review_scope === 'full-body-comparison'));
  }
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
test('repository discovery puts a complete owner/repo match first by relevance', () => {
  const fixtures = [
    { full_name: 'example/papers-tools', summary: 'Example papers', summary_zh: 'Example papers' },
    { full_name: 'example/papers' },
  ];
  assert.equal(search(fixtures, 'EXAMPLE/papers', { mode: 'repos' })[0].full_name, 'example/papers');
});
test('repository Stars sorting keeps query and category filters and puts unknown counts last', () => {
  const fixtures = [
    { full_name: 'example/unknown', stars: null },
    { full_name: 'example/zero', stars: 0 },
    { full_name: 'example/zeta', stars: 10 },
    { full_name: 'example/alpha', stars: 10 },
    { full_name: 'example/archive', stars: 20, upstream_state: 'archived' },
    { full_name: 'example/missing', stars: 99, upstream_state: 'unavailable' },
    { full_name: 'example/history', stars: 98, recommendation: 'historical-only' },
    { full_name: 'example/other-volume', stars: 97, section: 'infra' },
    { full_name: 'unrelated/repo', stars: 96 },
  ].map(row => ({ section: 'vertical', upstream_state: 'active', ...row }));
  assert.deepEqual(search(fixtures, 'example', { mode: 'repos', category: 'vertical', sort: 'stars' }).map(row => row.full_name),
    ['example/archive', 'example/alpha', 'example/zeta', 'example/zero', 'example/unknown']);
  assert.deepEqual(popularRepositories(fixtures, { category: 'vertical' }).map(row => row.full_name),
    ['unrelated/repo', 'example/alpha', 'example/zeta']);
});

test('skill install rankings show only measured current skills and respect search and volume filters', () => {
  const fixtures = [
    { name: 'archive', installs: 50, status: 'deprecated' },
    { name: 'unknown', installs: null },
    { name: 'zeta', installs: 2 },
    { name: 'alpha', installs: 2 },
    { name: 'beta', installs: 3 },
    { name: 'other', installs: 6, vol: '02-engineering' },
  ].map(row => ({ vol: '01-documents', description: 'example', ...row }));
  const options = { category: '01-documents', sort: 'installs' };
  assert.deepEqual(search(fixtures, 'example', options).map(row => row.name), ['beta', 'alpha', 'zeta']);
  assert.deepEqual(search(fixtures, 'zeta', options).map(row => row.name), ['zeta']);
  assert.ok(search(fixtures, '').some(row => row.name === 'unknown'));
  assert.deepEqual(popularSkills(fixtures).map(row => row.name), ['other', 'beta', 'alpha', 'zeta']);
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
  const installSnapshot = JSON.parse(await readFile(new URL('../site/skill-installs.json', import.meta.url), 'utf8'));
  assert.equal(published.installs_checked_at, installSnapshot.checked_at);
  assert.match(published.installs_checked_at, /^\d{4}-\d{2}-\d{2}$/);
  const publishedInstalls = popularSkills(published.skills);
  const currentIds = new Set(published.skills.filter(row => row.status !== 'deprecated').map(row => row.name));
  const matchedSnapshot = Object.fromEntries(Object.entries(installSnapshot.installs).filter(([name]) => currentIds.has(name)));
  assert.deepEqual(Object.fromEntries(publishedInstalls.map(row => [row.name, row.installs])), matchedSnapshot);
  const original = await loadSkillRepos();
  const dated = original.find(row => row.upstream_snapshot?.stars > 0 && row.upstream_snapshot.stars !== row.stars);
  assert.ok(dated, 'Fixture needs a measured snapshot different from the recorded batch count');
  const publishedDated = published.repositories.find(row => row.full_name === dated.full_name);
  assert.equal(publishedDated.stars, dated.upstream_snapshot.stars);
  assert.equal(publishedDated.stars_checked_at, dated.upstream_snapshot.checked_at);
  assert.equal(knownHistorical.stars, null);
  assert.equal(knownHistorical.stars_checked_at, null);
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

test('the homepage links to a shareable on-site comparison catalog', async () => {
  const html = await readFile(new URL('../site/index.html', import.meta.url), 'utf8');
  assert.match(html, /id="all-comparisons"[^>]+href="\?kind=tasks#catalog-results"/);
});
