import {
  buildPickupMail,
  buildPickupConfirmation,
  type Pickup,
} from './pickup.ts';
import type { PhotoAttachment } from './photos.ts';
import { pickupEmailArtwork } from './pickup-email-artwork.generated.ts';

export type PickupMessage = Omit<
  | ReturnType<typeof buildPickupMail>
  | ReturnType<typeof buildPickupConfirmation>,
  'attachments'
> & {
  attachments?: {
    filename: string;
    contentType: string;
    content: string | Buffer;
    cid?: string;
    contentDisposition?: 'inline' | 'attachment';
  }[];
};
export type PickupDelivery = { confirmation: 'sent' | 'unconfirmed' };

export function withPickupArtwork(
  message: PickupMessage,
  audience: 'crew' | 'customer',
): PickupMessage {
  return {
    ...message,
    attachments: [
      ...(message.attachments || []),
      ...(['logo', audience] as const).map((name) => ({
        filename: `bulk-away-${name}.png`,
        contentType: 'image/png',
        content: Buffer.from(pickupEmailArtwork[name], 'base64'),
        cid: `bulk-away-${name}@wsitrashvalet.com`,
        contentDisposition: 'inline' as const,
      })),
    ],
  };
}

// The crew must receive the request before we acknowledge it to the customer.
// Keep partial success: retrying the crew after a confirmation timeout could
// duplicate a job. The API caches this combined result under its request key.
export async function deliverPickupMessages(
  pickup: Pickup,
  reference: string,
  photos: PhotoAttachment[],
  deliver: (message: PickupMessage, timeoutMs: number) => Promise<void>,
): Promise<PickupDelivery> {
  const crewMail = buildPickupMail(pickup, reference, photos.length);
  await deliver(
    withPickupArtwork(
      {
        ...crewMail,
        attachments: [...crewMail.attachments, ...photos],
      },
      'crew',
    ),
    25000,
  );
  try {
    await deliver(
      withPickupArtwork(
        buildPickupConfirmation(pickup, reference, photos.length),
        'customer',
      ),
      8000,
    );
    return { confirmation: 'sent' };
  } catch {
    return { confirmation: 'unconfirmed' };
  }
}
