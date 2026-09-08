import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sharp } from './image-processor.ts';
import { preparePhotos, readPickupRequest } from './photos.ts';

void test('requests without photos retain JSON support', async () => {
  const result = await readPickupRequest(
    new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":"Taylor"}',
    }),
  );
  assert.deepEqual(result, { input: { name: 'Taylor' }, files: [] });
  assert.deepEqual(await preparePhotos([]), []);
});
void test('multipart requests deliver normalized photos with private metadata removed', async () => {
  const original = await sharp({
    create: { width: 2500, height: 1000, channels: 3, background: 'red' },
  })
    .jpeg()
    .withMetadata()
    .toBuffer();
  const form = new FormData();
  form.append('request', '{"name":"Taylor"}');
  form.append(
    'photos',
    new File([original], '../../private-name.jpg', { type: 'image/jpeg' }),
  );
  const parsed = await readPickupRequest(
    new Request('https://example.com', { method: 'POST', body: form }),
  );
  const photos = await preparePhotos(parsed.files);
  assert.equal(photos.length, 1);
  assert.equal(photos[0].filename, 'pickup-photo-1.jpg');
  assert.equal(photos[0].contentType, 'image/jpeg');
  const metadata = await sharp(photos[0].content).metadata();
  assert.ok(metadata.width! <= 2000);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.icc, undefined);
});
void test('invalid, mislabeled, empty, oversized and excessive uploads are rejected', async () => {
  const validPng = await sharp({
    create: { width: 2, height: 2, channels: 3, background: 'blue' },
  })
    .png()
    .toBuffer();
  for (const files of [
    [new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' })],
    [new File(['not an image'], 'x.jpg', { type: 'image/jpeg' })],
    [new File([validPng], 'x.jpg', { type: 'image/jpeg' })],
    [new File([], 'empty.jpg', { type: 'image/jpeg' })],
    [
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.jpg', {
        type: 'image/jpeg',
      }),
    ],
    Array.from(
      { length: 6 },
      () => new File([validPng], 'photo.png', { type: 'image/png' }),
    ),
  ])
    await assert.rejects(preparePhotos(files));
});
void test('multipart parsing keeps textual data bounded and rejects extra fields', async () => {
  for (const extra of [false, true]) {
    const form = new FormData();
    form.append(
      'request',
      extra ? '{}' : JSON.stringify({ details: 'x'.repeat(20001) }),
    );
    if (extra) form.append('unexpected', 'value');
    await assert.rejects(
      readPickupRequest(
        new Request('https://example.com', { method: 'POST', body: form }),
      ),
    );
  }
});
