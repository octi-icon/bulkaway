import assert from 'node:assert/strict';

const origin = process.env.BASE_URL || 'http://127.0.0.1:8788';
const routes = [
  '/',
  '/services',
  '/about',
  '/how-it-works',
  '/pickup',
  '/team',
  '/privacy',
  '/sms',
  '/arcade',
  '/request',
  '/navigation-check-not-found',
];
const pages = new Map();
for (const route of routes) {
  const response = await fetch(origin + route);
  assert.equal(
    response.status,
    route === '/navigation-check-not-found' ? 404 : 200,
    route,
  );
  const html = await response.text();
  pages.set(route, html);
  const navigation =
    html.match(
      /<nav\b[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/g,
    ) || [];
  assert.equal(navigation.length, 1, `${route}: one complete main menu`);
  assert.match(html, /aria-label="Open menu"/, `${route}: mobile menu toggle`);
  assert.equal((html.match(/class="skip-link"/g) || []).length, 1, `${route}: one skip link`);
  assert.equal(
    (html.match(/<main\b/g) || []).length,
    1,
    `${route}: one main landmark`,
  );
  for (const destination of [
    '/services',
    '/team',
    '/how-it-works',
    '/about',
    '/pickup',
  ]) {
    assert.ok(
      navigation[0].includes(`href="${destination}"`),
      `${route}: menu reaches ${destination}`,
    );
  }
}

// Check rendered links, rather than serialized framework payloads, across every page.
for (const [route, html] of pages) {
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), origin + route);
    if (url.origin !== origin) continue;
    if (/\.[a-z0-9]+$/i.test(url.pathname)) continue;
    assert.ok(pages.has(url.pathname), `${route}: ${url.pathname} is an available page`);
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(
        pages.get(url.pathname).includes(`id="${id}"`),
        `${route}: ${url.pathname}${url.hash} has a destination`,
      );
    }
  }
}
console.log(
  'PASS shared desktop/mobile navigation and internal section links on all public pages, the request fallback, and the 404',
);
