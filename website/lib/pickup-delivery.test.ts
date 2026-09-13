import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deliverPickupMessages,
  type PickupMessage,
} from './pickup-delivery.ts';
import { validatePickup } from './pickup.ts';
import nodemailer from 'nodemailer';

const parsed = validatePickup({
  name: 'Taylor Test',
  email: 'taylor@example.com',
  phone: '8015550100',
  address: '123 Test St, Salt Lake City, UT 84101',
  service: 'Trash outs',
  details: 'Two sofas in the living room.',
  consent: true,
});
assert.ok(parsed.ok);
const pickup = parsed.data;
const photo = {
  filename: 'pickup-photo-1.jpg',
  contentType: 'image/jpeg',
  content: Buffer.from('test-photo'),
};

void test('accepted crew request is followed by a separate customer confirmation without private attachments', async () => {
  const messages: PickupMessage[] = [];
  const result = await deliverPickupMessages(
    pickup,
    'BA-1234ABCD',
    [photo],
    async (message) => {
      messages.push(message);
    },
  );
  assert.deepEqual(result, { confirmation: 'sent' });
  assert.equal(messages.length, 2);
  assert.equal(messages[0].to, 'service@bulkaway.com');
  assert.equal(messages[1].to, 'taylor@example.com');
  assert.equal(messages[0].attachments?.length, 4);
  assert.deepEqual(
    messages[0].attachments?.find(
      (attachment) => attachment.filename === photo.filename,
    ),
    photo,
  );
  assert.match(
    String(
      messages[0].attachments?.find(
        (attachment) => attachment.filename === 'contact-permission.txt',
      )?.content,
    ),
    /SMS consent: NOT GIVEN/,
  );
  assert.equal(messages[1].attachments?.length, 2);
  for (const message of messages) {
    const artwork =
      message.attachments?.filter(
        (attachment) => attachment.contentDisposition === 'inline',
      ) || [];
    assert.equal(artwork.length, 2);
    for (const image of artwork) {
      assert.ok(Buffer.isBuffer(image.content));
      assert.match(message.html, new RegExp(`src="cid:${image.cid}"`));
      assert.equal(image.contentType, 'image/png');
    }
    assert.match(message.html, /alt="Bulk Away"/);
  }
  assert.ok(
    messages[1].attachments?.every(
      (attachment) => attachment.contentDisposition === 'inline',
    ),
  );
  assert.notEqual(messages[0].messageId, messages[1].messageId);
});
void test('uncertain crew delivery stops the flow before any customer acknowledgment', async () => {
  let attempts = 0;
  await assert.rejects(
    deliverPickupMessages(pickup, 'BA-1234ABCD', [], async () => {
      attempts++;
      throw new Error('SMTP timeout');
    }),
    /SMTP timeout/,
  );
  assert.equal(attempts, 1);
});
void test('customer rejection preserves staff success and never resends the staff request', async () => {
  const recipients: string[] = [];
  const result = await deliverPickupMessages(
    pickup,
    'BA-1234ABCD',
    [],
    async (message) => {
      recipients.push(message.to);
      if (message.to === pickup.email) throw new Error('SMTP rejected');
    },
  );
  assert.deepEqual(result, { confirmation: 'unconfirmed' });
  assert.deepEqual(recipients, ['service@bulkaway.com', 'taylor@example.com']);
});
void test('generated MIME contains both alternatives, with photos only in the crew message', async () => {
  // Stream transport serializes the actual mailer payload without SMTP/network.
  const transport = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: 'unix',
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  const results: string[] = [];
  await deliverPickupMessages(
    pickup,
    'BA-1234ABCD',
    [photo],
    async (message) => {
      const result = await transport.sendMail(message);
      assert.ok(Buffer.isBuffer(result.message));
      results.push(result.message.toString());
    },
  );
  for (const raw of results) {
    assert.match(raw, /Content-Type: multipart\/alternative/);
    assert.match(raw, /Content-Type: text\/plain/);
    assert.match(raw, /Content-Type: text\/html/);
  }
  assert.match(results[0], /filename=pickup-photo-1.jpg/);
  assert.match(results[0], /filename=contact-permission.txt/);
  assert.doesNotMatch(results[1], /Content-Disposition: attachment/);
  assert.match(results[1], /Reply-To: Bulk Away crew <service@bulkaway.com>/);
  assert.match(results[1], /Auto-Submitted: auto-generated/);
  assert.match(results[1], /Content-ID: <bulk-away-logo@wsitrashvalet.com>/);
  assert.match(
    results[1],
    /Content-ID: <bulk-away-customer@wsitrashvalet.com>/,
  );
});
