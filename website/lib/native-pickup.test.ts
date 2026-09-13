import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  adaptNativePickup,
  nativePickupApiRequest,
  readNativePickupForm,
} from './native-pickup.ts';
import { validatePickup, smsDisclosureVersion } from './pickup.ts';
import { PayloadTooLarge } from './read-json.ts';
import { MAX_TOTAL_PHOTO_BYTES } from './photo-limits.ts';

function fixture() {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '8015550100',
    service: 'Trash outs',
    address: '123 Example St, Salt Lake City, UT 84101',
    unit: 'Unit 4',
    details: 'Please clear the storage room.',
    consent: 'true',
    smsDisclosureVersion,
    token: '12345678-1234-1234-1234-123456789abc',
  }))
    form.set(key, value);
  return form;
}

void test('ordinary multipart fields retain values and produce the shared API contract', async () => {
  const form = fixture();
  form.set('quantity.mattresses', '2');
  form.set('offer', 'SPACE5');
  form.append(
    'photos',
    new File(['pixels'], 'photo.jpg', { type: 'image/jpeg' }),
  );
  form.append('photos', new File([], '', { type: 'application/octet-stream' }));
  form.set('coverage', 'approved');
  const request = new Request('https://bulkaway.example/request', {
    method: 'POST',
    headers: {
      origin: 'https://bulkaway.example',
      'x-forwarded-for': '192.0.2.1',
    },
    body: form,
  });
  const parsed = await readNativePickupForm(request.clone());
  const result = adaptNativePickup(parsed);
  assert.equal(validatePickup(result.input).ok, true);
  assert.equal(result.values.unit, 'Unit 4');
  assert.equal(result.input.details, 'Please clear the storage room.');
  assert.equal(result.input.offer, 'SPACE5');
  assert.deepEqual(result.input.items, [{ id: 'mattresses', quantity: 2 }]);
  assert.equal('coverage' in result.input, false);
  assert.equal(result.photoCount, 1);
  const apiRequest = nativePickupApiRequest(request, result);
  assert.equal(apiRequest.headers.get('idempotency-key'), result.token);
  assert.equal(apiRequest.headers.get('origin'), 'https://bulkaway.example');
  assert.equal(apiRequest.headers.get('x-forwarded-for'), '192.0.2.1');
  const envelope = await apiRequest.formData();
  assert.deepEqual(JSON.parse(envelope.get('request') as string), result.input);
  assert.equal(envelope.getAll('photos').length, 1);
});

void test('checkbox decoding never grants consent to nonempty false strings', () => {
  for (const value of ['false', '0', 'on', 'yes', '']) {
    const form = fixture();
    form.set('consent', value);
    form.set('smsConsent', value);
    const { input } = adaptNativePickup(form);
    assert.equal(input.consent, false);
    assert.equal(input.smsConsent, false);
    const validation = validatePickup(input);
    assert.equal(validation.ok, false);
    if (!validation.ok) assert.ok(validation.errors.consent);
  }
  const form = fixture();
  form.set('smsConsent', 'true');
  form.set('smsDisclosureVersion', 'outdated');
  const validation = validatePickup(adaptNativePickup(form).input);
  assert.equal(validation.ok, false);
  if (!validation.ok) assert.ok(validation.errors.smsConsent);
});

void test('optional quantities stay optional and malformed quantities reach shared field validation', () => {
  const optional = fixture();
  optional.set('quantity.furniture', '');
  assert.deepEqual(adaptNativePickup(optional).input.items, []);
  for (const quantity of ['0', '1000', '-1', '2.5', '2chairs', '1e2']) {
    const form = fixture();
    form.set('quantity.furniture', quantity);
    const validation = validatePickup(adaptNativePickup(form).input);
    assert.equal(validation.ok, false);
    if (!validation.ok) assert.ok(validation.errors.items);
  }
  const itemsOnly = fixture();
  itemsOnly.set('details', '');
  itemsOnly.set('quantity.boxes', '1');
  assert.equal(validatePickup(adaptNativePickup(itemsOnly).input).ok, true);
});

void test('rejects repeated scalar fields and files masquerading as text', () => {
  const duplicate = fixture();
  duplicate.append('consent', 'false');
  assert.throws(() => adaptNativePickup(duplicate), SyntaxError);
  const file = fixture();
  file.set('name', new File(['secret'], 'name.txt'));
  assert.throws(() => adaptNativePickup(file), SyntaxError);
});

void test('does not replace an absent or hostile caller origin with the website origin', () => {
  for (const origin of ['', 'https://attacker.example']) {
    const request = new Request('https://bulkaway.example/request', {
      headers: origin ? { origin } : {},
    });
    const apiRequest = nativePickupApiRequest(
      request,
      adaptNativePickup(fixture()),
    );
    assert.equal(apiRequest.headers.get('origin'), origin || null);
  }
});

void test('bounds oversized text and stops oversized streams before multipart parsing', async () => {
  const form = fixture();
  form.set('details', 'x'.repeat(20001));
  assert.throws(() => adaptNativePickup(form), PayloadTooLarge);
  let pulls = 0;
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) {
      pulls++;
      controller.enqueue(new Uint8Array(MAX_TOTAL_PHOTO_BYTES));
    },
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request('https://bulkaway.example/request', {
    method: 'POST',
    headers: { 'content-type': 'multipart/form-data; boundary=test' },
    body: stream,
    duplex: 'half',
  } as RequestInit);
  await assert.rejects(readNativePickupForm(request), PayloadTooLarge);
  assert.equal(cancelled, true);
  assert.ok(pulls <= 3);
});
