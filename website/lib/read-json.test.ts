import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readBoundedJson, PayloadTooLarge } from './read-json.ts';
void test('reads a valid JSON request within the byte limit', async () => {
  assert.deepEqual(
    await readBoundedJson(
      new Request('https://example.com', {
        method: 'POST',
        body: '{"name":"Taylor"}',
      }),
    ),
    { name: 'Taylor' },
  );
});
void test('cancels oversized chunked bodies before buffering the rest', async () => {
  let pulls = 0;
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) {
      pulls++;
      controller.enqueue(new Uint8Array(10000));
    },
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request('https://example.com', {
    method: 'POST',
    body: stream,
    duplex: 'half',
  } as RequestInit);
  await assert.rejects(readBoundedJson(request), PayloadTooLarge);
  assert.equal(cancelled, true);
  assert.ok(pulls < 6, 'must not consume the unbounded stream');
});
void test('counts bytes, not string characters', async () => {
  await assert.rejects(
    readBoundedJson(
      new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({ message: '🌟'.repeat(6000) }),
      }),
    ),
    PayloadTooLarge,
  );
});
