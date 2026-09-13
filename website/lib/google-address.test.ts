import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAddressSession,
  loadAddressLibrary,
  type PlacesLibrary,
} from './google-address.ts';

void test('address searches reuse a session until selection and request only the needed address', async () => {
  const requests: Parameters<
    PlacesLibrary['AutocompleteSuggestion']['fetchAutocompleteSuggestions']
  >[0][] = [];
  const fields: string[][] = [];
  const prediction = {
    placeId: 'example',
    types: ['street_address'],
    text: { toString: () => 'Example address' },
    toPlace: () => ({
      formattedAddress: '123 Main St, Salt Lake City, UT 84101, USA',
      addressComponents: [
        { longText: '123', shortText: '123', types: ['street_number'] },
        { longText: 'Main Street', shortText: 'Main St', types: ['route'] },
        { longText: '84101', shortText: '84101', types: ['postal_code'] },
        {
          longText: 'Salt Lake County',
          shortText: 'Salt Lake County',
          types: ['administrative_area_level_2'],
        },
        {
          longText: 'Utah',
          shortText: 'UT',
          types: ['administrative_area_level_1'],
        },
        { longText: 'United States', shortText: 'US', types: ['country'] },
      ],
      fetchFields: async (options: { fields: string[] }) => {
        fields.push(options.fields);
      },
    }),
  };
  const session = createAddressSession({
    AutocompleteSessionToken: class {},
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: async (request) => {
        requests.push(request);
        return {
          suggestions: [
            {},
            {
              placePrediction: {
                ...prediction,
                placeId: 'state',
                types: ['administrative_area_level_1', 'political'],
              },
            },
            { placePrediction: prediction },
          ],
        };
      },
    },
  });
  assert.deepEqual(await session.search('123 Ma'), [prediction]);
  await session.search('123 Main');
  assert.equal(requests[0].sessionToken, requests[1].sessionToken);
  assert.deepEqual(requests[0].includedRegionCodes, ['us']);
  assert.deepEqual(requests[0].includedPrimaryTypes, [
    'street_address',
    'premise',
    'subpremise',
  ]);
  assert.ok('locationRestriction' in requests[0]);
  assert.ok(!('locationBias' in requests[0]));
  assert.equal(
    await session.select(prediction),
    '123 Main St, Salt Lake City, UT 84101, USA',
  );
  assert.deepEqual(fields, [['formattedAddress', 'addressComponents']]);
  await session.search('456');
  assert.notEqual(requests[1].sessionToken, requests[2].sessionToken);
});

void test('a county match alone cannot turn a city or incomplete place into a selected address', async () => {
  const session = createAddressSession({
    AutocompleteSessionToken: class {},
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: async () => ({ suggestions: [] }),
    },
  });
  await assert.rejects(
    session.select({
      placeId: 'city',
      types: ['locality'],
      text: { toString: () => 'Salt Lake City, UT' },
      toPlace: () => ({
        formattedAddress: 'Salt Lake City, UT, USA',
        addressComponents: [
          {
            longText: 'Salt Lake County',
            shortText: 'Salt Lake County',
            types: ['administrative_area_level_2'],
          },
          {
            longText: 'Utah',
            shortText: 'UT',
            types: ['administrative_area_level_1'],
          },
          { longText: 'United States', shortText: 'US', types: ['country'] },
        ],
        fetchFields: async () => {},
      }),
    }),
    /full street address/,
  );
});

void test('selection rejects neighboring counties and same-named counties outside Utah', async () => {
  const session = createAddressSession({
    AutocompleteSessionToken: class {},
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: async () => ({ suggestions: [] }),
    },
  });
  for (const [county, state, country] of [
    ['Tooele County', 'UT', 'US'],
    ['Morgan County', 'UT', 'US'],
    ['Davis County', 'IA', 'US'],
    ['Utah County', 'UT', 'CA'],
  ]) {
    await assert.rejects(
      session.select({
        placeId: 'outside',
        text: { toString: () => 'Outside address' },
        toPlace: () => ({
          formattedAddress: '123 Example Street',
          addressComponents: [
            {
              longText: county,
              shortText: county,
              types: ['administrative_area_level_2'],
            },
            {
              longText: state,
              shortText: state,
              types: ['administrative_area_level_1'],
            },
            { longText: country, shortText: country, types: ['country'] },
          ],
          fetchFields: async () => {},
        }),
      }),
      /Salt Lake, Utah, Davis and Weber/,
    );
  }
});

void test('address lookup failures remain failures rather than fabricated matches', async () => {
  const session = createAddressSession({
    AutocompleteSessionToken: class {},
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: async () => {
        throw new Error('offline');
      },
    },
  });
  await assert.rejects(session.search('123 Main'), /offline/);
  await assert.rejects(
    session.select({
      placeId: 'missing',
      text: { toString: () => 'Partial' },
      toPlace: () => ({ fetchFields: async () => {} }),
    }),
    /Address unavailable/,
  );
});

void test('a failed library download can be retried without reloading the page', async () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    'document',
  );
  let attempts = 0;
  let removals = 0;
  const places = { marker: 'loaded' };
  const browser: Record<string, unknown> = { setTimeout, clearTimeout };
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: browser,
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement: () => ({
        onerror: () => {},
        remove: () => {
          removals++;
        },
      }),
      head: {
        appendChild: (script: { onerror(): void }) => {
          attempts++;
          if (attempts === 1) queueMicrotask(() => script.onerror());
          else {
            browser.google = { maps: { importLibrary: async () => places } };
            queueMicrotask(() => (browser.bulkAwayMapsReady as () => void)());
          }
        },
      },
    },
  });
  try {
    await assert.rejects(loadAddressLibrary('test-only'), /Maps unavailable/);
    assert.equal(await loadAddressLibrary('test-only'), places);
    assert.equal(attempts, 2);
    assert.equal(removals, 1);
  } finally {
    if (previousWindow)
      Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (previousDocument)
      Object.defineProperty(globalThis, 'document', previousDocument);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
