// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { action } from '@/app/routes/request';
import { POST } from '@/app/api/pickup/route';

const origin =
  process.env.SITE_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  'https://bulkaway.example';
function nativeRequest(ip: string, malformed = false) {
  const form = new FormData();
  form.set('name', 'Test Visitor');
  if (malformed) form.append('name', 'Duplicate');
  const request = new Request(`${origin}/request`, {
    method: 'POST',
    headers: { origin, 'x-forwarded-for': ip },
    body: form,
  });
  let bodyReads = 0;
  const body = request.body;
  Object.defineProperty(request, 'body', {
    get() {
      bodyReads++;
      return body;
    },
  });
  return { request, reads: () => bodyReads };
}
const submitNative = (request: Request) =>
  action({ request, params: {}, context: {} } as Parameters<typeof action>[0]);

describe('pickup request admission', () => {
  it('counts malformed native uploads and rejects the next request before reading its body', async () => {
    const ip = crypto.randomUUID();
    for (let count = 0; count < 5; count++) {
      expect(
        (await submitNative(nativeRequest(ip, true).request)).init?.status,
      ).toBe(400);
    }
    const blocked = nativeRequest(ip, true);
    expect((await submitNative(blocked.request)).init?.status).toBe(429);
    expect(blocked.reads()).toBe(0);
  });

  it('counts an ordinary native submission once across the native and API adapters', async () => {
    const ip = crypto.randomUUID();
    for (let count = 0; count < 5; count++) {
      expect((await submitNative(nativeRequest(ip).request)).init?.status).toBe(
        400,
      );
    }
    const blocked = nativeRequest(ip);
    expect((await submitNative(blocked.request)).init?.status).toBe(429);
    expect(blocked.reads()).toBe(0);
  });

  it('shares the five-attempt allowance with JSON requests without double counting', async () => {
    const ip = crypto.randomUUID();
    for (let count = 0; count < 5; count++) {
      const response = await POST(
        new Request(`${origin}/api/pickup`, {
          method: 'POST',
          headers: {
            origin,
            'x-forwarded-for': ip,
            'content-type': 'application/json',
          },
          body: '{}',
        }),
      );
      expect(response.status).toBe(400);
    }
    const blocked = nativeRequest(ip);
    expect((await submitNative(blocked.request)).init?.status).toBe(429);
    expect(blocked.reads()).toBe(0);
  });
});
