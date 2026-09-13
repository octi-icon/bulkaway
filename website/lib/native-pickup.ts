import { haulItems } from './haul-guide.ts';
import { MAX_TOTAL_PHOTO_BYTES } from './photo-limits.ts';
import { PayloadTooLarge, readBoundedBytes } from './read-json.ts';

const textFields = [
  'name',
  'email',
  'phone',
  'service',
  'address',
  'unit',
  'date',
  'details',
  'consent',
  'smsConsent',
  'smsDisclosureVersion',
  'offer',
  'website',
  'token',
  ...haulItems.map(({ id }) => `quantity.${id}`),
] as const;

export type NativePickupValues = Record<string, string>;

export async function readNativePickupForm(
  request: Request,
): Promise<FormData> {
  const type = request.headers.get('content-type') || '';
  if (!type.startsWith('multipart/form-data;'))
    throw new SyntaxError('Unsupported request format');
  // Bound the incoming stream before the multipart parser allocates files/fields.
  const bytes = await readBoundedBytes(request, MAX_TOTAL_PHOTO_BYTES + 100000);
  return new Response(bytes, { headers: { 'Content-Type': type } }).formData();
}

export function nativePickupValues(form: FormData): NativePickupValues {
  const values = Object.fromEntries(
    textFields.map((key) => {
      const value = form.get(key);
      return [key, typeof value === 'string' ? value : ''];
    }),
  );
  if (new TextEncoder().encode(JSON.stringify(values)).byteLength > 20000)
    throw new PayloadTooLarge();
  return values;
}

export function adaptNativePickup(form: FormData) {
  const values = nativePickupValues(form);
  // A repeated scalar or a file in a text field is malformed, not an arbitrary
  // first/last value. Photos alone may repeat. Ignore unrecognized client claims.
  for (const key of textFields) {
    const entries = form.getAll(key);
    if (
      entries.length > 1 ||
      entries.some((value) => typeof value !== 'string')
    )
      throw new SyntaxError('Invalid request fields');
  }
  const items = haulItems.flatMap(({ id }) => {
    const quantity = values[`quantity.${id}`].trim();
    if (!quantity) return [];
    // The shared validator reports invalid integers; never round or parse a prefix.
    return [
      { id, quantity: /^\d{1,3}$/.test(quantity) ? Number(quantity) : null },
    ];
  });
  const input = {
    name: values.name,
    email: values.email,
    phone: values.phone,
    service: values.service,
    address: values.address,
    unit: values.unit,
    date: values.date,
    details: values.details,
    items,
    consent: values.consent === 'true',
    smsConsent: values.smsConsent === 'true',
    smsDisclosureVersion: values.smsDisclosureVersion,
    offer: values.offer,
    website: values.website,
  };
  const body = new FormData();
  body.set('request', JSON.stringify(input));
  let photoCount = 0;
  for (const photo of form.getAll('photos')) {
    // An untouched upload is an empty File; Node's multipart parser can decode
    // that empty filename as an empty text entry instead.
    if (photo === '' || (photo instanceof File && !photo.name && !photo.size))
      continue;
    body.append('photos', photo);
    photoCount++;
  }
  return { values, input, body, photoCount, token: values.token };
}

export function nativePickupApiRequest(
  request: Request,
  submission: ReturnType<typeof adaptNativePickup>,
) {
  const headers = new Headers();
  for (const name of ['origin', 'x-forwarded-for']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('idempotency-key', submission.token);
  // Preserve the caller's origin for the API's origin check. Do not manufacture
  // a trusted origin or copy the old multipart boundary/content length.
  return new Request(new URL('/api/pickup', request.url), {
    method: 'POST',
    headers,
    body: submission.body,
  });
}
