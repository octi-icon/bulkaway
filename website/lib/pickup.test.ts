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
import * as pickupMail from './pickup.ts';
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
void test('pickup step blocks state names, cities, incomplete addresses and other states before review', () => {
  for (const address of [
    'California',
    'Utah',
    'New York',
    'Salt Lake City',
    'Utah 84101',
    '123 Main St',
    '123 Main St, Denver, CO 80202',
    '123 Utah Ave, Las Vegas, NV 89101',
  ]) {
    assert.ok(validatePickupStep({ address, date: '' }, 1).address, address);
  }
  for (const address of [
    '123 Main St, Salt Lake City, UT 84101',
    '123 E 100 S Provo Utah 84601',
    '123 Main St, Ogden, UT 84401, USA',
  ]) {
    assert.equal(
      validatePickupStep({ address, date: '' }, 1).address,
      undefined,
      address,
    );
  }
});
void test('branded mail gives the crew structured details and a safe reply action', () => {
  const result = validatePickup({
    ...valid,
    items: [{ id: 'mattresses', quantity: 2 }],
    details: '<img src=x onerror=alert(1)>\nUse side entrance & ring bell.',
  });
  assert.ok(result.ok);
  const mail = buildPickupMail(result.data, 'BA-1234ABCD', 2);
  assert.match(mail.html, /<html lang="en"/);
  assert.match(mail.html, /<th[^>]*scope="col"[^>]*>Item/);
  assert.match(mail.html, /Mattresses/);
  assert.match(mail.html, /href="mailto:taylor%40example.com\?subject=/);
  assert.match(mail.html, /&lt;img src=x onerror=alert\(1\)&gt;<br/);
  assert.doesNotMatch(mail.html, /<img src=x|<pre|<script/);
  assert.match(mail.text, /2 × Mattresses/);
  assert.match(mail.html, /2 attached/);
});
void test('customer confirmation is a separate email with a reference and no booking promise', () => {
  const result = validatePickup({ ...valid, unit: 'Apt 2', offer: 'SPACE5' });
  assert.ok(result.ok);
  assert.equal(typeof pickupMail.buildPickupConfirmation, 'function');
  const mail = pickupMail.buildPickupConfirmation(
    result.data,
    'BA-1234ABCD',
    2,
  );
  assert.equal(mail.to, valid.email);
  assert.equal(mail.from.address, 'mailer@wsitrashvalet.com');
  assert.equal(mail.replyTo.address, 'service@bulkaway.com');
  assert.notEqual(
    mail.messageId,
    buildPickupMail(result.data, 'BA-1234ABCD').messageId,
  );
  assert.match(mail.subject, /BA-1234ABCD/);
  for (const body of [mail.text, mail.html]) {
    assert.match(body, /isn’t booked yet/);
    assert.match(body, /Apt 2/);
    assert.match(body, /SPACE5/);
    assert.match(body, /2 received/);
    assert.doesNotMatch(
      body,
      /Disclosure shown|Recorded at|apply 5% off.*quoting/,
    );
  }
  assert.equal(mail.headers['Auto-Submitted'], 'auto-generated');
});
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
    { email: 'group:a@example.com;' },
    { email: 'a(comment)@example.com' },
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
      /SMS opt-in: No/,
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
  assert.ok(mail.attachments?.length);
  const record = mail.attachments[0].content;
  assert.match(record, /SMS consent: GIVEN/);
  assert.match(record, /Disclosure version: 2026-09-06/);
  assert.match(record, /Consent source: Bulk Away website pickup form/);
  assert.match(record, /Recorded at: \d{4}-\d{2}-\d{2}T/);
  assert.match(record, /Reply STOP to opt out/);
  assert.match(record, /does not activate Twilio/);
  assert.match(record, /BA-SMS/);
  for (const body of [mail.html, mail.text]) {
    assert.doesNotMatch(
      body,
      /Disclosure shown|Recorded at|Requested dates are preferences/,
    );
    assert.match(body, /SMS opt-in: Yes/);
  }
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

void test('normalization strips unknown fields without coercing optional values', () => {
  const result = validatePickup({
    ...valid,
    name: ' Taylor Jones ',
    email: ' taylor@example.com ',
    phone: ' 8015550100 ',
    service: ' Trash outs ',
    address: ` ${valid.address} `,
    date: null,
    details: null,
    items: [{ id: 'furniture', quantity: 1, price: 0 }],
    offer: ' SPACE5 ',
    admin: true,
  });
  assert.deepEqual(result, {
    ok: true,
    data: {
      name: valid.name,
      email: valid.email,
      phone: valid.phone,
      service: valid.service,
      address: valid.address,
      unit: '',
      date: '',
      details: '',
      items: [{ id: 'furniture', quantity: 1 }],
      consent: true,
      smsConsent: false,
      offer: 'SPACE5',
    },
  });
});

void test('contact permission requires boolean true, independently of SMS permission', () => {
  for (const consent of [undefined, false, null, 1, 'true']) {
    assert.deepEqual(validatePickup({ ...valid, consent }), {
      ok: false,
      errors: { consent: 'Please agree to be contacted about your pickup.' },
    });
  }
});

void test('invalid quantities preserve the item error without requiring a second description', () => {
  for (const items of [
    null,
    'furniture',
    [{ id: 'unknown', quantity: 1 }],
    [{ id: 'furniture', quantity: '1' }],
    [{ id: 'furniture', quantity: 0 }],
    [{ id: 'furniture', quantity: 1.5 }],
    [{ id: 'furniture', quantity: 1000 }],
    [
      { id: 'furniture', quantity: 1 },
      { id: 'furniture', quantity: 2 },
    ],
  ]) {
    assert.deepEqual(validatePickup({ ...valid, items, details: '' }), {
      ok: false,
      errors: {
        items:
          'Choose known items and enter a whole-number quantity from 1 to 999 for each.',
      },
    });
  }
});

void test('independent errors are returned together with the existing customer copy', () => {
  assert.deepEqual(
    validatePickup({
      ...valid,
      name: 'A',
      email: 'a(comment)@example.com',
      phone: '8015550100\nBcc',
      service: 'Other',
      address: 'Utah',
      unit: null,
      items: [{ id: 'furniture', quantity: 0 }],
      details: 'x'.repeat(4001),
      date: '2099-02-30',
      consent: 'true',
      smsConsent: true,
      smsDisclosureVersion: 'outdated',
      website: 'spam',
    }),
    {
      ok: false,
      errors: {
        items:
          'Choose known items and enter a whole-number quantity from 1 to 999 for each.',
        form: 'Please call or email the crew to arrange your pickup.',
        name: 'Enter your name (2–100 characters).',
        email: 'Enter a valid email address.',
        phone: 'Enter a phone number including the area code.',
        service: 'Choose a service.',
        address:
          'Enter a full Utah pickup address: street number, street, city, UT and ZIP code.',
        unit: 'Enter apartment, unit or building details in 100 characters or fewer.',
        details:
          'Select items above or describe what needs to go (10–4,000 characters).',
        date: 'Choose today or a future date, or leave it blank.',
        consent: 'Please agree to be contacted about your pickup.',
        smsConsent:
          'The SMS terms have changed. Refresh this page to review them, or uncheck SMS updates to continue without texts.',
      },
    },
  );
});

void test('shared schema exposes normalized data and field issues through safeParse', () => {
  assert.equal(typeof pickupMail.pickupSchema?.safeParse, 'function');
  const accepted = pickupMail.pickupSchema.safeParse(valid);
  assert.ok(accepted.success);
  const compatible = validatePickup(valid);
  assert.ok(compatible.ok);
  assert.deepEqual(accepted.data, compatible.data);
  const rejected = pickupMail.pickupSchema.safeParse({
    ...valid,
    consent: 'true',
  });
  assert.equal(rejected.success, false);
  if (!rejected.success) {
    assert.deepEqual(
      rejected.error.issues.map(({ path, message }) => ({ path, message })),
      [
        {
          path: ['consent'],
          message: 'Please agree to be contacted about your pickup.',
        },
      ],
    );
  }
});
