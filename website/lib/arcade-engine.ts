// The simulation has no DOM, clock, storage, or rendering dependencies.
export const ROUND_SECONDS = 75;
export const CAPACITY = 5;
export const W = 800;
export const H = 600;
export const levels = [
  {
    name: 'Neighborhood Sweep',
    tip: 'Dodge passing cars. Collect the glowing capsules.',
    interval: 3.4,
    speed: 95,
  },
  {
    name: 'Commercial Chaos',
    tip: 'Rival UFOs swoop across your route.',
    interval: 2.4,
    speed: 140,
  },
  {
    name: 'Orbital Rush',
    tip: 'Watch the warning columns. Debris is incoming!',
    interval: 1.7,
    speed: 170,
  },
] as const;
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
export const junkNames = [
  'Sofa',
  'Mattress',
  'Boxes',
  'Refrigerator',
  'Tire',
  'Television',
];
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
};
export type World = {
  x: number;
  y: number;
  time: number;
  score: number;
  delivered: number;
  cargo: number;
  lives: number;
  shield: number;
  spawn: number;
  seed: number;
  junk: Junk[];
  traffic: Traffic[];
  over: boolean;
  notice: string;
  level: number;
  levelIntro: number;
  powerups: Powerup[];
  powerSpawn: number;
  powerIndex: number;
  effects: { split: number; repulsor: number };
  launchReady: boolean;
};
export function beamRange(w: World) {
  return { width: w.effects.split > 0 ? 82 : 43, depth: 115 };
}
export function beamTargets(w: World) {
  if (w.over || w.cargo >= CAPACITY) return [];
  const range = beamRange(w);
  return w.junk
    .filter(
      (j) =>
        Math.abs(j.x - w.x) < range.width &&
        j.y - w.y > 15 &&
        j.y - w.y < range.depth,
    )
    .slice(0, Math.min(CAPACITY - w.cargo, w.effects.split > 0 ? 2 : 1));
}
function bankCargo(w: World) {
  w.score += w.cargo * 100 + (w.cargo === CAPACITY ? 100 : 0);
  w.delivered += w.cargo;
  w.cargo = 0;
  w.notice = 'POOF, GONE! Load delivered.';
}
export function launchCargo(w: World) {
  if (w.over || !w.launchReady || !w.cargo) return false;
  bankCargo(w);
  w.launchReady = false;
  w.notice = 'Special delivery! Cargo launched straight to the truck.';
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
    y = 170 + random(w) * 285;
    if (w.junk.every((item) => Math.hypot(item.x - x, item.y - y) > 58)) break;
  }
  w.junk.push({
    x,
    y,
    kind: Math.floor(random(w) * 6),
    charge: 0,
  });
}
export function createWorld(seed = 42): World {
  const w: World = {
    x: 400,
    y: 105,
    time: ROUND_SECONDS,
    score: 0,
    delivered: 0,
    cargo: 0,
    lives: 3,
    shield: 2,
    spawn: 4,
    seed,
    junk: [],
    traffic: [],
    over: false,
    notice: 'Hover above junk to beam it up.',
    level: 1,
    levelIntro: 3,
    powerups: [],
    powerSpawn: 5,
    powerIndex: 0,
    effects: { split: 0, repulsor: 0 },
    launchReady: false,
  };
  for (let i = 0; i < 10; i++) addJunk(w);
  return w;
}
export type StepEvents = {
  collected: boolean;
  banked: boolean;
  hit: boolean;
  levelChanged: boolean;
  powerUp: PowerKind | null;
  deflected: boolean;
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
  };
  if (w.over) return events;
  const dt = Math.min(Math.max(seconds, 0), 0.05, w.time);
  w.time = Math.max(0, w.time - dt);
  w.shield = Math.max(0, w.shield - dt);
  w.levelIntro = Math.max(0, w.levelIntro - dt);
  for (const key of ['split', 'repulsor'] as const)
    w.effects[key] = Math.max(0, w.effects[key] - dt);
  const level = Math.min(3, 1 + Math.floor((ROUND_SECONDS - w.time) / 25));
  if (level !== w.level) {
    w.level = level;
    w.levelIntro = 3;
    w.traffic = [];
    w.spawn = 2;
    w.shield = Math.max(w.shield, 2);
    w.powerSpawn = Math.min(w.powerSpawn, 1);
    w.notice = levels[level - 1].tip;
    events.levelChanged = true;
  }
  const length = Math.hypot(dx, dy) || 1;
  w.x = Math.max(
    35,
    Math.min(W - 35, w.x + (dx / Math.max(1, length)) * 235 * dt),
  );
  w.y = Math.max(
    60,
    Math.min(H - 60, w.y + (dy / Math.max(1, length)) * 235 * dt),
  );
  if (w.cargo && w.y > 480 && Math.abs(w.x - 400) < 110) {
    bankCargo(w);
    events.banked = true;
  }
  w.powerSpawn -= dt;
  if (w.powerSpawn <= 0) {
    const kind = (['split', 'repulsor', 'haul'] as const)[w.powerIndex++ % 3];
    if (w.powerups.length < 2)
      w.powerups.push({
        x: 100 + random(w) * 600,
        y: 175 + random(w) * 220,
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
    if (targets.includes(j) && w.cargo < CAPACITY) {
      j.charge += dt / (j.kind === 0 || j.kind === 3 ? 0.8 : 0.48);
      if (j.charge >= 1) {
        w.cargo++;
        w.junk = w.junk.filter((item) => item !== j);
        addJunk(w);
        w.notice =
          w.cargo === CAPACITY
            ? 'Full load! Head to the truck below.'
            : `${junkNames[j.kind]} aboard. Keep clearing!`;
        events.collected = true;
      }
    } else j.charge = Math.max(0, j.charge - dt);
  }
  w.spawn -= dt;
  if (w.spawn <= 0) {
    const fromLeft = random(w) > 0.5;
    const settings = levels[w.level - 1];
    const kind =
      w.level === 1
        ? 0
        : w.level === 3 && random(w) > 0.55
          ? 2
          : random(w) > 0.45
            ? 1
            : 0;
    w.traffic.push({
      x: fromLeft ? -60 : 860,
      y: 90 + random(w) * 335,
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
        x: 65 + random(w) * 670,
        y: 60,
        vx: 0,
        vy: 195,
        warning: 1.25,
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
      t.y = t.originY + Math.sin(t.phase) * 38;
    }
    if (t.vy) t.y += t.vy * dt;
    if (
      Math.abs(t.x - w.x) < 48 &&
      Math.abs(t.y - w.y) < 28 &&
      w.effects.repulsor > 0
    ) {
      t.x = -200;
      w.score += 75;
      w.notice = 'BOING! Hazard repelled. +75 points.';
      events.deflected = true;
    } else if (
      !w.shield &&
      Math.abs(t.x - w.x) < 48 &&
      Math.abs(t.y - w.y) < 28
    ) {
      w.lives--;
      w.shield = 2;
      w.notice = 'Close encounter! Two seconds of protection.';
      events.hit = true;
    }
  }
  w.traffic = w.traffic.filter((t) => t.x > -100 && t.x < 900 && t.y < H + 60);
  if (w.time <= 0 || w.lives <= 0) {
    w.over = true;
    // Picked-up items still count at the end; delivering full loads earns bonuses.
    w.score += w.cargo * 100;
    w.delivered += w.cargo;
    w.cargo = 0;
    w.notice = 'Shift complete. Hello, space!';
  }
  return events;
}
export function readBest(raw: string | null): number {
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= 0 && n <= 100000 ? n : 0;
}
