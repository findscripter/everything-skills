#!/usr/bin/env node
// Keep main/zh README introductions in one shared source tree.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSkillRepos } from './load-skill-repos.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lang = process.argv.find(arg => arg.startsWith('--lang='))?.slice(7) || process.env.SKILL_LANG;
if (!['en', 'zh'].includes(lang)) {
  console.error('Usage: node scripts/build-readme-intro.mjs --lang=en|zh');
  process.exit(2);
}
const readme = await fs.readFile(path.join(ROOT, 'README.md'), 'utf8');
const begin = '<!-- BEGIN GENERATED:skill-repos -->', end = '<!-- END GENERATED:skill-repos -->';
const offset = readme.indexOf(begin), stop = readme.indexOf(end);
if (offset < 0 || stop < offset || readme.indexOf(begin, offset + begin.length) >= 0 || readme.indexOf(end, stop + end.length) >= 0)
  throw new Error('README must have exactly one ordered repository-directory marker pair.');
const intro = await fs.readFile(path.join(ROOT, 'data', `readme-intro.${lang}.md`), 'utf8');
if (!intro.includes('<!-- BEGIN GENERATED:brand -->') || !intro.includes('<!-- END GENERATED:brand -->'))
  throw new Error('The localized introduction must include brand markers.');
const [skills, repos] = await Promise.all([
  fs.readFile(path.join(ROOT, 'INDEX', 'search.json'), 'utf8').then(JSON.parse),
  loadSkillRepos(),
]);
const archived = skills.filter(skill => skill.status === 'deprecated').length;
const counts = {
  CURRENT_SKILLS: skills.length - archived,
  ARCHIVED_SKILLS: archived,
  BUNDLED_SKILLS: skills.length,
  EXTERNAL_REPOS: repos.length,
};
let rendered = intro;
for (const [name, value] of Object.entries(counts)) rendered = rendered.replaceAll(`{{${name}}}`, String(value));
await fs.writeFile(path.join(ROOT, 'README.md'), rendered.trimEnd() + '\n\n' + readme.slice(offset));
console.log(`Generated README introduction: ${lang}.`);
