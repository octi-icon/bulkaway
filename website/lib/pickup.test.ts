import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePickup,
  buildPickupMail,
  smsDisclosureVersion,
  validatePickupStep,
  pickupErrorStep,
  pickupToday,
} from './pickup.ts';
void test('pickup calendar uses Utah dates across midnight and daylight saving changes', () => {
  assert.equal(pickupToday(new Date('2026-09-07T05:59:59Z')), '2026-09-06');
  assert.equal(pickupToday(new Date('2026-09-07T06:00:00Z')), '2026-09-07');
  assert.equal(pickupToday(new Date('2026-01-07T06:59:59Z')), '2026-01-06');
  assert.equal(pickupToday(new Date('2026-01-07T07:00:00Z')), '2026-01-07');
  assert.equal(pickupToday(new Date('2026-03-08T09:00:00Z')), '2026-03-08');
});
const valid = {
  name: 'Taylor Jones',
  email: 'taylor@example.com',
  phone: '8015550100',
  service: 'Trash outs',
  address: '123 Main St, Salt Lake City, UT 84101',
  date: '',
  details: 'Sofa and boxes in a second-floor apartment.',
  website: '',
  consent: true,
};
void test('only the approved arcade offer reaches the quote email', () => {
  const accepted = validatePickup({ ...valid, offer: 'SPACE5' });
  assert.equal(accepted.ok, true);
  if (accepted.ok)
    assert.match(
      buildPickupMail(accepted.data, 'BA-12345678').text,
      /SPACE5 — apply 5% off/,
    );
  const other = validatePickup({ ...valid, offer: 'FREE100\r\nInjected' });
  assert.equal(other.ok, true);
  if (other.ok)
    assert.doesNotMatch(
      buildPickupMail(other.data, 'BA-12345678').text,
      /Arcade offer|FREE100|Injected/,
    );
});
void test('pickup steps validate only their own fields before the final review', () => {
  assert.deepEqual(
    validatePickupStep({ service: valid.service, details: valid.details }, 0),
    {},
  );
  assert.deepEqual(
    validatePickupStep({ address: valid.address, date: '' }, 1),
    {},
  );
  assert.ok(validatePickupStep({ service: '', details: '' }, 0).service);
  assert.ok(validatePickupStep({ address: '', date: '2026-02-30' }, 1).date);
  assert.deepEqual(validatePickupStep(valid, 2), {});
  assert.ok(validatePickupStep({ ...valid, details: '' }, 2).details);
  assert.ok(validatePickupStep({ ...valid, consent: false }, 2).consent);
});
void test('errors return customers to the earliest affected step', () => {
  assert.equal(
    pickupErrorStep({ email: 'Invalid email', details: 'Add details' }),
    0,
  );
  assert.equal(pickupErrorStep({ date: 'Past date', consent: 'Required' }), 1);
  assert.equal(pickupErrorStep({ photos: 'Invalid photo' }), 0);
  assert.equal(pickupErrorStep({ email: 'Invalid email' }), 2);
});
void test('accepts a complete request and fixes sender and recipient', () => {
  const result = validatePickup(valid);
  assert.ok(result.ok);
  if (result.ok) {
    const mail = buildPickupMail(result.data, 'BA-TEST');
    assert.equal(mail.to, 'service@bulkaway.com');
    assert.equal(mail.from.address, 'mailer@wsitrashvalet.com');
    assert.equal(mail.replyTo.address, valid.email);
    assert.match(mail.text, /second-floor/);
  }
});
void test('optional unit details are validated on the pickup step and included in the email', () => {
  const result = validatePickup({ ...valid, unit: ' Building B, Unit 204 ' });
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.data.unit, 'Building B, Unit 204');
    assert.match(
      buildPickupMail(result.data, 'BA-TEST').text,
      /Pickup location: .* · Building B, Unit 204/,
    );
  }
  for (const unit of ['x'.repeat(101), 'Unit 1\nUnit 2', {}]) {
    assert.ok(validatePickupStep({ ...valid, unit }, 1).unit);
  }
  assert.equal(pickupErrorStep({ unit: 'Too long' }), 1);
  assert.ok(validatePickup(valid).ok);
});
void test('rejects header injection, incomplete address and unsupported services', () => {
  for (const change of [
    { email: 'a@example.com\r\nBcc: bad@example.com' },
    { name: 'Taylor\nBcc: x' },
    { address: '' },
    { service: 'Power washing' },
    { consent: false },
  ])
    assert.equal(validatePickup({ ...valid, ...change }).ok, false);
});
void test('rejects impossible and past dates plus oversized details', () => {
  for (const change of [
    { date: '2027-02-30' },
    { date: '2000-01-01' },
    { details: 'x'.repeat(4001) },
  ])
    assert.equal(validatePickup({ ...valid, ...change }).ok, false);
});
void test('rejects malformed input and honeypot submissions', () => {
  for (const value of [null, [], 42, { ...valid, website: 'spam' }])
    assert.equal(validatePickup(value).ok, false);
});
void test('SMS consent is optional and never inferred from a phone number', () => {
  for (const choice of [undefined, false]) {
    const result = validatePickup({ ...valid, smsConsent: choice });
    assert.ok(result.ok);
    assert.equal(result.data.smsConsent, false);
    assert.match(
      buildPickupMail(result.data, 'BA-NO-SMS').text,
      /SMS consent: NOT GIVEN/,
    );
  }
  for (const choice of ['true', 'false', 1, null]) {
    assert.equal(validatePickup({ ...valid, smsConsent: choice }).ok, false);
  }
});
void test('explicit SMS consent is recorded with disclosure, source and server time', () => {
  const result = validatePickup({
    ...valid,
    smsConsent: true,
    smsDisclosureVersion,
  });
  assert.ok(result.ok);
  const mail = buildPickupMail(result.data, 'BA-SMS');
  assert.match(mail.text, /SMS consent: GIVEN/);
  assert.match(mail.text, /Disclosure version: 2026-09-06/);
  assert.match(mail.text, /Consent source: Bulk Away website pickup form/);
  assert.match(mail.text, /Recorded at: \d{4}-\d{2}-\d{2}T/);
  assert.match(mail.text, /Reply STOP to opt out/);
  assert.match(mail.text, /does not activate Twilio/);
});
void test('stale SMS disclosures cannot be recorded as current consent', () => {
  for (const version of [undefined, 'old-version']) {
    const result = validatePickup({
      ...valid,
      smsConsent: true,
      smsDisclosureVersion: version,
    });
    assert.equal(result.ok, false);
  }
});
