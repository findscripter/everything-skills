import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { search, githubPath, commands } from '../site/search.mjs';

const rows = JSON.parse(await readFile(new URL('../INDEX/search.json', import.meta.url), 'utf8'));
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
});
test('links and install commands reject traversal and command injection', () => {
  assert.equal(githubPath('02-engineering/api-design-reviewer/SKILL.md'), 'https://github.com/findscripter/everything-skills/blob/main/02-engineering/api-design-reviewer/SKILL.md');
  for (const path of ['../secret', '/secret', 'file\\secret', 'a/../b', 'a//b']) assert.throws(() => githubPath(path));
  assert.match(commands('02-engineering'), /02-engineering@everything-skills$/);
  for (const volume of ['02-engineering\nrun bad', '../../x', '$(bad)']) assert.throws(() => commands(volume));
});
test('page links to three reproducible workflows and renders metadata without HTML injection', async () => {
  const html = await readFile(new URL('../site/index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../site/app.mjs', import.meta.url), 'utf8');
  for (const name of ['repository-onboarding', 'paper-reading', 'api-review']) assert.ok(html.includes(`/examples/${name}`));
  assert.ok(html.includes('role="search"'));
  assert.ok(html.includes('aria-live="polite"'));
  assert.ok(!app.includes('.innerHTML'));
});
