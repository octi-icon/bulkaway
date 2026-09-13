import { z } from 'zod';
import { validateHaulItems } from './haul-guide.ts';
import { pickupAddressError } from './pickup-address.ts';

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

// Pickup availability follows the service area, even for visitors elsewhere.
export function pickupToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

const detailsError =
  'Select items above or describe what needs to go (10–4,000 characters).';
const unitError =
  'Enter apartment, unit or building details in 100 characters or fewer.';

const normalizedPickupSchema = z
  .object({
    name: z
      .string()
      .refine(
        (value) =>
          value.length >= 2 && value.length <= 100 && !/[\r\n]/.test(value),
        'Enter your name (2–100 characters).',
      ),
    // Keep the mailbox restrictions used by the email delivery boundary.
    email: z
      .string()
      .refine(
        (value) =>
          /^[^\s@,<>]+@[^\s@,<>]+\.[^\s@,<>]+$/.test(value) &&
          !/[()[\]:;"\\]/.test(value) &&
          value.length <= 254,
        'Enter a valid email address.',
      ),
    phone: z
      .string()
      .refine(
        (value) =>
          value.replace(/\D/g, '').length >= 10 &&
          value.length <= 30 &&
          !/[\r\n]/.test(value),
        'Enter a phone number including the area code.',
      ),
    service: z
      .string()
      .refine(
        (value) => (serviceNames as readonly string[]).includes(value),
        'Choose a service.',
      ),
    address: z.string().superRefine((value, ctx) => {
      const message = pickupAddressError(value);
      if (message) ctx.addIssue({ code: 'custom', message });
    }),
    unit: z
      .string()
      .refine(
        (value) => value.length <= 100 && !/[\r\n]/.test(value),
        unitError,
      ),
    date: z.string().refine((value) => {
      if (!value) return true;
      const date = new Date(`${value}T12:00:00Z`);
      return (
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value &&
        value >= pickupToday()
      );
    }, 'Choose today or a future date, or leave it blank.'),
    details: z.string().max(4000, detailsError),
    items: z.array(z.object({ id: z.string(), quantity: z.number() })),
    consent: z
      .boolean()
      .refine(
        (value) => value,
        'Please agree to be contacted about your pickup.',
      ),
    smsConsent: z.boolean(),
    offer: z.string(),
    // Preserve raw-input facts until cross-field rules run. These never leave
    // the schema, and continuable refinements report all fields in one pass.
    _validation: z.object({
      itemsError: z.string(),
      unitValid: z.boolean(),
      smsConsentValid: z.boolean(),
      smsDisclosureCurrent: z.boolean(),
      website: z.string(),
    }),
  })
  .superRefine((data, ctx) => {
    const add = (field: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [field], message });
    const facts = data._validation;
    if (facts.itemsError) add('items', facts.itemsError);
    if (facts.website)
      add('form', 'Please call or email the crew to arrange your pickup.');
    if (!facts.unitValid) add('unit', unitError);
    if (!facts.itemsError && !data.items.length && data.details.length < 10)
      add('details', detailsError);
    if (!facts.smsConsentValid)
      add(
        'smsConsent',
        'Choose whether you want optional pickup text updates.',
      );
    if (data.smsConsent && !facts.smsDisclosureCurrent)
      add(
        'smsConsent',
        'The SMS terms have changed. Refresh this page to review them, or uncheck SMS updates to continue without texts.',
      );
  })
  .transform(({ _validation, ...data }) => ({
    ...data,
    consent: true as const,
  }));

export const pickupSchema = z
  .custom<Record<string, unknown>>(
    (input) => !!input && typeof input === 'object' && !Array.isArray(input),
    'Please complete the request form.',
  )
  .transform((raw) => {
    const value = (key: string) =>
      typeof raw[key] === 'string' ? raw[key].trim() : '';
    const haul = validateHaulItems(raw.items);
    return {
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      service: value('service'),
      address: value('address'),
      unit: value('unit'),
      date: value('date'),
      details: value('details'),
      items: haul.items,
      consent: raw.consent === true,
      smsConsent: raw.smsConsent === true,
      offer: value('offer') === 'SPACE5' ? 'SPACE5' : '',
      _validation: {
        itemsError: haul.error,
        unitValid: raw.unit === undefined || typeof raw.unit === 'string',
        smsConsentValid:
          raw.smsConsent === undefined || typeof raw.smsConsent === 'boolean',
        smsDisclosureCurrent: raw.smsDisclosureVersion === smsDisclosureVersion,
        website: value('website'),
      },
    };
  })
  .pipe(normalizedPickupSchema);

export type Pickup = z.infer<typeof pickupSchema>;
