import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const here = path.dirname(fileURLToPath(import.meta.url));
const input = path.join(here, 'input/mini-repo');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
function files(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const relative = `${prefix}${entry.name}`;
    return entry.isDirectory() ? files(path.join(dir, entry.name), `${relative}/`) : [relative];
  }).sort();
}

export function reproduce() {
  const paths = files(input);
  const manifests = paths.filter(p => p.endsWith('package.json')).map(p => ({ path: p, ...JSON.parse(fs.readFileSync(path.join(input, p), 'utf8')) }));
  const packages = manifests.filter(m => m.path !== 'package.json');
  const names = new Set(packages.map(p => p.name));
  const edges = packages.flatMap(pkg => Object.keys(pkg.dependencies || {}).filter(name => names.has(name)).map(name => ({ from: pkg.name, to: name })));
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'everything-skills-example-'));
  try {
    fs.cpSync(input, temporary, { recursive: true });
    const tests = spawnSync(process.execPath, ['--test', '--test-reporter=tap', 'test/core.test.mjs'], { cwd: temporary, encoding: 'utf8' });
    assert.equal(tests.status, 0, tests.stderr || tests.stdout);
    const testCount = Number(tests.stdout.match(/^# tests (\d+)$/m)?.[1]);
    assert.ok(Number.isInteger(testCount) && testCount > 0, 'Node TAP output must report an executed test count');
    const demo = spawnSync(process.execPath, ['apps/cli/index.mjs'], { cwd: temporary, encoding: 'utf8' });
    assert.equal(demo.status, 0, demo.stderr);
    const result = JSON.parse(demo.stdout.trim());
    assert.deepEqual(result, { count: 3, totalMinutes: 60 });
    return {
      fixture: 'original synthetic Node.js workspace',
      fileCount: paths.length,
      sourceModules: paths.filter(p => p.endsWith('.mjs')),
      workspacePatterns: manifests.find(m => m.path === 'package.json').workspaces,
      packages: packages.map(({ name, path: manifest }) => ({ name, manifest })),
      dependencyEdges: edges,
      inputSha256: Object.fromEntries(paths.map(p => [p, createHash('sha256').update(fs.readFileSync(path.join(input, p))).digest('hex')])),
      cleanDirectoryRun: { tests: { command: 'node --test --test-reporter=tap test/core.test.mjs', exitCode: tests.status, testCount }, demo: { command: 'node apps/cli/index.mjs', exitCode: demo.status, output: result } }
    };
  } finally {
    // This exact path was created above, under the OS temp directory.
    assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(temporary).startsWith('everything-skills-example-'));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = reproduce();
  if (process.argv.includes('--write')) {
    fs.mkdirSync(path.join(here, 'output'), { recursive: true });
    fs.writeFileSync(path.join(here, 'output/facts.json'), json(result));
  } else {
    assert.deepEqual(result, JSON.parse(fs.readFileSync(path.join(here, 'output/facts.json'), 'utf8')));
  }
  console.log('repository-onboarding: 3 tests passed; CLI returned 3 notes / 60 minutes; fixture facts match');
}
