import { randomUUID } from 'node:crypto';
import {
  Form,
  Link,
  data,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router';
import { processAdmittedPickup } from '../api/pickup/route';
import {
  admitPickupRequest,
  pickupRateLimitMessage,
} from '@/lib/pickup-admission';
import { haulItems } from '@/lib/haul-guide';
import {
  serviceNames,
  smsConsentText,
  smsDisclosureVersion,
  pickupToday,
} from '@/lib/pickup';
import { serviceNameFromId } from '@/lib/service-links';
import { SERVICE_AREA_MESSAGE } from '@/lib/service-area';
import {
  adaptNativePickup,
  nativePickupApiRequest,
  nativePickupValues,
  readNativePickupForm,
  type NativePickupValues,
} from '@/lib/native-pickup';
import {
  createPickupReceipt,
  PickupDeliveryError,
  pickupFailureMessage,
  readPickupResponse,
  type PickupReceipt,
} from '@/lib/pickup-feedback';
import { PayloadTooLarge } from '@/lib/read-json';
import { routeMeta, type PageMetadata } from '@/lib/page-metadata';

export const handle = {
  metadata: {
    title: 'Request a Pickup | Bulk Away',
    description:
      'Request junk removal, bulk pickup, or a trash out in Salt Lake, Utah, Davis, and Weber counties. Tell the Bulk Away crew what needs to go.',
    alternates: { canonical: '/request' },
    robots: { index: false, follow: true },
  } satisfies PageMetadata,
};

export const meta = routeMeta(handle.metadata);

const privateHeaders = { 'Cache-Control': 'no-store' };
export const headers = () => privateHeaders;

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return data(
    {
      token: randomUUID(),
      today: pickupToday(),
      service: serviceNameFromId(url.searchParams.get('service') || '') || '',
      offer: url.searchParams.get('offer') === 'SPACE5' ? 'SPACE5' : '',
    },
    { headers: privateHeaders },
  );
}

type ActionResult = {
  values: NativePickupValues;
  error?: string;
  errors?: Record<string, string>;
  receipt?: PickupReceipt;
  reference?: string;
  confirmation?: 'sent' | 'unconfirmed';
};

export async function action({ request }: ActionFunctionArgs) {
  let values: NativePickupValues = {};
  const respond = (result: ActionResult, status = 200) =>
    data(result, { status, headers: privateHeaders });
  const trustedOrigin = (
    process.env.SITE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    new URL(request.url).origin
  ).replace(/\/$/, '');
  if (request.headers.get('origin') !== trustedOrigin)
    return respond(
      {
        values,
        error: 'Please submit your request from the Bulk Away website.',
      },
      403,
    );
  if (request.method !== 'POST')
    return respond(
      { values, error: 'Please submit the pickup request form.' },
      405,
    );
  if (!admitPickupRequest(request))
    return respond({ values, error: pickupRateLimitMessage }, 429);
  try {
    const form = await readNativePickupForm(request);
    values = nativePickupValues(form);
    const submission = adaptNativePickup(form);
    const response = await processAdmittedPickup(
      nativePickupApiRequest(request, submission),
    );
    try {
      const accepted = await readPickupResponse(response);
      return respond({
        values: {},
        ...accepted,
        receipt: createPickupReceipt(submission.input, submission.photoCount),
      });
    } catch (error) {
      return respond(
        {
          values,
          error: pickupFailureMessage(error),
          errors: error instanceof PickupDeliveryError ? error.fields : {},
        },
        response.ok ? 503 : response.status,
      );
    }
  } catch (error) {
    if (error instanceof PayloadTooLarge)
      return respond(
        {
          values,
          error:
            'Your request is too large. Keep photos under 10 MB combined and shorten any lengthy details.',
        },
        413,
      );
    return respond(
      {
        values,
        error:
          error instanceof SyntaxError || error instanceof TypeError
            ? 'We couldn’t read your request. Please check the form and try again.'
            : pickupFailureMessage(error),
      },
      error instanceof SyntaxError || error instanceof TypeError ? 400 : 503,
    );
  }
}

export default function NativePickupRequest() {
  const initial = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const pending = navigation.state === 'submitting';
  const values = result?.values || {};
  const errors = result?.errors || {};
  const value = (name: string) => values[name] ?? '';
  const describedBy = (name: string, hint?: string) =>
    [hint, errors[name] ? `native-${name}-error` : '']
      .filter(Boolean)
      .join(' ') || undefined;
  const fieldError = (name: string) =>
    errors[name] ? (
      <span id={`native-${name}-error`} className="field-error">
        {errors[name]}
      </span>
    ) : null;
  const fieldProps = (name: string, hint?: string) => ({
    id: `native-${name}`,
    name,
    defaultValue: value(name),
    'aria-invalid': !!errors[name],
    'aria-describedby': describedBy(name, hint),
  });

  return (
    <main
      id="main"
      tabIndex={-1}
      className="section"
      style={{ maxWidth: 850, margin: '0 auto', padding: '64px 20px' }}
      aria-labelledby="native-request-title"
    >
      <p className="eyebrow">Let’s clear some space</p>
      <h1
        id="native-request-title"
        style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}
      >
        Request a pickup.
      </h1>
      {result?.receipt ? (
        <section
          aria-live="polite"
          aria-label="Pickup request receipt"
          className="pickup-form"
          style={{ color: 'var(--cream)', marginTop: 24, display: 'block' }}
        >
          <h2>We received your request.</h2>
          <p>
            Reference: <strong>{result.reference}</strong>
          </p>
          <p>
            The crew will contact you to confirm the price, pickup date, and
            next steps. Your pickup isn’t booked yet.
          </p>
          <p>
            {result.confirmation === 'sent'
              ? 'A confirmation email is on its way.'
              : 'Your request reached the crew, but we couldn’t confirm your email copy. Keep this reference; there’s no need to submit again.'}
          </p>
          <dl style={{ display: 'grid', gap: 12, marginTop: 24 }}>
            <div>
              <dt>Service</dt>
              <dd>{result.receipt.service}</dd>
            </div>
            <div>
              <dt>Pickup address</dt>
              <dd>{result.receipt.address}</dd>
            </div>
            <div>
              <dt>Preferred date (not confirmed)</dt>
              <dd>{result.receipt.date}</dd>
            </div>
            {result.receipt.items && (
              <div>
                <dt>Items</dt>
                <dd style={{ whiteSpace: 'pre-line' }}>
                  {result.receipt.items}
                </dd>
              </div>
            )}
            {result.receipt.details && (
              <div>
                <dt>Details</dt>
                <dd
                  style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                >
                  {result.receipt.details}
                </dd>
              </div>
            )}
            <div>
              <dt>Photos received</dt>
              <dd>{result.receipt.photoCount}</dd>
            </div>
            {result.receipt.offer && (
              <div>
                <dt>Offer</dt>
                <dd>{result.receipt.offer}</dd>
              </div>
            )}
          </dl>
          <p style={{ marginTop: 24 }}>
            Need to update your request? Call{' '}
            <a href="tel:+18016027705" style={{ textDecoration: 'underline' }}>
              (801) 602-7705
            </a>{' '}
            or email{' '}
            <a
              href="mailto:service@bulkaway.com"
              style={{ textDecoration: 'underline' }}
            >
              service@bulkaway.com
            </a>
            .
          </p>
        </section>
      ) : (
        <>
          <p>
            Tell us what needs to go and where to find it. We’ll follow up with
            pricing and availability.
          </p>
          <Form
            method="post"
            action="/request"
            encType="multipart/form-data"
            className="pickup-form"
            style={{ color: 'var(--cream)', marginTop: 24 }}
          >
            <input
              type="hidden"
              name="token"
              value={values.token || initial.token}
            />
            <input
              type="hidden"
              name="smsDisclosureVersion"
              value={smsDisclosureVersion}
            />
            <input
              type="hidden"
              name="offer"
              value={values.offer ?? initial.offer}
            />
            <div aria-hidden="true" style={{ display: 'none' }}>
              <label>
                Website
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue={value('website')}
                />
              </label>
            </div>
            {result?.error && (
              <div
                role="alert"
                tabIndex={-1}
                id="native-errors"
                style={{ marginBottom: 24 }}
              >
                <h2 style={{ fontSize: '1.3rem' }}>
                  Please check your request.
                </h2>
                <p>{result.error}</p>
                {!!Object.keys(errors).length && (
                  <ul style={{ paddingLeft: 20 }}>
                    {Object.entries(errors).map(([name, message]) => (
                      <li key={name}>
                        <a
                          href={`#${name === 'form' ? 'native-errors' : `native-${name}`}`}
                          style={{ textDecoration: 'underline' }}
                        >
                          {message}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <p>
                  If you added photos, please choose them again before
                  resubmitting.
                </p>
                <p>
                  You can also call{' '}
                  <a
                    href="tel:+18016027705"
                    style={{ textDecoration: 'underline' }}
                  >
                    (801) 602-7705
                  </a>
                  .
                </p>
              </div>
            )}
            <div className="form-grid">
              <label className="field full" htmlFor="native-service">
                Service
                <select
                  {...fieldProps('service')}
                  defaultValue={values.service ?? initial.service}
                  required
                >
                  <option value="">Choose a service</option>
                  {serviceNames.map((service) => (
                    <option key={service}>{service}</option>
                  ))}
                </select>
                {fieldError('service')}
              </label>
              <fieldset
                className="field full"
                id="native-items"
                aria-describedby={describedBy('items', 'native-items-hint')}
              >
                <legend>Items and quantities (optional)</legend>
                <p id="native-items-hint">
                  Enter a quantity for each item, or leave these blank and
                  describe your pickup below.
                </p>
                <div className="form-grid">
                  {haulItems.map(({ id, label }) => (
                    <label
                      className="field"
                      key={id}
                      htmlFor={`native-quantity-${id}`}
                    >
                      {label}
                      <input
                        id={`native-quantity-${id}`}
                        name={`quantity.${id}`}
                        type="number"
                        min={1}
                        max={999}
                        step={1}
                        inputMode="numeric"
                        defaultValue={value(`quantity.${id}`)}
                        aria-invalid={!!errors.items}
                        aria-describedby={describedBy('items')}
                      />
                    </label>
                  ))}
                </div>
                {fieldError('items')}
              </fieldset>
              <label className="field full" htmlFor="native-details">
                What needs to go?
                <textarea
                  {...fieldProps('details', 'native-details-hint')}
                  maxLength={4000}
                  rows={4}
                />
                <small id="native-details-hint">
                  Describe the items, access, stairs, or anything the crew
                  should know. At least 10 characters if you haven’t entered
                  item quantities.
                </small>
                {fieldError('details')}
              </label>
              <label className="field full" htmlFor="native-photos">
                Photos (optional)
                <input
                  id="native-photos"
                  name="photos"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  aria-invalid={!!errors.photos}
                  aria-describedby={describedBy('photos', 'native-photos-hint')}
                />
                <small id="native-photos-hint">
                  Up to 5 JPG, PNG, or WebP photos. Maximum 5 MB each and 10 MB
                  combined.
                </small>
                {fieldError('photos')}
              </label>
              <label className="field full" htmlFor="native-address">
                Full Utah pickup address
                <input
                  {...fieldProps('address', 'native-address-hint')}
                  required
                  maxLength={300}
                  autoComplete="street-address"
                  placeholder="123 Main St, Salt Lake City, UT 84101"
                />
                <small id="native-address-hint">
                  Include street number, street, city, UT, and ZIP code.{' '}
                  {SERVICE_AREA_MESSAGE} We verify the address before accepting
                  your request.
                </small>
                {fieldError('address')}
              </label>
              <label className="field" htmlFor="native-unit">
                Apartment, unit, or building (optional)
                <input
                  {...fieldProps('unit')}
                  maxLength={100}
                  autoComplete="address-line2"
                />
                {fieldError('unit')}
              </label>
              <label className="field" htmlFor="native-date">
                Preferred date (optional)
                <input
                  {...fieldProps('date')}
                  type="date"
                  min={initial.today}
                />
                {fieldError('date')}
              </label>
              <label className="field full" htmlFor="native-name">
                Your name
                <input
                  {...fieldProps('name')}
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                />
                {fieldError('name')}
              </label>
              <label className="field" htmlFor="native-phone">
                Phone number
                <input
                  {...fieldProps('phone')}
                  required
                  type="tel"
                  maxLength={30}
                  autoComplete="tel"
                />
                {fieldError('phone')}
              </label>
              <label className="field" htmlFor="native-email">
                Email address
                <input
                  {...fieldProps('email')}
                  required
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                />
                {fieldError('email')}
              </label>
            </div>
            <div className="form-consent">
              <label className="consent-checkbox" htmlFor="native-consent">
                <input
                  id="native-consent"
                  name="consent"
                  type="checkbox"
                  value="true"
                  defaultChecked={value('consent') === 'true'}
                  required
                  aria-invalid={!!errors.consent}
                  aria-describedby={describedBy('consent')}
                />
                I agree to be contacted by phone or email about this pickup
                request.
              </label>
              {fieldError('consent')} <Link to="/privacy">Privacy policy</Link>
            </div>
            <fieldset className="sms-consent">
              <legend>Text updates (optional)</legend>
              <p className="sms-coming">
                SMS is coming soon. This records your preference; it does not
                activate text messages.
              </p>
              <label
                className="form-consent consent-checkbox"
                htmlFor="native-smsConsent"
              >
                <input
                  id="native-smsConsent"
                  name="smsConsent"
                  type="checkbox"
                  value="true"
                  defaultChecked={value('smsConsent') === 'true'}
                  aria-invalid={!!errors.smsConsent}
                  aria-describedby={describedBy('smsConsent')}
                />
                {smsConsentText}
              </label>
              {fieldError('smsConsent')}
              <p>
                <Link to="/sms">SMS terms</Link> and{' '}
                <Link to="/privacy#sms-privacy">SMS privacy</Link>
              </p>
            </fieldset>
            <p className="form-consent">
              Your preferred date is a request. The crew will confirm the price
              and schedule with you.
            </p>
            <button
              type="submit"
              className="form-submit"
              data-slot="button"
              disabled={pending}
            >
              {pending ? 'Sending your request…' : 'Send pickup request'}
            </button>
          </Form>
        </>
      )}
    </main>
  );
}
