import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const read = name => JSON.parse(fs.readFileSync(path.join(HERE, name), 'utf8'));

export function verifyOutcome(result, inventory, snapshot) {
  assert.equal(result.schema_version, 1);
  assert.equal(result.fixed_source.commit, inventory.commit);
  assert.equal(snapshot.rev, inventory.commit);
  assert.equal(snapshot.hash, result.fixed_source.nar_sha256_base64);
  assert.match(inventory.commit, /^[a-f0-9]{40}$/);
  const safe = value => typeof value === 'string' && value && !value.includes('\\') && !value.startsWith('/') && value.split('/').every(part => part && part !== '.' && part !== '..');
  const exported = Object.entries(snapshot.paths).flatMap(([directory, names]) => {
    assert.ok(directory === '' || safe(directory), 'Unsafe package directory');
    assert.ok(Array.isArray(names));
    return names.map(name => {
      assert.ok(safe(name) && !name.includes('/'), 'Unsafe package name');
      return directory ? `${directory}/${name}` : name;
    });
  });
  const groups = ['active', 'archived', 'templates'];
  const expected = groups.flatMap(group => inventory[group]);
  assert.ok(expected.every(safe));
  assert.equal(new Set(expected).size, expected.length, 'Inventory roles overlap');
  assert.equal(new Set(exported).size, exported.length, 'Duplicate exported path');
  assert.deepEqual(exported.sort(), expected.sort(), 'Export must match the complete pinned inventory');
  assert.equal(result.validation.same_current_source_default_paths, 0);
  assert.equal(result.validation.same_current_source_configured_paths, expected.length);
  assert.equal(result.validation.nix_eval_before, 0);
  assert.equal(result.validation.nix_eval_after, expected.length);
  assert.equal(result.validation.nix_evaluated_derivations, expected.length);
  assert.equal(result.validation.nix_source_roots_match_snapshot, true);
  assert.equal(result.validation.red_exit_code, 1);
  assert.equal(result.validation.green_exit_code, 0);
  assert.equal(result.fixed_source.canonical_paths, expected.length);
  assert.equal(result.fixed_source.active_entries, inventory.active.length);
  assert.equal(result.fixed_source.internal_deprecated_entries, inventory.archived.length);
  assert.equal(result.fixed_source.internal_draft_template_entries, inventory.templates.length);
  assert.equal(result.validation.nix_package_exit_code, 0);
  assert.equal(result.validation.packaged_skill_sha256, inventory.representative_sha256);
  assert.equal(result.validation.packaged_skill_matches_fixed_source, true);
  assert.ok(result.limits.some(line => line.includes('Only one representative package')));
  return { before: 0, after: expected.length, active: inventory.active.length, archived: inventory.archived.length, templates: inventory.templates.length, source: inventory.commit };
}

export function check() {
  return verifyOutcome(read('output/result.json'), read('input/inventory.json'), read('output/nix-snapshot.json'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = check();
  console.log(`Pinned source: ${result.source}`);
  console.log(`Discovery: ${result.before} -> ${result.after} exported paths`);
  console.log(`Scope: ${result.active} active + ${result.archived} archived + ${result.templates} template`);
  console.log('Stored scanner/Nix observations and complete path inventory agree.');
  console.log('Offline evidence check only; use replay.py and the case guide for a fresh scanner/Nix run.');
}
