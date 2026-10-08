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
// 注：历史英文镜像树位于 en/，当前主索引仍跳过该目录以免重名误报。
const SKIP_DIRS = new Set(['_template', 'INDEX', 'node_modules', '.git', 'scripts', 'assets', 'en']);
const langArg = process.argv.find(a => a.startsWith('--lang='));
const LANG = (langArg ? langArg.slice('--lang='.length) : process.env.SKILL_LANG || '').toLowerCase();
if (!['en', 'zh'].includes(LANG)) {
  console.error('用法：node scripts/build-index.mjs --lang=en|zh（也可设置 SKILL_LANG）');
  process.exit(2);
}

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
const ARRAY_FIELDS = ['agents', ...REL_FIELDS, 'supersedes', 'tags', 'tools', 'triggers'];
const UNDIRECTED = new Set(['related', 'combines_with']);
const KNOWN_AGENTS = new Set(['claude-code', 'codex', 'cursor', 'gemini-cli', 'copilot', 'windsurf', 'aider', 'cline']);
const DESC_WARN_LEN = 200;

const errors = [];
const warnings = [];
const pendingWrites = new Map();

// 生成器可能在一个工作目录旁边遇到另一个完整 checkout（例如本地的
// everything-skills/）。嵌套 checkout 不是本仓库的数据源，必须在递归时
// 跳过，否则会把同一批技能扫描两遍并产生大量假重名。
async function hasGitMetadata(dir) {
  try {
    await fs.access(path.join(dir, '.git'));
    return true;
  } catch {
    return false;
  }
}

async function collect(dir, acc = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return acc; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue;
      if (await hasGitMetadata(path.join(dir, e.name))) continue;
      await collect(path.join(dir, e.name), acc);
    } else if (e.name === 'SKILL.md') acc.push(path.join(dir, e.name));
  }
  return acc;
}

function parseQuotedScalar(value) {
  if (value.startsWith('"')) {
    try { return JSON.parse(value); } catch { return null; }
  }
  if (value.startsWith("'"))
    return value.endsWith("'") ? value.slice(1, -1).replaceAll("''", "'") : null;
  return value;
}

function parseArrayItem(item) {
  if (/^["']/.test(item)) return parseQuotedScalar(item);
  if (/^(null|~)$/i.test(item) || /^[\[{]/.test(item)) return null;
  if (/^(true|false)$/i.test(item)) return item.toLowerCase() === 'true';
  if (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(item)) return Number(item);
  return item;
}

// 保留 flow 数组元素的基本类型，避免把数字、布尔值等强行当成字符串。
// 带引号的逗号属于字符串内容，不是数组分隔符。
function parseInlineArray(value) {
  const body = value.slice(1, -1);
  if (!body.trim()) return [];
  const parts = [];
  let part = '', quote = '';
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (quote) {
      part += char;
      if (quote === '"' && char === '\\' && i + 1 < body.length) part += body[++i];
      else if (char === quote) {
        if (quote === "'" && body[i + 1] === "'") part += body[++i];
        else quote = '';
      }
    } else if ((char === '"' || char === "'") && !part.trim()) {
      quote = char;
      part += char;
    } else if (char === ',') {
      parts.push(part.trim());
      part = '';
    } else part += char;
  }
  if (quote) return null;
  parts.push(part.trim());
  return parts.map(parseArrayItem);
}

function parseBlockArray(lines, file, key) {
  const items = [];
  let indent;
  for (const line of lines) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = line.match(/^( +)-(?:\s+(.*)|\s*)$/);
    if (!match || (indent !== undefined && match[1].length !== indent)) {
      errors.push(`${file}: 字段 "${key}" 的多行数组仅支持同级、单行字符串元素`);
      return null;
    }
    indent = match[1].length;
    const value = (match[2] || '').trim();
    // 嵌套 sequence / mapping 不属于 string[]，不能扁平化成字符串。
    items.push(!/^["']/.test(value) && (/^-(?:\s|$)/.test(value) || /:\s/.test(value)) ? null : parseArrayItem(value));
  }
  return items.length ? items : null;
}

function parseBlockString(lines, indicator, file, key) {
  const content = lines.filter(line => !line.startsWith('#'));
  const first = content.find(line => line.trim());
  if (!first) return indicator.endsWith('+') ? '\n'.repeat(content.length) : '';
  const indent = first.match(/^ */)[0].length;
  if (!indent || content.some(line => line.trim() && !line.startsWith(' '.repeat(indent)))) {
    errors.push(`${file}: 字段 "${key}" 的多行字符串须使用一致的内容缩进`);
    return null;
  }
  const values = content.map(line => line.trim() ? line.slice(indent) : '');
  let text;
  if (indicator.startsWith('|')) text = values.join('\n');
  else {
    text = '';
    let previous, blanks = 0;
    for (const value of values) {
      if (!value) { blanks++; continue; }
      if (previous === undefined) text += '\n'.repeat(blanks);
      else if (blanks) text += '\n'.repeat(blanks);
      else text += previous.startsWith(' ') || value.startsWith(' ') ? '\n' : ' ';
      text += value;
      previous = value;
      blanks = 0;
    }
    text += '\n'.repeat(blanks);
  }
  text += '\n';
  if (indicator.endsWith('-')) return text.replace(/\n+$/, '');
  if (indicator.endsWith('+')) return text;
  return text.replace(/\n+$/, '') + '\n';
}

// 受限 frontmatter：scalar、flow/block 字符串数组、|/> 多行字符串。
// 多行值在下一个顶层 key 或 frontmatter 结束符处停止，不解释嵌套 YAML 对象。
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
    const val = m[2].trim();
    if (/^[|>][+-]?$/.test(val) || (!val && ARRAY_FIELDS.includes(key))) {
      let end = i + 1;
      while (end < lines.length && !/^(?:[A-Za-z_]+:|---\s*$)/.test(lines[end])) end++;
      const block = lines.slice(i + 1, end);
      fm[key] = val ? parseBlockString(block, val, file, key) : parseBlockArray(block, file, key);
      i = end - 1;
    } else if (val.startsWith('[') && val.endsWith(']'))
      fm[key] = parseInlineArray(val);
    else fm[key] = key === 'deprecate_reason' ? parseArrayItem(val) : parseQuotedScalar(val);
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
  for (const key of REQUIRED.filter(key => key !== 'agents')) {
    if (fm[key] !== undefined && typeof fm[key] !== 'string')
      errors.push(`${relOf(file)}: 字段 "${key}" 须为字符串`);
  }
  for (const key of ARRAY_FIELDS) {
    const value = fm[key];
    if (value !== undefined && (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim())))
      errors.push(`${relOf(file)}: 字段 "${key}" 须为非空字符串组成的数组（可用 [] 表示空数组）`);
  }
  if (fm.deprecate_reason !== undefined && (typeof fm.deprecate_reason !== 'string' || !fm.deprecate_reason.trim()))
    errors.push(`${relOf(file)}: 字段 "deprecate_reason" 须为非空字符串`);
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
  for (const a of (Array.isArray(fm.agents) ? fm.agents : [])) if (!KNOWN_AGENTS.has(a)) warnings.push(`${relOf(file)}: 未知 agent "${a}"（受控词表外）`);
  if (fm.source && (typeof fm.source_license !== 'string' || !fm.source_license.trim()))
    errors.push(`${relOf(file)}: 有 source 但缺有效 source_license（采编须注明原始许可）`);
  if (fm.source_license && /proprietary|source-available|all rights reserved|未授权/i.test(fm.source_license))
    errors.push(`${relOf(file)}: source_license="${fm.source_license}" 不可再分发，不得采编其内容`);
}

function exitOnErrors() {
  if (!errors.length) return;
  console.error(`\n✗ 错误 ${errors.length}：`);
  for (const error of errors) console.error('  - ' + error);
  process.exit(1);
}

// ---------- 主流程 ----------
// 只扫描受控的 11 个卷目录。生成物、文档、临时目录和嵌套 checkout
// 都不属于技能源数据，避免未知顶层目录改变索引语义。
const TOP_LEVEL_DIRS = new Set([...VOLS.map(v => v.dir), ...SKIP_DIRS]);
for (const entry of await fs.readdir(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('.') || TOP_LEVEL_DIRS.has(entry.name)) continue;
  const dir = path.join(ROOT, entry.name);
  if (await hasGitMetadata(dir)) {
    warnings.push(`${entry.name}/：检测到嵌套 Git 仓库，已跳过`);
    continue;
  }
  const unexpectedSkills = await collect(dir);
  if (unexpectedSkills.length)
    errors.push(`${entry.name}/：未知顶层目录包含 ${unexpectedSkills.length} 个 SKILL.md，请移入 00-meta…10-platform 卷目录`);
}
const files = [];
for (const { dir } of VOLS) {
  const volumePath = path.join(ROOT, dir);
  try {
    const stat = await fs.stat(volumePath);
    if (!stat.isDirectory()) throw new Error('不是目录');
  } catch {
    errors.push(`${dir}/：卷目录不存在或不可读取`);
    continue;
  }
  await collect(volumePath, files);
}
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
// 类型错误先终止，后续图谱和渲染只能消费已通过契约校验的元数据。
exitOnErrors();

// supersedes 是新技能 → 被取代旧技能；反向查找旧技能的继任者。
const successors = new Map();
for (const s of skills) {
  for (const oldName of (s.fm.supersedes || [])) {
    const old = byName.get(oldName);
    if (!old) { errors.push(`${relOf(s.file)}: supersedes → "${oldName}" 不存在`); continue; }
    if (old === s) { errors.push(`${relOf(s.file)}: supersedes 不可取代自身`); continue; }
    if (old.fm.status !== 'deprecated')
      errors.push(`${relOf(s.file)}: supersedes → "${oldName}" 须标记 status=deprecated`);
    if (!successors.has(oldName)) successors.set(oldName, []);
    successors.get(oldName).push(s.fm.name);
  }
}
{
  const state = new Map(), stack = [];
  const visit = name => {
    state.set(name, 'visiting');
    stack.push(name);
    for (const next of (successors.get(name) || [])) {
      if (state.get(next) === 'visiting')
        errors.push(`supersedes 继任链成环：${[...stack.slice(stack.indexOf(next)), next].join(' → ')}`);
      else if (!state.has(next)) visit(next);
    }
    stack.pop();
    state.set(name, 'done');
  };
  for (const name of byName.keys()) if (!state.has(name)) visit(name);
}
function hasActiveSuccessor(name, seen = new Set()) {
  if (seen.has(name)) return false;
  seen.add(name);
  return (successors.get(name) || []).some(next =>
    byName.get(next).fm.status !== 'deprecated' || hasActiveSuccessor(next, seen));
}
for (const s of skills) {
  if (s.fm.status === 'deprecated' && !hasActiveSuccessor(s.fm.name) && !s.fm.deprecate_reason)
    errors.push(`${relOf(s.file)}: status=deprecated 但无可用继任技能或 deprecate_reason 终止归档原因（由新技能 supersedes 声明，继任链不能成环）`);
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

function stageWrite(file, content) {
  pendingWrites.set(file, content);
}

async function flushWrites() {
  for (const [file, content] of pendingWrites) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp-${process.pid}`;
    try {
      await fs.writeFile(tmp, content);
      try {
        await fs.rename(tmp, file);
      } catch (error) {
        // Windows 不允许 rename 覆盖已存在文件；仅在目标是已有生成物时
        // 采用删除后替换，避免把临时文件遗留在仓库里。
        if (!['EEXIST', 'EPERM'].includes(error.code)) throw error;
        await fs.rm(file, { force: true });
        await fs.rename(tmp, file);
      }
    } finally {
      await fs.rm(tmp, { force: true });
    }
  }
}
const stamp = '> 本文件由 scripts/build-index.mjs 自动生成，请勿手改。\n';
const linkOf = s => relOf(s.file);
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
  stageWrite(path.join(INDEX, 'catalog.md'), md);
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
  stageWrite(path.join(INDEX, fname), md);
}

// graph.json + graph.md（related/combines_with 视为无向、去重；requires 有向）
// graph.md：卷级总览 mermaid + 按卷折叠的紧凑边表（不再渲染大块卷内 mermaid），避免 README/INDEX 体积膨胀。
// 规则：跨卷 Top14；每卷度最高 ≤10 个枢纽 + Top ≤24 条诱导边（表格）。
{
  const nodes = skills.map(s => ({ id: s.fm.name, title: s.fm.title, domain: s.fm.domain, level: s.fm.level, status: s.fm.status }));
  // 无向边去重（仅渲染用；graph.json 仍写原始 edges）
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
  stageWrite(path.join(INDEX, 'graph.json'), JSON.stringify({ nodes, edges }, null, 2));

  const MAX_CROSS_VOL_EDGES = 14;
  const MAX_VOL_HUBS = 10;
  const MAX_VOL_EDGES = 24;
  const ARROW = { requires: '-->', related: '-.-', combines_with: '===' };
  const volOf = (n) => String((n && n.domain) || '').split('/')[0].trim();
  const nodesById = new Map(nodes.map(n => [n.id, n]));
  const cnOrder = VOLS.map(v => v.cn);
  const fence = '```';

  const dedupeRender = (list) => {
    const s = new Set(); const out = [];
    for (const e of list) {
      let key;
      if (UNDIRECTED.has(e.type)) key = e.type + ':' + [e.from, e.to].sort().join('|');
      else key = e.type + ':' + e.from + '->' + e.to;
      if (s.has(key)) continue; s.add(key); out.push(e);
    }
    return out;
  };

  const cross = new Map();
  for (const e of dedupeRender(edges.filter(e => UNDIRECTED.has(e.type)))) {
    const a = nodesById.get(e.from), b = nodesById.get(e.to);
    if (!a || !b) continue;
    const va = volOf(a), vb = volOf(b);
    if (!va || !vb || va === vb) continue;
    if (!CN2DIR.has(va) || !CN2DIR.has(vb)) continue;
    const key = [va, vb].sort().join('|');
    cross.set(key, (cross.get(key) || 0) + 1);
  }
  const topCross = [...cross.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_CROSS_VOL_EDGES);

  let overview = fence + 'mermaid\ngraph LR\n';
  for (const cn of cnOrder) overview += '  ' + cn + '\n';
  for (const [key, c] of topCross) {
    const parts = key.split('|');
    overview += '  ' + parts[0] + ' ---|' + c + '| ' + parts[1] + '\n';
  }
  overview += fence + '\n';
  const crossNote = topCross.slice(0, 5).map(([k, c]) => {
    const parts = k.split('|');
    return parts[0] + '–' + parts[1] + '(' + c + ')';
  }).join('、');

  let md = '# 互见图谱 · Graph\n\n' + stamp + '\n';
  md += '全库 **' + nodes.length + '** 节点、**' + edges.length + '** 条互见边（含方向重复前的原始边）。\n\n';
  md += '图例：`-->` 依赖(requires) · `-.-` 互见(related) · `===` 组合(combines_with)。\n\n';
  md += '整库单图无法在 GitHub 上渲染，故拆成「卷级总览 mermaid + 按卷紧凑边表」。机读全量见同目录 [`graph.json`](graph.json)。\n\n';
  md += '## 卷级总览（跨卷最强互见）\n\n';
  md += '无向边按跨卷计数取 Top ' + MAX_CROSS_VOL_EDGES + '；边上数字为边数。示例热点：' + crossNote + '…\n\n';
  md += overview + '\n';
  md += '## 按卷展开（仅卷内边 · 紧凑表）\n\n';
  md += '每卷列出度最高的 ' + MAX_VOL_HUBS + ' 个枢纽，及其诱导边中按两端度之和排序的 Top ' + MAX_VOL_EDGES + ' 条；空卷跳过。完整边集见 `graph.json`。\n\n';

  for (const v of VOLS) {
    const volNodes = nodes.filter(n => volOf(n) === v.cn).map(n => n.id);
    if (!volNodes.length) continue;
    const vs = new Set(volNodes);
    let intra = dedupeRender(edges.filter(e => vs.has(e.from) && vs.has(e.to)));
    if (!intra.length) continue;
    const deg = new Map();
    for (const e of intra) {
      deg.set(e.from, (deg.get(e.from) || 0) + 1);
      deg.set(e.to, (deg.get(e.to) || 0) + 1);
    }
    let hubs = [...deg.keys()].sort((a, b) => (deg.get(b) - deg.get(a)) || a.localeCompare(b));
    let truncated = false;
    if (hubs.length > MAX_VOL_HUBS) {
      hubs = hubs.slice(0, MAX_VOL_HUBS);
      truncated = true;
    }
    const keep = new Set(hubs);
    let hubEdges = intra.filter(e => keep.has(e.from) && keep.has(e.to));
    hubEdges = hubEdges.sort((a, b) => {
      const da = (deg.get(a.from) || 0) + (deg.get(a.to) || 0);
      const db = (deg.get(b.from) || 0) + (deg.get(b.to) || 0);
      return db - da || a.from.localeCompare(b.from) || a.to.localeCompare(b.to);
    });
    let edgeTrunc = false;
    if (hubEdges.length > MAX_VOL_EDGES) {
      hubEdges = hubEdges.slice(0, MAX_VOL_EDGES);
      edgeTrunc = true;
    }
    const noteParts = [];
    if (truncated) noteParts.push('枢纽截断至 ' + MAX_VOL_HUBS);
    if (edgeTrunc) noteParts.push('边截断至 ' + MAX_VOL_EDGES);
    const note = noteParts.length ? ('（' + noteParts.join('；') + '）') : '';
    md += '<details><summary>' + v.title + '（枢纽 ' + hubs.length + ' / 边 ' + hubEdges.length + '）' + note + '</summary>\n\n';
    md += '**Hubs (by degree):** ' + hubs.map(id => '`' + id + '`(' + deg.get(id) + ')').join(', ') + '\n\n';
    md += '| from | type | to |\n| --- | --- | --- |\n';
    for (const e of hubEdges) {
      md += '| `' + e.from + '` | `' + (ARROW[e.type] || e.type) + '` | `' + e.to + '` |\n';
    }
    md += '\n</details>\n\n';
  }
  stageWrite(path.join(INDEX, 'graph.md'), md);
}

// search.json —— 两段式发现的召回层（扁平记录，供向量/BM25/关键词索引）
{
  const records = skills.map(s => ({
    name: s.fm.name, title: s.fm.title, vol: s.vol, domain: s.fm.domain,
    level: s.fm.level || '', status: s.fm.status || '',
    tags: s.fm.tags || [], triggers: s.fm.triggers ?? parseTriggers(s.fm.description),
    description: s.fm.description || '', path: linkOf(s),
    ...(s.fm.deprecate_reason ? { deprecate_reason: s.fm.deprecate_reason } : {}),
  }));
  stageWrite(path.join(INDEX, 'search.json'), JSON.stringify(records, null, 2));
}

// sources.md —— 采编署名与许可清单（合规用）
{
  const withSrc = sorted.filter(s => s.fm.source);
  let md = `# 采编来源与许可 · Sources\n\n${stamp}\n采编自第三方的技能及其原始许可（自有原创技能不在此列）。\n`;
  if (!withSrc.length) md += '\n（暂无采编条目）\n';
  for (const s of withSrc)
    md += `- [\`${s.fm.name}\`](../${linkOf(s)}) ← ${s.fm.source}　\`${s.fm.source_license || '未注明'}\`\n`;
  stageWrite(path.join(INDEX, 'sources.md'), md);
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
      skills: list.map(s => `./${path.posix.dirname(linkOf(s))}`),
    });
  }
  const mp = {
    name: 'everything-skills',
    owner: { name: 'findscripter' },
    metadata: { description: '技能大典 · Everything Skills — 类书式 AI Agent 技能库', version: '1.0.0' },
    plugins,
  };
  stageWrite(path.join(ROOT, '.claude-plugin', 'marketplace.json'), JSON.stringify(mp, null, 2));
}

// 多 harness 上下文文件：CLAUDE.md / AGENTS.md / GEMINI.md 同源 + gemini-extension.json
// 对标 obra/superpowers、wshobson/agents——让 Claude Code / Codex / Gemini CLI / Cursor 等都能发现并使用本库技能。
// 注：本库技能分布在 11 个卷目录（非单一 skills/），故用「上下文文件指路」而非依赖目录约定的 skills 路径。
{
  const ctx = LANG === 'en'
    ? `<!-- Generated by scripts/build-index.mjs; do not edit manually. -->
# Everything Skills — Agent Usage Guide

This repository is an Agent skill library: **${skills.length} \`SKILL.md\` skills** organized into 11 domain volumes under \`00-meta/\` … \`10-platform/\` (there is no single \`skills/\` directory).

## Discovering skills
- Agents match each skill's \`description\` field at runtime; they do not browse the directory tree.
- Human indexes: \`INDEX/catalog.md\`, \`INDEX/tags.md\`, and \`INDEX/graph.md\`.
- Machine-readable recall: \`INDEX/search.json\` (name/description/triggers/domain for two-stage retrieval).

## Using a skill
Open its folder and follow the \`SKILL.md\` instructions. Each skill is self-contained and single-purpose.

## Installation (Claude Code marketplace)
\`\`\`
/plugin marketplace add findscripter/everything-skills
\`\`\`
The 11 volumes are installable as 11 plugins.

## Relationships
Skill relationships use frontmatter \`requires\`, \`related\`, and \`combines_with\`; the generated graph lives in \`INDEX/graph.md\`.

## License
See per-skill \`source_license\` and \`INDEX/sources.md\`, plus \`LICENSE\` and \`NOTICE\`.
`
    : `<!-- 本文件由 scripts/build-index.mjs 自动生成，请勿手改。 -->
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
  for (const f of ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md']) stageWrite(path.join(ROOT, f), ctx);
  const gemExt = {
    name: 'everything-skills',
    description: '类书式 AI Agent 技能大典：精选/中文化/互见成网的开源技能库',
    version: '1.0.0',
    contextFileName: 'GEMINI.md',
  };
  stageWrite(path.join(ROOT, 'gemini-extension.json'), JSON.stringify(gemExt, null, 2));
}

// ---------- 汇报 ----------
console.log(`扫描到 ${skills.length} 条技能，${edges.length} 条互见边。`);
if (warnings.length) { console.log(`\n⚠ 警告 ${warnings.length}：`); for (const w of warnings) console.log('  - ' + w); }
exitOnErrors();
try {
  await flushWrites();
} catch (error) {
  console.error(`\n✗ 写入生成物失败：${error.message}`);
  process.exit(1);
}
console.log('已生成 INDEX/{catalog,tags,tools,graph,sources}.md + graph.json + search.json + .claude-plugin/marketplace.json');
console.log('\n✓ 校验通过。');
