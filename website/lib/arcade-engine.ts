// The simulation has no DOM, clock, storage, or rendering dependencies.
export const ROUND_SECONDS = 60;
export const MAX_LEGS = 3;
export const CAPACITY = 5;
export const chassis = {
  scout: {
    name: 'Scout',
    tip: 'Fast flight · 4 slots',
    speed: 280,
    capacity: 4,
    liftTime: 1,
  },
  lifter: {
    name: 'Lifter',
    tip: 'Quick lift · 5 slots',
    speed: 225,
    capacity: CAPACITY,
    liftTime: 0.8,
  },
  hauler: {
    name: 'Hauler',
    tip: 'Slow & roomy · 7 slots',
    speed: 205,
    capacity: 7,
    liftTime: 1,
  },
} as const;
export type Chassis = keyof typeof chassis;
export const W = 800;
export const H = 800;
// Shared by traffic spawning and the painted roads. Flying hazards use the sky.
export const ROAD_LANES = [245, 415, 605] as const;
export const DELIVERY_DOCKS = { recycling: 195, trash: 575 } as const;
export const levels = [
  { name: 'Neighborhood Sweep' },
  { name: 'Commercial Circuit' },
  { name: 'Orbital Yard' },
] as const;
// Pressure changes introduce future spawns, never a new location mid-flight.
const waves = [
  {
    name: 'Neighborhood Sweep',
    tip: 'Dodge cars and wide haulers. Grab the capsules.',
    interval: 3.4,
    speed: 95,
  },
  {
    name: 'Commercial Chaos',
    tip: 'Rival UFOs sweep across. Patrol drones weave down.',
    interval: 2.4,
    speed: 140,
  },
  {
    name: 'Orbital Rush',
    tip: 'Watch the warning columns. Debris is incoming!',
    interval: 1.7,
    speed: 170,
  },
  {
    name: 'Convoy Crossing',
    tip: 'Paired cars cross the loading yard.',
    interval: 2.6,
    speed: 150,
  },
  {
    name: 'Saucer Slalom',
    tip: 'Rivals weave wider. Leave yourself an exit.',
    interval: 2.1,
    speed: 165,
  },
  {
    name: 'Salvage Storm',
    tip: 'Debris targets your last position. Watch the markers.',
    interval: 1.8,
    speed: 175,
  },
  {
    name: 'Night Delivery',
    tip: 'Convoys and rivals share the night shift.',
    interval: 2.1,
    speed: 175,
  },
  {
    name: 'Deep Orbit',
    tip: 'Wide-sweeping rivals patrol the salvage field.',
    interval: 1.7,
    speed: 185,
  },
  {
    name: 'The Final Haul',
    tip: 'One last storm. Make every load count.',
    interval: 1.5,
    speed: 195,
  },
] as const;
export function pressureSettings(
  w: Pick<World, 'elapsed' | 'leg' | 'pressure'>,
) {
  const index = w.pressure - 1;
  const current = waves[index];
  const previous = waves[Math.max((w.leg - 1) * 3, index - 1)];
  const blend = Math.max(0, Math.min(1, (w.elapsed - index * 20) / 10));
  return {
    speed: previous.speed + (current.speed - previous.speed) * blend,
    interval:
      previous.interval + (current.interval - previous.interval) * blend,
  };
}
export function approachingHazards(time: number, leg = 1) {
  if (time > 40 && time <= 45)
    return 'UFOs approaching — keep an escape route.';
  if (time > 20 && time <= 25)
    return 'Debris incoming — watch for marked columns.';
  if (time > 0 && time <= 5)
    return leg === MAX_LEGS
      ? 'Final shift ending soon. Bring it home.'
      : 'Shift ending soon. Finish or choose an upgrade.';
  return '';
}
export const upgrades = {
  beam: {
    name: 'Twin Beam',
    tip: 'Keep two beams. B capsules lift three items.',
  },
  hold: {
    name: 'Cargo Bay',
    tip: 'Add 3 cargo slots. Make fewer trips to the truck.',
  },
  drive: {
    name: 'Ion Dash',
    tip: 'Burst through danger. Shift / Dash; recharges in 6s.',
  },
} as const;
export type Upgrade = keyof typeof upgrades;
export type PowerKind = 'split' | 'repulsor' | 'haul';
export const powers: Record<
  PowerKind,
  { name: string; glyph: string; tip: string; notice: string }
> = {
  split: {
    name: 'Split Beam',
    glyph: 'B',
    tip: 'Lift two items at once for 10 seconds.',
    notice: 'Split Beam: lift two at once for 10s.',
  },
  repulsor: {
    name: 'Repulsor',
    glyph: 'R',
    tip: 'Ram hazards for bonus points for 8 seconds.',
    notice: 'Repulsor: ram hazards for 8s. +75 each!',
  },
  haul: {
    name: 'Cargo Launch',
    glyph: 'H',
    tip: 'Press Space or Launch cargo to bank a load anywhere.',
    notice: 'Cargo Launch ready. Space / tap to unload.',
  },
};
export type Powerup = { x: number; y: number; kind: PowerKind; ttl: number };
export const junkTypes = [
  { name: 'Sofa', seconds: 1.4, points: 300 },
  { name: 'Mattress', seconds: 1.1, points: 225 },
  { name: 'Clean cardboard', seconds: 0.45, points: 100 },
  { name: 'Refrigerator', seconds: 1.65, points: 350 },
  { name: 'Tire', seconds: 0.6, points: 125 },
  { name: 'Television', seconds: 0.85, points: 175 },
  { name: 'Empty cans', seconds: 0.4, points: 100 },
  { name: 'Bagged trash', seconds: 0.5, points: 100 },
] as const;
export const isRecyclable = (kind: number) => kind === 2 || kind === 6;
export const junkNames = junkTypes.map((item) => item.name);
export type Junk = { x: number; y: number; kind: number; charge: number };
export type Traffic = {
  x: number;
  y: number;
  vx: number;
  kind: number;
  vy?: number;
  warning?: number;
  originY?: number;
  phase?: number;
  originX?: number;
};
export type World = {
  x: number;
  y: number;
  time: number;
  score: number;
  delivered: number;
  cargo: number;
  cargoValue: number;
  recyclingCargo: number;
  recyclingValue: number;
  recycled: number;
  recyclingBonus: number;
  chassis: Chassis;
  lives: number;
  shield: number;
  spawn: number;
  seed: number;
  junk: Junk[];
  traffic: Traffic[];
  over: boolean;
  notice: string;
  level: number;
  pressure: number;
  levelIntro: number;
  powerups: Powerup[];
  powerSpawn: number;
  powerIndex: number;
  effects: { split: number; repulsor: number };
  launchReady: boolean;
  elapsed: number;
  leg: number;
  docked: boolean;
  upgrades: Upgrade[];
  dash: number;
  dashCooldown: number;
  deliveryFlash: number;
  deliveryX: number;
  hazardIndex: number;
};
export function capacity(w: Pick<World, 'chassis' | 'upgrades'>) {
  return chassis[w.chassis].capacity + (w.upgrades.includes('hold') ? 3 : 0);
}
export function dash(w: World) {
  if (w.over || w.docked || !w.upgrades.includes('drive') || w.dashCooldown > 0)
    return false;
  w.dash = 0.65;
  w.dashCooldown = 6;
  w.shield = Math.max(w.shield, 0.85);
  w.notice = 'Ion Dash! Fly through danger.';
  return true;
}
export function finishWorld(w: World) {
  if (w.over) return;
  w.over = true;
  w.docked = false;
  w.score += w.cargoValue;
  w.delivered += w.cargo;
  w.cargo = 0;
  w.cargoValue = 0;
  w.recyclingCargo = 0;
  w.recyclingValue = 0;
  w.notice = 'Shift complete. Hello, space!';
}
export function extendShift(w: World, upgrade: Upgrade) {
  if (
    !w.docked ||
    w.over ||
    w.leg >= MAX_LEGS ||
    !(upgrade in upgrades) ||
    w.upgrades.includes(upgrade)
  )
    return false;
  w.upgrades.push(upgrade);
  w.leg++;
  w.level = w.leg;
  w.pressure = (w.leg - 1) * 3 + 1;
  w.levelIntro = 0;
  w.time = ROUND_SECONDS;
  w.docked = false;
  w.traffic = [];
  w.powerups = [];
  w.spawn = 3;
  w.powerSpawn = 2;
  w.shield = 3;
  w.lives = Math.min(3, w.lives + 1);
  w.notice = `${upgrades[upgrade].name} installed. Shield repaired. Let's haul!`;
  return true;
}
export function beamRange(w: World) {
  return {
    width: w.effects.split > 0 ? 82 : w.upgrades.includes('beam') ? 65 : 43,
    depth: 115,
  };
}
export function beamTargets(w: World) {
  if (w.over || w.docked || w.cargo >= capacity(w)) return [];
  const range = beamRange(w);
  return w.junk
    .filter(
      (j) =>
        Math.abs(j.x - w.x) < range.width &&
        j.y - w.y > 15 &&
        j.y - w.y < range.depth,
    )
    .slice(
      0,
      Math.min(
        capacity(w) - w.cargo,
        1 + Number(w.effects.split > 0) + Number(w.upgrades.includes('beam')),
      ),
    );
}
function bankCargo(w: World) {
  const points = w.cargoValue + (w.cargo === capacity(w) ? 100 : 0);
  w.score += points;
  w.deliveryFlash = 0.7;
  w.delivered += w.cargo;
  w.cargo = 0;
  w.cargoValue = 0;
  w.recyclingCargo = 0;
  w.recyclingValue = 0;
  w.deliveryX = w.x;
  w.notice = `POOF, GONE! +${points} points delivered.`;
}
// Each dock accepts its own stream only. Wrong-dock visits never lose cargo or pay.
export function deliverCargo(w: World, stream: keyof typeof DELIVERY_DOCKS) {
  if (w.over || w.docked) return false;
  const recycle = stream === 'recycling';
  const count = recycle ? w.recyclingCargo : w.cargo - w.recyclingCargo;
  if (!count) {
    if (w.cargo)
      w.notice = recycle
        ? 'This load goes to Bulk / Trash →'
        : 'Clean boxes and cans go to ← Recycling.';
    return false;
  }
  const value = recycle ? w.recyclingValue : w.cargoValue - w.recyclingValue;
  const points = value * (recycle ? 2 : 1);
  w.score += points;
  w.delivered += count;
  w.cargo -= count;
  w.cargoValue -= value;
  if (recycle) {
    w.recyclingCargo = 0;
    w.recyclingValue = 0;
    w.recycled += count;
    w.recyclingBonus += value;
  }
  w.deliveryFlash = 0.7;
  w.deliveryX = DELIVERY_DOCKS[stream];
  w.notice = `${recycle ? 'Recycled! 2× value' : 'Bulk / trash delivered'} · +${points}${w.cargo ? ` · ${w.cargo} left for the other dock.` : ''}`;
  return true;
}
export function launchCargo(w: World) {
  if (w.over || w.docked || !w.launchReady || !w.cargo) return false;
  bankCargo(w);
  w.launchReady = false;
  w.notice =
    'Express delivery! Base points banked; recycling bonus needs the dock.';
  return true;
}
function random(w: World) {
  w.seed = (Math.imul(w.seed, 1664525) + 1013904223) >>> 0;
  return w.seed / 4294967296;
}
function addJunk(w: World) {
  let x = 0,
    y = 0;
  for (let attempt = 0; attempt < 40; attempt++) {
    x = 65 + random(w) * 670;
    y = 170 + random(w) * (H - 345);
    if (w.junk.every((item) => Math.hypot(item.x - x, item.y - y) > 58)) break;
  }
  w.junk.push({
    x,
    y,
    kind: Math.floor(random(w) * junkTypes.length),
    charge: 0,
  });
}
export function createWorld(seed = 42, build: Chassis = 'lifter'): World {
  const w: World = {
    x: 400,
    y: 105,
    time: ROUND_SECONDS,
    score: 0,
    delivered: 0,
    cargo: 0,
    cargoValue: 0,
    recyclingCargo: 0,
    recyclingValue: 0,
    recycled: 0,
    recyclingBonus: 0,
    chassis: build,
    lives: 3,
    shield: 2,
    spawn: 4,
    seed,
    junk: [],
    traffic: [],
    over: false,
    notice: 'Hover above junk to beam it up.',
    level: 1,
    pressure: 1,
    levelIntro: 0,
    powerups: [],
    powerSpawn: 5,
    powerIndex: 0,
    effects: { split: 0, repulsor: 0 },
    launchReady: false,
    elapsed: 0,
    leg: 1,
    docked: false,
    upgrades: [],
    dash: 0,
    dashCooldown: 0,
    deliveryFlash: 0,
    deliveryX: DELIVERY_DOCKS.trash,
    hazardIndex: 0,
  };
  for (let i = 0; i < 10; i++) addJunk(w);
  // Every opening field demonstrates both destinations, regardless of the seed.
  w.junk[0].kind = 2;
  w.junk[1].kind = 6;
  w.junk[2].kind = 7;
  return w;
}
export type StepEvents = {
  collected: boolean;
  banked: boolean;
  hit: boolean;
  levelChanged: boolean;
  powerUp: PowerKind | null;
  deflected: boolean;
  warning: boolean;
};
export function stepWorld(
  w: World,
  seconds: number,
  dx: number,
  dy: number,
): StepEvents {
  const events: StepEvents = {
    collected: false,
    banked: false,
    hit: false,
    levelChanged: false,
    powerUp: null,
    deflected: false,
    warning: false,
  };
  if (w.over || w.docked) return events;
  const dt = Math.min(Math.max(seconds, 0), 0.05, w.time);
  w.time = Math.max(0, w.time - dt);
  w.elapsed += dt;
  w.dash = Math.max(0, w.dash - dt);
  w.dashCooldown = Math.max(0, w.dashCooldown - dt);
  w.deliveryFlash = Math.max(0, w.deliveryFlash - dt);
  w.shield = Math.max(0, w.shield - dt);
  w.levelIntro = Math.max(0, w.levelIntro - dt);
  for (const key of ['split', 'repulsor'] as const)
    w.effects[key] = Math.max(0, w.effects[key] - dt);
  w.pressure = Math.min(w.leg * 3, 1 + Math.floor((w.elapsed + 0.000001) / 20));
  const length = Math.hypot(dx, dy) || 1;
  const speed = w.dash > 0 ? 540 : chassis[w.chassis].speed;
  w.x = Math.max(
    35,
    Math.min(W - 35, w.x + (dx / Math.max(1, length)) * speed * dt),
  );
  w.y = Math.max(
    60,
    Math.min(H - 60, w.y + (dy / Math.max(1, length)) * speed * dt),
  );
  if (w.cargo && w.y > H - 120) {
    for (const stream of ['recycling', 'trash'] as const) {
      if (Math.abs(w.x - DELIVERY_DOCKS[stream]) < 110)
        events.banked = deliverCargo(w, stream);
    }
  }
  w.powerSpawn -= dt;
  if (w.powerSpawn <= 0) {
    const kind = (['split', 'repulsor', 'haul'] as const)[w.powerIndex++ % 3];
    if (w.powerups.length < 2)
      w.powerups.push({
        x: 100 + random(w) * 600,
        y: 175 + random(w) * (H - 380),
        kind,
        ttl: 14,
      });
    w.powerSpawn = 9;
  }
  w.powerups = w.powerups.filter((p) => {
    p.ttl -= dt;
    if (p.ttl <= 0) return false;
    if (Math.hypot(p.x - w.x, p.y - w.y) > 36) return true;
    if (p.kind === 'haul') w.launchReady = true;
    else w.effects[p.kind] = p.kind === 'split' ? 10 : 8;
    w.notice = powers[p.kind].notice;
    events.powerUp = p.kind;
    return false;
  });
  const targets = beamTargets(w);
  for (const j of w.junk) {
    if (targets.includes(j) && w.cargo < capacity(w)) {
      const item = junkTypes[j.kind];
      j.charge += dt / (item.seconds * chassis[w.chassis].liftTime);
      if (j.charge >= 1) {
        w.cargo++;
        w.cargoValue += item.points;
        if (isRecyclable(j.kind)) {
          w.recyclingCargo++;
          w.recyclingValue += item.points;
        }
        w.junk = w.junk.filter((item) => item !== j);
        addJunk(w);
        w.notice =
          w.cargo === capacity(w)
            ? 'Full load! ← Recycling · Bulk / Trash →'
            : `${item.name} aboard. ${isRecyclable(j.kind) ? '← Recycle for ' + item.points * 2 : 'Bulk / Trash → ' + item.points} pts.`;
        events.collected = true;
      }
    } else j.charge = Math.max(0, j.charge - dt);
  }
  w.spawn -= dt;
  if (w.spawn <= 0) {
    const fromLeft = random(w) > 0.5;
    const settings = pressureSettings(w);
    const area = (w.pressure - 1) % 3;
    const roster =
      area === 0 ? [0, 0, 4] : area === 1 ? [1, 3, 0, 1] : [2, 1, 3, 4];
    const kind = roster[w.hazardIndex++ % roster.length];
    const position = random(w);
    const lane = Math.floor(position * ROAD_LANES.length);
    w.traffic.push({
      x: fromLeft ? -60 : 860,
      y:
        kind === 0 || kind === 4 ? ROAD_LANES[lane] : 90 + position * (H - 265),
      vx: (fromLeft ? 1 : -1) * settings.speed,
      kind,
    });
    const hazard = w.traffic[w.traffic.length - 1];
    if (kind === 1) {
      hazard.originY = hazard.y;
      hazard.phase = 0;
    }
    if (kind === 2)
      Object.assign(hazard, {
        x:
          w.leg > 1
            ? Math.max(65, Math.min(W - 65, w.x))
            : 65 + random(w) * 670,
        y: 60,
        vx: 0,
        vy: 195,
        warning: 1.25,
      });
    if (kind === 2) events.warning = true;
    if (kind === 3) {
      const x = 120 + random(w) * (W - 240);
      Object.assign(hazard, {
        x,
        originX: x,
        y: 60,
        vx: 0,
        vy: 110 + w.leg * 12,
        phase: 0,
        warning: 0.9,
      });
      events.warning = true;
    }
    if (kind === 4) hazard.vx *= 0.65;
    if (area === 0 && w.leg > 1 && kind === 0)
      w.traffic.push({
        ...hazard,
        y: ROAD_LANES[(lane + 1) % ROAD_LANES.length],
      });
    w.spawn = settings.interval;
  }
  for (const t of w.traffic) {
    if (t.warning && t.warning > 0) {
      t.warning = Math.max(0, t.warning - dt);
      continue;
    }
    t.x += t.vx * dt;
    if (t.kind === 1 && t.originY !== undefined) {
      t.phase = (t.phase || 0) + dt * 2.4;
      t.y = t.originY + Math.sin(t.phase) * (w.leg > 1 ? 75 : 38);
    }
    if (t.vy) t.y += t.vy * dt;
    if (t.kind === 3 && t.originX !== undefined) {
      t.phase = (t.phase || 0) + dt * 2;
      t.x = t.originX + Math.sin(t.phase) * 70;
    }
    const collisionWidth = t.kind === 4 ? 70 : t.kind === 3 ? 38 : 48;
    if (
      Math.abs(t.x - w.x) < collisionWidth &&
      Math.abs(t.y - w.y) < 28 &&
      w.effects.repulsor > 0
    ) {
      t.x = -200;
      w.score += 75;
      w.notice = 'BOING! Hazard repelled. +75 points.';
      events.deflected = true;
    } else if (
      !w.shield &&
      Math.abs(t.x - w.x) < collisionWidth &&
      Math.abs(t.y - w.y) < 28
    ) {
      w.lives--;
      w.shield = 2;
      w.notice = 'Close encounter! Two seconds of protection.';
      events.hit = true;
    }
  }
  w.traffic = w.traffic.filter((t) => t.x > -100 && t.x < 900 && t.y < H + 60);
  if (w.lives <= 0 || (w.time <= 0 && w.leg >= MAX_LEGS)) finishWorld(w);
  else if (w.time <= 0) {
    w.docked = true;
    w.notice = 'Shift complete. Finish here or upgrade for another minute.';
  }
  return events;
}
export function readBest(raw: string | null): number {
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= 0 && n <= 100000 ? n : 0;
}
