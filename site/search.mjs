// Browser-safe search: source metadata is data, never HTML or executable instructions.
export const FEATURED = ['codebase-onboarding-doc', 'api-design-reviewer', 'academic-paper-explainer', 'api-test-suite-builder', 'citation-management', 'monorepo-navigator', 'accessibility-wcag-audit', 'spec-driven-workflow', 'agent-skill-security-scanner'];

export function tokens(value) {
  const out = [];
  for (const word of String(value || '').toLowerCase().match(/[a-z0-9][a-z0-9_+.#-]*|[\u3400-\u9fff]+/g) || []) {
    out.push(word);
    if (/^[\u3400-\u9fff]+$/.test(word)) for (let i = 0; i + 1 < word.length; i++) out.push(word.slice(i, i + 2));
  }
  return [...new Set(out)];
}

export function search(rows, query, { category = '', mode = 'skills' } = {}) {
  const terms = tokens(query);
  return rows.filter(row => row.status !== 'deprecated' && (mode !== 'repos' || (row.recommendation !== 'historical-only' && row.upstream_state !== 'unavailable')) && (!category || (mode === 'skills' ? row.vol : row.section) === category)).map(row => {
    let score = 0;
    const weighted = mode === 'skills' ? [[row.name, 10], [row.title, 8], [(row.triggers || []).join(' '), 12], [(row.tags || []).join(' '), 4], [row.description, 2]] : [[row.full_name, 10], [row.summary, 2], [row.summary_zh, 2]];
    for (const [value, weight] of weighted) for (const term of terms) if (String(value || '').toLowerCase().includes(term)) score += weight;
    if ((row.triggers || []).some(t => t.toLowerCase() === String(query).trim().toLowerCase())) score += 24;
    const featured = FEATURED.indexOf(row.name);
    return { row, score: terms.length ? score : (featured < 0 ? 0 : FEATURED.length - featured) };
  }).filter(item => !terms.length || item.score > 0).sort((a, b) => b.score - a.score || String(a.row.name || a.row.full_name).localeCompare(String(b.row.name || b.row.full_name))).map(item => item.row);
}

export function githubPath(relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || relative.startsWith('/') || relative.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid repository path');
  return `https://github.com/findscripter/everything-skills/blob/main/${relative.split('/').map(encodeURIComponent).join('/')}`;
}

export function commands(volume) {
  if (!/^\d{2}-[a-z]+$/.test(volume)) throw new Error('Invalid volume');
  return `/plugin marketplace add findscripter/everything-skills\n/plugin install ${volume}@everything-skills`;
}
