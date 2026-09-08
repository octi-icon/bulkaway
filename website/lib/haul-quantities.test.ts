import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateHaulItems } from './haul-guide.ts';
import {
  validatePickup,
  validatePickupStep,
  pickupErrorStep,
  buildPickupMail,
} from './pickup.ts';

void test('rejects unknown, duplicate, missing, fractional, zero and excessive quantities', () => {
  for (const input of [
    null,
    {},
    [{ id: 'unknown', quantity: 1 }],
    ...['', '2', 0, -1, 1.5, 1000, Infinity, NaN, undefined].map((quantity) => [
      { id: 'furniture', quantity },
    ]),
    [
      { id: 'tires', quantity: 2 },
      { id: 'tires', quantity: 3 },
    ],
  ]) {
    assert.ok(validateHaulItems(input).error);
  }
  assert.deepEqual(validateHaulItems(undefined), { items: [], error: '' });
  assert.equal(pickupErrorStep({ items: 'Invalid quantity' }), 0);
});
void test('items allow optional notes; removing all items requires a description', () => {
  const input = {
    service: 'Bulk item removal',
    details: '',
    items: [{ id: 'mattresses', quantity: 2 }],
  };
  assert.deepEqual(validatePickupStep(input, 0), {});
  assert.ok(validatePickupStep({ ...input, items: [] }, 0).details);
  assert.ok(
    validatePickupStep(
      { ...input, items: [{ id: 'mattresses', quantity: '' }] },
      0,
    ).items,
  );
  assert.equal(
    validatePickupStep(
      { ...input, items: [{ id: 'mattresses', quantity: '' }] },
      0,
    ).details,
    undefined,
  );
  assert.ok(
    validatePickupStep({ ...input, details: 'x'.repeat(4001) }, 0).details,
  );
});
void test('validated quantities and separate notes reach the crew email', () => {
  const result = validatePickup({
    name: 'Test Person',
    email: 'test@example.com',
    phone: '8015550100',
    service: 'Bulk item removal',
    address: 'Test pickup location',
    date: '',
    consent: true,
    details: 'Use the side gate.',
    items: [
      { id: 'furniture', quantity: 3 },
      { id: 'tires', quantity: 4 },
    ],
  });
  assert.ok(result.ok);
  if (!result.ok) return;
  assert.deepEqual(result.data.items, [
    { id: 'furniture', quantity: 3 },
    { id: 'tires', quantity: 4 },
  ]);
  const mail = buildPickupMail(result.data, 'BA-TEST');
  assert.match(mail.text, /3 × Furniture\n4 × Tires/);
  assert.match(mail.text, /ADDITIONAL DETAILS\nUse the side gate\./);
  assert.match(mail.html, /3 × Furniture/);
});
