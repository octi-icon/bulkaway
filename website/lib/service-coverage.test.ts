import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyServiceAddress, CoverageError } from './service-coverage.ts';

const result = (county = 'Salt Lake County', state = 'UT') => ({
  formatted_address: '123 Example Street, Example City, UT, USA',
  types: ['street_address'],
  address_components: [
    { long_name: '84101', short_name: '84101', types: ['postal_code'] },
    { long_name: '123', short_name: '123', types: ['street_number'] },
    { long_name: 'Example Street', short_name: 'Example St', types: ['route'] },
    {
      long_name: county,
      short_name: county,
      types: ['administrative_area_level_2'],
    },
    {
      long_name: state,
      short_name: state,
      types: ['administrative_area_level_1'],
    },
    { long_name: 'United States', short_name: 'US', types: ['country'] },
  ],
});
const response =
  (body: unknown): typeof fetch =>
  async () =>
    Response.json(body);

void test('submitted addresses in all four counties pass without rewriting the input', async () => {
  for (const county of [
    'Salt Lake County',
    'Utah County',
    'Davis County',
    'Weber County',
  ]) {
    assert.equal(
      await verifyServiceAddress(
        '123 Example Street',
        'test-key',
        response({ status: 'OK', results: [result(county)] }),
      ),
      undefined,
    );
  }
});

void test('server checks the actual address, with no geographic filter that could force an incorrect local match', async () => {
  const lookup: typeof fetch = async (url, options) => {
    const request = new URL(url instanceof Request ? url.url : url);
    assert.equal(request.origin, 'https://maps.googleapis.com');
    assert.equal(
      request.searchParams.get('address'),
      '123 Main St, Tooele, UT',
    );
    assert.equal(request.searchParams.get('components'), null);
    assert.equal(request.searchParams.get('key'), 'test-key');
    assert.equal(options?.cache, 'no-store');
    assert.ok(options?.signal);
    return Response.json({ status: 'OK', results: [result('Tooele County')] });
  };
  await assert.rejects(
    verifyServiceAddress('123 Main St, Tooele, UT', 'test-key', lookup),
    (error: unknown) => error instanceof CoverageError && error.status === 400,
  );
});

void test('out-of-area, ambiguous, partial, missing-county and city-only results are rejected', async () => {
  for (const results of [
    [result('Morgan County')],
    [result('Davis County', 'IA')],
    [result(), result('Utah County')],
    [{ ...result(), partial_match: true }],
    [{ ...result(), types: ['locality', 'political'] }],
    [
      {
        ...result(),
        address_components: result().address_components.filter(
          (c) => !c.types.includes('administrative_area_level_2'),
        ),
      },
    ],
  ]) {
    await assert.rejects(
      verifyServiceAddress(
        '123 Example Street',
        'test-key',
        response({ status: 'OK', results }),
      ),
      (error: unknown) =>
        error instanceof CoverageError && error.status === 400,
    );
  }
  await assert.rejects(
    verifyServiceAddress(
      'Unknown',
      'test-key',
      response({ status: 'ZERO_RESULTS', results: [] }),
    ),
    (error: unknown) => error instanceof CoverageError && error.status === 400,
  );
});

void test('missing credentials, denied requests and network failures never bypass coverage', async () => {
  const unreachable: typeof fetch = async () => {
    throw new Error('private provider details');
  };
  for (const [key, lookup] of [
    ['', unreachable],
    ['test-key', unreachable],
    [
      'test-key',
      response({
        status: 'REQUEST_DENIED',
        error_message: 'private provider details',
      }),
    ],
    ['test-key', response({ unexpected: true })],
  ] as const) {
    await assert.rejects(
      verifyServiceAddress('123 Example Street', key, lookup),
      (error: unknown) =>
        error instanceof CoverageError &&
        error.status === 503 &&
        !error.message.includes('private provider details'),
    );
  }
});
