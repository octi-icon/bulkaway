import { pickupSchema, type Pickup } from './pickup-schema.ts';

export {
  pickupSchema,
  pickupToday,
  serviceNames,
  smsConsentText,
  smsDisclosureVersion,
  type Pickup,
} from './pickup-schema.ts';
export { buildPickupMail, buildPickupConfirmation } from './pickup-mail.ts';

const pickupStepFields = [
  ['service', 'items', 'details', 'photos'],
  ['address', 'unit', 'date'],
  ['name', 'phone', 'email', 'consent', 'smsConsent'],
] as const;

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

// Preserve the existing error order used by the form's error summary.
const pickupErrorFields = [
  'items',
  'form',
  'name',
  'email',
  'phone',
  'service',
  'address',
  'unit',
  'details',
  'date',
  'consent',
  'smsConsent',
];

export function validatePickup(
  input: unknown,
): { ok: true; data: Pickup } | { ok: false; errors: Record<string, string> } {
  const result = pickupSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const issues = new Map(
    result.error.issues.map((issue) => [
      String(issue.path[0] ?? 'form'),
      issue.message,
    ]),
  );
  return {
    ok: false,
    errors: Object.fromEntries(
      pickupErrorFields.flatMap((field) => {
        const message = issues.get(field);
        return message ? [[field, message]] : [];
      }),
    ),
  };
}
