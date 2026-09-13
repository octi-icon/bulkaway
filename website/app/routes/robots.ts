export function loader() {
  const origin = (process.env.SITE_URL || 'https://bulkaway.com').replace(
    /\/$/,
    '',
  );
  return new Response(
    'User-agent: *\nAllow: /\nDisallow: /api/\n' +
      (process.env.PUBLIC_LAUNCH === 'true'
        ? 'Sitemap: ' + origin + '/sitemap.xml\n'
        : ''),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
