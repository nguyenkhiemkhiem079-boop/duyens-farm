import test from 'node:test';
import assert from 'node:assert/strict';
import { completeMemory, freshProgress, loadProgress, PERSONAL_SAVE_KEY, saveProgress, validateProgress, type ProgressStorage } from '../personalProgress';
import { MEMORIES } from '../content/story';
function store(initial?: string): ProgressStorage & { values: Map<string, string> } {
  const values = new Map(initial ? [[PERSONAL_SAVE_KEY, initial]] : []);
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
}
test('fresh progress owns independent crop rows and save key', () => {
  const a = freshProgress(), b = freshProgress(); a.harvested[0][0] = true;
  assert.equal(b.harvested[0][0], false); assert.equal(a.harvested[1][0], false);
  assert.equal(validateProgress(a), true); assert.equal(PERSONAL_SAVE_KEY, 'duyen_four_fields_v1');
});
test('partial harvest round trips without changing a legacy save', () => {
  const s = store(); s.setItem('duyen_save_v4', 'untouched');
  const a = freshProgress(); a.harvested[0][2] = true; a.position = { x: -3.6, z: 8 };
  assert.equal(saveProgress(a, s), true); assert.deepEqual(loadProgress(s).progress, a);
  assert.equal(s.getItem('duyen_save_v4'), 'untouched');
});
test('completed crops survive a reload before story acknowledgement', () => {
  const a = freshProgress(); a.harvested[0].fill(true); const s = store();
  saveProgress(a, s); const resumed = loadProgress(s).progress;
  assert.equal(resumed.memories.length, 0); assert.equal(completeMemory(resumed, 0), true);
  assert.equal(completeMemory(resumed, 0), false); assert.deepEqual(resumed.memories, [MEMORIES[0].id]);
});
test('all four story pages require their own completed plot in sequence', () => {
  const a = freshProgress();
  assert.equal(completeMemory(a, 0), false); assert.equal(completeMemory(a, 3), false);
  for (let plot = 0; plot < 4; plot++) {
    a.activePlot = plot; a.harvested[plot].fill(true);
    assert.equal(completeMemory(a, plot), true); assert.equal(validateProgress(a), true);
  }
  assert.equal(a.memories.length, 4);
});
test('corrupt and incompatible saves are protected and remain exportable', () => {
  for (const raw of ['{bad', JSON.stringify({ version: 99 }), 'null']) {
    const s = store(raw); const result = loadProgress(s);
    assert.equal(result.protected, true); assert.match(result.warning, /chưa bị ghi đè/);
    assert.equal(s.getItem(PERSONAL_SAVE_KEY), raw);
  }
});
test('rejects nonfinite positions, duplicate stories, skipped stages and invalid crop flags', () => {
  const a = freshProgress(); a.position.x = Infinity; assert.equal(validateProgress(a), false);
  const b = freshProgress(); b.memories = ['first-date', 'first-date']; assert.equal(validateProgress(b), false);
  const c = freshProgress(); c.activePlot = 2; assert.equal(validateProgress(c), false);
  const d = freshProgress(); d.harvested[2][0] = true; assert.equal(validateProgress(d), false);
  const e = freshProgress(); (e.harvested[0] as unknown[])[0] = 1; assert.equal(validateProgress(e), false);
  assert.equal(saveProgress(e, store()), false);
});
test('storage failures report failure without throwing', () => {
  const s = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('full'); } };
  assert.equal(loadProgress(s).protected, true); assert.equal(saveProgress(freshProgress(), s), false);
});
