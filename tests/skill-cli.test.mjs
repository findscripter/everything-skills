import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const cli = path.join(root, 'scripts', 'everything-skills.mjs');
function run(...args) {
  return execFileSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' }).trim();
}

test('search returns ranked JSON skill entries', () => {
  const rows = JSON.parse(run('search', '无障碍审计', '--limit', '2', '--json'));
  assert.equal(rows.length, 2);
  assert.ok(rows.some(row => ['wcag-22-audit-patterns', 'accessibility-wcag-audit'].includes(row.name)));
  assert.ok(rows[0].score > 0);
});

test('list filters by domain', () => {
  const rows = JSON.parse(run('list', '--domain', 'frontend', '--limit', '3', '--json'));
  assert.ok(rows.length > 0 && rows.length <= 3);
  assert.ok(rows.every(row => row.domain.includes('frontend')));
});

test('why exposes graph relations', () => {
  const result = JSON.parse(run('why', 'agent-self-reflection', '--json'));
  assert.equal(result.skill.id, 'agent-self-reflection');
  assert.ok(result.relations.length > 0);
});

test('repo resolves indexed repository', () => {
  const result = JSON.parse(run('repo', 'anthropics/skills', '--json'));
  assert.equal(result.full_name, 'anthropics/skills');
  assert.equal(result.license, 'Apache-2.0');
});

test('search eval fixture passes', () => {
  const result = JSON.parse(run('eval', '--json'));
  assert.equal(result.total, 8);
  assert.equal(result.passed, result.total);
});
