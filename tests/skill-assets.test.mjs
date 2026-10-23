import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const checker = path.resolve(import.meta.dirname, '../scripts/check-skill-assets.mjs');
const commit = 'a'.repeat(40);
const skillPath = '02-engineering/demo-skill';
const sourceBase = `https://github.com/example/skills/blob/${commit}/`;
const sha256 = value => createHash('sha256').update(value).digest('hex');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'everything-skill-assets-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (relative, value) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, value);
  };
  write(`${skillPath}/SKILL.md`, '---\nname: demo-skill\n---\nDemo\n');
  write(`${skillPath}/scripts/tool.py`, "print('demo')\n");
  write(`${skillPath}/UPSTREAM-LICENSE.txt`, 'MIT License\n');
  const manifest = {
    schema_version: 1,
    skills: [{
      name: 'demo-skill',
      skill_path: skillPath,
      resolution: 'bundle',
      source: {
        repository: 'example/skills',
        commit,
        path: 'skills/demo',
        url: `${sourceBase}skills/demo/SKILL.md`,
        role: 'resource-restoration-snapshot',
      },
      resources: [{
        path: `${skillPath}/scripts/tool.py`,
        sha256: sha256("print('demo')\n"),
        source_url: `${sourceBase}skills/demo/scripts/tool.py`,
        license: 'MIT',
        license_path: `${skillPath}/UPSTREAM-LICENSE.txt`,
      }, {
        path: `${skillPath}/UPSTREAM-LICENSE.txt`,
        sha256: sha256('MIT License\n'),
        source_url: `${sourceBase}LICENSE`,
        license: 'MIT',
        license_path: `${skillPath}/UPSTREAM-LICENSE.txt`,
      }],
      dependencies: [],
      notes: [],
    }],
  };
  const run = () => {
    write('data/skill-resources.json', `${JSON.stringify(manifest, null, 2)}\n`);
    return spawnSync(process.execPath, [checker, '--root', root], { encoding: 'utf8' });
  };
  return { root, write, manifest, skill: manifest.skills[0], run };
}

function rejects(result, code) {
  assert.notEqual(result.status, 0, 'invalid resource manifest must fail');
  assert.match(`${result.stdout}\n${result.stderr}`, new RegExp(`\\[${code}\\]`));
}

test('asset checker validates real bytes without running a bundled executable', t => {
  const f = fixture(t);
  f.write(`${skillPath}/scripts/tool.py`, "raise RuntimeError('must never run')\n");
  f.skill.resources[0].sha256 = sha256("raise RuntimeError('must never run')\n");
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 skills.*2 resources/);
});

test('asset checker accepts inline and native rewrites with a real skill body', t => {
  const f = fixture(t);
  f.skill.resolution = 'inline';
  f.skill.resources = [];
  assert.equal(f.run().status, 0);
  f.skill.resolution = 'native-rewrite';
  f.skill.source = null;
  assert.equal(f.run().status, 0);
});

test('asset checker rejects missing skill bodies even for a native rewrite', t => {
  const f = fixture(t);
  f.skill.resolution = 'native-rewrite';
  f.skill.source = null;
  f.skill.resources = [];
  fs.unlinkSync(path.join(f.root, skillPath, 'SKILL.md'));
  rejects(f.run(), 'ASSET_SKILL');
});

test('asset checker rejects a path escaping its skill through dot segments', t => {
  const f = fixture(t);
  f.skill.resources[0].path = `${skillPath}/../another/tool.py`;
  rejects(f.run(), 'ASSET_PATH');
});

test('asset checker rejects resources in a different skill', t => {
  const f = fixture(t);
  f.skill.resources[0].path = '02-engineering/another-skill/tool.py';
  rejects(f.run(), 'ASSET_SCOPE');
});

test('asset checker rejects absolute paths and Windows path syntax', t => {
  for (const invalid of ['C:/outside/tool.py', '/outside/tool.py', `${skillPath}\\tool.py`]) {
    const f = fixture(t);
    f.skill.resources[0].path = invalid;
    rejects(f.run(), 'ASSET_PATH');
  }
});

test('asset checker rejects resource directory junctions escaping the skill', t => {
  const f = fixture(t);
  f.write('outside/tool.py', "print('demo')\n");
  fs.rmSync(path.join(f.root, skillPath, 'scripts'), { recursive: true });
  fs.symlinkSync(path.join(f.root, 'outside'), path.join(f.root, skillPath, 'scripts'), process.platform === 'win32' ? 'junction' : 'dir');
  rejects(f.run(), 'ASSET_SCOPE');
});

test('asset checker rejects a skill directory junction outside the workspace', t => {
  const f = fixture(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'everything-skill-outside-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.writeFileSync(path.join(outside, 'SKILL.md'), 'Outside\n');
  fs.rmSync(path.join(f.root, skillPath), { recursive: true });
  fs.symlinkSync(outside, path.join(f.root, skillPath), process.platform === 'win32' ? 'junction' : 'dir');
  rejects(f.run(), 'ASSET_SCOPE');
});

test('asset checker rejects absent resources and hash mismatches', t => {
  const missing = fixture(t);
  fs.unlinkSync(path.join(missing.root, skillPath, 'scripts/tool.py'));
  rejects(missing.run(), 'ASSET_MISSING');
  const changed = fixture(t);
  changed.write(`${skillPath}/scripts/tool.py`, 'changed\n');
  rejects(changed.run(), 'ASSET_HASH');
});

test('asset checker rejects duplicate skill names and resource paths', t => {
  const duplicateSkill = fixture(t);
  duplicateSkill.manifest.skills.push(structuredClone(duplicateSkill.skill));
  rejects(duplicateSkill.run(), 'ASSET_DUPLICATE');
  const duplicateResource = fixture(t);
  duplicateResource.skill.resources.push(structuredClone(duplicateResource.skill.resources[0]));
  rejects(duplicateResource.run(), 'ASSET_DUPLICATE');
});

test('asset checker requires immutable source commits and matching source URLs', t => {
  const floating = fixture(t);
  floating.skill.source.commit = 'main';
  rejects(floating.run(), 'ASSET_SOURCE');
  const differentCommit = fixture(t);
  differentCommit.skill.resources[0].source_url = `https://github.com/example/skills/blob/${'b'.repeat(40)}/tool.py`;
  rejects(differentCommit.run(), 'ASSET_SOURCE');
  const otherRepository = fixture(t);
  otherRepository.skill.source.url = `https://github.com/other/skills/blob/${commit}/skills/demo/SKILL.md`;
  rejects(otherRepository.run(), 'ASSET_SOURCE');
});

test('asset checker requires a declared, existing license within the same skill', t => {
  const absent = fixture(t);
  fs.unlinkSync(path.join(absent.root, skillPath, 'UPSTREAM-LICENSE.txt'));
  rejects(absent.run(), 'ASSET_LICENSE');
  const outside = fixture(t);
  outside.write('LICENSE', 'MIT License\n');
  outside.skill.resources[0].license_path = 'LICENSE';
  rejects(outside.run(), 'ASSET_SCOPE');
  const undeclared = fixture(t);
  undeclared.write(`${skillPath}/OTHER-LICENSE.txt`, 'MIT License\n');
  undeclared.skill.resources[0].license_path = `${skillPath}/OTHER-LICENSE.txt`;
  rejects(undeclared.run(), 'ASSET_LICENSE');
});

test('asset checker rejects conflicting licenses sharing one license file', t => {
  const f = fixture(t);
  f.skill.resources[0].license = 'Apache-2.0';
  rejects(f.run(), 'ASSET_LICENSE');
});

test('asset checker requires a supported manifest schema and a bundle resource', t => {
  const schema = fixture(t);
  schema.manifest.schema_version = 99;
  rejects(schema.run(), 'ASSET_SCHEMA');
  const empty = fixture(t);
  empty.skill.resources = [];
  rejects(empty.run(), 'ASSET_SCHEMA');
});
