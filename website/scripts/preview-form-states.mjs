// Local visual QA only. Never forwards writes or sends email.
// Start the real preview on 8788, then run this and visit :8790/?qa=success#request
// Use ?qa=error for a controlled delivery problem. Do not deploy this harness.
import http from 'node:http';
import { Readable } from 'node:stream';

const port = Number(process.env.QA_PORT || 8790);
const upstream = `http://127.0.0.1:${Number(process.env.QA_UPSTREAM_PORT || 8788)}`;
if (new URL(upstream).port === String(port))
  throw new Error('QA and upstream ports must differ.');
const origin = `http://127.0.0.1:${port}`;
// Optional Google-shaped fixture for local address UX checks, never a live provider.
const addressFixture = process.env.QA_ADDRESS === 'true';
const fixtureScript = `
window.google = { maps: { importLibrary: async () => ({
  AutocompleteSessionToken: class {},
  AutocompleteSuggestion: { fetchAutocompleteSuggestions: async ({input}) => {
    await new Promise(resolve => setTimeout(resolve, input.includes('slow') ? 1800 : 60));
    if (input.includes('offline')) throw new Error('Simulated outage');
    if (input.includes('nomatch')) return {suggestions: []};
    return { suggestions: [1, 2, 3, 4, 5].map(index => ({ placePrediction: {
      placeId: 'fixture-' + index,
      text: {toString: () => index + ' QA Test Street, Salt Lake City, UT, USA'},
      toPlace: () => ({formattedAddress: index + ' QA Test Street, Salt Lake City, UT 84101, USA',
        fetchFields: async () => { await new Promise(resolve => setTimeout(resolve, 2000)); }})
    }})) };
  }}
}) }};
`;
const server = http.createServer(async (request, response) => {
  const path = new URL(request.url, origin);
  if (addressFixture && path.pathname === '/qa-google.js') {
    response.writeHead(200, {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-store',
    });
    response.end(fixtureScript);
    return;
  }
  if (request.method === 'POST' && path.pathname === '/api/pickup') {
    request.resume();
    const scenario = new URL(
      request.headers.referer || origin,
    ).searchParams.get('qa');
    response.writeHead(scenario === 'success' ? 200 : 503, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    response.end(
      JSON.stringify(
        scenario === 'success'
          ? { reference: 'BA-00000001' }
          : {
              error:
                'We couldn’t confirm email delivery. Please contact the crew directly so we don’t duplicate your request.',
            },
      ),
    );
    return;
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405);
    response.end();
    return;
  }
  try {
    const result = await fetch(upstream + path.pathname + path.search, {
      method: request.method,
    });
    const headers = Object.fromEntries(result.headers);
    // Fetch decodes compressed bodies; these wire headers no longer describe them.
    for (const key of [
      'content-encoding',
      'content-length',
      'transfer-encoding',
      'connection',
    ])
      delete headers[key];
    response.writeHead(result.status, headers);
    if (addressFixture && headers['content-type']?.includes('text/html')) {
      const html = await result.text();
      response.end(
        html.replace('<head>', '<head><script src="/qa-google.js"></script>'),
      );
      return;
    }
    if (result.body) Readable.fromWeb(result.body).pipe(response);
    else response.end();
  } catch {
    response.writeHead(502);
    response.end('Start the local preview on port 8788 first.');
  }
});
server.listen(port, '127.0.0.1', () =>
  console.log(
    `Visual test only: ${origin}/?qa=success#request — all submissions simulated; no email.`,
  ),
);
