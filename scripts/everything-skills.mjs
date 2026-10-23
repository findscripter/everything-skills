// everything-skills CLI: local discovery and search helpers.
// Reads generated INDEX/search.json and INDEX/graph.json plus data/skill-repos*.jsonl.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSkillRepos } from './load-skill-repos.mjs';

const BOOLEAN_OPTIONS = new Set(['json', 'include-deprecated', 'help']);

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--') { out._.push(...argv.slice(i + 1)); break; }
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq > 2) out[arg.slice(2, eq)] = arg.slice(eq + 1);
      else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (BOOLEAN_OPTIONS.has(key)) out[key] = true;
        else if (next && !next.startsWith('-')) { out[key] = next; i += 1; }
        else out[key] = true;
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      out[arg.slice(1)] = true;
    } else out._.push(arg);
  }
  return out;
}

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) {
    if (fallback !== null) return fallback;
    throw new Error(`无法读取 ${file}: ${error.message}`);
  }
}

function rootFrom(args) {
  return path.resolve(String(args.root || process.cwd()));
}

function loadIndex(root) {
  const file = path.join(root, 'INDEX', 'search.json');
  const rows = readJson(file);
  if (!Array.isArray(rows)) throw new Error(`${file} 不是数组索引`);
  return rows;
}

function loadGraph(root) {
  return readJson(path.join(root, 'INDEX', 'graph.json'), { nodes: [], edges: [] });
}

function tokenize(value) {
  // Keep contiguous CJK phrases and their bigrams so short user wording
  // still matches a skill that uses a nearby synonym or inflection.
  const tokens = [];
  for (const part of String(value || '').toLocaleLowerCase().match(/[a-z0-9][a-z0-9_+.#-]*|[\u3400-\u9fff]+/g) || []) {
    tokens.push(part);
    if (/^[\u3400-\u9fff]+$/.test(part)) {
      for (let i = 0; i + 1 < part.length; i += 1) tokens.push(part.slice(i, i + 2));
    }
  }
  return tokens;
}

function fields(row) {
  return [row.name, row.title, row.domain, row.vol, ...(row.tags || []), ...(row.triggers || []), row.description].filter(Boolean).join(' ');
}

function score(row, queryTokens) {
  const name = tokenize(row.name).join(' ');
  const title = tokenize(row.title).join(' ');
  const domain = tokenize(row.domain).join(' ');
  const tags = tokenize((row.tags || []).join(' ')).join(' ');
  const triggers = tokenize((row.triggers || []).join(' ')).join(' ');
  const desc = tokenize(row.description).join(' ');
  let value = 0;
  for (const token of queryTokens) {
    if (name.includes(token)) value += 10;
    if (title.includes(token)) value += 8;
    if (domain.includes(token)) value += 6;
    if (tags.includes(token)) value += 4;
    // Explicit triggers are the strongest signal: they represent phrases
    // written for retrieval, while names/titles often contain broad terms.
    if (triggers.includes(token)) value += 12;
    if (desc.includes(token)) value += 2;
  }
  return value;
}

export function searchRows(rows, query, limit = 10, { includeDeprecated = false } = {}) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];
  const normalizedQuery = String(query).trim().toLocaleLowerCase();
  return rows.filter(row => includeDeprecated || row.status !== 'deprecated').map(row => {
    let value = score(row, queryTokens);
    // An authored trigger phrase is stronger evidence than a broad token
    // match (for example, "React" in ReactFlow). Give exact trigger phrases
    // a small deterministic boost for task-oriented queries.
    if ((row.triggers || []).some(trigger => String(trigger).trim().toLocaleLowerCase() === normalizedQuery)) value += 24;
    return { row, score: value };
  })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || String(a.row.name).localeCompare(String(b.row.name)))
    .slice(0, limit);
}

function printRows(results, json, { showScore = true } = {}) {
  if (json) {
    console.log(JSON.stringify(results.map(({ row, score }) => showScore ? ({ ...row, score }) : row)));
    return;
  }
  if (!results.length) { console.log('没有匹配的技能。'); return; }
  for (const { row, score } of results) {
    const suffix = showScore ? `\t${score}` : '';
    console.log(`${row.name}\t${row.title || ''}\t${row.domain || row.vol || ''}${suffix}`);
  }
}

function findRepo(repos, query) {
  const q = String(query).toLowerCase();
  return repos.find(repo => String(repo.full_name || '').toLowerCase() === q)
    || repos.find(repo => String(repo.full_name || '').toLowerCase().includes(q));
}

function commandHelp() {
  console.log('用法: node scripts/everything-skills.mjs <command> [options]');
  console.log('  search <关键词> [--limit N] [--json]   搜索技能');
  console.log('  list [--domain D|--vol V|--tag T]       浏览技能');
  console.log('  why <skill-name> [--json]               查看关系图邻居');
  console.log('  repo <owner/name> [--json]              查看仓库索引');
  console.log('  eval [文件] [--top-k N] [--json]        运行检索评测集');
  console.log('  search / list 默认排除 deprecated；--include-deprecated 显式查看历史技能。');
}

function runEval(root, file, topK = 5) {
  const evalFile = file ? path.resolve(root, file) : path.join(root, 'data', 'search-eval.json');
  const cases = readJson(evalFile);
  if (!Array.isArray(cases)) throw new Error(`评测集必须是数组: ${evalFile}`);
  const rows = loadIndex(root);
  const details = cases.map(test => {
    const results = searchRows(rows, test.query, topK);
    const names = results.map(x => x.row.name);
    const expected = Array.isArray(test.expected) ? test.expected : [test.expected];
    const hit = expected.some(name => names.includes(name));
    return { query: test.query, expected, top: names, hit };
  });
  const passed = details.filter(x => x.hit).length;
  return { file: path.relative(root, evalFile), total: details.length, passed, accuracy: details.length ? passed / details.length : 0, topK, cases: details };
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const command = args._[0];
  const root = rootFrom(args);
  if (!command || command === 'help' || command === '--help') { commandHelp(); return 0; }
  const json = Boolean(args.json);
  if (command === 'search') {
    const query = args._.slice(1).join(' ');
    const limit = Math.max(1, Number(args.limit || 10));
    printRows(searchRows(loadIndex(root), query, limit, { includeDeprecated: Boolean(args['include-deprecated']) }), json);
    return 0;
  }
  if (command === 'list') {
    const rows = loadIndex(root).filter(row => {
      if (!args['include-deprecated'] && row.status === 'deprecated') return false;
      if (args.domain && !String(row.domain || '').toLowerCase().includes(String(args.domain).toLowerCase())) return false;
      if (args.vol && String(row.vol || '') !== String(args.vol)) return false;
      if (args.tag && !(row.tags || []).some(tag => String(tag).toLowerCase().includes(String(args.tag).toLowerCase()))) return false;
      return true;
    });
    const limit = Math.max(1, Number(args.limit || 20));
    printRows(rows.slice(0, limit).map(row => ({ row, score: 0 })), json, { showScore: false });
    if (!json) console.log(`共 ${rows.length} 个，显示前 ${Math.min(limit, rows.length)} 个。`);
    return 0;
  }
  if (command === 'why') {
    const name = args._[1];
    if (!name) throw new Error('why 需要技能名称');
    const graph = loadGraph(root);
    const node = graph.nodes.find(item => item.id === name || item.name === name);
    const edges = graph.edges.filter(edge => edge.from === name || edge.to === name);
    const result = { skill: node || { id: name }, relations: edges.map(edge => ({ ...edge, direction: edge.from === name ? 'out' : 'in' })) };
    if (json) console.log(JSON.stringify(result));
    else {
      console.log(`${result.skill.id || name}${result.skill.title ? ` — ${result.skill.title}` : ''}`);
      if (!edges.length) console.log('暂无关系记录。');
      else for (const edge of result.relations) console.log(`${edge.direction === 'out' ? '→' : '←'} ${edge.type}: ${edge.from === name ? edge.to : edge.from}`);
    }
    return node || edges.length ? 0 : 1;
  }
  if (command === 'repo') {
    const repo = findRepo(await loadSkillRepos(root), args._[1] || '');
    if (!repo) { if (json) console.log(JSON.stringify(null)); else console.log('没有找到该仓库。'); return 1; }
    if (json) console.log(JSON.stringify(repo));
    else console.log(`${repo.full_name}\n${repo.html_url || ''}\n${repo.summary || ''}\n许可: ${repo.license || '未标注'}\n状态: ${repo.status || '未标注'}`);
    return 0;
  }
  if (command === 'eval') {
    const result = runEval(root, args._[1], Math.max(1, Number(args['top-k'] || args.topK || 5)));
    if (json) console.log(JSON.stringify(result));
    else console.log(`检索评测: ${result.passed}/${result.total} 命中 (${(result.accuracy * 100).toFixed(1)}%, top-${result.topK})`);
    return result.passed === result.total ? 0 : 1;
  }
  commandHelp();
  return 1;
}

if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  try { process.exitCode = await main(); }
  catch (error) { console.error(`错误: ${error.message}`); process.exitCode = 1; }
}
