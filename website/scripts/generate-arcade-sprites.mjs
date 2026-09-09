import { mkdir, writeFile } from 'node:fs/promises';
import {
  palette,
  saucerPixels,
  junkPixels,
  truckPixels,
} from '../lib/arcade-sprites.ts';

// Keep menu artwork identical to the in-game pixel maps, with no raster downloads.
const dir = new URL('../public/arcade/', import.meta.url);
await mkdir(dir, { recursive: true });
for (const [name, rows] of [
  ['saucer', saucerPixels],
  ['truck', truckPixels],
  ...junkPixels.map((rows, i) => [`junk-${i}`, rows]),
]) {
  const width = Math.max(...rows.map((row) => row.length));
  const cells = rows
    .flatMap((row, y) =>
      [...row].flatMap((pixel, x) =>
        palette[pixel]
          ? [
              `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[pixel]}"/>`,
            ]
          : [],
      ),
    )
    .join('');
  await writeFile(
    new URL(`${name}.svg`, dir),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${rows.length}" shape-rendering="crispEdges">${cells}</svg>\n`,
  );
}
