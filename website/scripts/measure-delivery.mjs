import http from 'node:http';
import { gunzipSync } from 'node:zlib';

// Measure actual loopback HTTP payloads, not field Core Web Vitals.
const origin = 'http://127.0.0.1:8788';
function read(path) {
  return new Promise((resolve, reject) => {
    http
      .get(
        new URL(path, origin),
        { headers: { 'Accept-Encoding': 'gzip' } },
        (response) => {
          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => {
            const wire = Buffer.concat(chunks);
            const body =
              response.headers['content-encoding'] === 'gzip'
                ? gunzipSync(wire)
                : wire;
            resolve({
              status: response.statusCode,
              wireBytes: wire.length,
              decodedBytes: body.length,
              encoding: response.headers['content-encoding'] || 'identity',
              cache: response.headers['cache-control'] || '',
              body: body.toString(),
            });
          });
          response.on('error', reject);
        },
      )
      .on('error', reject);
  });
}
const report = {
  scope:
    'Local production HTTP response payloads; not browser timing or field metrics',
  routes: {},
  css: {},
};
for (const route of ['/', '/privacy', '/sms', '/delivery-review-missing']) {
  const { body, ...delivery } = await read(route);
  const styles = [...body.matchAll(/href="([^" ]+\.css)"/g)].map((m) => m[1]);
  report.routes[route] = { ...delivery, styles: [...new Set(styles)] };
  const scripts = [
    ...new Set(
      [
        ...body.matchAll(
          /(?:src|href)="([^" ]+\/_next\/static\/chunks\/[^" ]+\.js|\/_next\/static\/chunks\/[^" ]+\.js)"/g,
        ),
      ].map((m) => m[1]),
    ),
  ];
  let javascriptWireBytes = 0;
  let javascriptDecodedBytes = 0;
  for (const path of scripts) {
    const asset = await read(path);
    javascriptWireBytes += asset.wireBytes;
    javascriptDecodedBytes += asset.decodedBytes;
  }
  report.routes[route].declaredJavascript = {
    scripts,
    wireBytes: javascriptWireBytes,
    decodedBytes: javascriptDecodedBytes,
  };
  for (const path of styles) {
    if (report.css[path]) continue;
    const { body: css, ...asset } = await read(path);
    report.css[path] = asset;
  }
}
console.log(JSON.stringify(report, null, 2));
