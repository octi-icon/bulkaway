import { W, H, CAPACITY, type World } from './arcade-engine';
import {
  palette,
  saucerPixels,
  junkPixels,
  carPixels,
  truckPixels,
} from './arcade-sprites';

type Pen = CanvasRenderingContext2D;
const CELL = 2.5;
const snap = (value: number) => Math.round(value / CELL) * CELL;
function rect(
  c: Pen,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  c.fillStyle = color;
  c.fillRect(
    snap(x),
    snap(y),
    Math.max(CELL, snap(width)),
    Math.max(CELL, snap(height)),
  );
}
function oval(
  c: Pen,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  for (let dy = -ry; dy < ry; dy += CELL) {
    const half = rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2));
    if (half > 0) rect(c, x - half, y + dy, half * 2, CELL, color);
  }
}
function sparkle(c: Pen, x: number, y: number, color: string, size = 7.5) {
  rect(c, x, y - size, CELL, size * 2 + CELL, color);
  rect(c, x - size / 2, y, size + CELL, CELL, color);
}
// A tiny bitmap alphabet keeps in-game labels as crisp as the sprites.
const glyphs: Record<string, string> = {
  A: '010101111101101',
  B: '110101110101110',
  D: '110101101101110',
  E: '111100110100111',
  H: '101101111101101',
  K: '101101110101101',
  L: '100100100100111',
  N: '101111111111101',
  O: '010101101101010',
  R: '110101110101101',
  U: '101101101101111',
  W: '101101111111101',
  Y: '101101010010010',
  '!': '010010010000010',
  ' ': '000000000000000',
};
function label(c: Pen, value: string, x: number, y: number, color: string) {
  const left = x - ((value.length * 4 - 1) * CELL) / 2;
  value.split('').forEach((letter, i) => {
    const glyph = glyphs[letter] || glyphs[' '];
    glyph.split('').forEach((bit, k) => {
      if (bit === '1')
        rect(
          c,
          left + (i * 4 + (k % 3)) * CELL,
          y + Math.floor(k / 3) * CELL,
          CELL,
          CELL,
          color,
        );
    });
  });
}
function sprite(rows: string[], replacements: Record<string, string> = {}) {
  const image = document.createElement('canvas');
  image.width = Math.max(...rows.map((row) => row.length));
  image.height = rows.length;
  const pen = image.getContext('2d');
  if (pen)
    rows.forEach((row, y) =>
      row.split('').forEach((pixel, x) => {
        const color = replacements[pixel] || palette[pixel];
        if (color) {
          pen.fillStyle = color;
          pen.fillRect(x, y, 1, 1);
        }
      }),
    );
  return image;
}
function stamp(
  c: Pen,
  image: HTMLCanvasElement,
  x: number,
  y: number,
  flip = false,
) {
  c.save();
  c.translate(snap(x), snap(y));
  c.scale(flip ? -1 : 1, 1);
  c.drawImage(
    image,
    -Math.floor(image.width / 2) * CELL,
    -Math.floor(image.height / 2) * CELL,
    image.width * CELL,
    image.height * CELL,
  );
  c.restore();
}
function loadingBay(c: Pen, truck: HTMLCanvasElement) {
  // An open, raised loading platform: the approach stays visible around the truck.
  // This is scenery only; the existing unloading bounds are unchanged.
  for (let y = 505; y < 580; y += CELL) {
    const half = 87.5 + (y - 505) * 0.45;
    rect(c, 400 - half, y, half * 2, CELL, palette.D);
    rect(c, 400 - half, y, CELL, CELL, palette.S);
    rect(c, 400 + half, y, CELL, CELL, palette.K);
  }
  // Front fascia and recessed feet give the pad thickness rather than a box outline.
  rect(c, 280, 580, 242.5, 10, palette.K);
  rect(c, 282.5, 580, 237.5, CELL, palette.S);
  rect(c, 292.5, 590, 25, 5, palette.K);
  rect(c, 485, 590, 25, 5, palette.K);
  for (let x = 290; x < 515; x += 20) {
    rect(c, x, 582.5, 10, 2.5, palette.Y);
    rect(c, x - 2.5, 585, 10, 2.5, palette.O);
  }
  // Painted parking lines follow the platform's perspective.
  for (let y = 520; y < 575; y += CELL) {
    const half = 75 + (y - 520) * 0.33;
    rect(c, 400 - half, y, CELL, CELL, palette.G);
    rect(c, 400 + half, y, CELL, CELL, palette.G);
  }
  rect(c, 310, 572.5, 180, CELL, palette.G);
  // Googie-style freestanding sign, clear of the fin and cargo pile.
  for (const x of [320, 477.5]) {
    rect(c, x + CELL, 490, CELL, 40, palette.K);
    rect(c, x, 487.5, CELL, 37.5, palette.S);
  }
  rect(c, 325, 472.5, 155, 25, palette.K);
  rect(c, 320, 465, 160, 27.5, palette.O);
  rect(c, 320, 465, 160, CELL, palette.C);
  rect(c, 320, 467.5, 157.5, 20, palette.Y);
  label(c, 'UNLOAD HERE', 400, 472.5, palette.K);
  // Down arrows and fixed landing lamps mark the clear approach at either side.
  for (const x of [302.5, 497.5]) {
    rect(c, x, 497.5, 5, 10, palette.L);
    rect(c, x - 5, 505, 15, CELL, palette.L);
    rect(c, x - 2.5, 507.5, 10, CELL, palette.L);
    rect(c, x, 510, 5, CELL, palette.L);
    rect(c, x - 7.5, 565, 17.5, 7.5, palette.K);
    rect(c, x - 5, 562.5, 12.5, 5, palette.Y);
    rect(c, x - 5, 562.5, 12.5, CELL, palette.C);
  }
  oval(c, 403, 575, 83, 5, palette.K);
  stamp(c, truck, 398, 540);
}
function backdrop(c: Pen, truck: HTMLCanvasElement) {
  rect(c, 0, 0, W, H, palette.K);
  // Flat color bands and checker dithering replace all smooth gradients.
  for (let y = 300; y < H; y += CELL)
    for (let x = 0; x < W; x += CELL) {
      if (y > 440 || (x / CELL + y / CELL) % 4 === 0)
        rect(c, x, y, CELL, CELL, '#272232');
    }
  for (let i = 0; i < 46; i++)
    rect(
      c,
      (i * 137 + 33) % W,
      (i * 71 + 15) % 470,
      CELL,
      CELL,
      i % 3 ? palette.S : palette.C,
    );
  sparkle(c, 65, 60, palette.Y);
  sparkle(c, 732, 122, palette.C, 5);
  oval(c, 680, 67, 32, 32, palette.O);
  oval(c, 687, 62, 23, 27, palette.Y);
  for (let i = -48; i < 49; i += CELL)
    rect(c, 680 + i, 67 - i / 3, CELL * 2, CELL, palette.S);
  const ridge = [
    [0, 175],
    [85, 90],
    [135, 145],
    [217, 70],
    [302, 151],
    [368, 102],
    [465, 180],
    [568, 98],
    [681, 164],
    [758, 107],
    [800, 155],
  ];
  for (let i = 0; i < ridge.length - 1; i++) {
    const [x1, y1] = ridge[i],
      [x2, y2] = ridge[i + 1];
    for (let x = x1; x < x2; x += CELL) {
      const y = y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
      rect(c, x, y, CELL, 202 - y, i % 2 ? palette.D : '#302a3b');
      if (y < 110) rect(c, x, y, CELL, 5, palette.S);
    }
  }
  for (const y of [245, 415]) {
    rect(c, 0, y - 25, W, 50, '#211c2a');
    rect(c, 0, y - 25, W, CELL, palette.D);
    for (let x = 0; x < W; x += 45) rect(c, x, y, 20, CELL, palette.D);
  }
  for (let i = 0; i < 10; i++) {
    const x = i * 88 - 14,
      top = H - 30 - ((i * 17) % 48);
    rect(c, x, top, 68, H - top, palette.D);
    rect(c, x + 52, top, 16, H - top, palette.K);
    for (let k = 0; k < 76; k += CELL)
      rect(c, x - 4 + k, top + 5 - k / 8, CELL, CELL, palette.S);
    for (let k = 0; k < 3; k++)
      rect(c, x + 10 + k * 15, top + 15, 5, 7.5, palette.O);
  }
  loadingBay(c, truck);
}

export function createArcadePainter(c: Pen, scale: number) {
  const player = sprite(saucerPixels),
    fullPlayer = sprite(saucerPixels, { L: palette.Y, G: palette.O });
  const rival = sprite(saucerPixels, {
    L: palette.R,
    G: palette.O,
    B: palette.D,
  });
  const junk = junkPixels.map((rows) => sprite(rows)),
    car = sprite(carPixels),
    truck = sprite(truckPixels);
  const background = document.createElement('canvas');
  background.width = W * scale;
  background.height = H * scale;
  const b = background.getContext('2d');
  if (b) {
    b.scale(scale, scale);
    b.imageSmoothingEnabled = false;
    backdrop(b, truck);
  }
  c.imageSmoothingEnabled = false;
  return (w: World, quiet: boolean) => {
    if (b) c.drawImage(background, 0, 0, W, H);
    else backdrop(c, truck);
    const full = w.cargo === CAPACITY;
    if (!full) {
      for (let dy = 17.5; dy < 115; dy += CELL) {
        const half = 10 + dy * 0.29;
        for (let dx = -half; dx < half; dx += CELL) {
          if ((Math.round(dx / CELL) + dy / CELL) % (dy < 45 ? 2 : 4) === 0)
            rect(c, w.x + dx, w.y + dy, CELL, CELL, palette.B);
        }
        rect(c, w.x - half, w.y + dy, CELL, CELL, palette.G);
        rect(c, w.x + half, w.y + dy, CELL, CELL, palette.G);
      }
      if (!quiet)
        for (let i = 0; i < 3; i++) {
          const d = ((75 - w.time) * 45 + i * 34) % 100;
          sparkle(c, w.x + (i - 1) * 10, w.y + 112 - d, palette.L, 2.5);
        }
    }
    for (const j of w.junk) {
      oval(c, j.x + 5, j.y + 22, 23, 5, palette.K);
      stamp(c, junk[j.kind], j.x, j.y - (quiet ? 0 : j.charge * 10));
      if (j.charge > 0) {
        rect(c, j.x - 25, j.y + 28, 50, 5, palette.D);
        rect(c, j.x - 25, j.y + 28, 50 * j.charge, 5, palette.L);
      }
    }
    for (const t of w.traffic) {
      oval(c, t.x + 5, t.y + 22, 28, 5, palette.K);
      stamp(
        c,
        t.kind ? rival : car,
        t.x,
        t.y - (t.kind ? 7.5 : 0),
        !t.kind && t.vx < 0,
      );
      label(c, '!', t.x, t.y - 42.5, palette.R);
    }
    if (w.shield > 0) {
      for (let i = 0; i < 30; i++) {
        const a = (i * Math.PI * 2) / 30;
        rect(
          c,
          w.x + Math.cos(a) * 44,
          w.y - 5 + Math.sin(a) * 32.5,
          CELL,
          CELL,
          palette.A,
        );
      }
    }
    stamp(c, full ? fullPlayer : player, w.x, w.y - 7.5);
    for (let i = 0; i < CAPACITY; i++)
      rect(
        c,
        w.x - 22.5 + i * 10,
        w.y - 40,
        7.5,
        5,
        i < w.cargo ? palette.Y : palette.S,
      );
  };
}
