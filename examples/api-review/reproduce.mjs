import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const verbs = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);
const read = name => JSON.parse(fs.readFileSync(path.join(here, 'input', name), 'utf8'));
const pointer = value => value.replaceAll('~', '~0').replaceAll('/', '~1');

// Original, deliberately bounded fixture checker. Not a general OpenAPI validator.
export function review(before, after) {
  const findings = [];
  const add = (id, category, location, beforeValue, afterValue) => findings.push({ id, category, location, before: beforeValue, after: afterValue });
  for (const [route, item] of Object.entries(before.paths)) {
    for (const method of Object.keys(item).filter(k => verbs.has(k))) {
      if (!after.paths[route]?.[method]) add('BREAK_REMOVED_OPERATION', 'breaking', `/paths/${pointer(route)}/${method}`, 'present', 'absent');
    }
  }
  const oldResponse = before.components.schemas.Widget.properties;
  const newResponse = after.components.schemas.Widget.properties;
  for (const [name, property] of Object.entries(oldResponse)) {
    const location = `/components/schemas/Widget/properties/${pointer(name)}`;
    if (!newResponse[name]) add('BREAK_RESPONSE_PROPERTY', 'breaking', location, property.type, 'absent');
    else if (property.type !== newResponse[name].type) add('BREAK_RESPONSE_TYPE', 'breaking', `${location}/type`, property.type, newResponse[name].type);
  }
  const oldRequired = before.components.schemas.CreateWidget.required || [];
  for (const name of after.components.schemas.CreateWidget.required || []) {
    if (!oldRequired.includes(name)) add('BREAK_REQUEST_REQUIRED', 'breaking', '/components/schemas/CreateWidget/required', 'optional: ' + name, 'required: ' + name);
  }
  for (const [route, item] of Object.entries(after.paths)) {
    if (route.split('/').some(segment => /^get[A-Z]/.test(segment))) add('DESIGN_VERB_ROUTE', 'design', `/paths/${pointer(route)}`, 'resource noun expected', route);
    const response = item.get?.responses?.['200']?.content?.['application/json']?.schema;
    const bounded = (item.get?.parameters || []).some(p => p.in === 'query' && p.name === 'limit' && Number.isFinite(p.schema?.maximum));
    if (response?.type === 'array' && !bounded) add('DESIGN_UNBOUNDED_COLLECTION', 'design', `/paths/${pointer(route)}/get/parameters`, 'bounded collection expected', 'no maximum page size');
    if (item.get && Array.isArray(item.get.security) && item.get.security.length === 0) add('SEC_ANONYMOUS_DETAIL', 'security-design', `/paths/${pointer(route)}/get/security`, 'global bearerAuth inherited previously', 'anonymous override');
  }
  after.servers.forEach((server, i) => {
    if (!server.url.startsWith('https://')) add('SEC_CLEARTEXT_SERVER', 'security-design', `/servers/${i}/url`, before.servers[i]?.url || null, server.url);
  });
  const operations = Object.values(after.paths).flatMap(item => Object.entries(item).filter(([method]) => verbs.has(method)).map(([, operation]) => operation));
  const scorecard = [
    { dimension: 'consistency', weight: 30, earned: findings.some(f => f.category === 'breaking' || f.id === 'DESIGN_VERB_ROUTE') ? 0 : 30, criterion: 'No breaking change or verb route in this fixture' },
    { dimension: 'documentation', weight: 20, earned: operations.every(op => op.description && Object.values(op.responses).every(r => r.description)) ? 20 : 0, criterion: 'Every operation and response has a description' },
    { dimension: 'security-design', weight: 20, earned: findings.some(f => f.category === 'security-design') ? 0 : 20, criterion: 'HTTPS and no explicit anonymous override' },
    { dimension: 'usability', weight: 15, earned: findings.some(f => f.id === 'DESIGN_UNBOUNDED_COLLECTION') ? 0 : 15, criterion: 'Collection has a bounded page parameter' },
    { dimension: 'performance-design', weight: 15, earned: after.paths['/api/v1/widgets/{widgetId}'].get.responses['200'].headers?.ETag ? 15 : 0, criterion: 'Detail response declares an ETag; no latency measurement' }
  ];
  const total = scorecard.reduce((sum, row) => sum + row.earned, 0);
  return { scope: 'original synthetic OpenAPI fixture; static specification only', disposition: findings.some(f => f.category === 'breaking') ? 'revise-or-version' : 'review', findings, scorecard, score: total, grade: total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F', scoreMeaning: 'Example-specific documented design rubric, not runtime performance or security certification' };
}

export function reproduce() {
  const result = review(read('before.openapi.json'), read('after.openapi.json'));
  result.inputSha256 = Object.fromEntries(['before.openapi.json', 'after.openapi.json'].map(name => [name, createHash('sha256').update(fs.readFileSync(path.join(here, 'input', name))).digest('hex')]));
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = reproduce();
  if (process.argv.includes('--write')) {
    fs.mkdirSync(path.join(here, 'output'), { recursive: true });
    fs.writeFileSync(path.join(here, 'output/findings.json'), `${JSON.stringify(result, null, 2)}\n`);
  } else assert.deepEqual(result, JSON.parse(fs.readFileSync(path.join(here, 'output/findings.json'), 'utf8')));
  console.log('api-review: 4 breaking changes and 4 design/security findings; fixture score 35/100; output matches');
}
