import assert from 'node:assert/strict';
import test from 'node:test';
import { summarize } from '../packages/core/index.mjs';

test('sums minutes without mutating the input', () => {
  const notes = Object.freeze([Object.freeze({ minutes: 25 }), Object.freeze({ minutes: 35 })]);
  assert.deepEqual(summarize(notes), { count: 2, totalMinutes: 60 });
});
test('empty notes have an empty total', () => {
  assert.deepEqual(summarize([]), { count: 0, totalMinutes: 0 });
});
test('rejects invalid durations', () => {
  assert.throws(() => summarize([{ minutes: -1 }]), RangeError);
  assert.throws(() => summarize([{ minutes: Infinity }]), RangeError);
});
