export function loader() {
  const origin = (process.env.SITE_URL || 'https://bulkaway.com').replace(
    /\/$/,
    '',
  );
  const escape = (text: string) =>
    text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('"', '&quot;');
  const entries =
    process.env.PUBLIC_LAUNCH === 'true'
      ? [
          '',
          '/services',
          '/about',
          '/how-it-works',
          '/pickup',
          '/team',
          '/arcade',
          '/privacy',
          '/sms',
        ]
          .map((path) => '<url><loc>' + escape(origin + path) + '</loc></url>')
          .join('')
      : '';
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      entries +
      '</urlset>',
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
