#!/usr/bin/env node
// Regenerate README ## 技能仓库目录 from data/skill-repos*.jsonl
// Preserves existing bullet order; appends new full_names at end of each section.
// Usage: node scripts/refresh-readme-skill-repos-directory.mjs
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const README = path.join(ROOT, 'README.md');

const SECTION_META = [
  ['official', '1. 官方与权威（official）'],
  ['collections', '2. 精选列表 / 大集合（collections）'],
  ['vertical', '3. 垂直领域技能包（vertical）'],
  ['infra', '4. 安装器 / 注册表 / 基础设施（infra）'],
  ['other', '5. 其他（other）'],
  ['unnamed', '6. 名称不含 skill / agent（unnamed）'],
];

const files = (await fs.readdir(DATA))
  .filter(n => n === 'skill-repos.jsonl' || /^skill-repos\.part\d+\.jsonl$/.test(n))
  .sort((a, b) => {
    const rank = n => (n === 'skill-repos.jsonl' ? 1 : Number(n.match(/part(\d+)/)[1]));
    return rank(a) - rank(b);
  });

const byFull = new Map();
for (const n of files) {
  const text = await fs.readFile(path.join(DATA, n), 'utf8');
  for (const line of text.split(/\n/)) {
    if (!line.trim()) continue;
    const o = JSON.parse(line);
    const key = String(o.full_name || '').toLowerCase();
    if (!key || byFull.has(key)) continue;
    byFull.set(key, o);
  }
}

let readme = await fs.readFile(README, 'utf8');
const start = readme.indexOf('## 技能仓库目录');
if (start < 0) throw new Error('missing ## 技能仓库目录');
const rest = readme.slice(start + 10);
const m = rest.match(/\n## [^#]/);
const end = m ? start + 10 + m.index : readme.length;
const oldSec = readme.slice(start, end);

const secRe = /### (\d+\. .+?)（(\d+)）\n\n([\s\S]*?)(?=\n### |\s*$)/g;
const blocks = new Map();
for (const match of oldSec.matchAll(secRe)) {
  const title = match[1];
  const num = Number(title.split('.', 1)[0]);
  const sid = {1:'official',2:'collections',3:'vertical',4:'infra',5:'other',6:'unnamed'}[num];
  const bullets = [...match[3].matchAll(/- \[`([^`]+)`\]\(([^)]+)\)/g)].map(x => [x[1], x[2]]);
  blocks.set(sid, bullets);
}

const present = new Set();
for (const bullets of blocks.values()) for (const [fn] of bullets) present.add(fn.toLowerCase());

const extras = Object.fromEntries(SECTION_META.map(([id]) => [id, []]));
for (const o of byFull.values()) {
  const sec = extras[o.section] ? o.section : 'unnamed';
  if (!present.has(o.full_name.toLowerCase())) extras[sec].push(o);
}
for (const id of Object.keys(extras)) {
  extras[id].sort((a, b) => (b.stars||0) - (a.stars||0) || a.full_name.localeCompare(b.full_name));
}

const total = byFull.size;
const parts = [];
parts.push('## 技能仓库目录\n');
parts.push(`\n目前索引 **${total}** 个 GitHub 技能库/市场/精选列表。只根据 README 摘要，不收录对方源码、不复制 SKILL.md。\n`);
parts.push('\n完整分表（含 stars / summary / license）由 `data/skill-repos.jsonl`（及 part 分片）生成，见 **[INDEX/skill-repos.md](INDEX/skill-repos.md)**。本页为归类链接目录。\n');
for (const [id, title] of SECTION_META) {
  const bullets = [...(blocks.get(id) || [])];
  for (const o of extras[id]) bullets.push([o.full_name, o.html_url]);
  parts.push(`\n### ${title}（${bullets.length}）\n\n`);
  for (const [fn, url] of bullets) parts.push(`- [\`${fn}\`](${url})\n`);
}
const newSec = parts.join('');
readme = readme.slice(0, start) + newSec + readme.slice(end);
readme = readme.replace(/另索引 \*\*\d+\*\* 个外部 GitHub 技能库/, `另索引 **${total}** 个外部 GitHub 技能库`);
await fs.writeFile(README, readme);
const counts = Object.fromEntries(SECTION_META.map(([id, title]) => {
  const bullets = [...(blocks.get(id) || [])];
  for (const o of extras[id]) bullets.push(o);
  return [id, bullets.length];
}));
console.log('updated README unique=', total, counts);
