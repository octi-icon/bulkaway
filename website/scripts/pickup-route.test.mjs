import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// Run the real route with only SMTP and Google replaced. No live email or API calls.
let emails = 0;
globalThis.__coverageTestSend = async () => {
  emails++;
  return { confirmation: 'sent' };
};
const root = new URL('../', import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/'))
      return { url: new URL(`${specifier.slice(2)}.ts`, root).href, shortCircuit: true };
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === new URL('lib/mail.ts', root).href)
      return { format: 'module', source: 'export const sendPickup = (...args) => globalThis.__coverageTestSend(...args);', shortCircuit: true };
    return nextLoad(url, context);
  },
});
const { POST } = await import('../app/api/pickup/route.ts');
const originalFetch = globalThis.fetch;
const originalKey = process.env.GOOGLE_MAPS_SERVER_KEY;
const originalOrigin = process.env.SITE_URL;
process.env.SITE_URL = 'https://bulkaway.example';
const input = {
  name: 'Coverage Test', email: 'test@example.com', phone: '8015550100',
  service: 'Trash outs', address: '123 Example Street, Test City, UT 84101',
  details: 'Synthetic test. No real email.', consent: true, smsConsent: false,
};
const request = (key, address = input.address) => new Request('https://bulkaway.example/api/pickup', {
  method: 'POST', headers: {
    origin: 'https://bulkaway.example', 'content-type': 'application/json',
    'idempotency-key': key, 'x-forwarded-for': crypto.randomUUID(),
  }, body: JSON.stringify({ ...input, address }),
});
const geocode = county => Response.json({ status: 'OK', results: [{
  types: ['street_address'], address_components: [
    { long_name: '123', short_name: '123', types: ['street_number'] },
    { long_name: 'Example Street', short_name: 'Example St', types: ['route'] },
    { long_name: '84101', short_name: '84101', types: ['postal_code'] },
    { long_name: county, short_name: county, types: ['administrative_area_level_2'] },
    { long_name: 'Utah', short_name: 'UT', types: ['administrative_area_level_1'] },
    { long_name: 'United States', short_name: 'US', types: ['country'] },
  ],
}] });

void test('coverage runs before email, supports correction and deduplicates simultaneous retries', async () => {
  try {
    process.env.GOOGLE_MAPS_SERVER_KEY = '';
    globalThis.fetch = async () => { throw new Error('Unexpected network request'); };
    const missing = await POST(request(crypto.randomUUID()));
    assert.equal(missing.status, 503);
    assert.ok((await missing.json()).errors.address);
    assert.equal(emails, 0);

    process.env.GOOGLE_MAPS_SERVER_KEY = 'fixture-only';
    const retryKey = crypto.randomUUID();
    globalThis.fetch = async () => geocode('Tooele County');
    const outside = await POST(request(retryKey));
    assert.equal(outside.status, 400);
    assert.ok((await outside.json()).errors.address);
    assert.equal(emails, 0);

    let lookups = 0;
    globalThis.fetch = async () => {
      lookups++;
      await new Promise(resolve => setTimeout(resolve, 10));
      return geocode('Salt Lake County');
    };
    const corrected = '456 Example Street, Salt Lake City, UT 84101';
    const responses = await Promise.all([POST(request(retryKey, corrected)), POST(request(retryKey, corrected))]);
    assert.deepEqual(responses.map(response => response.status), [200, 200]);
    assert.deepEqual(await responses[0].json(), await responses[1].json());
    assert.equal(emails, 1);
    assert.equal(lookups, 1);
    assert.equal((await POST(request(retryKey, corrected))).status, 200);
    assert.equal(lookups, 1);
    assert.equal(emails, 1);
    assert.equal((await POST(request(retryKey, '789 Different Street, Salt Lake City, UT 84101'))).status, 409);
    assert.equal(emails, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GOOGLE_MAPS_SERVER_KEY;
    else process.env.GOOGLE_MAPS_SERVER_KEY = originalKey;
    if (originalOrigin === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = originalOrigin;
    delete globalThis.__coverageTestSend;
  }
});
