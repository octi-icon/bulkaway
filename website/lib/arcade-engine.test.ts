import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createWorld,
  stepWorld,
  readBest,
  CAPACITY,
  beamRange,
  launchCargo,
  H,
  W,
} from './arcade-engine.ts';

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

void test('levels escalate at 25-second boundaries and transitions give breathing room', () => {
  const w = createWorld();
  assert.equal(w.level, 1);
  w.time = 50.01;
  w.traffic = [{ x: w.x, y: w.y, vx: 0, kind: 0 }];
  assert.equal(stepWorld(w, 0.02, 0, 0).levelChanged, true);
  assert.equal(w.level, 2);
  assert.equal(w.traffic.length, 0);
  assert.ok(w.shield > 0);
  assert.equal(stepWorld(w, 0.02, 0, 0).levelChanged, false);
  w.time = 25.01;
  assert.equal(stepWorld(w, 0.02, 0, 0).levelChanged, true);
  assert.equal(w.level, 3);
});

void test('repulsor turns collisions into bonuses once, then expires', () => {
  const w = createWorld();
  w.powerups = [{ x: w.x, y: w.y, kind: 'repulsor', ttl: 12 }];
  assert.equal(stepWorld(w, 0.05, 0, 0).powerUp, 'repulsor');
  assert.equal(stepWorld(w, 0.05, 0, 0).powerUp, null);
  w.traffic = [{ x: w.x, y: w.y, vx: 0, kind: 0 }];
  w.shield = 0;
  assert.equal(stepWorld(w, 0.05, 0, 0).deflected, true);
  assert.equal(w.lives, 3);
  assert.equal(w.score, 75);
  assert.equal(w.traffic.length, 0);
  assert.equal(stepWorld(w, 0.05, 0, 0).deflected, false);
  w.effects.repulsor = 0.01;
  w.traffic = [{ x: w.x, y: w.y, vx: 0, kind: 0 }];
  assert.equal(stepWorld(w, 0.05, 0, 0).hit, true);
  assert.equal(w.lives, 2);
  w.powerups = [{ x: 70, y: 300, kind: 'split', ttl: 0.01 }];
  stepWorld(w, 0.05, 0, 0);
  assert.equal(w.powerups.length, 0);
});

void test('split beam lifts two separate targets and returns to one when it expires', () => {
  const w = createWorld();
  w.junk = [-60, 60].map((offset) => ({
    x: w.x + offset,
    y: w.y + 70,
    kind: 2,
    charge: 0,
  }));
  stepWorld(w, 0.05, 0, 0);
  assert.equal(w.junk[0].charge, 0);
  w.powerups = [{ x: w.x, y: w.y, kind: 'split', ttl: 12 }];
  stepWorld(w, 0.05, 0, 0);
  assert.ok(beamRange(w).width > 60);
  for (let i = 0; i < 10; i++) stepWorld(w, 0.05, 0, 0);
  assert.equal(w.cargo, 2);
  w.effects.split = 0.01;
  stepWorld(w, 0.05, 0, 0);
  assert.equal(beamRange(w).width, 43);
  w.effects.split = 10;
  w.cargo = CAPACITY - 1;
  w.junk = [-60, 60].map((offset) => ({
    x: w.x + offset,
    y: w.y + 70,
    kind: 2,
    charge: 0.99,
  }));
  stepWorld(w, 0.05, 0, 0);
  assert.equal(w.cargo, CAPACITY);
});

void test('cargo launch banks remotely once; empty, uncharged and ended runs cannot spend it', () => {
  const w = createWorld();
  assert.equal(launchCargo(w), false);
  w.powerups = [{ x: w.x, y: w.y, kind: 'haul', ttl: 12 }];
  stepWorld(w, 0.05, 0, 0);
  assert.equal(launchCargo(w), false);
  assert.equal(w.launchReady, true);
  w.cargo = 5;
  assert.equal(launchCargo(w), true);
  assert.equal(w.score, 600);
  assert.equal(w.delivered, 5);
  assert.equal(w.cargo, 0);
  assert.equal(launchCargo(w), false);
  w.launchReady = true;
  w.cargo = 3;
  w.over = true;
  assert.equal(launchCargo(w), false);
  assert.equal(w.cargo, 3);
});

void test('falling debris warns before moving or damaging the player', () => {
  const w = createWorld();
  w.shield = 0;
  w.traffic = [{ x: w.x, y: w.y, vx: 0, vy: 180, kind: 2, warning: 0.9 }];
  const y = w.y;
  stepWorld(w, 0.05, 0, 0);
  assert.equal(w.lives, 3);
  assert.equal(w.traffic[0].y, y);
  w.traffic[0].warning = 0;
  assert.equal(stepWorld(w, 0.05, 0, 0).hit, true);
  assert.equal(w.traffic[0].y, y + 9);
});
void test('a complete run introduces all hazard types and keeps pickups and traffic bounded', () => {
  const w = createWorld(7);
  w.shield = 1000;
  const seen = new Map<number, Set<number>>();
  const pickups = new Set<string>();
  for (let i = 0; i < 1501; i++) {
    stepWorld(w, 0.05, 0, 0);
    if (!seen.has(w.level)) seen.set(w.level, new Set());
    w.traffic.forEach((t) => seen.get(w.level)!.add(t.kind));
    w.powerups.forEach((p) => pickups.add(p.kind));
    assert.ok(w.traffic.length < 12);
    assert.ok(w.powerups.length <= 2);
    assert.ok(w.cargo <= CAPACITY);
  }
  assert.deepEqual([...seen.get(1)!], [0]);
  assert.ok(seen.get(2)!.has(1));
  assert.ok(seen.get(3)!.has(2));
  assert.equal(pickups.size, 3);
  assert.equal(w.over, true);
});
void test('truck banks cargo once and rewards a full load', () => {
  const w = createWorld();
  w.y = H - 80;
  w.cargo = 5;
  assert.equal(stepWorld(w, 0.01, 0, 0).banked, true);
  assert.equal(w.score, 600);
  assert.equal(w.delivered, 5);
  stepWorld(w, 0.01, 0, 0);
  assert.equal(w.score, 600);
});
void test('taller world has usable lower space and unloads only at its bottom', () => {
  assert.equal(H, W);
  const w = createWorld(42);
  assert.ok(w.junk.some((j) => j.y > 500));
  assert.ok(w.junk.every((j) => j.y < H - 120));
  w.cargo = 2;
  w.y = 520;
  assert.equal(stepWorld(w, 0.01, 0, 0).banked, false);
  w.y = H - 80;
  assert.equal(stepWorld(w, 0.01, 0, 0).banked, true);
  w.shield = 1000;
  for (let i = 0; i < 100; i++) stepWorld(w, 0.05, 0, 1);
  assert.equal(w.y, H - 60);
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
