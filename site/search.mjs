// Browser-safe search: source metadata is data, never HTML or executable instructions.
import { rankedResult, compareResults, normalizeTask } from '../scripts/skill-ranking.mjs';
export const FEATURED = ['codebase-onboarding-doc', 'api-design-reviewer', 'academic-paper-explainer', 'api-test-suite-builder', 'citation-management', 'monorepo-navigator', 'accessibility-wcag-audit', 'spec-driven-workflow', 'agent-skill-security-scanner'];

export function tokens(value) {
  const out = [];
  for (const word of String(value || '').toLowerCase().match(/[a-z0-9][a-z0-9_+.#-]*|[\u3400-\u9fff]+/g) || []) {
    out.push(word);
    if (/^[\u3400-\u9fff]+$/.test(word)) for (let i = 0; i + 1 < word.length; i++) out.push(word.slice(i, i + 2));
  }
  return [...new Set(out)];
}

const searchableRepository = row => row.status !== 'deprecated' && row.recommendation !== 'historical-only' && row.upstream_state !== 'unavailable';
const compareRepositoryStars = (a, b) => (b.stars ?? -1) - (a.stars ?? -1) || a.full_name.localeCompare(b.full_name, 'en');
const hasInstalls = row => row.status !== 'deprecated' && Number.isSafeInteger(row.installs) && row.installs > 0;
const compareSkillInstalls = (a, b) => b.installs - a.installs || a.name.localeCompare(b.name, 'en');

export function popularRepositories(rows, { category = '' } = {}) {
  return rows.filter(row => searchableRepository(row) && row.upstream_state === 'active' && row.stars > 0 && (!category || row.section === category)).sort(compareRepositoryStars);
}

export function popularSkills(rows) {
  return rows.filter(hasInstalls).sort(compareSkillInstalls);
}

export function taskComparisons(skills) {
  const groups = new Map();
  for (const { name, title: skillTitle, path, status, task_rankings = [] } of skills) {
    if (status === 'deprecated') continue;
    for (const { task, title, title_en, triggers, reviewed_at, rank, reason, reason_en } of task_rankings) {
      if (!groups.has(task)) groups.set(task, { task, title, title_en, triggers, reviewed_at, entries: [] });
      groups.get(task).entries.push({ name, title: skillTitle, path, rank, reason, reason_en });
    }
  }
  for (const group of groups.values()) group.entries.sort((a, b) => a.rank - b.rank);
  return [...groups.values()];
}

export function searchComparisons(groups, query, lang = 'en') {
  const terms = tokens(query).filter(term => !/^[a-z]$/.test(term));
  const phrase = normalizeTask(query);
  return groups.map(group => {
    const taskNames = [group.title, group.title_en, ...group.triggers].map(normalizeTask);
    const skills = group.entries.map(entry => entry.name);
    let exact = 0;
    if (phrase === group.task) exact = 3;
    else if (taskNames.includes(phrase)) exact = 2;
    else if (skills.includes(phrase)) exact = 1;
    const details = [group.task, ...taskNames, ...skills, ...group.entries.map(entry => normalizeTask(entry.title))].join(' ');
    return { group, exact, phraseMatch: Number(Boolean(phrase && details.includes(phrase))),
      score: terms.filter(term => details.includes(term)).length };
  }).filter(({ exact, phraseMatch, score }) => exact || phraseMatch || score || !phrase)
    .sort((a, b) => b.exact - a.exact || b.phraseMatch - a.phraseMatch || b.score - a.score
      || (lang === 'zh' ? a.group.title.localeCompare(b.group.title, 'zh-CN') : a.group.title_en.localeCompare(b.group.title_en, 'en')))
    .map(({ group }) => group);
}

export function search(rows, query, { category = '', mode = 'skills', sort = '' } = {}) {
  const terms = tokens(query);
  const normalizedQuery = normalizeTask(query);
  const byInstalls = mode === 'skills' && sort === 'installs';
  const compare = mode === 'repos' && sort === 'stars' ? (a, b) => compareRepositoryStars(a.row, b.row)
    : byInstalls ? (a, b) => compareSkillInstalls(a.row, b.row) : compareResults;
  return rows.filter(row => (mode === 'repos' ? searchableRepository(row) : row.status !== 'deprecated') && (!category || (mode === 'skills' ? row.vol : row.section) === category)).map(row => {
    let score = 0;
    const weighted = mode === 'skills' ? [[row.name, 10], [row.title, 8], [(row.triggers || []).join(' '), 12], [(row.tags || []).join(' '), 4], [row.description, 2]] : [[row.full_name, 10], [row.summary, 2], [row.summary_zh, 2]];
    for (const [value, weight] of weighted) for (const term of terms) if (String(value || '').toLowerCase().includes(term)) score += weight;
    if ((row.triggers || []).some(t => t.toLowerCase() === String(query).trim().toLowerCase())) score += 24;
    const featured = FEATURED.indexOf(row.name);
    if (mode === 'repos') return { row, score, exact: Boolean(normalizedQuery && normalizedQuery === normalizeTask(row.full_name)) };
    return rankedResult(row, terms.length ? score : (featured < 0 ? 0 : FEATURED.length - featured), query);
  }).filter(item => (!byInstalls || hasInstalls(item.row)) && (!terms.length || item.exact || item.score > 0 || item.recommendation))
    .sort(compare).map(({row, recommendation}) => recommendation ? {...row, recommendation} : row);
}

export function githubPath(relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || relative.startsWith('/') || relative.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid repository path');
  return `https://github.com/findscripter/everything-skills/blob/main/${relative.split('/').map(encodeURIComponent).join('/')}`;
}

export function commands(volume) {
  if (!/^\d{2}-[a-z]+$/.test(volume)) throw new Error('Invalid volume');
  return `/plugin marketplace add findscripter/everything-skills\n/plugin install ${volume}@everything-skills`;
}
