import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { reproduce as onboarding } from '../examples/repository-onboarding/reproduce.mjs';
import { reproduce as api, review } from '../examples/api-review/reproduce.mjs';
import { reproduce as paper } from '../examples/paper-reading/reproduce.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
assert.ok(Number(process.versions.node.split('.')[0]) >= 22, 'Examples require Node.js >=22');
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const text = relative => fs.readFileSync(path.join(root, relative), 'utf8');

// This reruns the tiny application and its behavior tests in a clean directory.
const repo = onboarding();
assert.deepEqual(repo, read('examples/repository-onboarding/output/facts.json'));
assert.equal(repo.fileCount, 7);
assert.equal(repo.packages.length, 2);
assert.deepEqual(repo.dependencyEdges, [{ from: '@trail/cli', to: '@trail/core' }]);
assert.equal(repo.cleanDirectoryRun.tests.testCount, 3);
assert.deepEqual(repo.cleanDirectoryRun.demo.output, { count: 3, totalMinutes: 60 });
console.log('PASS repository-onboarding: 7 source files, 2 packages, 3 executed tests and CLI result');

const apiResult = api();
assert.deepEqual(apiResult, read('examples/api-review/output/findings.json'));
assert.equal(apiResult.findings.filter(f => f.category === 'breaking').length, 4);
assert.equal(apiResult.findings.filter(f => f.category !== 'breaking').length, 4);
assert.equal(new Set(apiResult.findings.map(f => f.id)).size, 8);
const before = read('examples/api-review/input/before.openapi.json');
const after = read('examples/api-review/input/after.openapi.json');
assert.ok(before.paths['/api/v1/widgets'].get);
assert.equal(after.paths['/api/v1/widgets'].get, undefined);
assert.equal(before.components.schemas.Widget.properties.id.type, 'string');
assert.equal(after.components.schemas.Widget.properties.id.type, 'integer');
assert.ok(before.components.schemas.Widget.properties.name);
assert.equal(after.components.schemas.Widget.properties.name, undefined);
assert.equal(before.components.schemas.CreateWidget.required.includes('ownerId'), false);
assert.equal(after.components.schemas.CreateWidget.required.includes('ownerId'), true);
assert.deepEqual(after.paths['/api/v1/widgets/{widgetId}'].get.security, []);
assert.equal(apiResult.scorecard.reduce((sum, row) => sum + row.weight, 0), 100);
assert.equal(apiResult.scorecard.reduce((sum, row) => sum + row.earned, 0), 35);
// A no-change control must not emit the deliberately introduced regressions.
const control = review(before, structuredClone(before));
assert.deepEqual(control.findings, []);
assert.equal(control.score, 100);
console.log('PASS api-review: 4 contract regressions, 4 design/security findings, no-change control clean');

const { report, bib } = paper();
assert.deepEqual(report, read('examples/paper-reading/output/citation-check.json'));
assert.equal(bib, text('examples/paper-reading/output/references.bib'));
assert.equal(report.inputCount, 2);
assert.equal(report.uniqueWorkCount, 1);
assert.equal(report.correctedYear, 2017);
assert.equal(report.canonicalAuthorCount, 8);
assert.deepEqual(report.errors.map(e => e.code), ['YEAR_MISMATCH', 'AUTHOR_LIST_MISMATCH']);
assert.equal(report.duplicateGroups.length, 1);
assert.match(bib, /@misc\{/);
assert.match(bib, /year = \{2017\}/);
assert.match(bib, /10\.48550\/arxiv\.1706\.03762/);
const sources = read('examples/paper-reading/output/sources.json').sources;
const knownSourceIds = new Set(sources.map(source => source.id));
for (const source of sources) assert.equal(new URL(source.url).protocol, 'https:');
const claims = read('examples/paper-reading/output/claim-check.json').claims;
assert.equal(claims.length, 4);
for (const claim of claims) {
  assert.ok(claim.sources.length > 0);
  for (const id of claim.sources) assert.ok(knownSourceIds.has(id), `Unknown claim source ${id}`);
}
assert.deepEqual(claims.find(c => c.id === 'C3').reported, { enDe: 28.4, enFr: 41.8 });
assert.ok(claims.find(c => c.id === 'C4').unresolved);
console.log('PASS paper-reading: 2 citations -> 1 work; 2017 / 8 authors / DOI / BibTeX / evidence references');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
let localLinks = 0;
for (const file of walk(path.join(root, 'examples')).filter(file => file.endsWith('.md'))) {
  const body = fs.readFileSync(file, 'utf8');
  assert.equal(body.includes('\r'), false, `Expected LF: ${file}`);
  for (const match of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    assert.ok(fs.existsSync(path.resolve(path.dirname(file), target)), `Broken example link ${path.relative(root, file)} -> ${target}`);
    localLinks += 1;
  }
}
console.log(`PASS example documentation: ${localLinks} local links resolve; Markdown uses LF`);
console.log('All 3 worked examples passed. Offline artifact/fixture checks; no model calls or client-installation claims.');
