import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

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

test('installed entry searches from a different working directory', () => {
  const output = execFileSync(process.execPath, [path.join(root, 'bin/everything-skills.mjs'), 'search', '代码库导览', '--json'], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(JSON.parse(output)[0].name, 'codebase-onboarding-doc');
});

test('show returns the actual skill and its resource base without changing cwd', () => {
  const output = execFileSync(process.execPath, [cli, '--root', root, 'show', 'api-design-reviewer', '--json'], { cwd: os.tmpdir(), encoding: 'utf8' });
  const result = JSON.parse(output);
  assert.equal(result.content, fs.readFileSync(path.join(root, result.path), 'utf8'));
  assert.equal(result.absolute_path, fs.realpathSync(path.join(root, result.path)));
  assert.equal(result.skill_dir, path.dirname(result.absolute_path));
  assert.equal(result.name, 'api-design-reviewer');
});

test('compose exposes the documented API workflow with explicit handoffs', () => {
  const result = JSON.parse(run('compose', 'api-review', '--json'));
  assert.equal(result.kind, 'workflow');
  assert.equal(result.execution, 'plan-only');
  assert.equal(result.recipe.id, 'api-review');
  assert.deepEqual(result.steps.map(step => step.skill.name), ['api-design-reviewer', 'api-security-best-practices']);
  assert.ok(result.steps.every(step => step.inputs.length && step.outputs.length && step.check));
  assert.ok(result.recipe.limits.length);
});

function catalogFixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'everything-skills-cli-'));
  t.after(() => {
    assert.equal(path.dirname(dir), fs.realpathSync(os.tmpdir()));
    fs.rmSync(dir, { recursive: true, force: true });
  });
  for (const folder of ['INDEX', 'data', '00-meta/alpha', '00-meta/beta', '00-meta/retired']) fs.mkdirSync(path.join(dir, folder), { recursive: true });
  const rows = ['alpha', 'beta', 'retired'].map(name => ({ name, title: name, description: 'fixture task', status: name === 'retired' ? 'deprecated' : 'stable', path: `00-meta/${name}/SKILL.md` }));
  for (const row of rows) fs.writeFileSync(path.join(dir, row.path), `# ${row.name}\n`);
  const write = (file, value) => fs.writeFileSync(path.join(dir, file), JSON.stringify(value));
  write('INDEX/search.json', rows);
  write('INDEX/graph.json', { nodes: rows.map(row => ({ id: row.name })), edges: [
    { from: 'alpha', to: 'beta', type: 'combines_with' },
    { from: 'beta', to: 'alpha', type: 'combines_with' },
    { from: 'alpha', to: 'retired', type: 'combines_with' },
  ] });
  write('data/workflows.json', []);
  const invoke = (...args) => spawnSync(process.execPath, [cli, '--root', dir, ...args], { cwd: os.tmpdir(), encoding: 'utf8' });
  return { dir, rows, write, invoke };
}

test('compose deduplicates reverse declarations, excludes archives and invents no order', t => {
  const { invoke } = catalogFixture(t);
  const result = invoke('compose', 'alpha', '--json');
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.kind, 'suggestions');
  assert.equal(plan.ordered, false);
  assert.equal(plan.execution, 'plan-only');
  assert.deepEqual(plan.combinations.map(row => row.name), ['beta']);
});

test('show rejects paths outside the catalog and missing skills', t => {
  const { rows, write, invoke } = catalogFixture(t);
  rows[0].path = '../SKILL.md';
  write('INDEX/search.json', rows);
  const escaped = invoke('show', 'alpha', '--json');
  assert.equal(escaped.status, 1);
  assert.match(escaped.stderr, /越界|outside/i);
  assert.equal(invoke('show', 'missing', '--json').status, 1);
  assert.equal(invoke('show', 'retired', '--json').status, 1);
  assert.equal(invoke('show', 'retired', '--include-deprecated', '--json').status, 0);
});

test('show rejects a skill directory linked outside the catalog', t => {
  const { dir, invoke } = catalogFixture(t);
  fs.unlinkSync(path.join(dir, '00-meta/alpha/SKILL.md'));
  fs.rmdirSync(path.join(dir, '00-meta/alpha'));
  try { fs.symlinkSync(os.tmpdir(), path.join(dir, '00-meta/alpha'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (error.code === 'EPERM') { t.skip('symlink creation unavailable'); return; } throw error; }
  const result = invoke('show', 'alpha', '--json');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /越界|outside/i);
});

test('compose rejects a corrupt registry instead of silently losing workflows', t => {
  const { dir, invoke } = catalogFixture(t);
  fs.writeFileSync(path.join(dir, 'data/workflows.json'), '{broken');
  const result = invoke('compose', 'alpha', '--json');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /workflows/);
});

test('a combination limit never hides declared prerequisites', t => {
  const { dir, rows, write, invoke } = catalogFixture(t);
  rows.push({ name: 'gamma', status: 'stable', path: '00-meta/gamma/SKILL.md' });
  fs.mkdirSync(path.join(dir, '00-meta/gamma'));
  fs.writeFileSync(path.join(dir, '00-meta/gamma/SKILL.md'), '# gamma\n');
  write('INDEX/search.json', rows);
  write('INDEX/graph.json', { edges: ['beta', 'gamma'].map(to => ({ from: 'alpha', to, type: 'requires' })) });
  const result = invoke('compose', 'alpha', '--limit', '1', '--json');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).prerequisites.map(row => row.name), ['beta', 'gamma']);
});

test('compose rejects a workflow source outside the installed catalog', t => {
  const { write, invoke } = catalogFixture(t);
  write('data/workflows.json', [{ id: 'unsafe', title: 'unsafe', source: '../SKILL.md', triggers: [], inputs: ['input'], outputs: ['output'], limits: ['bounded'],
    steps: [{ skill: 'alpha', inputs: ['input'], outputs: ['output'], check: 'check' }] }]);
  const result = invoke('compose', 'unsafe', '--json');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /越界|outside/i);
});

test('Arch package staging preserves runtime queries, source licenses and resources', { skip: process.platform === 'win32' ? 'POSIX staging runs in Linux CI' : false }, t => {
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'everything-skills-package-'));
  t.after(() => {
    assert.equal(path.dirname(stage), fs.realpathSync(os.tmpdir()));
    fs.rmSync(stage, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(stage, 'source'));
  fs.symlinkSync(root, path.join(stage, 'source/everything-skills'), 'dir');
  const recipe = path.join(root, 'packaging/arch/PKGBUILD');
  execFileSync('bash', ['-euo', 'pipefail', '-c', 'source "$1"; package', 'package-stage', recipe], {
    cwd: os.tmpdir(), env: { ...process.env, srcdir: path.join(stage, 'source'), pkgdir: path.join(stage, 'package') }, encoding: 'utf8',
  });
  const installed = path.join(stage, 'package/usr/share/everything-skills');
  const entry = path.join(installed, 'bin/everything-skills.mjs');
  const result = JSON.parse(execFileSync(process.execPath, [entry, 'compose', 'api-review', '--json'], { cwd: os.tmpdir(), encoding: 'utf8' }));
  assert.equal(result.recipe.id, 'api-review');
  assert.ok(result.steps.every(step => step.skill.absolute_path.startsWith(installed + path.sep)));
  if (fs.existsSync('/usr/bin/node')) {
    const decoy = path.join(stage, 'decoy');
    fs.mkdirSync(decoy);
    fs.writeFileSync(path.join(decoy, 'node'), '#!/bin/sh\nexit 99\n', { mode: 0o755 });
    const direct = JSON.parse(execFileSync(entry, ['compose', 'api-review', '--json'], { cwd: os.tmpdir(), env: { ...process.env, PATH: decoy }, encoding: 'utf8' }));
    assert.equal(direct.recipe.id, 'api-review');
  }
  const repository = JSON.parse(execFileSync(process.execPath, [entry, 'repo', 'anthropics/skills', '--json'], { cwd: os.tmpdir(), encoding: 'utf8' }));
  assert.equal(repository.full_name, 'anthropics/skills');
  assert.equal(fs.readlinkSync(path.join(stage, 'package/usr/bin/everything-skills')), '/usr/share/everything-skills/bin/everything-skills.mjs');
  assert.deepEqual(fs.readFileSync(path.join(installed, 'LICENSE')), fs.readFileSync(path.join(root, 'LICENSE')));
  const resources = JSON.parse(fs.readFileSync(path.join(installed, 'data/skill-resources.json'), 'utf8'));
  assert.ok(resources.skills.length);
  for (const skill of resources.skills) for (const resource of skill.resources) {
    assert.deepEqual(fs.readFileSync(path.join(installed, resource.path)), fs.readFileSync(path.join(root, resource.path)));
  }
});
