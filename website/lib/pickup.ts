import {
  validateHaulItems,
  formatHaulItems,
  type HaulItem,
} from './haul-guide.ts';
import { formatPickupAddress } from './pickup-address.ts';
export const serviceNames = [
  'Bulk item removal',
  'Trash outs',
  'Weekly bulk service',
  'Chute room clear outs',
  'Donations & recyclables',
  'Help me choose',
] as const;
export const smsDisclosureVersion = '2026-09-06';
export const smsConsentText =
  'I agree to receive text messages from Bulk Away about my quotes, scheduling, pickups, and service updates, including automated messages when the SMS service launches. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is optional and is not a condition of purchase or service. I confirm this is a number I own or am authorized to use.';
export type Pickup = {
  name: string;
  email: string;
  phone: string;
  service: string;
  address: string;
  unit: string;
  date: string;
  details: string;
  items: HaulItem[];
  consent: true;
  smsConsent: boolean;
  offer?: string;
};

const pickupStepFields = [
  ['service', 'items', 'details', 'photos'],
  ['address', 'unit', 'date'],
  ['name', 'phone', 'email', 'consent', 'smsConsent'],
] as const;

// Pickup availability follows the service area, even for visitors elsewhere.
export function pickupToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function validatePickupStep(
  input: unknown,
  step: number,
): Record<string, string> {
  const result = validatePickup(input);
  if (result.ok) return {};
  if (step === 2) return result.errors;
  const fields: readonly string[] = pickupStepFields[step] || [];
  return Object.fromEntries(
    Object.entries(result.errors).filter(
      ([key]) => fields.includes(key) || key === 'form',
    ),
  );
}

export function pickupErrorStep(errors: Record<string, string>): number {
  const index = pickupStepFields.findIndex((fields) =>
    fields.some((field) => !!errors[field]),
  );
  return index < 0 ? 2 : index;
}
export function validatePickup(
  input: unknown,
): { ok: true; data: Pickup } | { ok: false; errors: Record<string, string> } {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return { ok: false, errors: { form: 'Please complete the request form.' } };
  const raw = input as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const haul = validateHaulItems(raw.items);
  if (haul.error) errors.items = haul.error;
  const value = (key: string) =>
    typeof raw[key] === 'string' ? raw[key].trim() : '';
  const data = {
    name: value('name'),
    email: value('email'),
    phone: value('phone'),
    service: value('service'),
    address: value('address'),
    unit: value('unit'),
    date: value('date'),
    details: value('details'),
    items: haul.items,
    consent: true as const,
    smsConsent: raw.smsConsent === true,
    offer: value('offer') === 'SPACE5' ? 'SPACE5' : '',
  };
  if (value('website'))
    errors.form = 'Please call or email the crew to arrange your pickup.';
  if (
    data.name.length < 2 ||
    data.name.length > 100 ||
    /[\r\n]/.test(data.name)
  )
    errors.name = 'Enter your name (2–100 characters).';
  if (
    !/^[^\s@,<>]+@[^\s@,<>]+\.[^\s@,<>]+$/.test(data.email) ||
    data.email.length > 254
  )
    errors.email = 'Enter a valid email address.';
  if (
    data.phone.replace(/\D/g, '').length < 10 ||
    data.phone.length > 30 ||
    /[\r\n]/.test(data.phone)
  )
    errors.phone = 'Enter a phone number including the area code.';
  if (!(serviceNames as readonly string[]).includes(data.service))
    errors.service = 'Choose a service.';
  if (data.address.length < 8 || data.address.length > 300)
    errors.address = 'Enter the pickup address, city, and ZIP code.';
  if (
    data.unit.length > 100 ||
    /[\r\n]/.test(data.unit) ||
    (raw.unit !== undefined && typeof raw.unit !== 'string')
  )
    errors.unit =
      'Enter apartment, unit or building details in 100 characters or fewer.';
  if (
    (!haul.error && !data.items.length && data.details.length < 10) ||
    data.details.length > 4000
  )
    errors.details =
      'Select items above or describe what needs to go (10–4,000 characters).';
  if (data.date) {
    const date = new Date(`${data.date}T12:00:00Z`);
    const today = pickupToday();
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== data.date ||
      data.date < today
    )
      errors.date = 'Choose today or a future date, or leave it blank.';
  }
  if (raw.consent !== true)
    errors.consent = 'Please agree to be contacted about your pickup.';
  if (raw.smsConsent !== undefined && typeof raw.smsConsent !== 'boolean')
    errors.smsConsent = 'Choose whether you want optional pickup text updates.';
  if (data.smsConsent && raw.smsDisclosureVersion !== smsDisclosureVersion)
    errors.smsConsent =
      'The SMS terms have changed. Refresh this page to review them, or uncheck SMS updates to continue without texts.';
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, data };
}
export function buildPickupMail(
  pickup: Pickup,
  reference: string,
  photoCount = 0,
) {
  const text = [
    `BULK AWAY — NEW PICKUP REQUEST`,
    `Reference: ${reference}`,
    '',
    `Service: ${pickup.service}`,
    `Name: ${pickup.name}`,
    `Email: ${pickup.email}`,
    `Phone: ${pickup.phone}`,
    `Pickup location: ${formatPickupAddress(pickup.address, pickup.unit)}`,
    `Preferred date: ${pickup.date || 'Flexible / please contact customer'}`,
    `Photos: ${photoCount ? `${photoCount} attached` : 'None provided'}`,
    ...(pickup.offer === 'SPACE5'
      ? ['Arcade offer: SPACE5 — apply 5% off the next removal when quoting.']
      : []),
    '',
    'WHAT NEEDS TO GO',
    ...(pickup.items.length ? [formatHaulItems(pickup.items), ''] : []),
    'ADDITIONAL DETAILS',
    pickup.details || 'None provided',
    '',
    'The customer agreed to be contacted about this request.',
    `SMS consent: ${pickup.smsConsent ? 'GIVEN' : 'NOT GIVEN — do not enroll this number in SMS'}`,
    ...(pickup.smsConsent
      ? [
          `Recorded at: ${new Date().toISOString()}`,
          'Consent source: Bulk Away website pickup form',
          `Disclosure version: ${smsDisclosureVersion}`,
          `Disclosure shown: ${smsConsentText}`,
          'Terms: /sms | Privacy: /privacy#sms-privacy',
        ]
      : []),
    'This email records a preference only; it does not activate Twilio or send a text.',
    'This is a quote and scheduling request, not a confirmed booking.',
  ].join('\n');
  const escape = (v: string) =>
    v.replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c]!,
    );
  return {
    from: { name: 'Bulk Away', address: 'mailer@wsitrashvalet.com' },
    to: 'service@bulkaway.com',
    replyTo: { name: pickup.name, address: pickup.email },
    subject: `Bulk Away pickup request — ${pickup.service} — ${reference}`,
    text,
    html: `<div style="background:#1d1724;color:#f5efd9;padding:32px;font-family:Arial,sans-serif"><h1 style="color:#efc24b">Bulk Away</h1><h2 style="color:#b2d34c">A fresh start is calling.</h2><p>A new pickup request is ready for your crew.</p><pre style="font:16px/1.65 Arial,sans-serif;white-space:pre-wrap">${escape(text)}</pre></div>`,
    messageId: `<pickup-${reference}@wsitrashvalet.com>`,
  };
}
