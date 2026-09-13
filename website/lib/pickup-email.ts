import type { Pickup } from './pickup.ts';
import { haulItems } from './haul-guide.ts';
import { formatPickupAddress } from './pickup-address.ts';

// Email clients do not share the site's CSS/runtime. Keep critical styling
// inline, layout tables presentational, and every submitted value escaped.
const ink = '#1d1724';
const cream = '#f5efd9';
const gold = '#efc24b';
const lime = '#b2d34c';
export function escapeEmail(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  );
}
const lines = (value: string) => escapeEmail(value).replace(/\r?\n/g, '<br>');

export function pickupEmailDate(date: string): string {
  return date
    ? new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${date}T12:00:00Z`))
    : 'Flexible — arrange with the crew';
}

export function renderPickupEmail(
  pickup: Pickup,
  reference: string,
  photoCount: number,
  audience: 'crew' | 'customer',
  consentSummary = '',
): string {
  const customer = audience === 'customer';
  const heading = customer
    ? 'You’re on our radar.'
    : 'A fresh start is calling.';
  const intro = customer
    ? 'We’ve received your request. Our crew will contact you to confirm the price, pickup date, and next steps. Your pickup isn’t booked yet.'
    : 'A new pickup request is ready for the crew. Review the details below, then contact the customer to quote and arrange service.';
  const reply = customer ? 'service@bulkaway.com' : pickup.email;
  const replyUrl = `mailto:${encodeURIComponent(reply)}?subject=${encodeURIComponent(`Re: Bulk Away pickup request ${reference}`)}`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:12px 0;border-bottom:1px solid #d4cebc;overflow-wrap:anywhere;word-break:break-word;"><p style="margin:0 0 4px;font-size:12px;line-height:18px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#514759;">${escapeEmail(label)}</p><p style="margin:0;font-size:16px;line-height:24px;color:${ink};">${lines(value)}</p></td></tr>`;
  const itemRows = pickup.items
    .map(
      (item) =>
        `<tr><td style="padding:10px 12px;border-bottom:1px solid #d4cebc;">${escapeEmail(haulItems.find((known) => known.id === item.id)?.label || item.id)}</td><td align="right" style="padding:10px 12px;border-bottom:1px solid #d4cebc;font-weight:bold;">${escapeEmail(String(item.quantity))}</td></tr>`,
    )
    .join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${heading}</title></head>
<body style="margin:0;padding:0;background-color:#e6e0ce;color:${ink};font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeEmail(customer ? `Request received • ${reference}. Our crew will be in touch about your pickup.` : `${pickup.service} • ${reference}. A new request needs your review.`)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#e6e0ce"><tr><td align="center" style="padding:24px 10px;">
<!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;table-layout:fixed;background-color:${cream};border:2px solid ${ink};" bgcolor="${cream}">
<tr><td align="center" bgcolor="${ink}" style="padding:24px;color:${gold};border-top:6px solid ${lime};"><img src="cid:bulk-away-logo@wsitrashvalet.com" alt="Bulk Away" width="240" height="185" style="display:block;width:240px;max-width:100%;height:auto;border:0;color:${gold};font:bold 28px/36px Georgia,serif;"><p style="margin:16px 0 0;font-size:11px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:${cream};">Clearing the Way for What’s Next.</p></td></tr>
<tr><td bgcolor="${gold}" style="padding:12px 24px;color:${ink};font-size:12px;line-height:20px;font-weight:bold;letter-spacing:1px;">${customer ? 'REQUEST RECEIVED' : 'NEW PICKUP REQUEST'} &nbsp;·&nbsp; ${escapeEmail(reference)}</td></tr>
<tr><td style="padding:24px 24px 12px;color:${ink};"><h1 style="margin:0 0 12px;font:bold 30px/36px Georgia,'Times New Roman',serif;"><img src="cid:bulk-away-${audience}@wsitrashvalet.com" alt="${heading}" width="532" height="72" style="display:block;width:532px;max-width:100%;height:auto;border:0;color:${ink};font:bold 30px/36px Georgia,serif;"></h1>${customer ? `<p style="margin:0 0 12px;font-size:16px;line-height:25px;">Hi ${escapeEmail(pickup.name)},</p>` : ''}<p style="margin:0;font-size:16px;line-height:25px;">${intro}</p></td></tr>
<tr><td style="padding:12px 24px 24px;color:${ink};"><h2 style="margin:0 0 4px;font-size:19px;line-height:26px;">${customer ? 'Your pickup request' : 'Request details'}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;">${row('Service', pickup.service)}${row('Contact', `${pickup.name}\n${pickup.email}\n${pickup.phone}`)}${row('Pickup address', formatPickupAddress(pickup.address, pickup.unit))}${row('Preferred date · not confirmed', pickupEmailDate(pickup.date))}${row('Photos', photoCount ? `${photoCount} ${customer ? 'received' : 'attached'}` : 'None provided')}</table>
${itemRows ? `<h2 style="margin:24px 0 12px;font-size:19px;line-height:26px;">What needs to go</h2><table width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:16px;line-height:24px;color:${ink};"><thead><tr bgcolor="${lime}"><th scope="col" align="left" style="padding:10px 12px;">Item</th><th scope="col" align="right" style="padding:10px 12px;">Qty</th></tr></thead><tbody>${itemRows}</tbody></table>` : ''}
<h2 style="margin:24px 0 12px;font-size:19px;line-height:26px;">${customer ? 'Your notes' : 'Job details'}</h2><p style="margin:0;font-size:16px;line-height:25px;overflow-wrap:anywhere;word-break:break-word;">${lines(pickup.details || 'None provided')}</p>
${pickup.offer === 'SPACE5' ? `<p style="margin:24px 0 0;padding:14px;border:2px solid ${ink};font-size:15px;line-height:23px;"><strong>SPACE5 · 5% off your next removal</strong><br>${customer ? 'Included with your request for the crew to apply when quoting.' : 'Apply the arcade offer when preparing the quote.'}</p>` : ''}
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;"><tr><td bgcolor="${ink}" style="border:2px solid ${ink};padding:14px 20px;text-align:center;"><a href="${escapeEmail(replyUrl)}" style="display:inline-block;font-size:16px;line-height:24px;font-weight:bold;color:${cream};text-decoration:underline;">${customer ? 'Reply to the crew' : 'Reply to customer'} &rarr;</a></td></tr></table>
${customer ? `<p style="margin:16px 0 0;font-size:14px;line-height:22px;">Need to update something? Reply to this email or call <a href="tel:+18016027705" style="color:${ink};text-decoration:underline;">(801) 602-7705</a>.</p>` : ''}
${!customer ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #d4cebc;font-size:13px;line-height:21px;color:#514759;">${lines(consentSummary)}</p>` : ''}
</td></tr><tr><td bgcolor="${ink}" style="padding:20px 24px;color:${cream};font-size:13px;line-height:21px;"><p style="margin:0 0 6px;font-weight:bold;">Bulk Away · Waste Solution Innovators family</p><p style="margin:0;"><a href="mailto:service@bulkaway.com" style="color:${cream};text-decoration:underline;">service@bulkaway.com</a> &nbsp;·&nbsp; <a href="tel:+18016027705" style="color:${cream};text-decoration:underline;">(801) 602-7705</a></p>${customer ? '<p style="margin:10px 0 0;">Sent in response to a pickup request using this email address. If you didn’t submit it, contact the crew.</p>' : ''}</td></tr>
</table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
}
