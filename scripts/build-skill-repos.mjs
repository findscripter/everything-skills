#!/usr/bin/env node
// 技能大典 · 技能仓库总目生成器（零依赖）
// 用法: node scripts/build-skill-repos.mjs
// 读 data/skill-repos.jsonl（及可选 skill-repos.partN.jsonl 分片）+ meta，写 INDEX/skill-repos.md。
// 请改 jsonl / meta，勿手改生成文件。

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const JSONL = path.join(DATA, 'skill-repos.jsonl');
const META = path.join(DATA, 'skill-repos.meta.md');
const OUT = path.join(ROOT, 'INDEX', 'skill-repos.md');

const SECTIONS = [
  { id: 'official', heading: '## 1. 官方与权威' },
  { id: 'collections', heading: '## 2. 精选列表 / 大集合' },
  { id: 'vertical', heading: '## 3. 垂直领域技能包' },
  { id: 'infra', heading: '## 4. 安装器 / 注册表 / 基础设施' },
  { id: 'other', heading: '## 5. 其他值得索引的技能库' },
  {
    id: 'unnamed',
    heading: '## 6. 名称不含 skill / agent 的技能库（本轮追加）',
    lead: '仓库名往往是方法论、产品或梗。判定依据是 README：可安装的 SKILL.md / Claude 插件市场 / `npx skills add`。',
  },
];
const KNOWN_SECTION = new Set(SECTIONS.map(s => s.id));
const KNOWN_STATUS = new Set(['仅索引', '已采编', '本项目']);
const REQUIRED = ['full_name', 'html_url', 'stars', 'summary', 'license', 'skill_count', 'status', 'section'];

const dataFiles = (await fs.readdir(DATA))
  .filter(n => n === 'skill-repos.jsonl' || /^skill-repos\.part\d+\.jsonl$/.test(n))
  .sort((a, b) => {
    const rank = n => n === 'skill-repos.jsonl' ? 1 : Number(n.match(/part(\d+)/)[1]);
    return rank(a) - rank(b);
  });
if (!dataFiles.includes('skill-repos.jsonl')) {
  console.error('缺少 data/skill-repos.jsonl');
  process.exit(1);
}
const raw = (await Promise.all(dataFiles.map(n => fs.readFile(path.join(DATA, n), 'utf8')))).join('\n');
const repos = [];
const seen = new Set();
let lineNo = 0;
for (const line of raw.split(/\r?\n/)) {
  lineNo++;
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  let obj;
  try { obj = JSON.parse(t); }
  catch (e) { console.error(`jsonl:${lineNo}: 非法 JSON`); process.exit(1); }
  for (const k of REQUIRED) {
    if (obj[k] === undefined || obj[k] === '') {
      console.error(`jsonl:${lineNo}: 缺少字段 "${k}"`); process.exit(1);
    }
  }
  if (!KNOWN_SECTION.has(obj.section)) {
    console.error(`jsonl:${lineNo}: 未知 section "${obj.section}"`); process.exit(1);
  }
  if (!KNOWN_STATUS.has(obj.status)) {
    console.error(`jsonl:${lineNo}: 未知 status "${obj.status}"`); process.exit(1);
  }
  if (typeof obj.stars !== 'number' || !Number.isFinite(obj.stars)) {
    console.error(`jsonl:${lineNo}: stars 须为数字`); process.exit(1);
  }
  if (seen.has(obj.full_name)) {
    console.error(`jsonl:${lineNo}: 重复 full_name "${obj.full_name}"`); process.exit(1);
  }
  seen.add(obj.full_name);
  repos.push(obj);
}

function fmtStars(n) {
  return Math.trunc(n).toLocaleString('en-US');
}

function cell(s) {
  return String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

const COLS = '| 仓库 | Stars | README 摘要 | 许可 | 技能数 | 采编 |';
const SEP = '|---|---:|---|---|---|---|';

function table(list) {
  const rows = list.map(r =>
    `| [${cell(r.full_name)}](${r.html_url}) | ${fmtStars(r.stars)} | ${cell(r.summary)} | ${cell(r.license)} | ${cell(r.skill_count)} | ${cell(r.status)} |`
  );
  return [COLS, SEP, ...rows].join('\n');
}

let meta = await fs.readFile(META, 'utf8');
meta = meta.replaceAll('{{COUNT}}', String(repos.length));
meta = meta.replace(/^# 技能仓库总目\s*\n+/ , '');

const chunks = [];
chunks.push('# 技能仓库总目');
chunks.push('');
chunks.push('> 由 scripts/build-skill-repos.mjs 生成，请改 data/skill-repos.jsonl，勿手改本文件。');
chunks.push('');
chunks.push(meta.trimEnd());
chunks.push('');

for (const sec of SECTIONS) {
  const list = repos.filter(r => r.section === sec.id);
  if (!list.length) continue;
  chunks.push(sec.heading);
  chunks.push('');
  if (sec.lead) {
    chunks.push(sec.lead);
    chunks.push('');
  }
  chunks.push(table(list));
  chunks.push('');
}

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, chunks.join('\n').replace(/\n+$/, '\n'));
console.log(`已生成 INDEX/skill-repos.md：${repos.length} 个独立仓库。`);
