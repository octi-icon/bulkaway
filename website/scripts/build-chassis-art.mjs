import { writeFile } from 'node:fs/promises';
import { chassisPixels, palette } from '../lib/arcade-sprites.ts';

// Export the same original pixel silhouettes used by the canvas renderer.
for (const [id, rows] of Object.entries(chassisPixels)) {
  const width = Math.max(...rows.map((row) => row.length));
  const pixels = rows
    .flatMap((row, y) =>
      [...row].flatMap((key, x) =>
        palette[key]
          ? [
              `<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[key]}"/>`,
            ]
          : [],
      ),
    )
    .join('');
  await writeFile(
    new URL(`../public/arcade/chassis-${id}.svg`, import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${rows.length}" shape-rendering="crispEdges">${pixels}</svg>\n`,
  );
}
