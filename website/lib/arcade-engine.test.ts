import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, stepWorld, readBest, CAPACITY } from './arcade-engine.ts';

void test('beam requires alignment, collects once, and respects capacity', () => {
  const w = createWorld();
  w.junk = [{ x: 400, y: 170, kind: 2, charge: 0 }];
  for (let i = 0; i < 12; i++) stepWorld(w, 0.05, 0, 0);
  assert.equal(w.cargo, 1);
  w.cargo = CAPACITY;
  w.junk = [{ x: 400, y: 170, kind: 2, charge: 0 }];
  for (let i = 0; i < 20; i++) stepWorld(w, 0.05, 0, 0);
  assert.equal(w.junk[0].charge, 0);
});
void test('truck banks cargo once and rewards a full load', () => {
  const w = createWorld();
  w.y = 520;
  w.cargo = 5;
  assert.equal(stepWorld(w, 0.01, 0, 0).banked, true);
  assert.equal(w.score, 600);
  assert.equal(w.delivered, 5);
  stepWorld(w, 0.01, 0, 0);
  assert.equal(w.score, 600);
});
void test('collision protection prevents repeated damage and completed runs are frozen', () => {
  const w = createWorld();
  w.shield = 0;
  w.traffic = [{ x: w.x, y: w.y, vx: 0, kind: 1 }];
  stepWorld(w, 0.05, 0, 0);
  stepWorld(w, 0.05, 0, 0);
  assert.equal(w.lives, 2);
  w.time = 0.01;
  w.cargo = 2;
  stepWorld(w, 0.05, 0, 0);
  assert.equal(w.over, true);
  assert.equal(w.score, 200);
  const end = structuredClone(w);
  stepWorld(w, 0.05, 1, 1);
  assert.deepEqual(w, end);
});
void test('simulation is deterministic, bounds movement and rejects corrupt stored bests', () => {
  const a = createWorld(7),
    b = createWorld(7);
  for (let i = 0; i < 250; i++) {
    stepWorld(a, 0.05, -1, -1);
    stepWorld(b, 0.05, -1, -1);
  }
  assert.deepEqual(a, b);
  assert.equal(a.x, 35);
  assert.equal(a.y, 60);
  for (const raw of ['bad', '-1', 'Infinity', '5.5', '100001'])
    assert.equal(readBest(raw), 0);
  assert.equal(readBest('1200'), 1200);
});
