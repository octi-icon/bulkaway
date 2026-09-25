import type { Pickup } from './pickup-schema.ts';
import type { PhotoAttachment } from './photos.ts';
import { smsDisclosureVersion } from './pickup-schema.ts';

/**
 * Helm intake hand-off — the site's reference implementation of the shared WSI website
 * contract `wsi_web_intake_v1` (Helm: docs/contracts/wsi-web-intake-v1.md).
 *
 * Runs on the SERVER after the crew email has been accepted. It never blocks or fails the
 * visitor's request: a Helm outage yields `{ status: 'unrecorded' }` and the crew still has
 * the email. Uses WebCrypto so the same file works on Node (this site) and on Cloudflare
 * Workers (wsi.solutions). To adopt on another WSI site: copy this file, change `SITE`,
 * `FORM` and `fields`, and wire `deliverToHelm` after that site's own delivery succeeds.
 */

export const HELM_INTAKE_CONTRACT = 'wsi_web_intake_v1';
const SITE = 'bulk-away';
const FORM = 'bulk_away.pickup';

export type HelmIntakeConfig = {
  /** Helm origin, e.g. https://helm.example.com — unset disables the hand-off. */
  HELM_INTAKE_URL?: string;
  /** Shared secret (matches Helm's WSI_INTAKE_SECRET_BULK_AWAY). */
  HELM_INTAKE_SECRET?: string;
};

export type HelmIntakeResult =
  | { status: 'recorded'; submissionId: string; requestNumber?: string }
  | { status: 'unrecorded'; reason: string }
  | { status: 'disabled' };

export type HelmIntakeEnvelope = {
  contract: typeof HELM_INTAKE_CONTRACT;
  site: string;
  form: string;
  idempotencyKey: string;
  reference: string;
  submittedAt: string;
  sourceUrl?: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    consent: { contact: true; sms: boolean; smsDisclosureVersion?: string };
  };
  location: { formattedAddress: string; addressLine2?: string };
  fields: Record<string, unknown>;
  attachments: {
    filename: string;
    contentType: string;
    bytesBase64: string;
    sha256: string;
  }[];
};

const encoder = new TextEncoder();

function hex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let out = '';
  for (const b of view) out += b.toString(16).padStart(2, '0');
  return out;
}

export async function sha256Hex(data: Uint8Array): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', data as BufferSource));
}

export async function signIntake(
  secret: string,
  timestampMs: string,
  rawBody: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${timestampMs}.${rawBody}`),
  );
  return `sha256=${hex(signature)}`;
}

/** Build the envelope from the ALREADY-VALIDATED pickup and the processed photos. */
export async function buildIntakeEnvelope(
  pickup: Pickup,
  reference: string,
  idempotencyKey: string,
  photos: PhotoAttachment[],
  options: { sourceUrl?: string; now?: Date } = {},
): Promise<HelmIntakeEnvelope> {
  const attachments = [];
  for (const photo of photos) {
    const bytes = new Uint8Array(photo.content);
    attachments.push({
      filename: photo.filename,
      contentType: photo.contentType,
      bytesBase64: Buffer.from(bytes).toString('base64'),
      sha256: await sha256Hex(bytes),
    });
  }
  return {
    contract: HELM_INTAKE_CONTRACT,
    site: SITE,
    form: FORM,
    idempotencyKey,
    reference,
    submittedAt: (options.now ?? new Date()).toISOString(),
    ...(options.sourceUrl ? { sourceUrl: options.sourceUrl } : {}),
    contact: {
      name: pickup.name,
      email: pickup.email,
      phone: pickup.phone,
      consent: {
        contact: true,
        sms: pickup.smsConsent,
        ...(pickup.smsConsent ? { smsDisclosureVersion } : {}),
      },
    },
    location: {
      formattedAddress: pickup.address,
      ...(pickup.unit ? { addressLine2: pickup.unit } : {}),
    },
    fields: {
      service: pickup.service,
      items: pickup.items,
      details: pickup.details,
      unit: pickup.unit,
      requestedDate: pickup.date,
      offer: pickup.offer,
    },
    attachments,
  };
}

export function helmIntakeEnabled(config: HelmIntakeConfig): boolean {
  return (
    !!config.HELM_INTAKE_URL?.trim() && !!config.HELM_INTAKE_SECRET?.trim()
  );
}

/**
 * POST the envelope to Helm. Resolves (never rejects) with the outcome so the caller can
 * record it beside the email result. 201/200/202 all mean Helm has the submission.
 */
export async function deliverToHelm(
  envelope: HelmIntakeEnvelope,
  config: HelmIntakeConfig,
  send: typeof fetch = fetch,
  timeoutMs = 10000,
): Promise<HelmIntakeResult> {
  if (!helmIntakeEnabled(config)) return { status: 'disabled' };
  const rawBody = JSON.stringify(envelope);
  const timestamp = String(Date.now());
  let response: Response;
  try {
    const signature = await signIntake(
      config.HELM_INTAKE_SECRET!,
      timestamp,
      rawBody,
    );
    response = await send(
      new URL('/api/web-intake', config.HELM_INTAKE_URL!.replace(/\/$/, '')),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-wsi-intake-site': envelope.site,
          'x-wsi-intake-timestamp': timestamp,
          'x-wsi-intake-signature': signature,
          'idempotency-key': envelope.idempotencyKey,
        },
        body: rawBody,
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
  } catch (error) {
    return {
      status: 'unrecorded',
      reason: error instanceof Error ? error.name : 'network',
    };
  }
  if (![200, 201, 202].includes(response.status))
    return { status: 'unrecorded', reason: `http_${response.status}` };
  try {
    const data = (await response.json()) as {
      receipt?: {
        submissionId?: string;
        routed?: { entityNumber?: string } | null;
      };
    };
    const submissionId = data.receipt?.submissionId;
    if (typeof submissionId !== 'string')
      return { status: 'unrecorded', reason: 'malformed_receipt' };
    const requestNumber = data.receipt?.routed?.entityNumber;
    return {
      status: 'recorded',
      submissionId,
      ...(typeof requestNumber === 'string' ? { requestNumber } : {}),
    };
  } catch {
    return { status: 'unrecorded', reason: 'malformed_receipt' };
  }
}
