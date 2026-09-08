import { readFile, writeFile } from 'node:fs/promises';
import { createElement as h } from 'react';
import { ImageResponse } from '@vercel/og';

// A static layout using the supplied logo and fonts; no runtime rendering cost.
const logo = await readFile(
  new URL('../public/brand/bulk-away.png', import.meta.url),
);
const brookvale = await readFile(
  new URL('../../Fonts/Brookvale-webfont.woff', import.meta.url),
);
const script = await readFile(
  new URL('../../Fonts/taldosescript-webfont.woff', import.meta.url),
);
const image = new ImageResponse(
  h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#1d1724',
        color: '#f5efd9',
        fontFamily: 'Brookvale',
        padding: '50px 56px 0',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 52,
          flexGrow: 1,
          paddingBottom: 35,
        },
      },
      h('img', {
        src: `data:image/png;base64,${logo.toString('base64')}`,
        width: 470,
        height: 360,
      }),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', width: 565 } },
        h(
          'div',
          { style: { fontSize: 75, lineHeight: 1.05 } },
          'Utah junk removal. Trash outs.',
        ),
        h(
          'div',
          {
            style: {
              fontFamily: 'Taldose',
              fontSize: 67,
              color: '#efc24b',
              marginTop: 28,
            },
          },
          'Hello, space.',
        ),
        h(
          'div',
          { style: { fontSize: 29, lineHeight: 1.25, marginTop: 20 } },
          'Women-majority owned. Family operated.',
        ),
      ),
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#1d1724',
          background: '#b2d34c',
          padding: '18px 24px',
          marginLeft: -56,
          marginRight: -56,
          fontSize: 31,
        },
      },
      h('span', null, 'Salt Lake · Utah · Weber · Davis counties'),
      h('span', null, 'bulkaway.com'),
    ),
  ),
  {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Brookvale', data: brookvale, style: 'normal' },
      { name: 'Taldose', data: script, style: 'normal' },
    ],
  },
);
await writeFile(
  new URL('../public/brand/bulk-away-share.png', import.meta.url),
  Buffer.from(await image.arrayBuffer()),
);
console.log('Created public/brand/bulk-away-share.png (1200 × 630).');
