// Task recommendations are editorial scope choices, separate from lexical scores.
export const normalizeTask = value => String(value || '').trim().toLowerCase()
  .replace(/\s+/g, ' ').replace(/(?<=\p{Script=Han}) | (?=\p{Script=Han})/gu, '');

export function rankedResult(row, score, query) {
  const normalized = normalizeTask(query);
  const recommendation = normalized && (row.task_rankings || []).find(group => group.triggers.some(trigger => normalizeTask(trigger) === normalized));
  return { row, score, exact: Boolean(normalized && normalizeTask(row.name || row.full_name) === normalized),
    ...(recommendation ? { recommendation } : {}) };
}

export function compareResults(a, b) {
  return Number(b.exact) - Number(a.exact)
    || (a.recommendation?.rank ?? Infinity) - (b.recommendation?.rank ?? Infinity)
    || b.score - a.score
    || String(a.row.name || a.row.full_name).localeCompare(String(b.row.name || b.row.full_name));
}
