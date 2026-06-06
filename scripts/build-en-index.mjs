#!/usr/bin/env node
// Everything Skills · English index / catalog / graph / recall generator (zero-dep)
// Usage: node scripts/build-en-index.mjs
// Scans en/**/SKILL.md, rebuilds en/INDEX/ from frontmatter, and hard-validates:
//   required fields, unique kebab name, domain↔volume dir, no dangling 互见, no requires cycle, license.
// Outputs: en/INDEX/{catalog,tags,tools,graph,sources}.md + graph.json + search.json
//          + en/.claude-plugin/marketplace.json + en/{CLAUDE,AGENTS,GEMINI}.md + en/gemini-extension.json
// Exits 1 on any error (CI / pre-commit gate).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.join(REPO, 'en');
const SKIP_DIRS = new Set(['_template', 'INDEX', 'node_modules', '.git', 'scripts', 'assets']);

const TX = JSON.parse(await fs.readFile(path.join(REPO, 'taxonomy.json'), 'utf8'));
const CLASSES = new Map(Object.entries(TX.vols).map(([d, s]) => [d, new Set(s.classes)]));

// dir / Chinese domain-prefix (still used as structural key in en frontmatter) / English display title & label
const VOLS = [
  { dir: '00-meta',         cn: '通用', en: 'Meta',        title: 'Vol 0 · Meta & Thinking' },
  { dir: '01-documents',    cn: '文书', en: 'Documents',   title: 'Vol 1 · Documents' },
  { dir: '02-engineering',  cn: '研发', en: 'Engineering', title: 'Vol 2 · Engineering' },
  { dir: '03-data',         cn: '数据', en: 'Data',        title: 'Vol 3 · Data' },
  { dir: '04-ai',           cn: '智能', en: 'AI',          title: 'Vol 4 · AI' },
  { dir: '05-business',     cn: '商业', en: 'Business',    title: 'Vol 5 · Business' },
  { dir: '06-creative',     cn: '创意', en: 'Creative',    title: 'Vol 6 · Creative' },
  { dir: '07-productivity', cn: '协作', en: 'Productivity',title: 'Vol 7 · Productivity' },
  { dir: '08-security',     cn: '安全', en: 'Security',    title: 'Vol 8 · Security' },
  { dir: '09-verticals',    cn: '领域', en: 'Verticals',   title: 'Vol 9 · Verticals' },
  { dir: '10-platform',     cn: '平台', en: 'Platform',    title: 'Vol 10 · Platform' },
];
const DIR2VOL = new Map(VOLS.map(v => [v.dir, v]));
const CN2EN = new Map(VOLS.map(v => [v.cn, v.en]));
const domEn = d => { const [c, ...rest] = String(d || '').split('/'); return (CN2EN.get(c) || c) + (rest.length ? '/' + rest.join('/') : ''); };

const REQUIRED = ['name', 'title', 'description', 'domain', 'status', 'agents'];
const REL_FIELDS = ['requires', 'related', 'combines_with'];
const UNDIRECTED = new Set(['related', 'combines_with']);
const KNOWN_AGENTS = new Set(['claude-code', 'codex', 'cursor', 'gemini-cli', 'copilot', 'windsurf', 'aider', 'cline']);
const DESC_WARN_LEN = 320;

const errors = [];
const warnings = [];

async function collect(dir, acc = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || e.name.startsWith('.')) continue;
      await collect(path.join(dir, e.name), acc);
    } else if (e.name === 'SKILL.md') acc.push(path.join(dir, e.name));
  }
  return acc;
}

function parseFrontmatter(raw, file) {
  const lines = raw.replace(/^﻿/, '').split(/\r?\n/);
  if (lines[0].trim() !== '---') { errors.push(`${file}: missing frontmatter (first line must be ---)`); return null; }
  const fm = {};
  let i = 1, closed = false;
  for (; i < lines.length; i++) {
    if (lines[i].trim() === '---') { closed = true; break; }
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_]+):\s?(.*)$/);
    if (!m) { warnings.push(`${file}: ignored multiline/invalid frontmatter value → "${line.trim().slice(0, 40)}"`); continue; }
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith('[') && val.endsWith(']'))
      fm[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    else fm[key] = val.replace(/^["']|["']$/g, '');
  }
  if (!closed) errors.push(`${file}: unterminated frontmatter (missing closing ---)`);
  return fm;
}

const relOf = f => path.relative(ROOT, f).split(path.sep).join('/');

function validate(s) {
  const { fm, file, folder, vol } = s;
  for (const k of REQUIRED) {
    const v = fm[k];
    if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0))
      errors.push(`${relOf(file)}: missing required field "${k}"`);
  }
  if (!DIR2VOL.has(vol)) warnings.push(`${relOf(file)}: top-level dir "${vol}" not a known volume`);
  if (fm.name && fm.name !== folder) errors.push(`${relOf(file)}: name "${fm.name}" != folder "${folder}"`);
  if (fm.name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.name)) errors.push(`${relOf(file)}: name "${fm.name}" must be ASCII kebab-case`);
  if (fm.domain) {
    const cn = String(fm.domain).split('/')[0].trim();
    const expect = DIR2VOL.get(vol);
    if (expect && cn !== expect.cn)
      errors.push(`${relOf(file)}: domain volume "${cn}" != dir ${vol} (expected "${expect.cn}")`);
    const cls2 = (String(fm.domain).split('/')[1] || '').trim();
    const allowed = CLASSES.get(vol);
    if (allowed && cls2 && !allowed.has(cls2))
      errors.push(`${relOf(file)}: domain class "${cls2}" not in volume ${vol} controlled set (see taxonomy.json)`);
  }
  if (fm.level && !['beginner', 'intermediate', 'advanced'].includes(fm.level)) warnings.push(`${relOf(file)}: level "${fm.level}" non-standard`);
  if (fm.status && !['draft', 'stable', 'deprecated'].includes(fm.status)) warnings.push(`${relOf(file)}: status "${fm.status}" non-standard`);
  if (typeof fm.description === 'string') {
    if (fm.description.length < 12) warnings.push(`${relOf(file)}: description too short`);
    if (fm.description.length > DESC_WARN_LEN) warnings.push(`${relOf(file)}: description too long (${fm.description.length}>${DESC_WARN_LEN})`);
  }
  for (const a of (fm.agents || [])) if (!KNOWN_AGENTS.has(a)) warnings.push(`${relOf(file)}: unknown agent "${a}"`);
  if (fm.source && !fm.source_license) warnings.push(`${relOf(file)}: has source but no source_license`);
  if (fm.source_license && /proprietary|source-available|all rights reserved/i.test(fm.source_license))
    errors.push(`${relOf(file)}: source_license="${fm.source_license}" not redistributable`);
}

// ---------- main ----------
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
  if (byName.has(s.fm.name)) errors.push(`duplicate name "${s.fm.name}": ${relOf(byName.get(s.fm.name).file)} & ${relOf(s.file)}`);
  else byName.set(s.fm.name, s);
}
for (const s of skills) validate(s);

for (const s of skills) {
  if (s.fm.status === 'deprecated') {
    const sup = s.fm.supersedes || [];
    if (!sup.length) errors.push(`${relOf(s.file)}: status=deprecated but no supersedes`);
    for (const t of sup) if (!byName.has(t)) errors.push(`${relOf(s.file)}: supersedes → "${t}" missing`);
  }
}

const edges = [];
for (const s of skills) {
  for (const field of REL_FIELDS) {
    for (const target of (Array.isArray(s.fm[field]) ? s.fm[field] : [])) {
      const tgt = byName.get(target);
      if (!tgt) { errors.push(`${relOf(s.file)}: dangling 互见 ${field} → "${target}"`); continue; }
      if (tgt.fm.status === 'deprecated' && s.fm.status !== 'deprecated')
        errors.push(`${relOf(s.file)}: ${field} → deprecated skill "${target}"`);
      edges.push({ from: s.fm.name, to: target, type: field });
    }
  }
}

{
  const adj = new Map();
  for (const e of edges) if (e.type === 'requires') { if (!adj.has(e.from)) adj.set(e.from, []); adj.get(e.from).push(e.to); }
  const state = new Map();
  const stack = [];
  const dfs = n => {
    state.set(n, 0); stack.push(n);
    for (const m of (adj.get(n) || [])) {
      if (state.get(m) === 0) errors.push(`requires cycle: ${[...stack.slice(stack.indexOf(m)), m].join(' → ')}`);
      else if (state.get(m) === undefined) dfs(m);
    }
    stack.pop(); state.set(n, 1);
  };
  for (const n of byName.keys()) if (state.get(n) === undefined) dfs(n);
}

for (const s of skills) {
  const out = REL_FIELDS.some(f => Array.isArray(s.fm[f]) && s.fm[f].length);
  const inn = edges.some(e => e.to === s.fm.name);
  if (!out && !inn) warnings.push(`${relOf(s.file)}: orphan skill (no 互见)`);
}

// ---------- generate en/INDEX ----------
const INDEX = path.join(ROOT, 'INDEX');
await fs.mkdir(INDEX, { recursive: true });
const stamp = '> Auto-generated by scripts/build-en-index.mjs. Do not edit by hand.\n';
const linkOf = s => `${s.vol}/${s.folder}/SKILL.md`;
const sorted = [...skills].sort((a, b) => (a.fm.name || '').localeCompare(b.fm.name || ''));

{
  const byVol = new Map();
  for (const s of skills) { if (!byVol.has(s.vol)) byVol.set(s.vol, []); byVol.get(s.vol).push(s); }
  let md = `# Catalog · Everything Skills (English)\n\n${stamp}\n${skills.length} skills.\n`;
  for (const v of VOLS) {
    const list = byVol.get(v.dir);
    if (!list || !list.length) continue;
    md += `\n## ${v.title}\n\n`;
    for (const s of list.sort((a, b) => (a.fm.domain || '').localeCompare(b.fm.domain || '') || (a.fm.name || '').localeCompare(b.fm.name || ''))) {
      const dep = s.fm.status === 'deprecated' ? ' ~~(deprecated)~~' : '';
      md += `- [\`${s.fm.name}\`](../${linkOf(s)}) — ${s.fm.title || ''}${dep}　\`${domEn(s.fm.domain)}\`${s.fm.level ? ' · ' + s.fm.level : ''}\n`;
    }
  }
  await fs.writeFile(path.join(INDEX, 'catalog.md'), md);
}

for (const [field, fname, title] of [['tags', 'tags.md', 'Tags'], ['tools', 'tools.md', 'Tools']]) {
  const map = new Map();
  for (const s of sorted) for (const t of (s.fm[field] || [])) { if (!map.has(t)) map.set(t, []); map.get(t).push(s); }
  let md = `# ${title} Index\n\n${stamp}\n`;
  if (!map.size) md += '\n(no data)\n';
  for (const t of [...map.keys()].sort()) {
    md += `\n### \`${t}\`\n`;
    for (const s of map.get(t)) md += `- [\`${s.fm.name}\`](../${linkOf(s)}) — ${s.fm.title || ''}\n`;
  }
  await fs.writeFile(path.join(INDEX, fname), md);
}

{
  const nodes = skills.map(s => ({ id: s.fm.name, title: s.fm.title, domain: domEn(s.fm.domain), level: s.fm.level, status: s.fm.status }));
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
  let md = `# Graph · Cross-references\n\n${stamp}\nrequires = solid directed, related = dashed, combines_with = thick.\n\n\`\`\`mermaid\ngraph LR\n`;
  for (const e of rendered) md += `  ${e.from} ${arrow[e.type]} ${e.to}\n`;
  md += '```\n';
  await fs.writeFile(path.join(INDEX, 'graph.md'), md);
}

{
  const records = skills.map(s => ({
    name: s.fm.name, title: s.fm.title, vol: s.vol, domain: domEn(s.fm.domain),
    level: s.fm.level || '', status: s.fm.status || '',
    tags: s.fm.tags || [], triggers: s.fm.triggers || [],
    description: s.fm.description || '', path: linkOf(s),
  }));
  await fs.writeFile(path.join(INDEX, 'search.json'), JSON.stringify(records, null, 2));
}

{
  const withSrc = sorted.filter(s => s.fm.source);
  let md = `# Sources & Licenses\n\n${stamp}\nSkills adapted from third parties and their original licenses.\n`;
  if (!withSrc.length) md += '\n(none)\n';
  for (const s of withSrc)
    md += `- [\`${s.fm.name}\`](../${linkOf(s)}) ← ${s.fm.source}　\`${s.fm.source_license || 'unspecified'}\`\n`;
  await fs.writeFile(path.join(INDEX, 'sources.md'), md);
}

{
  const byVol = new Map();
  for (const s of skills) { if (!byVol.has(s.vol)) byVol.set(s.vol, []); byVol.get(s.vol).push(s); }
  const plugins = [];
  for (const v of VOLS) {
    const list = byVol.get(v.dir);
    if (!list || !list.length) continue;
    plugins.push({
      name: `${v.dir}-en`,
      description: `${v.title} — ${list.length} skills`,
      source: './',
      strict: false,
      skills: list.map(s => `./${v.dir}/${s.folder}`),
    });
  }
  const mp = {
    name: 'everything-skills-en',
    owner: { name: 'findscripter' },
    metadata: { description: 'Everything Skills — encyclopedic AI-agent skill library (English)', version: '1.0.0' },
    plugins,
  };
  await fs.mkdir(path.join(ROOT, '.claude-plugin'), { recursive: true });
  await fs.writeFile(path.join(ROOT, '.claude-plugin', 'marketplace.json'), JSON.stringify(mp, null, 2));
}

{
  const ctx = `<!-- Auto-generated by scripts/build-en-index.mjs. Do not edit by hand. -->
# Everything Skills — AI Agent Guide (English)

This tree is an AI-agent skill library: **${skills.length} \`SKILL.md\` skills**, organized into 11 functional volumes under \`00-meta/\` … \`10-platform/\` (not a single \`skills/\` dir). English counterpart of the Chinese 技能大典.

## Discover skills
- Agents match each skill's frontmatter \`description\` to decide loading — not by browsing dirs.
- Human browse: \`INDEX/catalog.md\` (by volume/class), \`INDEX/tags.md\` (tags), \`INDEX/graph.md\` (cross-reference graph).
- Machine recall: \`INDEX/search.json\` (flat name/description/triggers/domain records for two-stage discovery).

## Use a skill
Enter the skill folder, read its \`SKILL.md\`, follow "## Steps". Each skill is single-purpose and self-contained.

## Install (Claude Code marketplace)
\`\`\`
/plugin marketplace add findscripter/everything-skills
\`\`\`
11 volumes map to 11 plugins; install all or per-volume.

## Relations
Expressed via frontmatter \`requires\` / \`related\` / \`combines_with\`, summarized in \`INDEX/graph.md\`.

## License
Curated/adapted collection; per-skill license in each \`SKILL.md\` \`source_license\` and \`INDEX/sources.md\`; see root \`LICENSE\` and \`NOTICE\`.
`;
  for (const f of ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md']) await fs.writeFile(path.join(ROOT, f), ctx);
  await fs.writeFile(path.join(ROOT, 'gemini-extension.json'), JSON.stringify({
    name: 'everything-skills-en',
    description: 'Encyclopedic AI-agent skill library (English): curated, cross-linked open-source skills',
    version: '1.0.0',
    contextFileName: 'GEMINI.md',
  }, null, 2));
}

console.log(`Scanned ${skills.length} EN skills, ${edges.length} 互见 edges.`);
console.log('Generated en/INDEX/{catalog,tags,tools,graph,sources}.md + graph.json + search.json + en/.claude-plugin/marketplace.json + en/{CLAUDE,AGENTS,GEMINI}.md');
if (warnings.length) { console.log(`\n⚠ ${warnings.length} warnings`); for (const w of warnings.slice(0, 30)) console.log('  - ' + w); if (warnings.length > 30) console.log(`  … +${warnings.length - 30} more`); }
if (errors.length) { console.error(`\n✗ ${errors.length} errors`); for (const e of errors) console.error('  - ' + e); process.exit(1); }
console.log('\n✓ Validation passed.');
