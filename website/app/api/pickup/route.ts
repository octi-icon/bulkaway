import { validatePickup } from '@/lib/pickup';
import { sendPickup, type MailConfig } from '@/lib/mail';
import { PayloadTooLarge } from '@/lib/read-json';
import {
  readPickupRequest,
  preparePhotos,
  PhotoError,
  type PhotoAttachment,
} from '@/lib/photos';
import { createHash } from 'node:crypto';
const requests = new Map<string, { time: number; attempts: number }>();
const deliveries = new Map<
  string,
  { time: number; payload: string; result: Promise<string> }
>();
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const trustedOrigin = (
    process.env.SITE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    new URL(request.url).origin
  ).replace(/\/$/, '');
  if (!origin || origin !== trustedOrigin)
    return json(
      { error: 'Please submit your request from the Bulk Away website.' },
      403,
    );
  if (
    !/^(application\/json|multipart\/form-data)(;|$)/.test(
      request.headers.get('content-type') || '',
    )
  )
    return json({ error: 'Unsupported request format.' }, 415);
  const now = Date.now();
  for (const [key, value] of requests)
    if (now - value.time > 900000) requests.delete(key);
  for (const [key, value] of deliveries)
    if (now - value.time > 3600000) deliveries.delete(key);
  const ip =
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
    'local';
  const count = requests.get(ip) || { time: now, attempts: 0 };
  if (count.attempts >= 5)
    return json(
      {
        error:
          'A few requests have come through already. Please wait 15 minutes or contact the crew directly.',
      },
      429,
    );
  count.attempts++;
  requests.set(ip, count);
  if (requests.size > 10000) requests.delete(requests.keys().next().value!);
  let input: unknown;
  let files: File[];
  try {
    ({ input, files } = await readPickupRequest(request));
  } catch (error) {
    if (error instanceof PayloadTooLarge)
      return json(
        {
          error:
            'Your request is too large. Keep photos under 10 MB combined and shorten any lengthy details.',
        },
        413,
      );
    if (error instanceof PhotoError)
      return json(
        { error: error.message, errors: { photos: error.message } },
        400,
      );
    return json(
      { error: 'We couldn’t read your request. Please try again.' },
      400,
    );
  }
  const validation = validatePickup(input);
  if (!validation.ok)
    return json(
      {
        error: 'Please check the highlighted fields.',
        errors: validation.errors,
      },
      400,
    );
  const key = request.headers.get('idempotency-key');
  if (!key || !/^[a-f0-9-]{36}$/i.test(key))
    return json({ error: 'Please reload the page and try again.' }, 400);
  let photos: PhotoAttachment[];
  try {
    photos = await preparePhotos(files);
  } catch (error) {
    const message =
      error instanceof PhotoError
        ? error.message
        : 'We couldn’t prepare your photos. Please try again.';
    return json({ error: message, errors: { photos: message } }, 400);
  }
  const fingerprint = createHash('sha256').update(
    JSON.stringify(validation.data),
  );
  for (const photo of photos) fingerprint.update(photo.content);
  const payload = fingerprint.digest('hex');
  const previous = deliveries.get(key);
  if (previous && previous.payload !== payload)
    return json(
      {
        error:
          'Your previous request is already being processed. Please call the crew to update it.',
      },
      409,
    );
  if (!previous) {
    if (deliveries.size > 1000)
      return json(
        {
          error:
            'We’re handling a lot of requests. Please contact the crew directly.',
        },
        503,
      );
    const reference = `BA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    deliveries.set(key, {
      time: now,
      payload,
      result: sendPickup(
        validation.data,
        reference,
        process.env as MailConfig,
        photos,
      ).then(() => reference),
    });
  }
  try {
    const reference = await deliveries.get(key)!.result;
    return json({ reference });
  } catch {
    return json(
      {
        error:
          'We couldn’t confirm email delivery. Please contact the crew directly so we don’t duplicate your request.',
      },
      503,
    );
  }
}
