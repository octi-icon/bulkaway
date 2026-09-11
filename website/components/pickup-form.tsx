'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SubmitEvent,
} from 'react';
import { ArrowUpRight, LoaderCircle, ChevronDown, Camera } from 'lucide-react';
import { SubmissionSparkle } from '@/components/atomic-experience';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/photo-upload';
import { AddressSelector } from '@/components/address-selector';
import { formatPickupAddress } from '@/lib/pickup-address';
import { formatHaulItems, validateHaulItems } from '@/lib/haul-guide';
import { HaulItemPicker, useHaulList } from '@/components/haul-list';
import { serviceNotesHint } from '@/lib/service-guide';
import {
  createPickupReceipt,
  readPickupResponse,
  pickupFailureMessage,
  PickupDeliveryError,
  type PickupReceipt,
} from '@/lib/pickup-feedback';
import {
  ServiceSelector,
  PickupDateSelector,
} from '@/components/pickup-selectors';
import {
  validatePickupStep,
  pickupErrorStep,
  smsConsentText,
  smsDisclosureVersion,
  pickupToday,
} from '@/lib/pickup';

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function PickupForm({ googleMapsKey = '' }: { googleMapsKey?: string }) {
  const [arcadeOffer, setArcadeOffer] = useState('');
  useEffect(() => {
    const applyArcadeOffer = () => setArcadeOffer('SPACE5');
    window.addEventListener('bulk-away:arcade-offer', applyArcadeOffer);
    const frame = requestAnimationFrame(() => {
      if (new URL(window.location.href).searchParams.get('offer') === 'SPACE5')
        setArcadeOffer('SPACE5');
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('bulk-away:arcade-offer', applyArcadeOffer);
    };
  }, []);
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const [receipt, setReceipt] = useState<PickupReceipt | null>(null);
  const { items, setItems, setLocked, setRequestStarted, setRequestComplete } =
    useHaulList();
  const [service, setService] = useState('');
  const [addressResolving, setAddressResolving] = useState(false);
  const [step, setStep] = useState(0);
  const [reviewEdit, setReviewEdit] = useState(false);
  const [smsSelected, setSmsSelected] = useState(false);
  const itemDisclosure = useRef<HTMLDetailsElement>(null);
  const [review, setReview] = useState<Record<string, string>>({});
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusNextStep = useRef(false);
  const stepTitles = [
    'What’s going?',
    'Where & when?',
    'Let’s make it happen.',
  ];
  const stepLabels = ['The stuff', 'The pickup', 'Your details'];
  function goToStep(next: number, editing = false) {
    setReviewEdit(editing);
    focusNextStep.current = true;
    setStep(next);
  }
  useEffect(() => {
    if (focusNextStep.current) {
      stepHeadingRef.current?.focus();
      focusNextStep.current = false;
    }
  }, [step]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    // A failed validation must reveal its field before focus moves to it.
    formRef.current
      ?.querySelectorAll('[aria-invalid="true"]')
      .forEach((field) => {
        let disclosure = field.closest('details');
        while (disclosure) {
          disclosure.open = true;
          disclosure = disclosure.parentElement?.closest('details') || null;
        }
      });
  }, [errors]);
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'error' | 'success'
  >('idle');
  useEffect(() => {
    if (items.length && itemDisclosure.current) {
      itemDisclosure.current.open = true;
      // Selecting a haul item can satisfy an earlier missing-description error.
      const details =
        formRef.current?.querySelector<HTMLTextAreaElement>('#pickup-details');
      if (
        !validateHaulItems(items).error &&
        (details?.value.trim().length ?? 0) <= 4000
      ) {
        setErrors((current) => {
          if (!current.details) return current;
          const next = { ...current };
          delete next.details;
          return next;
        });
      }
    }
  }, [items, status]);
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [haulMessage, setHaulMessage] = useState('');
  const [minimumDate, setMinimumDate] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const requestId = useRef<string>('');
  const startFreshRequest = useCallback(() => {
    setStatus('idle');
    setReceipt(null);
    setReference('');
    setService('');
    setRequestStarted(false);
    setRequestComplete(false);
    setStep(0);
    setReview({});
    setReviewEdit(false);
    setSmsSelected(false);
    setPhotos([]);
    setMessage('');
    setHaulMessage('');
    setErrors({});
    requestId.current = '';
    focusNextStep.current = true;
  }, [setRequestStarted, setRequestComplete]);
  useEffect(() => {
    const refreshMinimumDate = () => setMinimumDate(pickupToday());
    const frame = requestAnimationFrame(refreshMinimumDate);
    // Recheck a draft left open overnight, including when its tab is revisited.
    const timer = window.setInterval(refreshMinimumDate, 60000);
    window.addEventListener('focus', refreshMinimumDate);
    const selectService = (event: Event) => {
      if (status === 'sending') return;
      if (status === 'success') startFreshRequest();
      setService((event as CustomEvent<string>).detail);
      setRequestStarted(true);
      setRequestComplete(false);
      setStep(0);
      setReviewEdit(false);
      setStatus('idle');
    };
    window.addEventListener('bulk-service', selectService);
    const addItems = (event: Event) => {
      if (status === 'sending') return;
      event.preventDefault();
      if (status === 'success') startFreshRequest();
      setRequestStarted(true);
      setRequestComplete(false);
      setService((current) => current || 'Bulk item removal');
      setHaulMessage(
        'Your list is here. Adjust items and quantities below, then add any extra details.',
      );
      setStep(0);
      setReviewEdit(false);
      if (itemDisclosure.current) itemDisclosure.current.open = true;
      setStatus('idle');
      requestAnimationFrame(() =>
        stepHeadingRef.current?.focus({ preventScroll: true }),
      );
    };
    window.addEventListener('bulk-items', addItems);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshMinimumDate);
      window.removeEventListener('bulk-service', selectService);
      window.removeEventListener('bulk-items', addItems);
    };
  }, [status, setRequestStarted, setRequestComplete, startFreshRequest]);
  useEffect(() => {
    if (status === 'success' || status === 'error') statusRef.current?.focus();
  }, [status]);
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending' || addressResolving) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const input = {
      ...values,
      offer: arcadeOffer,
      items,
      consent: values.consent === 'on',
      smsConsent: values.smsConsent === 'on',
      smsDisclosureVersion,
    };
    const stepErrors = validatePickupStep(input, step);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      setStep(pickupErrorStep(stepErrors));
      setTimeout(
        () =>
          formRef.current
            ?.querySelector<HTMLElement>(
              '.pickup-step:not([hidden]) [aria-invalid=true]',
            )
            ?.focus(),
        0,
      );
      return;
    }
    setErrors({});
    setReview(
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          typeof value === 'string' ? value : '',
        ]),
      ),
    );
    if (step < 2) {
      goToStep(reviewEdit ? 2 : step + 1);
      return;
    }
    setStatus('sending');
    setLocked(true);
    setMessage('');
    const submittedReceipt = createPickupReceipt(input, photos.length);
    requestId.current ||= crypto.randomUUID();
    try {
      const body = new FormData();
      body.append('request', JSON.stringify(input));
      for (const photo of photos) body.append('photos', photo);
      const response = await fetch('/api/pickup', {
        method: 'POST',
        headers: {
          'Idempotency-Key': requestId.current,
        },
        body,
        signal: AbortSignal.timeout(35000),
      });
      const confirmedReference = await readPickupResponse(response);
      setReference(confirmedReference);
      setReceipt(submittedReceipt);
      setStatus('success');
      // The receipt owns its submitted snapshot. The shared list is now free
      // for a different pickup, without reusing the last request's quantities.
      setItems([]);
      setRequestComplete(true);
      setPhotos([]);
      requestId.current = '';
    } catch (error) {
      if (
        error instanceof PickupDeliveryError &&
        Object.keys(error.fields).length
      ) {
        setErrors(error.fields);
        setStep(pickupErrorStep(error.fields));
      }
      setStatus('error');
      setMessage(pickupFailureMessage(error));
    } finally {
      setLocked(false);
    }
  }
  function fieldError(name: string) {
    return errors[name] ? (
      <span id={`${name}-error`} className="field-error">
        {errors[name]}
      </span>
    ) : null;
  }
  const errorProps = (name: string) => ({
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });
  return (
    <div className="pickup-form" id="pickup-request" tabIndex={-1}>
      {!ready && (
        <output className="form-loading">
          Getting your request form ready. Need a hand?{' '}
          <a href="tel:+18016027705">Call the crew</a> or{' '}
          <a href="mailto:service@bulkaway.com">email us</a>.
        </output>
      )}
      <noscript>
        <style>{`.pickup-form form, .pickup-form .form-loading { display: none; }`}</style>
        <p>
          The interactive request form needs JavaScript. You can still arrange a
          pickup: <a href="tel:+18016027705">call (801) 602-7705</a> or{' '}
          <a href="mailto:service@bulkaway.com">email service@bulkaway.com</a>.
        </p>
      </noscript>
      {status === 'success' ? (
        <div
          className="form-success"
          ref={statusRef}
          tabIndex={-1}
          aria-live="polite"
        >
          <SubmissionSparkle />
          <p className="submission-message">MESSAGE AWAY!</p>
          <h3>You’re on our radar.</h3>
          <p>
            Your request is sent. We’ll contact you to confirm the price, pickup
            date, and next steps. Your pickup isn’t booked yet.
          </p>
          <p className="reference">
            Your reference: <strong>{reference}</strong>
          </p>
          {receipt && (
            <dl className="pickup-receipt">
              <div>
                <dt>Service</dt>
                <dd>{receipt.service}</dd>
              </div>
              {receipt.offer && (
                <div>
                  <dt>Arcade offer</dt>
                  <dd>{receipt.offer}</dd>
                </div>
              )}
              {receipt.items && (
                <div>
                  <dt>The stuff</dt>
                  <dd>{receipt.items}</dd>
                </div>
              )}
              {receipt.details && (
                <div>
                  <dt>Your notes</dt>
                  <dd>{receipt.details}</dd>
                </div>
              )}
              <div>
                <dt>Pickup address</dt>
                <dd>{receipt.address}</dd>
              </div>
              <div>
                <dt>Preferred date</dt>
                <dd>{receipt.date}</dd>
              </div>
              {receipt.photoCount > 0 && (
                <div>
                  <dt>Photos sent</dt>
                  <dd>{receipt.photoCount}</dd>
                </div>
              )}
            </dl>
          )}
          <p className="receipt-help">
            Keep this reference for your records. Need to change something?{' '}
            <a href="tel:+18016027705">Call (801) 602-7705</a> or{' '}
            <a
              href={`mailto:service@bulkaway.com?subject=${encodeURIComponent(`Pickup request ${reference}`)}`}
            >
              email the crew with your reference
            </a>
            .
          </p>
          <Button
            className="button"
            onClick={() => {
              startFreshRequest();
            }}
          >
            Start another request <ArrowUpRight />
          </Button>
        </div>
      ) : (
        <form
          method="post"
          action="/api/pickup"
          ref={formRef}
          onChange={() => setRequestStarted(true)}
          onSubmit={submit}
          noValidate
          aria-busy={status === 'sending'}
        >
          <input
            key={arcadeOffer || 'no-offer'}
            type="hidden"
            name="offer"
            value={arcadeOffer}
          />
          {arcadeOffer && (
            <p className="arcade-offer-note">
              <strong>SPACE5 · 5% off your next removal</strong>
              <br />
              Your arcade offer is included. The crew applies it when quoting.
            </p>
          )}
          <nav className="pickup-progress" aria-label="Pickup request progress">
            <ol>
              {stepLabels.map((label, index) => (
                <li
                  key={label}
                  aria-current={index === step ? 'step' : undefined}
                  data-complete={index < step}
                >
                  {index < step ? (
                    <button
                      type="button"
                      disabled={status === 'sending'}
                      onClick={() => goToStep(index)}
                      aria-label={`Back to step ${index + 1}: ${label}`}
                    >
                      <span aria-hidden="true">{index + 1}</span>
                      {label}
                    </button>
                  ) : (
                    <span>
                      <b aria-hidden="true">{index + 1}</b>
                      {label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h3
            ref={stepHeadingRef}
            tabIndex={-1}
            className="pickup-step-heading"
          >
            <span className="sr-only">Step {step + 1} of 3: </span>
            {stepTitles[step]}
          </h3>
          <p className="form-intro">
            {step === 0
              ? 'Describe the job, or choose items and quantities.'
              : step === 1
                ? 'Where should the crew head? Leave the date blank if you’re flexible.'
                : 'All three contact fields are required. We’ll use them to respond to your request.'}
          </p>
          <div className="honeypot" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <fieldset
            className="pickup-fields"
            disabled={!ready || status === 'sending'}
          >
            <div className="pickup-step" hidden={step !== 0}>
              {haulMessage && (
                <output className="haul-transfer-message">{haulMessage}</output>
              )}
              <div className="form-grid form-grid-single">
                <ServiceSelector
                  value={service}
                  onChange={(next) => {
                    setService(next);
                    setRequestStarted(true);
                  }}
                  error={errors.service}
                />
                <details
                  className="form-disclosure form-haul-list"
                  ref={itemDisclosure}
                >
                  <summary>
                    <span>
                      {items.length
                        ? `${items.length} item ${items.length === 1 ? 'type' : 'types'} selected — edit list`
                        : 'Choose items & quantities'}
                      {items.length > 0 && (
                        <small>
                          {formatHaulItems(validateHaulItems(items).items)}
                        </small>
                      )}
                    </span>
                    <ChevronDown size={19} aria-hidden="true" />
                  </summary>
                  <p>
                    Select what you have, then adjust the quantities. You can
                    add notes below.
                  </p>
                  <HaulItemPicker inForm />
                  {fieldError('items')}
                  <p className="item-review-note">
                    Special handling and custom quotes may apply. Our crew
                    confirms what we can take.
                  </p>
                </details>
                <div className="field full pickup-details-field">
                  <label htmlFor="pickup-details">
                    <span>
                      {items.length
                        ? 'Anything else our crew should know?'
                        : 'What needs clearing?'}
                    </span>
                    <span className="pickup-details-requirement">
                      {items.length ? 'Optional' : 'Required'}
                    </span>
                  </label>
                  <small className="service-notes-hint" id="service-notes-hint">
                    {serviceNotesHint(service)}
                  </small>
                  <textarea
                    id="pickup-details"
                    name="details"
                    required={!items.length}
                    minLength={items.length ? undefined : 10}
                    maxLength={4000}
                    rows={3}
                    placeholder="Write your details here…"
                    {...errorProps('details')}
                    aria-describedby={`service-notes-hint${errors.details ? ' details-error' : ''}`}
                  />
                  {fieldError('details')}
                </div>
              </div>
              <details className="form-disclosure photo-disclosure">
                <summary>
                  <Camera size={19} aria-hidden="true" />
                  <span>
                    {photos.length
                      ? `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} attached — view or edit`
                      : 'Add photos (optional)'}
                  </span>
                  <ChevronDown size={19} aria-hidden="true" />
                </summary>
                <PhotoUpload
                  files={photos}
                  onChange={setPhotos}
                  error={errors.photos}
                  onError={(error) =>
                    setErrors((current) => ({
                      ...current,
                      photos: error || '',
                    }))
                  }
                  disabled={status === 'sending'}
                />
              </details>
            </div>
            <div className="pickup-step" hidden={step !== 1}>
              <div className="form-grid form-grid-single">
                <AddressSelector
                  apiKey={googleMapsKey}
                  active={step === 1}
                  error={errors.address}
                  onResolvingChange={setAddressResolving}
                />
                <div className="field full">
                  <label htmlFor="pickup-unit">
                    Apartment, unit or building <small>(optional)</small>
                  </label>
                  <input
                    id="pickup-unit"
                    name="unit"
                    maxLength={100}
                    placeholder="For example: Building B, Unit 204"
                    {...errorProps('unit')}
                  />
                  {fieldError('unit')}
                </div>
                <PickupDateSelector
                  minimumDate={minimumDate}
                  error={errors.date}
                />
              </div>
              <p className="pickup-date-note">
                Our crew confirms the date and quote before anything is booked.
              </p>
            </div>
            <div className="pickup-step" hidden={step !== 2}>
              <div className="form-grid">
                <label className="field">
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="First & last name"
                    {...errorProps('name')}
                  />
                  {fieldError('name')}
                </label>
                <label className="field">
                  Phone number
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={30}
                    placeholder="(801) 555-0123"
                    {...errorProps('phone')}
                  />
                  {fieldError('phone')}
                </label>
                <label className="field full">
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="you@example.com"
                    {...errorProps('email')}
                  />
                  {fieldError('email')}
                </label>
              </div>
              <div className="pickup-review compact-review">
                <p className="pickup-review-essentials">
                  <strong>{service}</strong>
                  <span>
                    {formatPickupAddress(review.address || '', review.unit)}
                  </span>
                </p>
                <details className="form-disclosure review-disclosure">
                  <summary>
                    <span>Review & edit pickup details</span>
                    <ChevronDown size={19} aria-hidden="true" />
                  </summary>
                  <dl>
                    <div>
                      <dt>Service</dt>
                      <dd>{service}</dd>
                    </div>
                    <div>
                      <dt>What’s going</dt>
                      <dd>
                        {formatHaulItems(validateHaulItems(items).items) ||
                          'See details below'}
                      </dd>
                    </div>
                    <div>
                      <dt>Extra details</dt>
                      <dd>{String(review.details || 'None added')}</dd>
                    </div>
                    <div>
                      <dt>Photos</dt>
                      <dd>
                        {photos.length
                          ? `${photos.length} attached`
                          : 'None added'}
                      </dd>
                    </div>
                    <div>
                      <dt>Address</dt>
                      <dd>
                        {formatPickupAddress(review.address || '', review.unit)}
                      </dd>
                    </div>
                    <div>
                      <dt>Preferred date</dt>
                      <dd>
                        {review.date
                          ? new Date(
                              `${review.date}T00:00:00`,
                            ).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Flexible — arrange with the crew'}
                      </dd>
                    </div>
                  </dl>
                  <div className="pickup-review-edit">
                    <button type="button" onClick={() => goToStep(0, true)}>
                      Edit items & photos
                    </button>
                    <button type="button" onClick={() => goToStep(1, true)}>
                      Edit pickup details
                    </button>
                  </div>
                </details>
              </div>
              <div className="form-consent consent-checkbox">
                <input
                  id="pickup-consent"
                  name="consent"
                  type="checkbox"
                  required
                  {...errorProps('consent')}
                />
                <span>
                  <label htmlFor="pickup-consent">
                    I agree that Bulk Away may use my details to respond by
                    phone or email about this request.
                  </label>{' '}
                  See our{' '}
                  <Link href="/privacy" target="_blank" rel="noreferrer">
                    privacy notice (opens a new tab)
                  </Link>
                  .
                </span>
              </div>
              {fieldError('consent')}
              <details className="form-disclosure sms-disclosure">
                <summary>
                  <span>
                    {smsSelected
                      ? 'Pickup texts — consent selected'
                      : 'Pickup texts (optional · coming soon)'}
                  </span>
                  <ChevronDown size={19} aria-hidden="true" />
                </summary>
                <fieldset className="sms-consent">
                  <legend>
                    Pickup texts <span>(optional)</span>
                  </legend>
                  <p className="sms-coming">
                    Text updates are coming soon. You can record your choice
                    now; this form does not activate automated messages.
                  </p>
                  <label className="form-consent consent-checkbox">
                    <input
                      name="smsConsent"
                      type="checkbox"
                      checked={smsSelected}
                      onChange={(event) => setSmsSelected(event.target.checked)}
                      {...errorProps('smsConsent')}
                    />
                    <span>{smsConsentText}</span>
                  </label>
                  {fieldError('smsConsent')}
                  <p>
                    <Link href="/sms" target="_blank" rel="noreferrer">
                      SMS terms (opens a new tab)
                    </Link>{' '}
                    ·{' '}
                    <Link
                      href="/privacy#sms-privacy"
                      target="_blank"
                      rel="noreferrer"
                    >
                      SMS privacy (opens a new tab)
                    </Link>
                  </p>
                </fieldset>
              </details>
            </div>
            <div className="pickup-step-actions">
              {step > 0 && (
                <Button
                  type="button"
                  className="pickup-back"
                  onClick={() => goToStep(step - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className="form-submit"
                disabled={status === 'sending' || addressResolving}
              >
                {status === 'sending' ? (
                  <>
                    <LoaderCircle className="sending-spinner" />
                    Sending your request…
                  </>
                ) : (
                  <>
                    {addressResolving
                      ? 'Getting your address…'
                      : step === 2
                        ? 'Send my pickup request'
                        : reviewEdit
                          ? 'Back to review'
                          : step === 0
                            ? 'Next: where & when'
                            : 'Next: your details'}
                    <ArrowUpRight />
                  </>
                )}
              </Button>
            </div>
          </fieldset>
          {errors.form && (
            <p className="field-error" role="alert">
              {errors.form}
            </p>
          )}
          {status === 'error' && (
            <div
              className="form-alert"
              role="alert"
              ref={statusRef}
              tabIndex={-1}
            >
              {message} <a href="tel:+18016027705">Call 801.602.7705</a> or{' '}
              <a href="mailto:service@bulkaway.com">email us directly</a>.
            </div>
          )}
        </form>
      )}
    </div>
  );
}
