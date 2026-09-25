import nodemailer from 'nodemailer';
import { connect, type TLSSocket } from 'node:tls';
import type { Pickup } from './pickup';
import { deliverPickupMessages, type PickupMessage } from './pickup-delivery';
import type { PhotoAttachment } from './photos';
import {
  buildIntakeEnvelope,
  deliverToHelm,
  helmIntakeEnabled,
  type HelmIntakeConfig,
} from './helm-intake';
export type MailConfig = {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
};
export type IntakeOptions = {
  /** The visitor's idempotency key — reused for Helm so a retry never duplicates. */
  idempotencyKey: string;
  config: HelmIntakeConfig;
  sourceUrl?: string;
};
// Server-only delivery adapter. The form and request contract stay independent
// of this transport so a future Helm scheduler can use the same validated data.
export async function sendPickup(
  pickup: Pickup,
  reference: string,
  config: MailConfig,
  photos: PhotoAttachment[] = [],
  intake?: IntakeOptions,
) {
  return deliverPickupMessages(
    pickup,
    reference,
    photos,
    (message, timeoutMs) => sendMessage(message, config, timeoutMs),
    intake && helmIntakeEnabled(intake.config)
      ? async () =>
          deliverToHelm(
            await buildIntakeEnvelope(
              pickup,
              reference,
              intake.idempotencyKey,
              photos,
              { sourceUrl: intake.sourceUrl },
            ),
            intake.config,
          )
      : undefined,
  );
}

async function sendMessage(
  message: PickupMessage,
  config: MailConfig,
  timeoutMs: number,
) {
  const host = config.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(config.SMTP_PORT || 465);
  if (!config.SMTP_PASS || !Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Mail unavailable');
  let socket: TLSSocket | undefined;
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: {
      user: config.SMTP_USER || 'mailer@wsitrashvalet.com',
      pass:
        host === 'smtp.gmail.com'
          ? config.SMTP_PASS.replace(/\s/g, '')
          : config.SMTP_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    disableFileAccess: true,
    disableUrlAccess: true,
    logger: false,
    debug: false,
    getSocket(
      _options: unknown,
      callback: (
        error: Error | null,
        info: { connection: TLSSocket; secured: boolean },
      ) => void,
    ) {
      socket = connect({ host, port, servername: host, minVersion: 'TLSv1.2' });
      callback(null, { connection: socket, secured: true });
    },
  });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      transport.sendMail(message),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          socket?.destroy();
          transport.close();
          reject(new Error('Delivery timeout'));
        }, timeoutMs);
      }),
    ]);
    if (!result.accepted?.includes(message.to) || result.rejected?.length)
      throw new Error('Delivery rejected');
  } finally {
    clearTimeout(timeout);
    socket?.destroy();
    transport.close();
  }
}
