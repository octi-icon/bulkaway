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
  capacity,
  extendShift,
  finishWorld,
  dash,
  chassis,
  junkTypes,
  DELIVERY_DOCKS,
  deliverCargo,
  pressureSettings,
  approachingHazards,
  type Chassis,
} from './arcade-engine.ts';

function lift(kind: number, build: Chassis = 'lifter') {
  const w = createWorld(42, build);
  w.junk = [{ x: w.x, y: w.y + 70, kind, charge: 0 }];
  let seconds = 0;
  while (!w.cargo && seconds < 3) {
    stepWorld(w, 0.01, 0, 0);
    seconds += 0.01;
  }
  return { w, seconds };
}
void test('larger items take longer and retain their higher value through delivery and finish', () => {
  const results = junkTypes.map((_, kind) => lift(kind));
  for (const [kind, { w, seconds }] of results.entries()) {
    assert.equal(w.cargo, 1);
    assert.equal(w.score, 0);
    assert.equal(w.cargoValue, junkTypes[kind].points);
    assert.ok(
      Math.abs(seconds - junkTypes[kind].seconds * chassis.lifter.liftTime) <
        0.02,
    );
    w.launchReady = true;
    assert.equal(launchCargo(w), true);
    assert.equal(w.score, junkTypes[kind].points);
    assert.equal(w.cargoValue, 0);
    finishWorld(w);
    assert.equal(w.score, junkTypes[kind].points);
  }
  assert.ok(results[3].seconds > results[0].seconds);
  assert.ok(results[0].seconds > results[2].seconds);
  const { w } = lift(3);
  w.shield = 0;
  w.traffic = [{ x: w.x, y: w.y, vx: 0, kind: 0 }];
  stepWorld(w, 0.01, 0, 0);
  w.docked = true;
  extendShift(w, 'hold');
  finishWorld(w);
  finishWorld(w);
  assert.equal(w.score, 350);
  assert.equal(w.cargoValue, 0);
});
void test('three chassis trade speed, capacity and suction; upgrades add to each build', () => {
  const movement = {} as Record<Chassis, number>;
  for (const id of Object.keys(chassis) as Chassis[]) {
    const w = createWorld(42, id);
    stepWorld(w, 0.05, 1, 0);
    movement[id] = w.x - 400;
    assert.equal(capacity(w), chassis[id].capacity);
    w.docked = true;
    extendShift(w, 'hold');
    assert.equal(capacity(w), chassis[id].capacity + 3);
    assert.equal(w.chassis, id);
    w.junk = [{ x: w.x, y: w.y + 70, kind: 2, charge: 0 }];
    w.cargo = capacity(w);
    stepWorld(w, 0.05, 0, 0);
    assert.equal(w.junk[0].charge, 0);
  }
  assert.ok(movement.scout > movement.lifter);
  assert.ok(movement.lifter > movement.hauler);
  assert.ok(lift(3, 'lifter').seconds < lift(3, 'scout').seconds);
  assert.equal(lift(3, 'hauler').seconds, lift(3, 'scout').seconds);
});
void test('mixed cargo needs both docks and recycling earns double value once', () => {
  const w = createWorld();
  for (const kind of [0, 3, 2, 4, 5]) {
    w.junk = [{ x: w.x, y: w.y + 70, kind, charge: 0.999 }];
    stepWorld(w, 0.01, 0, 0);
  }
  assert.equal(w.cargo, 5);
  assert.equal(w.cargoValue, 1050);
  assert.equal(w.score, 0);
  w.y = H - 80;
  w.x = DELIVERY_DOCKS.trash;
  stepWorld(w, 0.01, 0, 0);
  assert.equal(w.score, 950);
  assert.equal(w.cargo, 1);
  assert.equal(w.recyclingCargo, 1);
  assert.equal(w.cargoValue, 100);
  assert.equal(stepWorld(w, 0.01, 0, 0).banked, false);
  w.x = DELIVERY_DOCKS.recycling;
  stepWorld(w, 0.01, 0, 0);
  assert.equal(w.score, 1150);
  assert.equal(w.recycled, 1);
  assert.equal(w.recyclingBonus, 100);
  assert.equal(w.cargoValue, 0);
  assert.equal(w.delivered, 5);
  stepWorld(w, 0.01, 0, 0);
  assert.equal(w.score, 1150);
});

void test('wrong docks retain recyclable cargo, and express/finish cannot claim its bonus', () => {
  for (const action of ['launch', 'finish'] as const) {
    const { w } = lift(6);
    assert.equal(w.recyclingCargo, 1);
    const value = w.cargoValue;
    assert.equal(deliverCargo(w, 'trash'), false);
    assert.equal(w.cargoValue, value);
    assert.equal(w.score, 0);
    w.launchReady = true;
    if (action === 'launch') launchCargo(w);
    else finishWorld(w);
    assert.equal(w.score, value);
    assert.equal(w.recyclingCargo, 0);
    assert.equal(w.recyclingValue, 0);
    assert.equal(w.recyclingBonus, 0);
    assert.equal(deliverCargo(w, 'recycling'), false);
    assert.equal(w.score, value);
  }
});
void test('recycling-first unload retains trash across an upgrade and cannot score while docked', () => {
  const { w } = lift(2);
  w.cargo++;
  w.cargoValue += 300;
  w.docked = true;
  assert.equal(deliverCargo(w, 'recycling'), false);
  extendShift(w, 'hold');
  assert.equal(deliverCargo(w, 'recycling'), true);
  assert.equal(w.score, 200);
  assert.equal(w.cargo, 1);
  assert.equal(w.cargoValue, 300);
  assert.equal(deliverCargo(w, 'recycling'), false);
  assert.equal(deliverCargo(w, 'trash'), true);
  assert.equal(w.score, 500);
  assert.equal(w.delivered, 2);
});
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

void test('pressure rises within a level without sudden level events', () => {
  const w = createWorld();
  assert.equal(w.level, 1);
  w.elapsed = 19.99;
  w.traffic = [{ x: w.x, y: w.y, vx: 0, kind: 0 }];
  assert.equal(stepWorld(w, 0.02, 0, 0).levelChanged, false);
  assert.equal(w.pressure, 2);
  assert.equal(w.level, 1);
  assert.equal(w.traffic.length, 1);
  assert.ok(w.shield > 0);
  assert.equal(stepWorld(w, 0.02, 0, 0).levelChanged, false);
  w.elapsed = 39.99;
  assert.equal(stepWorld(w, 0.02, 0, 0).levelChanged, false);
  assert.equal(w.pressure, 3);
  assert.equal(w.level, 1);
});
void test('hazards are previewed before arriving and spawn speed ramps continuously', () => {
  assert.equal(approachingHazards(46), '');
  assert.match(approachingHazards(45), /UFOs/);
  assert.match(approachingHazards(40.1), /UFOs/);
  assert.equal(approachingHazards(40), '');
  assert.match(approachingHazards(25), /Debris/);
  assert.match(approachingHazards(5), /Shift ending/);
  assert.equal(approachingHazards(0), '');
  const before = pressureSettings({ elapsed: 19.99, leg: 1, pressure: 1 });
  const boundary = pressureSettings({ elapsed: 20, leg: 1, pressure: 2 });
  const midway = pressureSettings({ elapsed: 25, leg: 1, pressure: 2 });
  const after = pressureSettings({ elapsed: 30, leg: 1, pressure: 2 });
  assert.deepEqual(before, boundary);
  assert.ok(boundary.speed < midway.speed && midway.speed < after.speed);
  assert.ok(
    boundary.interval > midway.interval && midway.interval > after.interval,
  );
});
void test('mid-shift escalation preserves the location, traffic and pickup state', () => {
  const w = createWorld();
  w.elapsed = 19.99;
  w.time = 40.01;
  w.shield = 0;
  w.spawn = 1;
  const traffic = { x: 100, y: 245, vx: 95, kind: 0 };
  w.traffic = [traffic];
  const junk = w.junk[0];
  const event = stepWorld(w, 0.02, 0, 0);
  assert.equal(w.level, 1, 'Location must not change in the middle of a shift');
  assert.equal(event.levelChanged, false, 'No surprise level sound');
  assert.ok(w.traffic.includes(traffic), 'Traffic must not vanish');
  assert.ok(w.junk.includes(junk));
  assert.equal(w.shield, 0, 'Escalation must not reset protection');
  assert.ok(Math.abs(w.spawn - 0.98) < 0.001);
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
  w.cargoValue = 5 * 100;
  assert.equal(launchCargo(w), true);
  assert.equal(w.score, 600);
  assert.equal(w.delivered, 5);
  assert.equal(w.cargo, 0);
  assert.equal(launchCargo(w), false);
  w.launchReady = true;
  w.cargo = 3;
  w.cargoValue = 3 * 100;
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
    if (!seen.has(w.pressure)) seen.set(w.pressure, new Set());
    w.traffic.forEach((t) => seen.get(w.pressure)!.add(t.kind));
    w.powerups.forEach((p) => pickups.add(p.kind));
    assert.ok(w.traffic.length < 12);
    assert.ok(w.powerups.length <= 2);
    assert.ok(w.cargo <= CAPACITY);
  }
  assert.ok(seen.get(1)!.has(0));
  assert.ok(seen.get(1)!.has(4));
  assert.ok(seen.get(2)!.has(1));
  assert.ok(seen.get(2)!.has(3));
  assert.ok(seen.get(3)!.has(2));
  assert.equal(pickups.size, 3);
  assert.equal(w.docked, true);
  assert.equal(w.over, false);
});
void test('truck banks trash once without multiplying delivery rewards', () => {
  const w = createWorld();
  w.y = H - 80;
  w.x = DELIVERY_DOCKS.trash;
  w.cargo = 5;
  w.cargoValue = 5 * 100;
  assert.equal(stepWorld(w, 0.01, 0, 0).banked, true);
  assert.equal(w.score, 500);
  assert.equal(w.delivered, 5);
  stepWorld(w, 0.01, 0, 0);
  assert.equal(w.score, 500);
});
void test('patrol drones warn before weaving downward and heavy haulers have a wider collision body', () => {
  const w = createWorld(8);
  w.elapsed = 21;
  stepWorld(w, 0.01, 0, 0);
  w.spawn = 0;
  w.hazardIndex = 1;
  const event = stepWorld(w, 0.05, 0, 0);
  const drone = w.traffic.find((t) => t.kind === 3)!;
  assert.ok(drone);
  assert.equal(event.warning, true);
  assert.equal(drone.y, 60);
  drone.warning = 0;
  const x = drone.x;
  stepWorld(w, 0.05, 0, 0);
  assert.ok(drone.y > 60);
  assert.notEqual(drone.x, x);
  assert.ok(Math.abs(drone.x - drone.originX!) <= 70);
  w.shield = 0;
  w.traffic = [{ x: w.x + 60, y: w.y, vx: 0, kind: 0 }];
  assert.equal(stepWorld(w, 0.01, 0, 0).hit, false);
  w.traffic[0].kind = 4;
  assert.equal(stepWorld(w, 0.01, 0, 0).hit, true);
  w.effects.repulsor = 2;
  assert.equal(stepWorld(w, 0.01, 0, 0).deflected, true);
  assert.equal(w.traffic.length, 0);
});
void test('taller world has usable lower space and unloads only at its bottom', () => {
  assert.equal(H, W);
  const w = createWorld(42);
  assert.ok(w.junk.some((j) => j.y > 500));
  assert.ok(w.junk.every((j) => j.y < H - 120));
  w.cargo = 2;
  w.cargoValue = 2 * 100;
  w.y = 520;
  w.x = DELIVERY_DOCKS.trash;
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
  w.leg = 3;
  w.cargo = 2;
  w.cargoValue = 2 * 100;
  stepWorld(w, 0.05, 0, 0);
  assert.equal(w.over, true);
  assert.equal(w.score, 200);
  const end = structuredClone(w);
  stepWorld(w, 0.05, 1, 1);
  assert.deepEqual(w, end);
});
void test('a minute docks once, freezes simulation, and only an explicit upgrade extends play', () => {
  const w = createWorld();
  w.elapsed = 59.99;
  w.time = 0.01;
  w.cargo = 3;
  w.cargoValue = 3 * 100;
  stepWorld(w, 0.05, 0, 0);
  assert.equal(w.docked, true);
  assert.equal(w.level, 1);
  assert.equal(w.pressure, 3);
  const dock = structuredClone(w);
  stepWorld(w, 0.05, 1, 1);
  assert.deepEqual(w, dock);
  assert.equal(launchCargo(w), false);
  assert.equal(extendShift(w, 'hold'), true);
  assert.equal(extendShift(w, 'beam'), false);
  assert.equal(w.time, 60);
  assert.equal(w.cargo, 3);
  assert.equal(w.score, 0);
  stepWorld(w, 0.05, 0, 0);
  assert.equal(w.level, 2);
  assert.equal(w.pressure, 4);
  assert.equal(capacity(w), 8);
  w.cargo = 8;
  w.cargoValue = 8 * 100;
  w.launchReady = true;
  assert.equal(launchCargo(w), true);
  assert.equal(w.score, 900);
  w.cargo = 2;
  w.cargoValue = 2 * 100;
  finishWorld(w);
  finishWorld(w);
  assert.equal(w.score, 1100);
  assert.equal(w.delivered, 10);
});
void test('twin upgrade stacks with capsules; dash is gated, protected and rechargeable', () => {
  const w = createWorld();
  assert.equal(dash(w), false);
  w.docked = true;
  extendShift(w, 'beam');
  w.junk = [-55, 55].map((offset) => ({
    x: w.x + offset,
    y: w.y + 70,
    kind: 2,
    charge: 0,
  }));
  for (let i = 0; i < 11; i++) stepWorld(w, 0.05, 0, 0);
  assert.equal(w.cargo, 2);
  w.docked = true;
  assert.equal(extendShift(w, 'beam'), false);
  assert.equal(extendShift(w, 'drive'), true);
  assert.equal(dash(w), true);
  assert.equal(dash(w), false);
  const x = w.x;
  stepWorld(w, 0.05, 1, 0);
  assert.ok(w.x - x > 20);
  assert.ok(w.shield > 0);
  for (let i = 0; i < 121; i++) stepWorld(w, 0.05, 0, 0);
  assert.equal(dash(w), true);
  finishWorld(w);
  assert.equal(dash(w), false);
  assert.deepEqual(createWorld().upgrades, []);
});
void test('three player-chosen levels span nine pressure stages with bounded hazards', () => {
  const w = createWorld(9);
  const seen = new Set<number>();
  let docks = 0;
  for (let i = 0; i < 3610 && !w.over; i++) {
    w.shield = 1000;
    stepWorld(w, 0.05, 0, 0);
    seen.add(w.pressure);
    assert.ok(w.traffic.length < 18);
    assert.ok(w.powerups.length <= 2);
    assert.ok(w.cargo <= capacity(w));
    if (w.docked) {
      docks++;
      assert.equal(extendShift(w, docks === 1 ? 'hold' : 'beam'), true);
    }
  }
  assert.equal(docks, 2);
  assert.equal(seen.size, 9);
  assert.equal(w.over, true);
  assert.ok(Math.abs(w.elapsed - 180) < 0.001);
  assert.equal(extendShift(w, 'drive'), false);
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

void test('cars and heavy haulers stay on the drawn roads throughout all three levels', () => {
  const roads = [245, 415, 605];
  const kinds = new Set<number>();
  for (const seed of [7, 42, 1234]) {
    const w = createWorld(seed);
    for (let frame = 0; frame < 3610 && !w.over; frame++) {
      w.shield = 1000;
      if (w.docked) extendShift(w, w.leg === 1 ? 'beam' : 'hold');
      stepWorld(w, 0.05, 0, 0);
      for (const vehicle of w.traffic.filter(
        (t) => t.kind === 0 || t.kind === 4,
      )) {
        kinds.add(vehicle.kind);
        assert.ok(
          roads.includes(vehicle.y),
          'Road vehicle spawned off the drawn roads at y=' + vehicle.y,
        );
      }
    }
    assert.equal(w.level, 3);
  }
  assert.deepEqual(
    [...kinds].sort((a, b) => a - b),
    [0, 4],
  );
});
