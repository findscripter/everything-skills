#!/usr/bin/env node
// Regenerate README skill-repos directory from data/skill-repos*.jsonl
// Rebuilds the whole section: summaries + collapsible <details> per category.
// Usage:
//   node scripts/refresh-readme-skill-repos-directory.mjs --lang=en
//   node scripts/refresh-readme-skill-repos-directory.mjs --lang=zh
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSkillRepos } from './load-skill-repos.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const README = path.join(ROOT, 'README.md');

const langArg = process.argv.find(a => a.startsWith('--lang='));
const LANG = (langArg ? langArg.slice('--lang='.length) : process.env.SKILL_LANG || '').toLowerCase();
if (!['en', 'zh'].includes(LANG)) {
  console.error('用法：node scripts/refresh-readme-skill-repos-directory.mjs --lang=en|zh（也可设置 SKILL_LANG）');
  process.exit(2);
}

const SECTION_META_ZH = [
  ['official', '1. 官方与权威（official）'],
  ['collections', '2. 精选列表 / 大集合（collections）'],
  ['vertical', '3. 垂直领域技能包（vertical）'],
  ['infra', '4. 安装器 / 注册表 / 基础设施（infra）'],
  ['other', '5. 其他（other）'],
  ['unnamed', '6. 名称不含 skill / agent（unnamed）'],
];

const SECTION_META_EN = [
  ['official', '1. Official'],
  ['collections', '2. Collections'],
  ['vertical', '3. Vertical'],
  ['infra', '4. Infra'],
  ['other', '5. Other'],
  ['unnamed', '6. Unnamed'],
];

const SECTION_META = LANG === 'en' ? SECTION_META_EN : SECTION_META_ZH;
const SECTION_HEADING = LANG === 'en' ? '## Skill repos directory' : '## 技能仓库目录';
const EMPTY_SUMMARY = LANG === 'en' ? '(no summary)' : '（暂无摘要）';

/** en → summary (English); zh → summary_zh then summary */
function pickSummary(o) {
  if (LANG === 'zh') {
    const zh = o.summary_zh;
    if (zh != null && String(zh).trim()) return zh;
  }
  return o.summary;
}

function sanitizeSummary(s) {
  const t = String(s ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t || EMPTY_SUMMARY;
}

/** Map Chinese status labels to English for --lang=en */
function pickStatus(status) {
  const s = String(status ?? '');
  if (LANG !== 'en') return s;
  const map = { '仅索引': 'indexed-only', '已采编': 'curated', '本项目': 'this-project' };
  return map[s] || s;
}

let repos;
try {
  repos = await loadSkillRepos();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const byFull = new Map(repos.map(repo => [String(repo.full_name).toLowerCase(), repo]));

const bySection = Object.fromEntries(SECTION_META.map(([id]) => [id, []]));
for (const o of byFull.values()) {
  const sec = bySection[o.section] ? o.section : 'unnamed';
  bySection[sec].push(o);
}
for (const id of Object.keys(bySection)) {
  bySection[id].sort(
    (a, b) => (b.stars || 0) - (a.stars || 0) || String(a.full_name).localeCompare(String(b.full_name)),
  );
}

const total = byFull.size;
const parts = [];
parts.push(SECTION_HEADING + '\n');
if (LANG === 'en') {
  parts.push(
    `\nCurrently indexing **${total}** GitHub skill libraries / marketplaces / curated lists. README summaries only — we do not vendor their source or copy their SKILL.md bodies.\n`,
  );
  parts.push(
    '\nFull tables (stars / summary / license) are generated from `data/skill-repos.jsonl` (and part shards) into **[INDEX/skill-repos.md](INDEX/skill-repos.md)**. This page is the categorized link directory.\n',
  );
} else {
  parts.push(
    `\n目前索引 **${total}** 个 GitHub 技能库/市场/精选列表。只根据 README 摘要，不收录对方源码、不复制 SKILL.md。\n`,
  );
  parts.push(
    '\n完整分表（含 stars / summary / license）由 `data/skill-repos.jsonl`（及 part 分片）生成，见 **[INDEX/skill-repos.md](INDEX/skill-repos.md)**。本页为归类链接目录。\n',
  );
}

const counts = {};
for (const [id, title] of SECTION_META) {
  const items = bySection[id];
  counts[id] = items.length;
  const countLabel = LANG === 'en' ? ` (${items.length})` : `（${items.length}）`;
  parts.push(`\n<details>\n<summary>${title}${countLabel}</summary>\n\n`);
  for (const o of items) {
    const url = o.html_url || `https://github.com/${o.full_name}`;
    const summary = sanitizeSummary(pickSummary(o));
    parts.push(`- [\`${o.full_name}\`](${url}) — ${summary}\n`);
  }
  parts.push(`\n</details>\n`);
}

const newSec = parts.join('');

let readme = await fs.readFile(README, 'utf8');
const BEGIN = '<!-- BEGIN GENERATED:skill-repos -->';
const END = '<!-- END GENERATED:skill-repos -->';
const beginAt = readme.indexOf(BEGIN);
const endAt = readme.indexOf(END);
if ((beginAt < 0) !== (endAt < 0)) throw new Error('README generated markers are incomplete');

if (beginAt >= 0) {
  if (readme.indexOf(BEGIN, beginAt + BEGIN.length) >= 0 || readme.indexOf(END, endAt + END.length) >= 0)
    throw new Error('README generated markers must be unique');
  readme = readme.slice(0, beginAt) + BEGIN + '\n' + newSec.trimEnd() + '\n' + readme.slice(endAt);
} else {
const altHeading = LANG === 'en' ? '## 技能仓库目录' : '## Skill repos directory';
let start = readme.indexOf(SECTION_HEADING);
let usedHeading = SECTION_HEADING;
if (start < 0) {
  start = readme.indexOf(altHeading);
  usedHeading = altHeading;
}
if (start < 0) throw new Error('missing ' + SECTION_HEADING + ' (or alt-language heading)');
const headingLen = usedHeading.length;
const rest = readme.slice(start + headingLen);
const m = rest.match(/\n## [^#]/);
const end = m ? start + headingLen + m.index : readme.length;
readme = readme.slice(0, start) + BEGIN + '\n' + newSec.trimEnd() + '\n' + END + readme.slice(end);
}
if (LANG === 'en') {
  // README chrome may use "Also indexes" or lowercase "also indexes"
  readme = readme.replace(
    /([Aa]lso indexes) \*\*\d+\*\* external GitHub skill (?:libraries|repos)/,
    (_, lead) => `${lead} **${total}** external GitHub skill libraries`,
  );
} else {
  readme = readme.replace(
    /另索引 \*\*\d+\*\* 个外部 GitHub 技能库/,
    `另索引 **${total}** 个外部 GitHub 技能库`,
  );
}
await fs.writeFile(README, readme, 'utf8');
console.log('updated README lang=' + LANG + ' unique=', total, counts);
