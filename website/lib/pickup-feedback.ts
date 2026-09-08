import { formatHaulItems, validateHaulItems } from './haul-guide.ts';
import { formatPickupAddress } from './pickup-address.ts';

export const uncertainDeliveryMessage =
  'We couldn’t confirm delivery. Your details are still here. Please call or email the crew before trying again.';

export class PickupDeliveryError extends Error {
  readonly fields: Record<string, string>;
  constructor(message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'PickupDeliveryError';
    this.fields = fields;
  }
}

export async function readPickupResponse(response: Response): Promise<string> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new PickupDeliveryError(uncertainDeliveryMessage);
  }
  if (!data || typeof data !== 'object')
    throw new PickupDeliveryError(uncertainDeliveryMessage);
  const result = data as Record<string, unknown>;
  if (!response.ok) {
    const fields =
      result.errors && typeof result.errors === 'object'
        ? Object.fromEntries(
            Object.entries(result.errors).filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === 'string',
            ),
          )
        : {};
    throw new PickupDeliveryError(
      typeof result.error === 'string' && result.error.trim()
        ? result.error
        : uncertainDeliveryMessage,
      fields,
    );
  }
  if (
    typeof result.reference !== 'string' ||
    !/^BA-[A-F0-9]{8}$/.test(result.reference)
  )
    throw new PickupDeliveryError(uncertainDeliveryMessage);
  return result.reference;
}

export function pickupFailureMessage(error: unknown): string {
  return error instanceof PickupDeliveryError
    ? error.message
    : uncertainDeliveryMessage;
}

export function createPickupReceipt(
  input: Record<string, unknown>,
  photoCount: number,
) {
  const value = (key: string) =>
    typeof input[key] === 'string' ? input[key].trim() : '';
  const date = value('date');
  return Object.freeze({
    service: value('service'),
    ...(value('offer') === 'SPACE5'
      ? { offer: 'SPACE5 — 5% off your next removal' }
      : {}),
    items: formatHaulItems(validateHaulItems(input.items).items),
    details: value('details'),
    address: formatPickupAddress(value('address'), value('unit')),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(new Date(`${date}T12:00:00Z`))
      : 'Flexible — arrange with the crew',
    photoCount,
  });
}

export type PickupReceipt = ReturnType<typeof createPickupReceipt>;
