#!/usr/bin/env node
// Regenerate README skill-repos directory from data/skill-repos*.jsonl
// Keep the homepage compact; full repository rows live in INDEX/skill-repos.md.
// Usage:
//   node scripts/refresh-readme-skill-repos-directory.mjs --lang=en
//   node scripts/refresh-readme-skill-repos-directory.mjs --lang=zh
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSkillRepos, upstreamStatus } from './load-skill-repos.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const README = path.join(ROOT, 'README.md');

const langArg = process.argv.find(a => a.startsWith('--lang='));
const LANG = (langArg ? langArg.slice('--lang='.length) : process.env.SKILL_LANG || '').toLowerCase();
if (!['en', 'zh'].includes(LANG)) {
  console.error('用法：node scripts/refresh-readme-skill-repos-directory.mjs --lang=en|zh（也可设置 SKILL_LANG）');
  process.exit(2);
}

const SECTION_META_ZH = [
  ['official', '官方与权威', '1-官方与权威'],
  ['collections', '精选列表 / 大集合', '2-精选列表--大集合'],
  ['vertical', '垂直领域技能包', '3-垂直领域技能包'],
  ['infra', '安装器 / 注册表 / 基础设施', '4-安装器--注册表--基础设施'],
  ['other', '其他技能库', '5-其他值得索引的技能库'],
  ['unnamed', '名称不含 skill / agent', '6-名称不含-skill--agent-的技能库本轮追加'],
];

const SECTION_META_EN = [
  ['official', 'Official', '1-official'],
  ['collections', 'Collections', '2-collections'],
  ['vertical', 'Domain skills', '3-vertical'],
  ['infra', 'Installers / registries / infrastructure', '4-infra'],
  ['other', 'Other skill libraries', '5-other'],
  ['unnamed', 'Names without skill / agent', '6-unnamed-repo-name-lacks-skill--agent'],
];

const SECTION_META = LANG === 'en' ? SECTION_META_EN : SECTION_META_ZH;
const SECTION_HEADING = LANG === 'en' ? '## Skill repos directory' : '## 技能仓库目录';

let repos;
try {
  repos = await loadSkillRepos();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const bySection = Object.fromEntries(SECTION_META.map(([id]) => [id, []]));
for (const repo of repos) bySection[repo.section].push(repo);

const total = repos.length;
const parts = [];
parts.push(SECTION_HEADING + '\n');
if (LANG === 'en') {
  parts.push(
    `\nBrowse **${total}** indexed entries for external GitHub skill libraries, marketplaces, and curated lists. Their skill bodies are not bundled here.\n`,
  );
  parts.push(
    '\nOpen a category below for the complete tables, including summaries, licenses, recorded stars, and review status. [Full repository index](INDEX/skill-repos.md).\n\n| Category | Indexed entries |\n| --- | ---: |\n',
  );
} else {
  parts.push(
    `\n浏览 **${total}** 条外部 GitHub 技能库、市场和精选列表目录记录；这些上游的技能正文不随本仓库安装。\n`,
  );
  parts.push(
    '\n点击分类查看完整条目、摘要、许可、历史 Stars 与复核状态。[完整仓库总目](INDEX/skill-repos.md)。\n\n| 分类 | 目录记录 |\n| --- | ---: |\n',
  );
}

const counts = {};
for (const [id, title, anchor] of SECTION_META) {
  const items = bySection[id];
  counts[id] = items.length;
  const label = items.length ? `[${title}](INDEX/skill-repos.md#${anchor})` : title;
  parts.push(`| ${label} | ${items.length} |\n`);
}

// Preserve the distinction between directory coverage and current recommendations.
const states = new Map();
for (const repo of repos) {
  const state = upstreamStatus(repo, LANG);
  if (state && state !== (LANG === 'en' ? 'upstream accessible' : '上游可访问'))
    states.set(state, (states.get(state) || 0) + 1);
}
if (states.size) {
  const label = LANG === 'en' ? 'Recorded upstream status' : '已记录的上游状态';
  parts.push(`\n${label}: ${[...states].map(([state, count]) => `${count} ${state}`).join(' · ')}.\n`);
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
  if (endAt < beginAt) throw new Error('README generated markers must be ordered BEGIN before END');
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
    /([Aa]lso indexes) \*\*\d+\*\* (?:external GitHub skill (?:libraries|repos)|external repository entries)/,
    (_, lead) => `${lead} **${total}** external repository entries`,
  );
} else {
  readme = readme.replace(
    /另索引 \*\*\d+\*\* (?:个外部 GitHub 技能库|条外部仓库目录记录)/,
    `另索引 **${total}** 条外部仓库目录记录`,
  );
}
await fs.writeFile(README, readme, 'utf8');
console.log('updated README lang=' + LANG + ' indexed entries=', total, counts);
