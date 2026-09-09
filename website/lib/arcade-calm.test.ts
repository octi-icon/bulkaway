import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCleanup, stepCleanup, cleanupItems } from './arcade-calm.ts';

void test('cleanup keeps picked items in cargo until the truck receives them', () => {
  let s = createCleanup();
  const items = cleanupItems(s.stage);
  for (const item of items.slice(0, 3))
    s = stepCleanup(s, { type: 'collect', id: item.id });
  assert.equal(s.cargo, 3);
  assert.equal(s.delivered, 0);
  assert.equal(s.score, 0);
  assert.equal(stepCleanup(s, { type: 'collect', id: items[3].id }), s);
  assert.equal(stepCleanup(s, { type: 'collect', id: items[0].id }), s);
  s = stepCleanup(s, { type: 'unload' });
  assert.equal(s.delivered, 3);
  assert.equal(s.cargo, 0);
  assert.equal(s.score, 300);
  assert.equal(s.cleared, false);
  assert.equal(stepCleanup(s, { type: 'next' }), s);
});

void test('three locations require real deliveries and finish only after the last unload', () => {
  let s = createCleanup();
  assert.equal(stepCleanup(s, { type: 'collect', id: 99 }), s);
  assert.equal(stepCleanup(s, { type: 'unload' }), s);
  for (let stage = 0; stage < 3; stage++) {
    assert.equal(s.stage, stage);
    for (const item of cleanupItems(stage)) {
      s = stepCleanup(s, { type: 'collect', id: item.id });
      s = stepCleanup(s, { type: 'unload' });
    }
    assert.equal(s.delivered, (stage + 1) * 4);
    assert.equal(s.cleared, true);
    assert.equal(s.finished, stage === 2);
    if (stage < 2) s = stepCleanup(s, { type: 'next' });
  }
  assert.equal(s.score, 1200);
  assert.equal(stepCleanup(s, { type: 'next' }), s);
  assert.equal(stepCleanup(s, { type: 'collect', id: 0 }), s);
});
