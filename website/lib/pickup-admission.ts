const requests = new Map<string, { time: number; attempts: number }>();

export const pickupRateLimitMessage =
  'A few requests have come through already. Please wait 15 minutes or contact the crew directly.';

/** Both HTTP adapters call this once, before reading or parsing the body. */
export function admitPickupRequest(request: Request): boolean {
  const now = Date.now();
  for (const [key, value] of requests)
    if (now - value.time > 900000) requests.delete(key);
  const ip =
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
    'local';
  const count = requests.get(ip) || { time: now, attempts: 0 };
  if (count.attempts >= 5) return false;
  count.attempts++;
  requests.set(ip, count);
  if (requests.size > 10000) requests.delete(requests.keys().next().value!);
  return true;
}
