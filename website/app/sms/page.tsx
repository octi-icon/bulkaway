import Link from 'next/link';
import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

export const metadata: Metadata = {
  title: 'SMS terms & pickup text updates | Bulk Away',
  description:
    'Bulk Away SMS terms for optional quote, scheduling, and pickup updates. Learn about consent, STOP and HELP, mobile privacy, and the upcoming client portal.',
  alternates: { canonical: '/sms' },
  ...socialMetadata(
    'SMS terms & pickup text updates | Bulk Away',
    'Terms for Bulk Away’s upcoming optional quote and pickup text updates, including consent, STOP, HELP, and mobile privacy.',
    '/sms',
  ),
};

export default function SmsTerms() {
  return (
    <main id="main" tabIndex={-1} className="privacy-page legal-page">
      <div className="wrap">
        <Link className="wordmark" href="/">
          Bulk Away
        </Link>
        <h1>
          Less wondering.
          <br />
          <em>More “on our way.”</em>
        </h1>
        <p>SMS Terms &amp; Conditions · Updated September 6, 2026</p>
        <div className="sms-launch-note">
          <h2>Text updates are coming.</h2>
          <p>
            Bulk Away is preparing its own SMS service through Twilio, with
            messaging also available through a future client portal. Neither is
            live on this website yet. You can record your optional text
            preference with a pickup request; it does not send a text or
            activate an automated subscription today.
          </p>
        </div>
        <nav className="legal-nav" aria-label="On this page">
          <a href="#program">The program</a>
          <a href="#consent">Your consent</a>
          <a href="#stop">Stop messages</a>
          <a href="#help">Get help</a>
          <a href="#mobile-information">Mobile privacy</a>
        </nav>
        <section id="program">
          <h2>What you can receive</h2>
          <p>
            Bulk Away’s Quote &amp; Pickup Updates program is for
            service-related texts about quotes, scheduling, arrival or pickup
            coordination, changes, and follow-up on your requested service.
            Messages may be automated once the system launches. This consent
            does not cover advertising, promotions, or other WSI brands’
            messages.
          </p>
          <p>
            Message frequency varies with your requests and service activity.
            Message and data rates may apply. Your wireless provider can explain
            your plan’s charges. Delivery depends on your carrier and network
            availability; messages may be delayed or unavailable. Carriers are
            not liable for delayed or undelivered messages.
          </p>
        </section>
        <section id="consent">
          <h2>You choose to opt in</h2>
          <p>
            To record your choice, select the separate, optional SMS checkbox
            and submit the pickup-request form. The box is unchecked by default.
            Use a mobile number you own or are authorized to use. We retain the
            disclosure and version, signup method, and server-recorded time with
            your request.
          </p>
          <p>
            SMS consent is not a condition of purchase or service. You can
            request a quote without selecting the SMS box. Giving us your
            number, agreeing to a phone or email response, reading this page, or
            saving cookie preferences does not enroll you in texts.
          </p>
          <p>
            When the client portal launches, it will provide another way to
            access messaging and manage SMS preferences. There is no portal
            sign-in or SMS preference sync available here yet. Any future
            enrollment must clearly identify Bulk Away, the message purpose, and
            your choices.
          </p>
        </section>
        <section id="stop">
          <h2>Stop messages at any time</h2>
          <p>
            When the program is active, reply <strong>STOP</strong> to a Bulk
            Away program message to unsubscribe. You may receive one
            confirmation of the opt-out; further program texts will stop unless
            you choose to opt in again.
          </p>
          <p>
            You can also withdraw consent now or after launch by emailing{' '}
            <a href="mailto:service@bulkaway.com">service@bulkaway.com</a> or
            calling <a href="tel:+18016027705">801.602.7705</a>. Tell us the
            mobile number associated with your choice. Contact us if your number
            changes or is reassigned. Withdrawing SMS consent does not cancel a
            pickup; contact the crew separately to change service arrangements.
          </p>
        </section>
        <section id="help">
          <h2>A real crew. Ready to help.</h2>
          <p>
            Once the program is active, reply <strong>HELP</strong> to a program
            message for assistance. You can always contact the crew at{' '}
            <a href="mailto:service@bulkaway.com">service@bulkaway.com</a> or{' '}
            <a href="tel:+18016027705">801.602.7705</a>. For time-sensitive
            changes, call the crew. Do not rely on a text being seen
            immediately.
          </p>
        </section>
        <section id="mobile-information">
          <h2>Your mobile information</h2>
          <p>
            We do not sell, rent, or share mobile information with third parties
            or affiliates for marketing or promotional purposes. SMS opt-in data
            and consent are not sold or transferred to other organizations for
            their own messaging programs. Providers such as Twilio may process
            messaging information on our behalf to deliver and support the
            program when connected.
          </p>
          <p>
            Read our <Link href="/privacy#sms-privacy">SMS privacy notice</Link>{' '}
            for details about consent records, information use, retention, and
            your choices.
          </p>
        </section>
        <section>
          <h2>Updates to these terms</h2>
          <p>
            We may update these terms as the program develops. The date above
            identifies the current version. A change in sender or message
            purpose requires an appropriate new opt-in; existing consent does
            not authorize unrelated messages.
          </p>
        </section>
        <Link className="button button-ink" href="/#request">
          Request a pickup
        </Link>
      </div>
    </main>
  );
}
