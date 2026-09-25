import assert from 'node:assert/strict';
import './verify-navigation.mjs';
const origin = process.env.BASE_URL || 'http://127.0.0.1:8788';
const homeHtml = await (await fetch(origin)).text();
const teamResponse = await fetch(origin + '/team');
assert.equal(teamResponse.status, 200);
const teamHtml = await teamResponse.text();
for (const [page, html] of [
  ['home', homeHtml],
  ['team', teamHtml],
]) {
  assert.match(
    html,
    /aria-label="Open menu"/,
    `${page} provides a mobile menu`,
  );
  assert.match(
    html,
    /aria-label="Main navigation"/,
    `${page} provides main navigation`,
  );
}
for (const destination of [
  '/services',
  '/team',
  '/how-it-works',
  '/about',
  '/pickup',
]) {
  assert.ok(
    teamHtml.includes(`href="${destination}"`),
    `team navigation reaches ${destination}`,
  );
}
assert.doesNotMatch(homeHtml, /Clear the junk\. Unlock the arcade\./);
assert.doesNotMatch(
  homeHtml,
  /<canvas\b/,
  'the homepage defers the game until it is unlocked',
);
const arcadeResponse = await fetch(origin + '/arcade');
assert.equal(arcadeResponse.status, 200);
const arcadeHtml = await arcadeResponse.text();
assert.match(arcadeHtml, /Start a 1-minute shift/);
assert.match(arcadeHtml, /Play untimed cleanup instead/);
for (const label of [
  'Split Beam',
  'Repulsor',
  'Launch cargo',
  'Set your pace.',
  'three optional levels',
]) {
  assert.ok(arcadeHtml.includes(label), `arcade renders ${label} guidance`);
}
for (const path of [
  '/arcade/saucer.svg',
  '/arcade/truck.svg',
  ...Array.from({ length: 6 }, (_, i) => `/arcade/junk-${i}.svg`),
]) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type') || '', /image\/svg\+xml/);
}
console.log('PASS standalone arcade, deferred homepage game and pixel sprites');
const robotsResponse = await fetch(origin + '/robots.txt');
assert.equal(robotsResponse.status, 200);
const robotsText = await robotsResponse.text();
assert.match(
  robotsText,
  /^Allow: \/\s*$/m,
  'public pages can expose their indexing directives',
);
assert.doesNotMatch(
  robotsText,
  /^Disallow: \/\s*$/m,
  'robots must not hide page-level noindex',
);
assert.match(robotsText, /^Disallow: \/api\/\s*$/m);
const sitemapResponse = await fetch(origin + '/sitemap.xml');
assert.equal(sitemapResponse.status, 200);
const sitemapXml = await sitemapResponse.text();
if (/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(homeHtml)) {
  assert.doesNotMatch(sitemapXml, /<loc>/, 'prelaunch sitemap stays empty');
  assert.doesNotMatch(
    robotsText,
    /^Sitemap:/m,
    'prelaunch does not advertise a sitemap',
  );
} else {
  assert.match(sitemapXml, /<loc>/, 'launched sitemap lists public pages');
  assert.match(robotsText, /^Sitemap: https?:\/\//m);
}
console.log('PASS crawlable indexing directives and launch-aware sitemap');
assert.match(
  homeHtml,
  /<html[^>]*data-motion="paused"/,
  'motion is paused before saved preferences hydrate',
);
const heroImage = homeHtml.match(/<img\b[^>]*class="hero-logo"[^>]*>/)?.[0];
assert.ok(heroImage, 'homepage renders its hero artwork in the initial HTML');
assert.match(
  heroImage,
  /loading="eager"/,
  'hero artwork must not wait for lazy-load visibility checks',
);
assert.match(
  heroImage,
  /fetchPriority="high"/i,
  'hero artwork keeps high fetch priority',
);
const servicePanels =
  homeHtml.match(/<div\b[^>]*role="tabpanel"[^>]*>[\s\S]*?<\/div>/g) || [];
assert.equal(
  servicePanels.length,
  5,
  'all five service descriptions are present before any interaction',
);
for (const [index, panel] of servicePanels.entries()) {
  assert.match(panel, new RegExp(`id="service-panel-${index}"`));
  assert.match(panel, new RegExp(`aria-labelledby="service-tab-${index}"`));
  assert.match(panel, /<h3>/, 'each service has a rendered heading');
  assert.match(
    panel,
    /href="#request"/,
    'each service has a real request link',
  );
  assert.equal(
    /\shidden(?:=|\s|>)/.test(panel),
    index !== 0,
    'only the first panel is initially visible',
  );
}
const stylesheet = homeHtml.match(/href="([^" ]+\.css)"/)?.[1];
const framework = homeHtml.match(
  /(?:src|href)="([^" ]+\/entry.client-[^" ]+\.js)"/,
)?.[1];
assert.ok(stylesheet, 'homepage declares its stylesheet');
assert.ok(framework, 'homepage declares its framework script');
for (const path of [stylesheet, framework]) {
  const plain = await fetch(new URL(path, origin), {
    headers: { 'Accept-Encoding': 'identity' },
  });
  const expected = await plain.text();
  for (const encoding of ['gzip', 'br']) {
    const compressed = await fetch(new URL(path, origin), {
      headers: { 'Accept-Encoding': encoding },
    });
    assert.equal(compressed.status, 200);
    assert.equal(
      compressed.headers.get('content-encoding'),
      encoding,
      `${path} supports ${encoding}`,
    );
    assert.match(compressed.headers.get('cache-control') || '', /immutable/);
    assert.match(compressed.headers.get('vary') || '', /accept-encoding/i);
    assert.equal(
      await compressed.text(),
      expected,
      `${encoding} decodes to the exact original asset`,
    );
  }
}
console.log(
  'PASS gzip/Brotli delivery, immutable caching, and decoded asset integrity',
);
for (const path of [
  '/',
  '/privacy',
  '/sms',
  '/api/health',
  '/fonts/Brookvale-webfont.woff2',
  '/fonts/taldosescript-webfont.woff2',
  '/fonts/geograph-regular.woff2',
  '/brand/bulk-away.png',
  '/brand/bulk-away-vector.svg',
  '/brand/bulk-away-share.png',
  '/brand/valet.png',
  '/brand/pet-waste-pals.png',
  '/brand/aepoc.png',
  '/brand/aepoc-vector.svg',
  '/brand/waste-solution-innovators.png',
  '/brand/waste-solution-innovators-dark.png',
  '/illustrations/bulk-away-crew-woman.webp',
  '/illustrations/fresh-start-door.webp',
]) {
  const r = await fetch(origin + path);
  assert.equal(r.status, 200, path);
  console.log('PASS', path);
}
const missingPage = await fetch(origin + '/verification-missing-page');
assert.equal(missingPage.status, 404, 'missing pages return a real HTTP 404');
const missingHtml = await missingPage.text();
assert.match(
  missingHtml,
  /<title>Page not found \| Bulk Away<\/title>/,
  'missing pages identify their recovery purpose in the browser title',
);
assert.match(
  missingHtml,
  /Back to Bulk Away/,
  'missing pages provide home recovery',
);
assert.match(
  missingHtml,
  /href="\/#pickup-request"/,
  'missing pages provide pickup recovery',
);
console.log('PASS branded 404 status and recovery links');
for (const method of ['GET', 'PUT', 'PATCH', 'DELETE']) {
  const rejected = await fetch(origin + '/api/pickup', { method, headers: { Origin: origin } });
  assert.equal(rejected.status, 405, `${method} cannot submit a pickup`);
  assert.equal(rejected.headers.get('allow'), 'POST');
}
const post = (body, extra = {}) =>
  fetch(origin + '/api/pickup', {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
      ...extra,
    },
    body: JSON.stringify(body),
  });
assert.equal(
  (await post({}, { Origin: 'https://unrelated.example' })).status,
  403,
);
const invalid = await post({});
assert.equal(invalid.status, 400);
assert.ok((await invalid.json()).errors.name);
assert.equal((await post({ details: 'x'.repeat(21000) })).status, 413);
console.log('PASS cross-origin, validation, and payload-limit responses');

const emptyMultipart = new FormData();
emptyMultipart.append('request', '{}');
const multipartResponse = await fetch(origin + '/api/pickup', {
  method: 'POST',
  headers: { Origin: origin, 'Idempotency-Key': crypto.randomUUID() },
  body: emptyMultipart,
});
assert.equal(multipartResponse.status, 400);
const multipartErrors = (await multipartResponse.json()).errors;
assert.ok(multipartErrors.name);
assert.equal(multipartErrors.photos, undefined);
const badPhoto = new FormData();
badPhoto.append(
  'request',
  JSON.stringify({
    name: 'Upload Test',
    phone: '2025550100',
    email: 'test@example.com',
    service: 'Trash outs',
    address: '123 Example Street, Test City, UT 84101',
    date: '',
    details: 'Invalid image rejection test. Do not send.',
    consent: true,
    smsConsent: false,
  }),
);
badPhoto.append(
  'photos',
  new File(['This is not a JPEG'], 'invalid.jpg', { type: 'image/jpeg' }),
);
const rejectedPhoto = await fetch(origin + '/api/pickup', {
  method: 'POST',
  headers: { Origin: origin, 'Idempotency-Key': crypto.randomUUID() },
  body: badPhoto,
});
assert.equal(rejectedPhoto.status, 400);
assert.ok((await rejectedPhoto.json()).errors.photos);
console.log(
  'PASS multipart requests and invalid-image rejection before email delivery',
);

// Only the isolated credential-free production runner enables this valid payload.
if (process.env.VERIFY_UNCONFIGURED_COVERAGE === 'true') {
  const unverified = await post({
    name: 'Coverage Test', phone: '8015550100', email: 'test@example.com',
    service: 'Trash outs', address: '123 Example Street, Test City, UT 84101',
    details: 'Synthetic coverage check. No email.', consent: true, smsConsent: false,
  });
  assert.equal(unverified.status, 503);
  assert.ok((await unverified.json()).errors.address);
  console.log('PASS missing server key blocks an unverified request before email');
}
