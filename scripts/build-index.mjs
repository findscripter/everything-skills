#!/usr/bin/env node
// 技能大典 · 索引 / 目录 / 互见图谱 / 召回产物 生成器（零依赖）
// 用法: node scripts/build-index.mjs
// 扫描全库 **/SKILL.md，从 frontmatter 重建 INDEX/，并强校验：
//   必填字段、name 唯一与命名、domain↔卷目录一致、互见无悬空、requires 无环、弃用链完整。
// 产物: INDEX/{catalog,tags,tools,graph}.md + graph.json + search.json（两段式发现的召回层）。
// 有 error 时以退出码 1 结束（接入 CI / pre-commit）。

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['_template', 'INDEX', 'node_modules', '.git', 'scripts', 'assets']);

// 受控词表（卷→合法类），用于校验 domain 的「类」段
const TX = JSON.parse(await fs.readFile(path.join(ROOT, 'taxonomy.json'), 'utf8'));
const CLASSES = new Map(Object.entries(TX.vols).map(([d, s]) => [d, new Set(s.classes)]));

// 卷：目录 / 中文卷名 / 展示标题。中文卷名用于校验 domain 前缀↔目录一致。
const VOLS = [
  { dir: '00-meta',         cn: '通用', title: '卷〇 · 通用' },
  { dir: '01-documents',    cn: '文书', title: '卷一 · 文书' },
  { dir: '02-engineering',  cn: '研发', title: '卷二 · 研发' },
  { dir: '03-data',         cn: '数据', title: '卷三 · 数据' },
  { dir: '04-ai',           cn: '智能', title: '卷四 · 智能' },
  { dir: '05-business',     cn: '商业', title: '卷五 · 商业' },
  { dir: '06-creative',     cn: '创意', title: '卷六 · 创意' },
  { dir: '07-productivity', cn: '协作', title: '卷七 · 协作' },
  { dir: '08-security',     cn: '安全', title: '卷八 · 安全' },
  { dir: '09-verticals',    cn: '领域', title: '卷九 · 领域专精' },
  { dir: '10-platform',     cn: '平台', title: '卷十 · 平台集成' },
];
const DIR2VOL = new Map(VOLS.map(v => [v.dir, v]));
const CN2DIR = new Map(VOLS.map(v => [v.cn, v.dir]));

const REQUIRED = ['name', 'title', 'description', 'domain', 'status', 'agents'];
const REL_FIELDS = ['requires', 'related', 'combines_with'];
const UNDIRECTED = new Set(['related', 'combines_with']);
const KNOWN_AGENTS = new Set(['claude-code', 'codex', 'cursor', 'gemini-cli', 'copilot', 'windsurf', 'aider', 'cline']);
const DESC_WARN_LEN = 200;

const errors = [];
const warnings = [];

async function collect(dir, acc = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return acc; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue;
      await collect(path.join(dir, e.name), acc);
    } else if (e.name === 'SKILL.md') acc.push(path.join(dir, e.name));
  }
  return acc;
}

// 极简 frontmatter 解析（scalar / inline 数组 / 单行 description）+ 多行值告警
function parseFrontmatter(raw, file) {
  const lines = raw.replace(/^﻿/, '').split(/\r?\n/);
  if (lines[0].trim() !== '---') { errors.push(`${file}: 缺少 frontmatter（首行应为 ---）`); return null; }
  const fm = {};
  let i = 1, closed = false;
  for (; i < lines.length; i++) {
    if (lines[i].trim() === '---') { closed = true; break; }
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_]+):\s?(.*)$/);
    if (!m) { warnings.push(`${file}: frontmatter 内疑似多行/非法值被忽略 → "${line.trim().slice(0, 40)}"`); continue; }
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith('[') && val.endsWith(']'))
      fm[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    else fm[key] = val.replace(/^["']|["']$/g, '');
  }
  if (!closed) errors.push(`${file}: frontmatter 未闭合（缺少结束 ---）`);
  return fm;
}

const relOf = f => path.relative(ROOT, f).split(path.sep).join('/');

function parseTriggers(desc = '') {
  const m = desc.match(/触发词[:：]\s*(.+?)[。.]?\s*$/);
  return m ? m[1].split(/[、,，\/]+/).map(s => s.trim()).filter(Boolean) : [];
}

function validate(s) {
  const { fm, file, folder, vol } = s;
  for (const k of REQUIRED) {
    const v = fm[k];
    if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0))
      errors.push(`${relOf(file)}: 缺少必填字段 "${k}"`);
  }
  if (!DIR2VOL.has(vol)) { warnings.push(`${relOf(file)}: 顶层目录 "${vol}" 不在已知卷中`); }
  if (fm.name && fm.name !== folder) errors.push(`${relOf(file)}: name "${fm.name}" 与文件夹 "${folder}" 不一致`);
  if (fm.name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) errors.push(`${relOf(file)}: name "${fm.name}" 须 ASCII kebab-case`);
  // domain↔卷目录一致（修复旧版只查 vol、不查 domain 的背离）
  if (fm.domain) {
    const cn = String(fm.domain).split('/')[0].trim();
    const expect = DIR2VOL.get(vol);
    if (expect && cn !== expect.cn)
      errors.push(`${relOf(file)}: domain 卷 "${cn}" 与所在目录 ${vol}（应为 "${expect.cn}"）不一致`);
    if (!CN2DIR.has(cn)) warnings.push(`${relOf(file)}: domain 卷 "${cn}" 不在受控卷名中`);
    const cls2 = (String(fm.domain).split('/')[1] || '').trim();
    const allowed = CLASSES.get(vol);
    if (allowed && cls2 && !allowed.has(cls2))
      errors.push(`${relOf(file)}: domain 类 "${cls2}" 不在卷 ${vol} 受控类集（见 taxonomy.json）`);
  }
  if (fm.level && !['入门', '进阶', '精通'].includes(fm.level)) warnings.push(`${relOf(file)}: level "${fm.level}" 非标准值`);
  if (fm.status && !['draft', 'stable', 'deprecated'].includes(fm.status)) warnings.push(`${relOf(file)}: status "${fm.status}" 非标准值`);
  if (typeof fm.description === 'string') {
    if (fm.description.length < 12) warnings.push(`${relOf(file)}: description 过短，影响发现命中`);
    if (fm.description.length > DESC_WARN_LEN) warnings.push(`${relOf(file)}: description 过长(${fm.description.length}>${DESC_WARN_LEN})，挤占发现上下文预算`);
    if (!/触发词[:：]/.test(fm.description)) warnings.push(`${relOf(file)}: description 缺「触发词：」段，建议补充以提升召回`);
  }
  for (const a of (fm.agents || [])) if (!KNOWN_AGENTS.has(a)) warnings.push(`${relOf(file)}: 未知 agent "${a}"（受控词表外）`);
  if (fm.source && !fm.source_license) warnings.push(`${relOf(file)}: 有 source 但缺 source_license（采编须注明原始许可）`);
  if (fm.source_license && /proprietary|source-available|all rights reserved|未授权/i.test(fm.source_license))
    errors.push(`${relOf(file)}: source_license="${fm.source_license}" 不可再分发，不得采编其内容`);
}

// ---------- 主流程 ----------
const files = await collect(ROOT);
const skills = [];
for (const file of files) {
  const fm = parseFrontmatter(await fs.readFile(file, 'utf8'), relOf(file));
  if (!fm) continue;
  const parts = relOf(file).split('/');
  skills.push({ fm, file, vol: parts[0], folder: parts[parts.length - 2] || '' });
}

const byName = new Map();
for (const s of skills) {
  if (!s.fm.name) continue;
  if (byName.has(s.fm.name)) errors.push(`重名 name "${s.fm.name}"：${relOf(byName.get(s.fm.name).file)} 与 ${relOf(s.file)}`);
  else byName.set(s.fm.name, s);
}
for (const s of skills) validate(s);

// 弃用链校验
for (const s of skills) {
  if (s.fm.status === 'deprecated') {
    const sup = s.fm.supersedes || [];
    if (!sup.length) errors.push(`${relOf(s.file)}: status=deprecated 但缺 supersedes（继任技能）`);
    for (const t of sup) if (!byName.has(t)) errors.push(`${relOf(s.file)}: supersedes → "${t}" 不存在`);
  }
}

// 互见边 + 悬空(error) + 指向 deprecated(error)
const edges = [];
for (const s of skills) {
  for (const field of REL_FIELDS) {
    for (const target of (Array.isArray(s.fm[field]) ? s.fm[field] : [])) {
      const tgt = byName.get(target);
      if (!tgt) { errors.push(`${relOf(s.file)}: 悬空互见 ${field} → "${target}"`); continue; }
      if (tgt.fm.status === 'deprecated' && s.fm.status !== 'deprecated')
        errors.push(`${relOf(s.file)}: ${field} 指向已弃用技能 "${target}"`);
      edges.push({ from: s.fm.name, to: target, type: field });
    }
  }
}

// requires 环检测（DFS 找回边）
{
  const adj = new Map();
  for (const e of edges) if (e.type === 'requires') { if (!adj.has(e.from)) adj.set(e.from, []); adj.get(e.from).push(e.to); }
  const state = new Map(); // 0=visiting 1=done
  const stack = [];
  const dfs = n => {
    state.set(n, 0); stack.push(n);
    for (const m of (adj.get(n) || [])) {
      if (state.get(m) === 0) { errors.push(`requires 成环：${[...stack.slice(stack.indexOf(m)), m].join(' → ')}`); }
      else if (state.get(m) === undefined) dfs(m);
    }
    stack.pop(); state.set(n, 1);
  };
  for (const n of byName.keys()) if (state.get(n) === undefined) dfs(n);
}

// 孤岛(warning)
for (const s of skills) {
  const out = REL_FIELDS.some(f => Array.isArray(s.fm[f]) && s.fm[f].length);
  const inn = edges.some(e => e.to === s.fm.name);
  if (!out && !inn) warnings.push(`${relOf(s.file)}: 孤岛技能（无任何互见）`);
}

// ---------- 生成 INDEX ----------
const INDEX = path.join(ROOT, 'INDEX');
await fs.mkdir(INDEX, { recursive: true });
const stamp = '> 本文件由 scripts/build-index.mjs 自动生成，请勿手改。\n';
const linkOf = s => `${s.vol}/${s.folder}/SKILL.md`;
const sorted = [...skills].sort((a, b) => (a.fm.name || '').localeCompare(b.fm.name || ''));

// catalog.md
{
  const byVol = new Map();
  for (const s of skills) { if (!byVol.has(s.vol)) byVol.set(s.vol, []); byVol.get(s.vol).push(s); }
  let md = `# 全书总目 · Catalog\n\n${stamp}\n共 ${skills.length} 条技能。\n`;
  for (const v of VOLS) {
    const list = byVol.get(v.dir);
    if (!list || !list.length) continue;
    md += `\n## ${v.title}\n\n`;
    for (const s of list.sort((a, b) => (a.fm.domain || '').localeCompare(b.fm.domain || '') || (a.fm.name || '').localeCompare(b.fm.name || ''))) {
      const dep = s.fm.status === 'deprecated' ? ' ~~(deprecated)~~' : '';
      md += `- [\`${s.fm.name}\`](../${linkOf(s)}) — ${s.fm.title || ''}${dep}　\`${s.fm.domain || ''}\`${s.fm.level ? ' · ' + s.fm.level : ''}\n`;
    }
  }
  await fs.writeFile(path.join(INDEX, 'catalog.md'), md);
}

// tags.md / tools.md
for (const [field, fname, title] of [['tags', 'tags.md', '标签索引 · Tags'], ['tools', 'tools.md', '工具索引 · Tools']]) {
  const map = new Map();
  for (const s of sorted) for (const t of (s.fm[field] || [])) { if (!map.has(t)) map.set(t, []); map.get(t).push(s); }
  let md = `# ${title}\n\n${stamp}\n`;
  if (!map.size) md += '\n（暂无数据）\n';
  for (const t of [...map.keys()].sort()) {
    md += `\n### \`${t}\`\n`;
    for (const s of map.get(t)) md += `- [\`${s.fm.name}\`](../${linkOf(s)}) — ${s.fm.title || ''}\n`;
  }
  await fs.writeFile(path.join(INDEX, fname), md);
}

// graph.json + graph.md（related/combines_with 视为无向、去重；requires 有向）
{
  const nodes = skills.map(s => ({ id: s.fm.name, title: s.fm.title, domain: s.fm.domain, level: s.fm.level, status: s.fm.status }));
  // 无向边去重
  const seen = new Set();
  const rendered = [];
  for (const e of edges) {
    if (!byName.has(e.to)) continue;
    if (UNDIRECTED.has(e.type)) {
      const key = e.type + ':' + [e.from, e.to].sort().join('|');
      if (seen.has(key)) continue; seen.add(key);
    }
    rendered.push(e);
  }
  await fs.writeFile(path.join(INDEX, 'graph.json'), JSON.stringify({ nodes, edges }, null, 2));
  const arrow = { requires: '-->|requires|', related: '-.-|related|', combines_with: '===|combines|' };
  let md = `# 互见图谱 · Graph\n\n${stamp}\n依赖(requires) 实箭头有向、互见(related) 虚线无向、组合(combines_with) 粗线无向。\n\n\`\`\`mermaid\ngraph LR\n`;
  for (const e of rendered) md += `  ${e.from} ${arrow[e.type]} ${e.to}\n`;
  md += '```\n';
  await fs.writeFile(path.join(INDEX, 'graph.md'), md);
}

// search.json —— 两段式发现的召回层（扁平记录，供向量/BM25/关键词索引）
{
  const records = skills.map(s => ({
    name: s.fm.name, title: s.fm.title, vol: s.vol, domain: s.fm.domain,
    level: s.fm.level || '', status: s.fm.status || '',
    tags: s.fm.tags || [], triggers: parseTriggers(s.fm.description),
    description: s.fm.description || '', path: linkOf(s),
  }));
  await fs.writeFile(path.join(INDEX, 'search.json'), JSON.stringify(records, null, 2));
}

// sources.md —— 采编署名与许可清单（合规用）
{
  const withSrc = sorted.filter(s => s.fm.source);
  let md = `# 采编来源与许可 · Sources\n\n${stamp}\n采编自第三方的技能及其原始许可（自有原创技能不在此列）。\n`;
  if (!withSrc.length) md += '\n（暂无采编条目）\n';
  for (const s of withSrc)
    md += `- [\`${s.fm.name}\`](../${linkOf(s)}) ← ${s.fm.source}　\`${s.fm.source_license || '未注明'}\`\n`;
  await fs.writeFile(path.join(INDEX, 'sources.md'), md);
}

// .claude-plugin/marketplace.json —— 使仓库可作为 Claude Code 插件市场安装
// （对标 anthropics/skills、wshobson/agents：卷→plugin，显式列技能路径，不依赖 skills/ 约定）
{
  const byVol = new Map();
  for (const s of skills) { if (!byVol.has(s.vol)) byVol.set(s.vol, []); byVol.get(s.vol).push(s); }
  const plugins = [];
  for (const v of VOLS) {
    const list = byVol.get(v.dir);
    if (!list || !list.length) continue;
    plugins.push({
      name: v.dir,
      description: `${v.title} —— ${list.length} 个技能`,
      source: './',
      strict: false,
      skills: list.map(s => `./${v.dir}/${s.folder}`),
    });
  }
  const mp = {
    name: 'everything-skills',
    owner: { name: 'findscripter' },
    metadata: { description: '技能大典 · Everything Skills — 类书式 AI Agent 技能库', version: '1.0.0' },
    plugins,
  };
  await fs.mkdir(path.join(ROOT, '.claude-plugin'), { recursive: true });
  await fs.writeFile(path.join(ROOT, '.claude-plugin', 'marketplace.json'), JSON.stringify(mp, null, 2));
}

// 多 harness 上下文文件：CLAUDE.md / AGENTS.md / GEMINI.md 同源 + gemini-extension.json
// 对标 obra/superpowers、wshobson/agents——让 Claude Code / Codex / Gemini CLI / Cursor 等都能发现并使用本库技能。
// 注：本库技能分布在 11 个卷目录（非单一 skills/），故用「上下文文件指路」而非依赖目录约定的 skills 路径。
{
  const ctx = `<!-- 本文件由 scripts/build-index.mjs 自动生成，请勿手改。 -->
# 技能大典 · Everything Skills —— AI Agent 使用指南

本仓库是面向 AI Agent 的技能库：**${skills.length} 条 \`SKILL.md\` 技能**，按 11 卷功能域组织在 \`00-meta/\` … \`10-platform/\` 目录下（非单一 \`skills/\` 目录）。

## 如何发现技能
- Agent 按每条技能 frontmatter 的 \`description\` 字段匹配是否加载——不靠浏览目录。
- 人工浏览：\`INDEX/catalog.md\`（按卷/类总目）、\`INDEX/tags.md\`（标签）、\`INDEX/graph.md\`（互见关系图）。
- 机读召回：\`INDEX/search.json\`（name/description/triggers/domain 扁平记录，供"先粗筛域/标签、再按 description 精排"的两段式发现）。

## 如何使用一条技能
进入该技能文件夹，读取其 \`SKILL.md\` 并遵循「## 步骤 / 指令」。每条技能单一职责、自包含。

## 安装（Claude Code 插件市场）
\`\`\`
/plugin marketplace add findscripter/everything-skills
\`\`\`
11 卷对应 11 个插件，可整库或按卷安装。

## 技能间关系
通过 frontmatter 的 \`requires\`(依赖) / \`related\`(相关) / \`combines_with\`(组合) 表达，汇总于 \`INDEX/graph.md\`。

## 许可
精选改编的合集，逐条许可见各 \`SKILL.md\` 的 \`source_license\` 与 \`INDEX/sources.md\`；总说明见 \`LICENSE\` 与 \`NOTICE\`。
`;
  for (const f of ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md']) await fs.writeFile(path.join(ROOT, f), ctx);
  const gemExt = {
    name: 'everything-skills',
    description: '类书式 AI Agent 技能大典：精选/中文化/互见成网的开源技能库',
    version: '1.0.0',
    contextFileName: 'GEMINI.md',
  };
  await fs.writeFile(path.join(ROOT, 'gemini-extension.json'), JSON.stringify(gemExt, null, 2));
}

// ---------- 汇报 ----------
console.log(`扫描到 ${skills.length} 条技能，${edges.length} 条互见边。`);
console.log('已生成 INDEX/{catalog,tags,tools,graph,sources}.md + graph.json + search.json + .claude-plugin/marketplace.json');
if (warnings.length) { console.log(`\n⚠ 警告 ${warnings.length}：`); for (const w of warnings) console.log('  - ' + w); }
if (errors.length) { console.error(`\n✗ 错误 ${errors.length}：`); for (const e of errors) console.error('  - ' + e); process.exit(1); }
console.log('\n✓ 校验通过。');
