#!/usr/bin/env node
// Keep main/zh README introductions in one shared source tree.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
await fs.writeFile(path.join(ROOT, 'README.md'), intro.trimEnd() + '\n\n' + readme.slice(offset));
console.log(`Generated README introduction: ${lang}.`);
