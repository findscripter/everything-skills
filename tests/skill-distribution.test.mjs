import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkDistribution } from '../scripts/check-skill-distribution.mjs';

const VOLUMES = ['00-meta', '01-documents', '02-engineering', '03-data', '04-ai', '05-business', '06-creative', '07-productivity', '08-security', '09-verticals', '10-platform'];
const ARRAY_FIELDS = ['agents', 'requires', 'related', 'combines_with', 'supersedes', 'tags', 'tools', 'triggers'];
const SCRIPT = path.resolve(import.meta.dirname, '../scripts/check-skill-distribution.mjs');

function skill(name, overrides = {}, body = '# Fixture\n') {
  const fields = {
    name: JSON.stringify(name), description: '"A fixture skill: inspect facts without executing its body."',
    status: 'stable', ...Object.fromEntries(ARRAY_FIELDS.map(field => [field, field === 'agents' ? '[codex]' : '[]'])),
    ...overrides,
  };
  return `---\n${Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join('\n')}\n---\n${body}`;
}

async function write(root, relative, content) {
  const file = path.join(root, relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

async function manifest(root, skills = ['./00-meta/active'], extra = {}) {
  await write(root, '.claude-plugin/marketplace.json', `${JSON.stringify({
    name: 'fixture', plugins: [{ name: '00-meta', source: './', skills, ...extra }],
  }, null, 2)}\n`);
}

async function fixture(t) {
  const temporaryDirectory = path.resolve(os.tmpdir());
  const root = await fs.mkdtemp(path.join(temporaryDirectory, 'everything-distribution-test-'));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(root)), temporaryDirectory);
    assert.match(path.basename(root), /^everything-distribution-test-/);
    await fs.rm(root, { recursive: true, force: true });
  });
  await write(root, 'taxonomy.json', JSON.stringify({ vols: Object.fromEntries(VOLUMES.map(volume => [volume, {}])) }));
  await Promise.all(VOLUMES.map(volume => fs.mkdir(path.join(root, volume))));
  await write(root, '00-meta/active/SKILL.md', skill('active', { metadata: '\n  internal: false\n  author: "fixture author"' }));
  await write(root, '00-meta/archived/SKILL.md', skill('archived', { status: 'deprecated', metadata: '\n  internal: true' }));
  await write(root, '_template/SKILL.md', skill('template', { status: 'draft', metadata: '\n  internal: true' }));
  await manifest(root);
  return root;
}

function hasError(report, code, file) {
  assert.ok(report.errors.some(error => error.code === code && (!file || error.path === file)),
    `Expected ${code}${file ? ` at ${file}` : ''}; got ${JSON.stringify(report.errors)}`);
}

test('DIST valid nested internal flags expose exactly the active source paths', async t => {
  const root = await fixture(t);
  const result = await checkDistribution(root);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.counts, { volumes: 11, sourceSkills: 2, parsedSkills: 3, activeSkills: 1, deprecatedSkills: 1, templates: 1, manifestSkills: 1 });
  assert.deepEqual(result.activePaths, ['00-meta/active']);
  assert.deepEqual(result.manifestPaths, ['00-meta/active']);
});

test('DIST rejects an unquoted @ value in a YAML flow array', async t => {
  const root = await fixture(t);
  await write(root, '00-meta/active/SKILL.md', skill('active', { tools: '[@playwright/test]' }));
  hasError(await checkDistribution(root), 'YAML_PARSE', '00-meta/active/SKILL.md');
});

test('DIST rejects an unquoted colon-space in description', async t => {
  const root = await fixture(t);
  await write(root, '00-meta/active/SKILL.md', skill('active', { description: 'Inspect this: record the facts' }));
  hasError(await checkDistribution(root), 'YAML_PARSE', '00-meta/active/SKILL.md');
});

test('DIST all controlled arrays contain only strings', async t => {
  for (const field of ARRAY_FIELDS) await t.test(field, async t => {
    const root = await fixture(t);
    await write(root, '00-meta/active/SKILL.md', skill('active', { [field]: '[codex, 42]' }));
    const report = await checkDistribution(root);
    hasError(report, 'ARRAY_TYPE', '00-meta/active/SKILL.md');
    assert.ok(report.errors.some(error => error.message.includes(field)));
  });
});

test('DIST name and description must be nonempty strings', async t => {
  const root = await fixture(t);
  await write(root, '00-meta/active/SKILL.md', skill('active', { name: '123', description: '{task: inspect}' }));
  const report = await checkDistribution(root);
  hasError(report, 'STRING_TYPE', '00-meta/active/SKILL.md');
  assert.equal(report.errors.filter(error => error.code === 'STRING_TYPE').length, 2);
});

test('DIST deprecated skills must be hidden and absent from marketplace', async t => {
  const root = await fixture(t);
  await write(root, '00-meta/archived/SKILL.md', skill('archived', { status: 'deprecated' }));
  await manifest(root, ['./00-meta/active', './00-meta/archived']);
  const report = await checkDistribution(root);
  hasError(report, 'INTERNAL_REQUIRED', '00-meta/archived/SKILL.md');
  hasError(report, 'MANIFEST_EXTRA', '00-meta/archived');
});

test('DIST the template must be hidden and absent from marketplace', async t => {
  const root = await fixture(t);
  await write(root, '_template/SKILL.md', skill('template', { status: 'draft' }));
  await manifest(root, ['./00-meta/active', './_template']);
  const report = await checkDistribution(root);
  hasError(report, 'INTERNAL_REQUIRED', '_template/SKILL.md');
  hasError(report, 'MANIFEST_EXTRA', '_template');
});

test('DIST an active skill cannot be accidentally internal', async t => {
  const root = await fixture(t);
  await write(root, '00-meta/active/SKILL.md', skill('active', { metadata: '\n  internal: true' }));
  hasError(await checkDistribution(root), 'ACTIVE_HIDDEN', '00-meta/active/SKILL.md');
});

test('DIST quoted internal true is not a boolean hiding flag', async t => {
  const root = await fixture(t);
  await write(root, '_template/SKILL.md', skill('template', { metadata: '\n  internal: "true"' }));
  const report = await checkDistribution(root);
  hasError(report, 'INTERNAL_TYPE', '_template/SKILL.md');
  hasError(report, 'INTERNAL_REQUIRED', '_template/SKILL.md');
});

test('DIST marketplace comparison reports missing and extra entries separately', async t => {
  const root = await fixture(t);
  await manifest(root, ['./00-meta/unknown']);
  const report = await checkDistribution(root);
  hasError(report, 'MANIFEST_MISSING', '00-meta/active');
  hasError(report, 'MANIFEST_EXTRA', '00-meta/unknown');
});

test('DIST marketplace duplicate paths do not hide behind set equality', async t => {
  const root = await fixture(t);
  await manifest(root, ['./00-meta/active', './00-meta/active']);
  hasError(await checkDistribution(root), 'MANIFEST_DUPLICATE', '00-meta/active');
});

test('DIST marketplace source must use this repository root', async t => {
  const root = await fixture(t);
  await manifest(root, ['./00-meta/active'], { source: './02-engineering' });
  hasError(await checkDistribution(root), 'MANIFEST_SOURCE', '.claude-plugin/marketplace.json');
});

test('DIST source discovery skips hidden/generated directories and nested Git checkouts', async t => {
  const root = await fixture(t);
  for (const directory of ['.cache', '_template', 'INDEX', 'node_modules', '.git', 'scripts', 'assets', 'en']) {
    await write(root, `00-meta/${directory}/not-a-source/SKILL.md`, '---\ntools: [@invalid]\n---\nIgnored input\n');
  }
  await write(root, '00-meta/checkout-with-git-file/.git', 'gitdir: /not-read-by-this-check\n');
  await write(root, '00-meta/checkout-with-git-file/SKILL.md', '---\ntools: [@invalid]\n---\nIgnored checkout\n');
  await fs.mkdir(path.join(root, '00-meta/checkout-with-git-directory/.git'), { recursive: true });
  await write(root, '00-meta/checkout-with-git-directory/nested/SKILL.md', '---\ndescription: invalid: value\n---\nIgnored checkout\n');
  const result = await checkDistribution(root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.counts.sourceSkills, 2, 'ignored SKILL.md files are not distribution sources');
  assert.equal(result.counts.parsedSkills, 3, 'controlled volume roots are entered even when they contain a .git directory');
  assert.deepEqual(result.activePaths, ['00-meta/active']);
});

test('DIST source discovery still includes normal nested skills', async t => {
  const root = await fixture(t);
  await write(root, '00-meta/group/nested-skill/SKILL.md', skill('nested-skill'));
  await manifest(root, ['./00-meta/active', './00-meta/group/nested-skill']);
  const result = await checkDistribution(root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.counts.sourceSkills, 3);
  assert.equal(result.counts.activeSkills, 2);
  assert.deepEqual(result.activePaths, ['00-meta/active', '00-meta/group/nested-skill']);
});

test('DIST source discovery reports I/O errors instead of treating them as skipped sources', async t => {
  const root = await fixture(t);
  await fs.rmdir(path.join(root, '10-platform'));
  const report = await checkDistribution(root);
  hasError(report, 'SOURCE_READ', '10-platform');
  assert.ok(report.errors.some(error => error.message.includes('ENOENT')));
});

test('DIST reads YAML only and never selects executable frontmatter engines', async t => {
  const root = await fixture(t);
  const marker = path.join(root, 'must-not-exist');
  await write(root, '00-meta/active/SKILL.md', `---js\nrequire('fs').writeFileSync(${JSON.stringify(marker)}, 'bad')\n---\n# ignored\n`);
  hasError(await checkDistribution(root), 'FRONTMATTER', '00-meta/active/SKILL.md');
  await assert.rejects(fs.access(marker));
});

test('DIST CLI reports counts and validation failure without changing input', async t => {
  const root = await fixture(t);
  const file = path.join(root, '00-meta/active/SKILL.md');
  await fs.writeFile(file, skill('active', { tools: '[@broken]' }));
  const before = await fs.readFile(file);
  const result = spawnSync(process.execPath, [SCRIPT, '--root', root], { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /YAML_PARSE.*00-meta\/active\/SKILL\.md/);
  assert.match(result.stdout, /sourceSkills/);
  assert.deepEqual(await fs.readFile(file), before);
});
