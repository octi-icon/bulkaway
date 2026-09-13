import { mkdir, writeFile } from 'node:fs/promises';
import nodemailer from 'nodemailer';
import { withPickupArtwork } from '../lib/pickup-delivery.ts';
import {
  buildPickupMail,
  buildPickupConfirmation,
  validatePickup,
  smsDisclosureVersion,
} from '../lib/pickup.ts';

// Synthetic fixtures only. Stream transport never opens an SMTP connection.
const result = validatePickup({
  name: 'Taylor Example',
  email: 'taylor@example.com',
  phone: '8015550100',
  service: 'Bulk item removal',
  address: '123 Example Lane, Salt Lake City, UT 84101',
  unit: 'Building B, Unit 204',
  date: '',
  items: [
    { id: 'furniture', quantity: 2 },
    { id: 'mattresses', quantity: 1 },
    { id: 'boxes', quantity: 8 },
  ],
  details:
    'Please collect two sofas, one mattress, and eight boxes.\nThe items are upstairs. Please call on arrival.',
  consent: true,
  smsConsent: true,
  smsDisclosureVersion,
  offer: 'SPACE5',
});
if (!result.ok) throw new Error('Invalid preview fixture');
const directory = new URL('../work/email-preview/', import.meta.url);
await mkdir(directory, { recursive: true });
const transport = nodemailer.createTransport({
  streamTransport: true,
  buffer: true,
  newline: 'unix',
  disableFileAccess: true,
  disableUrlAccess: true,
});
for (const [name, mail] of [
  ['crew', buildPickupMail(result.data, 'BA-1234ABCD', 0)],
  ['customer', buildPickupConfirmation(result.data, 'BA-1234ABCD', 0)],
  [
    'long-details',
    buildPickupConfirmation(
      {
        ...result.data,
        address: 'Example address '.repeat(20).slice(0, 300),
        details: 'VeryLongUnbrokenCustomerText'.repeat(160).slice(0, 4000),
      },
      'BA-1234ABCD',
      5,
    ),
  ],
]) {
  const message = withPickupArtwork(
    mail,
    name === 'crew' ? 'crew' : 'customer',
  );
  // Browsers do not resolve MIME Content-IDs; substitute the identical bytes
  // only in the local HTML preview. The .eml keeps real CID references.
  let preview = message.html;
  for (const attachment of message.attachments || []) {
    if (attachment.cid)
      preview = preview.replace(
        `cid:${attachment.cid}`,
        `data:${attachment.contentType};base64,${attachment.content.toString('base64')}`,
      );
  }
  await writeFile(new URL(`${name}.html`, directory), preview);
  await writeFile(new URL(`${name}.txt`, directory), mail.text);
  const output = await transport.sendMail(message);
  await writeFile(new URL(`${name}.eml`, directory), output.message);
}
console.log(
  'Email previews written to work/email-preview (HTML, text, EML). No email sent.',
);
