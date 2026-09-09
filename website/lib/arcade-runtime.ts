import { createArcadePainter } from './arcade-art';
import {
  createWorld,
  stepWorld,
  W,
  H,
  CAPACITY,
  beamTargets,
  launchCargo,
  type World,
} from './arcade-engine';
import type { BeamSound } from './arcade-audio';
export type ArcadeReadout = Pick<
  World,
  | 'score'
  | 'cargo'
  | 'lives'
  | 'time'
  | 'delivered'
  | 'notice'
  | 'level'
  | 'levelIntro'
  | 'effects'
  | 'launchReady'
>;
export type ArcadeRuntime = {
  pause: () => void;
  resume: () => void;
  destroy: () => void;
  direction: (key: string, down: boolean) => void;
  launch: () => void;
};
export function startArcade(
  canvas: HTMLCanvasElement,
  callbacks: {
    update: (value: ArcadeReadout) => void;
    finish: (value: ArcadeReadout) => void;
    pause: () => void;
    sound: (
      kind: 'collect' | 'bank' | 'hit' | 'power' | 'level' | 'repel',
    ) => void;
    beam: (value: BeamSound) => void;
    silence: () => void;
  },
): ArcadeRuntime {
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Canvas unavailable');
  // Square 320 x 320 pixel world; both axes use the same scale.
  const scale = 0.4;
  canvas.width = W * scale;
  canvas.height = H * scale;
  c.scale(scale, scale);
  const draw = createArcadePainter(c, scale);
  const world = createWorld(Math.floor(Math.random() * 0xffffffff));
  const keys = new Set<string>();
  let frame = 0,
    last = 0,
    ui = 0,
    paused = false,
    dead = false;
  let pointer: { x: number; y: number } | null = null;
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  const snapshot = (): ArcadeReadout => ({
    score: world.score,
    cargo: world.cargo,
    lives: world.lives,
    time: world.time,
    delivered: world.delivered,
    notice: world.notice,
    level: world.level,
    levelIntro: world.levelIntro,
    effects: { ...world.effects },
    launchReady: world.launchReady,
  });
  function launch() {
    if (paused || dead || !launchCargo(world)) return;
    callbacks.sound('bank');
    callbacks.update(snapshot());
  }
  function tick(now: number) {
    if (paused || dead) return;
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    let dx =
      Number(keys.has('arrowright') || keys.has('d')) -
      Number(keys.has('arrowleft') || keys.has('a'));
    let dy =
      Number(keys.has('arrowdown') || keys.has('s')) -
      Number(keys.has('arrowup') || keys.has('w'));
    if (pointer) {
      const x = pointer.x - world.x,
        y = pointer.y - world.y;
      const d = Math.hypot(x, y);
      dx = d > 6 ? x / d : 0;
      dy = d > 6 ? y / d : 0;
    }
    const event = stepWorld(world, dt, dx, dy);
    callbacks.beam(
      world.over || world.cargo === CAPACITY
        ? 0
        : beamTargets(world).some((j) => j.charge > 0)
          ? 2
          : 1,
    );
    if (event.collected) callbacks.sound('collect');
    if (event.banked) callbacks.sound('bank');
    if (event.hit) callbacks.sound('hit');
    if (event.powerUp) callbacks.sound('power');
    if (event.levelChanged) callbacks.sound('level');
    if (event.deflected) callbacks.sound('repel');
    draw(
      world,
      quiet.matches || document.documentElement.dataset.motion === 'paused',
    );
    if (now - ui > 140 || world.over) {
      callbacks.update(snapshot());
      ui = now;
    }
    if (world.over) {
      paused = true;
      callbacks.finish(snapshot());
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  const pause = () => {
    callbacks.silence();
    paused = true;
    keys.clear();
    pointer = null;
    cancelAnimationFrame(frame);
  };
  const requestPause = () => {
    if (!paused && !dead) {
      pause();
      callbacks.pause();
    }
  };
  const visibility = () => {
    if (document.hidden) requestPause();
  };
  const keyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) launch();
    }
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
      e.preventDefault();
      requestPause();
    }
    if (
      [
        'arrowleft',
        'arrowright',
        'arrowup',
        'arrowdown',
        'w',
        'a',
        's',
        'd',
      ].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
      pointer = null;
      keys.add(e.key.toLowerCase());
    }
  };
  const keyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  const move = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer = {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  };
  const down = (e: PointerEvent) => {
    if (paused) return;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(e.pointerId);
    move(e);
  };
  const drag = (e: PointerEvent) => {
    if (canvas.hasPointerCapture(e.pointerId)) move(e);
  };
  const up = () => {
    pointer = null;
  };
  canvas.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', drag);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('blur', requestPause);
  window.addEventListener('blur', requestPause);
  document.addEventListener('visibilitychange', visibility);
  frame = requestAnimationFrame(tick);
  return {
    pause,
    launch,
    resume() {
      if (dead || world.over || !paused) return;
      paused = false;
      last = 0;
      frame = requestAnimationFrame(tick);
    },
    direction(key, pressed) {
      pointer = null;
      if (pressed) keys.add(key);
      else keys.delete(key);
    },
    destroy() {
      dead = true;
      pause();
      canvas.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', drag);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('blur', requestPause);
      window.removeEventListener('blur', requestPause);
      document.removeEventListener('visibilitychange', visibility);
    },
  };
}
