// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router';
import NativePickupRequest, { action, loader } from '@/app/routes/request';
import { smsDisclosureVersion } from '@/lib/pickup';
import type { PickupMessage } from '@/lib/pickup-delivery';

const smtp = vi.hoisted(() => ({ sendMail: vi.fn(), close: vi.fn() }));
vi.mock('nodemailer', () => ({ default: { createTransport: () => smtp } }));

const origin = 'https://bulkaway.example';
const customer = 'native-test@example.com';
let geocode: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubEnv('SITE_URL', origin);
  vi.stubEnv('GOOGLE_MAPS_SERVER_KEY', 'fixture-only');
  vi.stubEnv('SMTP_PASS', 'fixture-only');
  smtp.sendMail.mockReset();
  smtp.close.mockReset();
  smtp.sendMail.mockImplementation(async (message: PickupMessage) => ({
    accepted: [message.to],
    rejected: [],
  }));
  geocode = vi.fn(async (url: string) => {
    expect(new URL(url).origin).toBe('https://maps.googleapis.com');
    expect(new URL(url).searchParams.get('address')).toBe(
      '123 Example Street, Salt Lake City, UT 84101',
    );
    return Response.json({
      status: 'OK',
      results: [
        {
          types: ['street_address'],
          address_components: [
            { long_name: '123', short_name: '123', types: ['street_number'] },
            {
              long_name: 'Example Street',
              short_name: 'Example St',
              types: ['route'],
            },
            { long_name: '84101', short_name: '84101', types: ['postal_code'] },
            {
              long_name: 'Salt Lake County',
              short_name: 'Salt Lake County',
              types: ['administrative_area_level_2'],
            },
            {
              long_name: 'Utah',
              short_name: 'UT',
              types: ['administrative_area_level_1'],
            },
            {
              long_name: 'United States',
              short_name: 'US',
              types: ['country'],
            },
          ],
        },
      ],
    });
  });
  vi.stubGlobal('fetch', geocode);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function submission(token: string, furniture = '3') {
  const form = new FormData();
  for (const [name, value] of Object.entries({
    token,
    name: 'Native Test Visitor',
    email: customer,
    phone: '8015550100',
    service: 'Trash outs',
    address: '123 Example Street, Salt Lake City, UT 84101',
    unit: 'Unit 4',
    details: 'Please clear the spare room.',
    date: '',
    consent: 'true',
    smsConsent: 'true',
    smsDisclosureVersion,
    offer: 'SPACE5',
    'quantity.furniture': furniture,
    'quantity.mattresses': '2',
  }))
    form.set(name, value);
  return new Request(`${origin}/request`, {
    method: 'POST',
    headers: { origin, 'x-forwarded-for': token },
    body: form,
  });
}

const submit = (request: Request) =>
  action({ request, params: {}, context: {} } as Parameters<typeof action>[0]);
function initialToken() {
  return loader({
    request: new Request(`${origin}/request`),
    params: {},
    context: {},
  } as Parameters<typeof loader>[0]).data.token;
}

test('native server submission renders its receipt and deduplicates retries under the loader token', async () => {
  const token = initialToken();
  expect(token).toMatch(/^[a-f0-9-]{36}$/i);
  const routes = [
    {
      id: 'request',
      path: '/request',
      loader,
      action,
      Component: NativePickupRequest,
    },
  ];
  const handler = createStaticHandler(routes);
  const context = await handler.query(submission(token));
  if (context instanceof Response)
    throw new Error(`Unexpected redirect: ${context.status}`);
  expect(context.statusCode).toBe(200);
  const receipt = context.actionData?.request;
  expect(receipt).toMatchObject({
    values: {},
    confirmation: 'sent',
    reference: expect.stringMatching(/^BA-[A-F0-9]{8}$/),
    receipt: {
      service: 'Trash outs',
      items: '3 × Furniture\n2 × Mattresses',
      address: expect.stringContaining('Unit 4'),
      details: 'Please clear the spare room.',
      photoCount: 0,
      date: 'Flexible — arrange with the crew',
      offer: 'SPACE5 — 5% off your next removal',
    },
  });
  expect(context.actionHeaders.request.get('Cache-Control')).toBe('no-store');
  const html = renderToString(
    createElement(StaticRouterProvider, {
      router: createStaticRouter(handler.dataRoutes, context),
      context,
    }),
  );
  expect(html).toContain('We received your request.');
  expect(html).toContain(receipt.reference);
  expect(html).toContain('A confirmation email is on its way.');
  expect(html).toContain('3 × Furniture');
  expect(html).toContain('2 × Mattresses');
  expect(html).not.toContain('name="token"');

  const retries = await Promise.all([
    submit(submission(token)),
    submit(submission(token)),
  ]);
  for (const retry of retries) {
    expect(retry.init?.status).toBe(200);
    expect(retry.data).toEqual(receipt);
  }
  expect(geocode).toHaveBeenCalledTimes(1);
  expect(smtp.sendMail).toHaveBeenCalledTimes(2);
  const [crew, customerCopy] = smtp.sendMail.mock.calls.map(
    ([message]) => message as PickupMessage,
  );
  expect(crew.to).toBe('service@bulkaway.com');
  expect(customerCopy.to).toBe(customer);
  expect(crew.text).toContain(receipt.reference);
  expect(crew.text).toContain('SMS opt-in: Yes');
  expect(customerCopy.text).toContain(receipt.reference);

  const changed = await submit(submission(token, '4'));
  expect(changed.init?.status).toBe(409);
  expect(changed.data.receipt).toBeUndefined();
  expect(smtp.sendMail).toHaveBeenCalledTimes(2);
});

test('customer email failure keeps the accepted receipt and does not resend the crew request', async () => {
  smtp.sendMail.mockImplementation(async (message: PickupMessage) => {
    if (message.to === customer)
      throw new Error('Synthetic customer mail failure');
    return { accepted: [message.to], rejected: [] };
  });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const token = initialToken();
  const first = await submit(submission(token));
  expect(first.init?.status).toBe(200);
  expect(first.data.confirmation).toBe('unconfirmed');
  expect(first.data.reference).toMatch(/^BA-[A-F0-9]{8}$/);
  expect(first.data.receipt?.items).toBe('3 × Furniture\n2 × Mattresses');
  const retry = await submit(submission(token));
  expect(retry.data).toEqual(first.data);
  const handler = createStaticHandler([
    {
      id: 'request',
      path: '/request',
      loader,
      action,
      Component: NativePickupRequest,
    },
  ]);
  const context = await handler.query(submission(token));
  if (context instanceof Response)
    throw new Error(`Unexpected redirect: ${context.status}`);
  const html = renderToString(
    createElement(StaticRouterProvider, {
      router: createStaticRouter(handler.dataRoutes, context),
      context,
    }),
  );
  expect(html).toContain('We received your request.');
  expect(html).toContain(
    'Your request reached the crew, but we couldn’t confirm your email copy.',
  );
  expect(html).toContain('there’s no need to submit again.');
  expect(geocode).toHaveBeenCalledTimes(1);
  expect(smtp.sendMail).toHaveBeenCalledTimes(2);
});
