#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loadSkillRepos } from './load-skill-repos.mjs';
import { check as checkOutcome } from '../examples/nix-discovery/check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
// Output stays inside this checkout. Rebuilds overwrite known files; they never delete a tree.
await fs.mkdir(OUT, { recursive: true });
for (const filename of ['index.html', 'styles.css', 'app.mjs', 'search.mjs']) await fs.copyFile(path.join(ROOT, 'site', filename), path.join(OUT, filename));
await fs.copyFile(path.join(ROOT, 'assets/brand/logo-static.svg'), path.join(OUT, 'logo.svg'));
await fs.copyFile(path.join(ROOT, 'scripts/skill-ranking.mjs'), path.join(OUT, 'skill-ranking.mjs'));
const rankingSource = await fs.readFile(path.join(OUT, 'skill-ranking.mjs'), 'utf8');
const rows = JSON.parse(await fs.readFile(path.join(ROOT, 'INDEX/search.json'), 'utf8'));
const repos = await loadSkillRepos();
const installSource = 'findscripter/everything-skills';
const activeIds = new Set(rows.filter(row => row.status !== 'deprecated').map(row => row.name));
const measuredCount = count => Number.isSafeInteger(count) && count > 0;
const installFile = path.join(ROOT, 'site/skill-installs.json');
let installSnapshot = JSON.parse(await fs.readFile(installFile, 'utf8'));
if (process.argv.includes('--refresh-installs')) {
  // shortcut: the public search feed returns a bounded sample, use a complete source feed if one becomes available.
  const url = new URL('https://skills.sh/api/search');
  url.search = new URLSearchParams({ q: installSource, limit: '100' });
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Skills.sh HTTP ${response.status}`);
  const data = await response.json();
  const entries = data.skills.filter(row => row.source === installSource && row.id === `${installSource}/${row.skillId}`
    && activeIds.has(row.skillId) && measuredCount(row.installs));
  if (!entries.length) throw new Error('No matching Skills.sh install records');
  entries.sort((a, b) => a.skillId.localeCompare(b.skillId, 'en'));
  installSnapshot = {
    checked_at: new Date().toISOString().slice(0, 10),
    installs: Object.fromEntries(entries.map(row => [row.skillId, row.installs])),
  };
  await fs.writeFile(installFile, JSON.stringify(installSnapshot, null, 2) + '\n');
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(installSnapshot.checked_at)) throw new Error('Invalid Skills.sh snapshot date');
const skills = rows.map(row => ({
  name: row.name, title: row.title, description: row.description, tags: row.tags, triggers: row.triggers,
  task_rankings: row.task_rankings, path: row.path, vol: row.vol, status: row.status,
  review_status: row.quality?.review_status || 'unreviewed',
  installs: activeIds.has(row.name) && measuredCount(installSnapshot.installs[row.name]) ? installSnapshot.installs[row.name] : null,
}));
const catalog = {
  outcome: checkOutcome(),
  installs_checked_at: installSnapshot.checked_at,
  stats: { total: rows.length, active: rows.filter(row => row.status !== 'deprecated').length, archived: rows.filter(row => row.status === 'deprecated').length, volumes: new Set(rows.map(row => row.vol)).size, repositories: repos.length },
  skills,
  repositories: repos.map(row => {
    const snapshot = row.upstream_snapshot;
    const hasStars = Number.isSafeInteger(snapshot?.stars) && snapshot.stars >= 0 && /^\d{4}-\d{2}-\d{2}$/.test(snapshot.checked_at);
    return {
      full_name: row.full_name, section: row.section || 'unnamed', summary: row.summary, summary_zh: row.summary_zh,
      recommendation: row.recommendation || 'unreviewed', upstream_state: snapshot?.state || 'unknown',
      stars: hasStars ? snapshot.stars : null, stars_checked_at: hasStars ? snapshot.checked_at : null,
    };
  }),
};
const catalogJson = JSON.stringify(catalog) + '\n';
await fs.writeFile(path.join(OUT, 'catalog.json'), catalogJson);
// Keep cached scripts, styles and data from mixing across a Pages deployment.
const version = text => createHash('sha256').update(text).digest('hex').slice(0, 12);
const searchSource = (await fs.readFile(path.join(OUT, 'search.mjs'), 'utf8')).replace("'../scripts/skill-ranking.mjs'", `'./skill-ranking.mjs?v=${version(rankingSource)}'`);
await fs.writeFile(path.join(OUT, 'search.mjs'), searchSource);
let appSource = await fs.readFile(path.join(OUT, 'app.mjs'), 'utf8');
appSource = appSource.replace("'./search.mjs'", `'./search.mjs?v=${version(searchSource)}'`).replace("'./catalog.json'", `'./catalog.json?v=${version(catalogJson)}'`);
await fs.writeFile(path.join(OUT, 'app.mjs'), appSource);
const cssSource = await fs.readFile(path.join(OUT, 'styles.css'), 'utf8');
const html = (await fs.readFile(path.join(OUT, 'index.html'), 'utf8')).replace('href="styles.css"', `href="styles.css?v=${version(cssSource)}"`).replace('src="app.mjs"', `src="app.mjs?v=${version(appSource)}"`);
await fs.writeFile(path.join(OUT, 'index.html'), html);
await fs.writeFile(path.join(OUT, '.nojekyll'), '');
await fs.writeFile(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://findscripter.github.io/everything-skills/sitemap.xml\n');
await fs.writeFile(path.join(OUT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://findscripter.github.io/everything-skills/</loc></url></urlset>\n');
try { await fs.copyFile(path.join(ROOT, 'site/social-card.png'), path.join(OUT, 'social-card.png')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
console.log(`Built _site: ${catalog.stats.active} current skills, ${catalog.stats.archived} archived, ${catalog.stats.repositories} external records.`);
