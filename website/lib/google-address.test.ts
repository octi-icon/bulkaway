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
    text: { toString: () => 'Example address' },
    toPlace: () => ({
      formattedAddress: '123 Main St, Salt Lake City, UT 84101, USA',
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
        return { suggestions: [{}, { placePrediction: prediction }] };
      },
    },
  });
  assert.deepEqual(await session.search('123 Ma'), [prediction]);
  await session.search('123 Main');
  assert.equal(requests[0].sessionToken, requests[1].sessionToken);
  assert.deepEqual(requests[0].includedRegionCodes, ['us']);
  assert.equal(
    await session.select(prediction),
    '123 Main St, Salt Lake City, UT 84101, USA',
  );
  assert.deepEqual(fields, [['formattedAddress']]);
  await session.search('456');
  assert.notEqual(requests[1].sessionToken, requests[2].sessionToken);
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
