import Link from 'next/link';
import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

export const metadata: Metadata = {
  title: 'Privacy & cookie notice | Bulk Away',
  description:
    'How Bulk Away handles pickup requests, cookie preferences, and optional SMS consent, with contact information for privacy requests.',
  alternates: { canonical: '/privacy' },
  ...socialMetadata(
    'Privacy & cookie notice | Bulk Away',
    'How Bulk Away handles pickup requests, photos, cookie preferences, and optional SMS consent.',
    '/privacy',
  ),
};

export default function Privacy() {
  return (
    <main id="main" tabIndex={-1} className="privacy-page legal-page">
      <div className="wrap">
        <Link href="/" className="wordmark">
          Bulk Away
        </Link>
        <h1>
          Your information.
          <br />
          <em>Handled with care.</em>
        </h1>
        <p>Privacy &amp; Cookie Notice · Updated September 8, 2026</p>
        <p>
          This notice describes how Bulk Away, part of the Waste Solution
          Innovators family, handles information through this website and its
          pickup-request form.
        </p>
        <nav className="legal-nav" aria-label="On this page">
          <a href="#information">Information you share</a>
          <a href="#use">How we use it</a>
          <a href="#address-search">Address search</a>
          <a href="#sms-privacy">SMS privacy</a>
          <a href="#cookies">Cookies &amp; storage</a>
          <a href="#choices">Your choices</a>
        </nav>
        <section id="information">
          <h2>What you share</h2>
          <p>
            We collect the name, phone number, email address, pickup address,
            optional apartment/unit/building details, selected service, optional
            preferred date, optional photos, and job details you submit. We also
            record your permission to respond and, separately, whether you
            choose optional SMS updates.
          </p>
          <p>
            Please include only information needed to plan your pickup. Do not
            include payment information, government identification numbers, or
            sensitive personal details.
          </p>
        </section>
        <section id="use">
          <h2>How your information is used</h2>
          <p>
            We use your request to respond, prepare a quote, confirm
            availability, and coordinate service. Requests are emailed to
            service@bulkaway.com through our Google mail setup. Submitting a
            request does not confirm a booking or sign you up for marketing.
          </p>
          <p>
            Optional photos are used to understand what needs hauling and are
            attached to the request email. Before emailing, the server resizes
            and re-encodes them without embedded metadata, including location
            metadata. Visible details within a photo are not removed. Photos are
            not published or placed in a public gallery. Originals are processed
            in memory; the emailed copies follow the retention practices for
            service correspondence below.
          </p>
          <p>
            Hosting and email providers process information needed to operate
            the site and deliver requests. Technical information, including IP
            addresses and request identifiers, may be processed to prevent
            abuse, limit repeated submissions, and troubleshoot delivery.
            Short-lived request records are held by the website server; the
            delivered request remains in our service mailbox.
          </p>
          <p>
            Links to other WSI brands take you to separate websites with their
            own privacy practices. Choosing Bulk Away SMS updates does not
            enroll you in another brand’s messaging program.
          </p>
        </section>
        <section id="address-search">
          <h2>Google address search: terms &amp; privacy</h2>
          <p>
            When enabled, our pickup form offers address suggestions through
            Google Maps Platform. When you type at least three characters in
            address-search mode, your search text and technical information such
            as your IP address are sent to Google to provide suggestions.
            Selecting a suggestion retrieves its formatted address. Suggestions
            prioritize our Utah service area; they do not confirm service
            coverage, access, or a booking.
          </p>
          <p>
            Use of Google address search is subject to the{' '}
            <a href="https://maps.google.com/help/terms_maps/">
              Google Maps/Google Earth Additional Terms of Service
            </a>
            . Google processes information under its{' '}
            <a href="https://policies.google.com/privacy">Privacy Policy</a>. We
            incorporate those terms and privacy practices for this feature. You
            can choose <strong>Enter address manually</strong> before typing to
            avoid sending address searches to Google, or continue manually if
            suggestions are unavailable.
          </p>
          <p>
            We use the address you select or enter, plus any separately entered
            unit details, to process your pickup request as described above. The
            website does not save address searches or suggestion lists in
            browser storage or maintain a Google-results database. Unit details
            entered in the separate field are not sent to Google by this form.
          </p>
        </section>
        <section id="sms-privacy">
          <h2>SMS notifications &amp; mobile privacy</h2>
          <p>
            Bulk Away’s planned SMS program covers quotes, scheduling, pickups,
            and service updates. It will use Twilio and will also be accessible
            through our future client portal. Twilio messaging and the portal
            are not connected to this website yet. No automated text or active
            subscription is created by submitting this form today.
          </p>
          <p>
            The optional, unchecked SMS box records your choice with your pickup
            request. If selected, the email includes your number, the
            server-recorded date and time, the signup method, and the disclosure
            text and version you agreed to. Providing a phone number or agreeing
            to a phone or email response does not by itself authorize SMS
            enrollment. Cookie preferences are separate from SMS consent.
          </p>
          <p>
            When messaging is available, we and providers acting on our behalf
            may process your mobile number, consent record, message content and
            delivery activity, and opt-out preferences to deliver and support
            the updates you request. Message frequency varies. Message and data
            rates may apply. Consent is not a condition of purchase or service.
          </p>
          <p>
            We do not sell, rent, or share mobile information with third parties
            or affiliates for marketing or promotional purposes. SMS opt-in data
            and consent are not sold or transferred to other organizations for
            their own messaging programs. Messaging and support providers may
            process this information only to provide the program on our behalf.
          </p>
          <p>
            You may withdraw your recorded choice now by emailing{' '}
            <a href="mailto:service@bulkaway.com">service@bulkaway.com</a> or
            calling <a href="tel:+18016027705">801.602.7705</a>. Once messages
            are available, reply <strong>STOP</strong> to stop messages or{' '}
            <strong>HELP</strong> for assistance. See the{' '}
            <Link href="/sms">SMS Terms &amp; Conditions</Link>.
          </p>
        </section>
        <section id="cookies">
          <h2>Cookies &amp; browser storage</h2>
          <p>
            The optional arcade saves your best timed-game score on this device
            using local storage under <code>bulk-away-arcade-best-v1</code>. It
            contains only a score, has no automatic expiration, and is not a
            public leaderboard. Use “Clear personal best” in the arcade or clear
            your browser storage to remove it. If storage is blocked, you can
            still play. The arcade has no account, analytics, or automatic
            messaging signup.
          </p>
          <p>
            If you use the arcade’s SPACE5 offer, its code is included in your
            pickup request and service email so the crew can apply 5% off your
            next removal when quoting. Playing does not book a service. Scores
            are not sent with the request.
          </p>
          <p>
            This website does not install analytics or advertising trackers.
            Fonts and brand images are hosted with the site. There are no
            optional tracking categories to enable.
          </p>
          <p>
            Google address search is a separate optional lookup feature, loaded
            only when you begin an address search. Google may process technical
            information as described in its Privacy Policy. You can use manual
            address entry regardless of your cookie preference.
          </p>
          <p>
            When you choose necessary only or dismiss the popup, we save that
            choice in session storage for the current browser tab. If you select
            “Remember my choice,” we also save a version and expiration time in
            local storage for 180 days. These settings use the key{' '}
            <code>bulk-away-privacy-v1</code>, contain no contact details, and
            are not used to track you across websites. Expired or invalid
            settings are removed when you next visit.
          </p>
          <p>
            Open <strong>Cookie settings</strong> at the bottom of any page to
            change your choice. Choose “Use necessary only” to remove the
            persistent record. If your browser blocks storage, you can still use
            the website, but the notice may appear again. You can also clear
            saved preferences using your browser settings.
          </p>
          <p>
            Cursor and motion options are saved separately for this browser
            tab’s session so your device-cursor, click-sparkle and motion-pause
            preferences survive page changes and reloads when browser storage is
            available. They contain no contact information and are not used for
            tracking. Change them in <strong>Cursor options</strong> near the
            homepage motion control or at the bottom of any page. Use the motion
            button beside it to pause or allow animation. Your device’s
            reduced-motion setting always applies.
          </p>
          <p>
            If optional tracking is added, we will update this notice and the
            controls before it runs. Your current choice does not authorize
            future analytics, advertising, or SMS enrollment.
          </p>
        </section>
        <section id="choices">
          <h2>Retention, questions &amp; your choices</h2>
          <p>
            We retain service correspondence as needed to handle requests,
            provide service, resolve disputes, and meet applicable obligations.
            Consent and opt-out records may be retained to document your choices
            and prevent unwanted messages. We limit access to people and
            providers who need the information to do this work.
          </p>
          <p>
            To ask about your information, request access or a correction or
            deletion, or withdraw SMS consent, email{' '}
            <a href="mailto:service@bulkaway.com">service@bulkaway.com</a> or
            call <a href="tel:+18016027705">801.602.7705</a>. Include your
            request reference if you have one. We may need to verify your
            identity and retain records needed to provide service or honor an
            opt-out.
          </p>
          <p>
            We may update this notice as the service changes. The date above
            identifies the current version.
          </p>
        </section>
        <Link className="button button-ink" href="/#request">
          Back to your fresh start
        </Link>
      </div>
    </main>
  );
}
