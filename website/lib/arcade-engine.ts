// The simulation has no DOM, clock, storage, or rendering dependencies.
export const ROUND_SECONDS = 75;
export const CAPACITY = 5;
export const W = 800;
export const H = 600;
export const junkNames = [
  'Sofa',
  'Mattress',
  'Boxes',
  'Refrigerator',
  'Tire',
  'Television',
];
export type Junk = { x: number; y: number; kind: number; charge: number };
export type Traffic = { x: number; y: number; vx: number; kind: number };
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
};
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
  };
  for (let i = 0; i < 10; i++) addJunk(w);
  return w;
}
export type StepEvents = { collected: boolean; banked: boolean; hit: boolean };
export function stepWorld(
  w: World,
  seconds: number,
  dx: number,
  dy: number,
): StepEvents {
  const events = { collected: false, banked: false, hit: false };
  if (w.over) return events;
  const dt = Math.min(Math.max(seconds, 0), 0.05, w.time);
  w.time = Math.max(0, w.time - dt);
  w.shield = Math.max(0, w.shield - dt);
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
    w.score += w.cargo * 100 + (w.cargo === CAPACITY ? 100 : 0);
    w.delivered += w.cargo;
    w.cargo = 0;
    w.notice = 'POOF, GONE! Load delivered.';
    events.banked = true;
  }
  const target = w.junk.find(
    (j) => Math.abs(j.x - w.x) < 43 && j.y - w.y > 15 && j.y - w.y < 115,
  );
  for (const j of w.junk) {
    if (j === target && w.cargo < CAPACITY) {
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
    w.traffic.push({
      x: fromLeft ? -60 : 860,
      y: 90 + random(w) * 335,
      vx: (fromLeft ? 1 : -1) * (90 + (ROUND_SECONDS - w.time) * 1.8),
      kind: random(w) > 0.5 ? 1 : 0,
    });
    w.spawn = Math.max(1.3, 3.8 - (ROUND_SECONDS - w.time) / 30);
  }
  for (const t of w.traffic) {
    t.x += t.vx * dt;
    if (!w.shield && Math.abs(t.x - w.x) < 48 && Math.abs(t.y - w.y) < 28) {
      w.lives--;
      w.shield = 2;
      w.notice = 'Close encounter! Two seconds of protection.';
      events.hit = true;
    }
  }
  w.traffic = w.traffic.filter((t) => t.x > -100 && t.x < 900);
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
