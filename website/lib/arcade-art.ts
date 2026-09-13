import {
  W,
  H,
  ROAD_LANES,
  capacity,
  powers,
  junkTypes,
  type World,
  type Chassis,
} from './arcade-engine';
import {
  palette,
  saucerPixels,
  chassisPixels,
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
  '0': '111101101101111',
  '1': '010110010010111',
  '2': '110001010100111',
  '3': '110001010001110',
  '4': '101101111001001',
  '5': '111100110001110',
  '6': '011100111101111',
  '7': '111001010010010',
  '8': '111101111101111',
  '9': '111101111001110',
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
  // Keep the original pixel geometry aligned with the world's lower edge.
  c.save();
  c.translate(0, H - 600);
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
  c.restore();
}
function backdrop(c: Pen, truck: HTMLCanvasElement, district = 0) {
  rect(c, 0, 0, W, H, ['#17131f', '#142026', '#20172b'][district]);
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
  for (const y of ROAD_LANES) {
    rect(c, 0, y - 25, W, 50, '#211c2a');
    rect(c, 0, y - 25, W, CELL, palette.D);
    for (let x = 0; x < W; x += 45) rect(c, x, y, 20, CELL, palette.D);
  }
  if (district > 0) {
    // Raised storage bays: lit top, shaded side and a cast ground shadow.
    for (const x of [15, 720]) {
      const y = district === 1 ? 320 : 470;
      rect(c, x + 10, y + 20, 60, 55, palette.K);
      rect(c, x, y, 55, 55, district === 1 ? '#354b49' : '#443447');
      rect(c, x, y, 55, 7.5, palette.S);
      rect(c, x + 45, y + 7.5, 10, 47.5, palette.D);
      for (let row = 0; row < 3; row++)
        rect(c, x + 7.5, y + 17.5 + row * 10, 30, CELL, palette.K);
    }
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
  const players = Object.fromEntries(
    (Object.keys(chassisPixels) as Chassis[]).map((id) => [
      id,
      {
        normal: sprite(chassisPixels[id]),
        full: sprite(chassisPixels[id], {
          L: palette.Y,
          G: palette.O,
          A: palette.Y,
        }),
      },
    ]),
  ) as Record<Chassis, { normal: HTMLCanvasElement; full: HTMLCanvasElement }>;
  const rival = sprite(saucerPixels, {
    L: palette.R,
    G: palette.O,
    B: palette.D,
  });
  const junk = junkPixels.map((rows) => sprite(rows)),
    car = sprite(carPixels),
    truck = sprite(truckPixels);
  const debris = sprite([
    '.....OOO......',
    '...OYYYOO.....',
    '..OYYCOOOO....',
    '.OYYCOOSSOO...',
    'OYYCOOSSSSOO..',
    'OYYOOSDDSSSO..',
    '.OOOSDDDDSSO..',
    '..OOSDDSSSO...',
    '...OOSSSOO....',
    '....OOOO......',
  ]);
  const drone = sprite([
    '..TTTTT...........TTTTT..',
    '.TAAAAAT.........TAAAAAT.',
    '..TTKTT....CCC....TTKTT..',
    '....K....CCAAACC....K....',
    '....KKKKCAATTTAACKKKK....',
    '........CATCKTAC........',
    '........CTTKKTTC........',
    '....KKKKCTTRRTTCKKKK....',
    '....K....CTTTTC....K....',
    '..TTKTT...CCCCC...TTKTT..',
    '.TAAAAAT.........TAAAAAT.',
    '..TTTTT...........TTTTT..',
  ]);
  const hauler = sprite([
    '....CCCCCCCCCCCCCCCCCCCCCCC................',
    '...CRRRRRRRRRRRRRRRRRRRRRRRC...RRRRRRR....',
    '..CRROOOOOOOOOOOOOOOOOOOOOORC.RRCCCCCRR...',
    '..CROORRROORRROORRROORRROOORC.RCAAAATCRR..',
    '..CROORRROORRROORRROORRROOORC.RCAAAATTTCR.',
    '..CROORRROORRROORRROORRROOORC.RCAAAATTTCR.',
    '..CROOOOOOOOOOOOOOOOOOOOOOOORC.RCCCCCCCCR.',
    '..COOOOOOOOOOOOOOOOOOOOOOOOOOC.RRRRRRRRRR.',
    '..COOOOOOOOOOOOOOOOOOOOOOOOOOC.RRRRCKRRRR.',
    '..CCCCCCCCCCCCCCCCCCCCCCCCCCC.RRRRRRRRRC.',
    '..OOOOOOOOOOOOOOOOOOOOOOOOOOOKOOOOOOOOOC.',
    '...KKSSSKKKKKKSSSKKKKKKKKKKKKKKKSSSKKKK..',
    '....KSCSK.....KSCSK..............KSCSK.....',
    '.....KKK.......KKK...............KKK......',
  ]);
  const backgrounds = [0, 1, 2].map((district) => {
    const background = document.createElement('canvas');
    background.width = W * scale;
    background.height = H * scale;
    const b = background.getContext('2d');
    if (b) {
      b.scale(scale, scale);
      b.imageSmoothingEnabled = false;
      backdrop(b, truck, district);
    }
    return background;
  });
  c.imageSmoothingEnabled = false;
  return (w: World, quiet: boolean) => {
    c.drawImage(backgrounds[(w.level - 1) % 3], 0, 0, W, H);
    const full = w.cargo === capacity(w);
    oval(c, w.x + 12, w.y + 38, 30, 7.5, palette.K);
    if (!full) {
      const beams =
        w.effects.split > 0 && w.upgrades.includes('beam')
          ? [-38, 0, 38]
          : w.effects.split > 0 || w.upgrades.includes('beam')
            ? [-30, 30]
            : [0];
      for (const offset of beams) {
        for (let dy = 17.5; dy < 115; dy += CELL) {
          const half = 10 + dy * 0.29;
          const center = w.x + (offset * dy) / 115;
          for (let dx = -half; dx < half; dx += CELL) {
            if ((Math.round(dx / CELL) + dy / CELL) % (dy < 45 ? 2 : 4) === 0)
              rect(c, center + dx, w.y + dy, CELL, CELL, palette.B);
          }
          rect(
            c,
            center - half,
            w.y + dy,
            CELL,
            CELL,
            w.effects.split > 0 ? palette.Y : palette.G,
          );
          rect(
            c,
            center + half,
            w.y + dy,
            CELL,
            CELL,
            w.effects.split > 0 ? palette.Y : palette.G,
          );
        }
      }
      if (!quiet)
        for (let i = 0; i < 3; i++) {
          const d = (w.elapsed * 45 + i * 34) % 100;
          sparkle(c, w.x + (i - 1) * 10, w.y + 112 - d, palette.L, 2.5);
        }
    }
    for (const j of w.junk) {
      oval(c, j.x + 5, j.y + 22, 23, 5, palette.K);
      const lift = quiet ? 0 : j.charge;
      stamp(
        c,
        junk[j.kind],
        j.x + (w.x - j.x) * lift * 0.45,
        j.y - lift * Math.max(15, (j.y - w.y) * 0.65),
      );
      if (j.charge > 0) {
        label(c, String(junkTypes[j.kind].points), j.x, j.y + 39, palette.Y);
        rect(c, j.x - 25, j.y + 28, 50, 5, palette.D);
        rect(c, j.x - 25, j.y + 28, 50 * j.charge, 5, palette.L);
      }
    }
    for (const t of w.traffic) {
      if (t.warning && t.warning > 0) {
        for (let y = 85; y < H - 60; y += 20) {
          rect(c, t.x - 23, y, CELL, 10, palette.R);
          rect(c, t.x + 23, y, CELL, 10, palette.R);
        }
        label(c, '!', t.x, 62.5, palette.R);
        continue;
      }
      oval(c, t.x + 5, t.y + 22, t.kind === 4 ? 48 : 28, 5, palette.K);
      stamp(
        c,
        t.kind === 4
          ? hauler
          : t.kind === 3
            ? drone
            : t.kind === 2
              ? debris
              : t.kind
                ? rival
                : car,
        t.x,
        t.y - (t.kind === 1 || t.kind === 3 ? 7.5 : 0),
        (t.kind === 0 || t.kind === 4) && t.vx < 0,
      );
      label(c, '!', t.x, t.y - 42.5, palette.R);
    }
    for (const p of w.powerups) {
      const color =
        p.kind === 'split'
          ? palette.Y
          : p.kind === 'repulsor'
            ? palette.A
            : palette.L;
      const bob = quiet ? 0 : Math.round(Math.sin(w.elapsed * 2) * 2) * CELL;
      oval(c, p.x + 3, p.y + 23, 17, 4, palette.K);
      rect(c, p.x - 18, p.y - 19 + bob, 36, 38, palette.K);
      rect(c, p.x - 15, p.y - 19 + bob, 30, 3, color);
      rect(c, p.x - 18, p.y - 16 + bob, 3, 30, color);
      rect(c, p.x + 15, p.y - 16 + bob, 3, 30, color);
      rect(c, p.x - 15, p.y + 14 + bob, 30, 3, color);
      label(c, powers[p.kind].glyph, p.x, p.y - 9 + bob, color);
      // Expiry is a steady shrinking bar, never a flash.
      rect(c, p.x - 15, p.y + 22, 30 * (p.ttl / 14), CELL, color);
    }
    if (w.shield > 0 || w.effects.repulsor > 0) {
      for (let i = 0; i < 30; i++) {
        const a = (i * Math.PI * 2) / 30;
        rect(
          c,
          w.x + Math.cos(a) * (w.effects.repulsor > 0 ? 54 : 44),
          w.y - 5 + Math.sin(a) * (w.effects.repulsor > 0 ? 42.5 : 32.5),
          CELL,
          CELL,
          palette.A,
        );
      }
    }
    if (w.dash > 0 && !quiet) {
      for (let i = 0; i < 5; i++)
        rect(c, w.x - 25 + i * 12.5, w.y + 15, 5, 15 + (i % 2) * 10, palette.A);
    }
    if (w.deliveryFlash > 0 && !quiet) {
      for (let i = 0; i < 8; i++) {
        const t = 1 - w.deliveryFlash / 0.7;
        rect(
          c,
          400 + (i - 3.5) * t * 15,
          H - 90 - Math.sin(t * Math.PI) * (20 + i * 3),
          5,
          5,
          i % 2 ? palette.Y : palette.L,
        );
      }
    }
    stamp(
      c,
      full ? players[w.chassis].full : players[w.chassis].normal,
      w.x,
      w.y - 7.5,
    );
    const slotStep = Math.min(10, 60 / capacity(w));
    for (let i = 0; i < capacity(w); i++)
      rect(
        c,
        w.x - ((capacity(w) - 1) * slotStep) / 2 + i * slotStep,
        w.y - 40,
        slotStep - 2.5,
        5,
        i < w.cargo ? palette.Y : palette.S,
      );
  };
}
