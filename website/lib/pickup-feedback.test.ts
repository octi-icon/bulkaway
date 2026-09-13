import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createPickupReceipt,
  readPickupResponse,
  pickupFailureMessage,
  PickupDeliveryError,
  uncertainDeliveryMessage,
} from './pickup-feedback.ts';

void test('accepts only a confirmed receipt reference', async () => {
  assert.deepEqual(
    await readPickupResponse(Response.json({ reference: 'BA-12ABC456' })),
    { reference: 'BA-12ABC456', confirmation: 'unconfirmed' },
  );
  for (const data of [null, {}, { reference: '' }, { reference: 'booked' }]) {
    await assert.rejects(readPickupResponse(Response.json(data)), {
      message: uncertainDeliveryMessage,
    });
  }
  await assert.rejects(
    readPickupResponse(new Response('<html>Service unavailable</html>')),
    { message: uncertainDeliveryMessage },
  );
});
void test('confirmation email problems do not turn an accepted pickup into a failed request', async () => {
  for (const confirmation of ['unconfirmed', undefined, 'delivered']) {
    assert.deepEqual(
      await readPickupResponse(
        Response.json({ reference: 'BA-12ABC456', confirmation }),
      ),
      { reference: 'BA-12ABC456', confirmation: 'unconfirmed' },
    );
  }
  assert.deepEqual(
    await readPickupResponse(
      Response.json({ reference: 'BA-12ABC456', confirmation: 'sent' }),
    ),
    { reference: 'BA-12ABC456', confirmation: 'sent' },
  );
});

void test('preserves server corrections and masks unclassified browser failures', async () => {
  await assert.rejects(
    readPickupResponse(
      Response.json(
        {
          error: 'Please check your details.',
          errors: { email: 'Enter an email.', other: 4 },
        },
        { status: 400 },
      ),
    ),
    (error: unknown) => {
      assert.ok(error instanceof PickupDeliveryError);
      assert.deepEqual(error.fields, { email: 'Enter an email.' });
      assert.equal(pickupFailureMessage(error), 'Please check your details.');
      return true;
    },
  );
  for (const error of [
    new TypeError('Failed to fetch'),
    new SyntaxError('Unexpected token'),
    new DOMException('Timeout', 'TimeoutError'),
    null,
  ])
    assert.equal(pickupFailureMessage(error), uncertainDeliveryMessage);
  await assert.rejects(readPickupResponse(Response.json({}, { status: 503 })), {
    message: uncertainDeliveryMessage,
  });
});

void test('receipt snapshots submitted quantities, notes, date and photos independently of the draft', () => {
  const input = {
    offer: 'SPACE5',
    service: 'Bulk item removal',
    items: [{ id: 'mattresses', quantity: 2 }],
    details: ' Upstairs ',
    address: '123 Test St',
    unit: ' Unit 204 ',
    date: '2026-10-01',
  };
  const receipt = createPickupReceipt(input, 3);
  input.items[0].quantity = 8;
  input.address = 'Changed address';
  assert.deepEqual(receipt, {
    offer: 'SPACE5 — 5% off your next removal',
    service: 'Bulk item removal',
    items: '2 × Mattresses',
    details: 'Upstairs',
    address: '123 Test St · Unit 204',
    date: 'October 1, 2026',
    photoCount: 3,
  });
  assert.ok(Object.isFrozen(receipt));
  const flexible = createPickupReceipt(
    { details: 'Clear the storage room' },
    0,
  );
  assert.equal(flexible.date, 'Flexible — arrange with the crew');
  assert.equal(flexible.items, '');
  assert.equal(flexible.details, 'Clear the storage room');
});
