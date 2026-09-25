import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import {
  buildIntakeEnvelope,
  deliverToHelm,
  helmIntakeEnabled,
  signIntake,
} from './helm-intake.ts';
import { deliverPickupMessages } from './pickup-delivery.ts';
import { validatePickup, smsDisclosureVersion } from './pickup.ts';

const parsed = validatePickup({
  name: 'Taylor Test',
  email: 'taylor@example.com',
  phone: '8015550100',
  address: '123 Test St, Salt Lake City, UT 84101',
  unit: 'Apt 4',
  service: 'Trash outs',
  details: 'Two sofas in the living room.',
  items: [{ id: 'mattresses', quantity: 2 }],
  consent: true,
  smsConsent: true,
  smsDisclosureVersion,
  offer: 'SPACE5',
});
assert.ok(parsed.ok);
const pickup = parsed.data;
const photo = {
  filename: 'pickup-photo-1.jpg',
  contentType: 'image/jpeg',
  content: Buffer.from('test-photo'),
};
const KEY = '12345678-1234-4234-8234-123456789abc';
const CONFIG = {
  HELM_INTAKE_URL: 'https://helm.example/',
  HELM_INTAKE_SECRET: 'shared-secret',
};

void test('envelope carries the validated pickup in the wsi_web_intake_v1 shape with hashed photos', async () => {
  const envelope = await buildIntakeEnvelope(
    pickup,
    'BA-1234ABCD',
    KEY,
    [photo],
    {
      sourceUrl: 'https://bulkaway.example/request',
      now: new Date('2026-09-13T12:00:00Z'),
    },
  );
  assert.equal(envelope.contract, 'wsi_web_intake_v1');
  assert.equal(envelope.site, 'bulk-away');
  assert.equal(envelope.form, 'bulk_away.pickup');
  assert.equal(envelope.idempotencyKey, KEY);
  assert.equal(envelope.reference, 'BA-1234ABCD');
  assert.equal(envelope.submittedAt, '2026-09-13T12:00:00.000Z');
  assert.deepEqual(envelope.contact, {
    name: 'Taylor Test',
    email: 'taylor@example.com',
    phone: '8015550100',
    consent: { contact: true, sms: true, smsDisclosureVersion },
  });
  assert.deepEqual(envelope.location, {
    formattedAddress: '123 Test St, Salt Lake City, UT 84101',
    addressLine2: 'Apt 4',
  });
  assert.deepEqual(envelope.fields, {
    service: 'Trash outs',
    items: [{ id: 'mattresses', quantity: 2 }],
    details: 'Two sofas in the living room.',
    unit: 'Apt 4',
    requestedDate: '',
    offer: 'SPACE5',
  });
  assert.equal(envelope.attachments.length, 1);
  assert.equal(
    envelope.attachments[0].bytesBase64,
    photo.content.toString('base64'),
  );
  assert.equal(
    envelope.attachments[0].sha256,
    createHash('sha256').update(photo.content).digest('hex'),
  );
});

void test('signature matches HMAC-SHA256 over `${timestamp}.${rawBody}`', async () => {
  const raw = '{"a":1}';
  const expected = createHmac('sha256', 'shared-secret')
    .update(`1789000000000.${raw}`)
    .digest('hex');
  assert.equal(
    await signIntake('shared-secret', '1789000000000', raw),
    `sha256=${expected}`,
  );
});

void test('delivery is disabled without configuration and never throws on failure', async () => {
  const envelope = await buildIntakeEnvelope(pickup, 'BA-1234ABCD', KEY, []);
  assert.equal(helmIntakeEnabled({}), false);
  assert.deepEqual(await deliverToHelm(envelope, {}), { status: 'disabled' });
  assert.deepEqual(
    await deliverToHelm(envelope, CONFIG, async () => {
      throw new TypeError('fetch failed');
    }),
    { status: 'unrecorded', reason: 'TypeError' },
  );
  assert.deepEqual(
    await deliverToHelm(
      envelope,
      CONFIG,
      async () => new Response('no', { status: 401 }),
    ),
    { status: 'unrecorded', reason: 'http_401' },
  );
});

void test('a 201 receipt is recorded with the Helm request number, and the request is signed', async () => {
  const envelope = await buildIntakeEnvelope(pickup, 'BA-1234ABCD', KEY, []);
  let seen: Request | undefined;
  const result = await deliverToHelm(envelope, CONFIG, async (input, init) => {
    seen = new Request(input, init);
    return Response.json(
      {
        ok: true,
        receipt: {
          submissionId: 'sub-1',
          status: 'routed',
          routed: {
            entityType: 'bulk_away_request',
            entityId: 'r-1',
            entityNumber: 'BA-R-ABCDEFGH',
          },
        },
      },
      { status: 201 },
    );
  });
  assert.deepEqual(result, {
    status: 'recorded',
    submissionId: 'sub-1',
    requestNumber: 'BA-R-ABCDEFGH',
  });
  assert.ok(seen);
  assert.equal(seen.url, 'https://helm.example/api/web-intake');
  assert.equal(seen.headers.get('x-wsi-intake-site'), 'bulk-away');
  assert.equal(seen.headers.get('idempotency-key'), KEY);
  const ts = seen.headers.get('x-wsi-intake-timestamp')!;
  const body = await seen.text();
  const expected = createHmac('sha256', 'shared-secret')
    .update(`${ts}.${body}`)
    .digest('hex');
  assert.equal(
    seen.headers.get('x-wsi-intake-signature'),
    `sha256=${expected}`,
  );
  assert.equal(JSON.parse(body).idempotencyKey, KEY);
});

void test('the delivery pipeline hands off to Helm after the crew email and reports the outcome without changing the email result', async () => {
  const order: string[] = [];
  const result = await deliverPickupMessages(
    pickup,
    'BA-1234ABCD',
    [photo],
    async (message) => {
      order.push(String(message.to));
    },
    async () => {
      order.push('helm');
      return {
        status: 'recorded',
        submissionId: 'sub-1',
        requestNumber: 'BA-R-ABCDEFGH',
      };
    },
  );
  assert.deepEqual(order, [
    'service@bulkaway.com',
    'helm',
    'taylor@example.com',
  ]);
  assert.deepEqual(result, {
    confirmation: 'sent',
    helm: 'recorded',
    helmRequestNumber: 'BA-R-ABCDEFGH',
  });
  const failed = await deliverPickupMessages(
    pickup,
    'BA-1234ABCD',
    [],
    async () => {},
    async () => {
      throw new Error('boom');
    },
  );
  assert.deepEqual(failed, { confirmation: 'sent', helm: 'unrecorded' });
});
