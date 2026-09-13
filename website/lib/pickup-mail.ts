import { formatHaulItems } from './haul-guide.ts';
import { formatPickupAddress } from './pickup-address.ts';
import { renderPickupEmail, pickupEmailDate } from './pickup-email.ts';
import {
  smsConsentText,
  smsDisclosureVersion,
  type Pickup,
} from './pickup-schema.ts';

export function buildPickupMail(
  pickup: Pickup,
  reference: string,
  photoCount = 0,
) {
  const consentRecord = [
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
  const consentSummary = `Phone/email follow-up: Approved\nSMS opt-in: ${pickup.smsConsent ? 'Yes' : 'No'}\nFull consent record attached.`;
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
    consentSummary,
  ].join('\n');
  return {
    from: { name: 'Bulk Away', address: 'mailer@wsitrashvalet.com' },
    to: 'service@bulkaway.com',
    replyTo: { name: pickup.name, address: pickup.email },
    subject: `Bulk Away pickup request — ${pickup.service} — ${reference}`,
    text,
    html: renderPickupEmail(
      pickup,
      reference,
      photoCount,
      'crew',
      consentSummary,
    ),
    attachments: [
      {
        filename: 'contact-permission.txt',
        contentType: 'text/plain; charset=utf-8',
        content: `BULK AWAY — CONTACT PERMISSION\nReference: ${reference}\nName: ${pickup.name}\nEmail: ${pickup.email}\nPhone: ${pickup.phone}\n\n${consentRecord}\n`,
      },
    ],
    messageId: `<pickup-${reference}@wsitrashvalet.com>`,
  };
}

export function buildPickupConfirmation(
  pickup: Pickup,
  reference: string,
  photoCount = 0,
) {
  return {
    from: { name: 'Bulk Away', address: 'mailer@wsitrashvalet.com' },
    to: pickup.email,
    replyTo: { name: 'Bulk Away crew', address: 'service@bulkaway.com' },
    subject: `We received your Bulk Away request — ${reference}`,
    messageId: `<confirmation-${reference}@wsitrashvalet.com>`,
    headers: {
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
    },
    text: [
      'BULK AWAY — REQUEST RECEIVED',
      `Reference: ${reference}`,
      '',
      `Hi ${pickup.name},`,
      '',
      'We’ve received your request. Our crew will contact you to confirm the price, pickup date, and next steps. Your pickup isn’t booked yet.',
      '',
      `Service: ${pickup.service}`,
      `Contact: ${pickup.name} | ${pickup.email} | ${pickup.phone}`,
      `Pickup address: ${formatPickupAddress(pickup.address, pickup.unit)}`,
      `Preferred date (not confirmed): ${pickupEmailDate(pickup.date)}`,
      `Photos: ${photoCount ? `${photoCount} received` : 'None provided'}`,
      '',
      ...(pickup.items.length
        ? ['WHAT NEEDS TO GO', formatHaulItems(pickup.items), '']
        : []),
      'YOUR NOTES',
      pickup.details || 'None provided',
      '',
      ...(pickup.offer === 'SPACE5'
        ? [
            'SPACE5 — 5% off your next removal. Included with your request for the crew to apply when quoting.',
            '',
          ]
        : []),
      'Need to update something? Reply to this email or call (801) 602-7705.',
      'service@bulkaway.com',
      '',
      'Bulk Away · Waste Solution Innovators family',
      'Clearing the Way for What’s Next.',
      'Sent in response to a pickup request using this email address. If you didn’t submit it, contact the crew.',
    ].join('\n'),
    html: renderPickupEmail(pickup, reference, photoCount, 'customer'),
  };
}
