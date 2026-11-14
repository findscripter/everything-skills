import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { check, verifyOutcome } from '../examples/nix-discovery/check.mjs';

const read = name => JSON.parse(fs.readFileSync(new URL(`../examples/nix-discovery/${name}`, import.meta.url), 'utf8'));

test('real distribution evidence covers the pinned inventory without inflating active skills', () => {
  const result = check();
  assert.equal(result.after, result.active + result.archived + result.templates);
  assert.ok(result.after > result.active);
});

test('outcome evidence rejects changed sources, invented counts and duplicate/traversing package paths', () => {
  const result = read('output/result.json'), inventory = read('input/inventory.json'), snapshot = read('output/nix-snapshot.json');
  const wrongSource = structuredClone(snapshot); wrongSource.rev = '0'.repeat(40);
  assert.throws(() => verifyOutcome(result, inventory, wrongSource));
  const wrongCount = structuredClone(result); wrongCount.validation.nix_eval_after += 1;
  assert.throws(() => verifyOutcome(wrongCount, inventory, snapshot));
  const duplicate = structuredClone(snapshot); duplicate.paths['00-meta'].push(duplicate.paths['00-meta'][0]);
  assert.throws(() => verifyOutcome(result, inventory, duplicate), /Duplicate/);
  const traversal = structuredClone(snapshot); traversal.paths['../outside'] = ['secret'];
  assert.throws(() => verifyOutcome(result, inventory, traversal), /Unsafe/);
});
