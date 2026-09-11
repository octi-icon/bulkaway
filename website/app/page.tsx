import Image from 'next/image';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Phone,
  Sparkles,
  Orbit,
  Recycle,
  Rocket,
  Gamepad2,
} from 'lucide-react';
import { PickupForm } from '@/components/pickup-form';
import { DraftSafeLink } from '@/components/draft-safe-link';
import { CursorOptions } from '@/components/site-experience';
import { ServiceExplorer, SiteHeader } from '@/components/interactive';
import {
  AtomicSky,
  SpaceSign,
  MotionToggle,
  CrewIllustration,
} from '@/components/atomic-experience';
import { searchData } from '@/lib/site-data';
import { countyMap, countyRegions } from '@/lib/county-map';
import {
  CountyExplorer,
  HaulBuilder,
  PreflightCheck,
  FamilyFinder,
} from '@/components/engagement';
export const metadata = { alternates: { canonical: '/' } };

const marqueeMessages = [
  'LESS JUNK',
  'APARTMENT TRASH OUTS',
  'BULK PICKUPS. BIG RELIEF.',
  'CHUTE ROOMS, CLEARED',
  'MORE SPACE',
  'WEEKLY BULK SERVICE',
  'ENCLOSURES, SWEPT',
  'COMMERCIAL SPACE, RECLAIMED',
  'LESS CLUTTER. MORE CURB APPEAL.',
  'HELLO, POSSIBILITIES',
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(searchData).replace(/</g, '\\u003c'),
        }}
      />
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <AtomicSky />
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title">
                JUNK,
                <br />
                BE GONE.
                <br />
                <em>Hello, space.</em>
              </h1>
              <p>
                Utah junk removal for homes, apartment communities, and
                commercial properties. One bulky item or a whole trash out—our
                family-owned crew does the heavy lifting. You get the breathing
                room.
              </p>
              <div className="hero-actions">
                <a className="button" href="#request">
                  Let’s haul it away <ArrowUpRight />
                </a>
                <a className="text-link" href="#services">
                  Find your service <ArrowDown size={17} />
                </a>
              </div>
              <div className="family-note">
                <Orbit size={20} />
                <span>Women-majority owned. Family operated.</span>
              </div>
              <a className="hero-coverage" href="#service-area">
                Serving Salt Lake, Utah, Weber &amp; Davis counties
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <SpaceSign />
          </div>
          <div className="hero-bottom wrap">
            <span>Clearing the Way for What’s Next.</span>
            <a href="#services" aria-label="Explore Bulk Away services">
              <ArrowDown size={20} />
            </a>
            <div className="hero-accessibility">
              <MotionToggle />
              <CursorOptions />
            </div>
          </div>
        </section>
        <div className="ticker" aria-hidden="true">
          <div>
            {Array.from({ length: 2 }, (_, i) => (
              <div className="ticker-group" key={i}>
                {marqueeMessages.map((message) => (
                  <span key={message}>
                    {message} <Sparkles />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <CountyExplorer>
          <svg
            className="interactive-county-map"
            viewBox={`0 0 ${countyMap.width} ${countyMap.height}`}
            // SVG needs an image role to expose its accessible name as one graphic.
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="img"
            aria-label="Weber, Davis, Salt Lake, and Utah counties connected in their geographic positions, from north to south."
          >
            {countyRegions.map((county) => (
              <g key={county.name} data-region={county.name}>
                <path
                  d={county.path}
                  fill={county.fill}
                  fillRule="evenodd"
                  stroke="#1d1724"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <text x="325" y={county.labelY}>
                  {county.name} County
                </text>
              </g>
            ))}
          </svg>
        </CountyExplorer>
        <section id="services" className="services section-pad">
          <div className="wrap">
            <div className="section-heading">
              <h2>
                Junk removal. Trash outs.
                <br />
                <em>Consider it handled.</em>
              </h2>
              <p>
                A couch that’s overstayed its welcome. An apartment ready for a
                reset. A dumpster enclosure that needs some breathing room.
                There’s a Bulk Away for that.
              </p>
            </div>
            <ServiceExplorer />
            <HaulBuilder />
            <div className="special-items">
              <Recycle size={23} />
              <p>
                Mattresses, refrigerators, electronics, or tires?{' '}
                <strong>Tell us what you have.</strong> Some items require
                special handling and a custom quote.
              </p>
              <a href="#request" className="text-link">
                Ask the crew <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
        <section className="how section-pad" id="how-it-works">
          <div className="wrap">
            <div className="how-heading">
              <div className="how-heading-copy">
                <h2>
                  From “ugh”
                  <br />
                  to <em>all gone.</em>
                </h2>
                <p>
                  Big on getting it done.
                  <br />
                  Small on making it complicated.
                </p>
              </div>
              <Image
                className="fresh-start-illustration"
                src="/illustrations/fresh-start-door.webp"
                alt=""
                width={520}
                height={540}
                unoptimized
                loading="lazy"
              />
            </div>
            <ol className="steps">
              <li>
                <span className="step-number">1</span>
                <div>
                  <h3>Give us the scoop.</h3>
                  <p>
                    Tell us what needs to go, where it is, and when you’d like
                    it gone.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-number">2</span>
                <div>
                  <h3>We make a plan.</h3>
                  <p>
                    Our team confirms availability, your quote, and the pickup
                    details.
                  </p>
                </div>
              </li>
              <li>
                <span className="step-number">3</span>
                <div>
                  <h3>Space. Reclaimed.</h3>
                  <p>
                    We take care of the haul. You get back to the good stuff.
                  </p>
                </div>
              </li>
            </ol>
            <PreflightCheck />
          </div>
        </section>
        <section className="about section-pad" id="about">
          <div className="wrap about-grid">
            <div className="about-sign">
              <CrewIllustration />
              <span>Good people.</span>
              <strong>Heavy lifting.</strong>
              <em>Great feeling.</em>
            </div>
            <div className="about-copy">
              <h2>
                A family business.
                <em>With lift-off energy.</em>
              </h2>
              <div className="ownership-seal">
                <Sparkles size={18} aria-hidden="true" />
                <span>
                  Women-majority
                  <br />
                  owned
                </span>
              </div>
              <p>
                We think clearing out the old should feel like the start of
                something good. So we bring a can-do attitude to the stuff you’d
                rather not deal with.
              </p>
              <p>
                Bulk Away is women-majority owned, family owned and operated,
                and part of the Waste Solution Innovators family of brands. Real
                people, practical solutions, and a shared drive to make everyday
                spaces work better.
              </p>
              <p>
                Led by Bill Loftin, our division is backed by the advisory board
                and support team at Waste Solution Innovators.
              </p>
              <DraftSafeLink className="text-link" href="/team">
                Meet the team <ArrowUpRight size={18} />
              </DraftSafeLink>
            </div>
          </div>
        </section>
        <section id="request" className="request section-pad">
          <div className="wrap request-grid">
            <div className="request-copy">
              <h2>
                Ready for
                <em>some space?</em>
              </h2>
              <p>
                Your next fresh start is one request away. Send us the details
                and our crew will be in touch to line up your quote and pickup.
              </p>
              <a className="phone-link" href="tel:+18016027705">
                <Phone size={23} />
                <span>
                  801.602.7705<small>Call the Bulk Away crew</small>
                </span>
              </a>
              <a className="email-link" href="mailto:service@bulkaway.com">
                service@bulkaway.com <ArrowUpRight size={17} />
              </a>
              <div className="request-note">
                <Check size={18} />
                <div>
                  <h3>A quote that fits the job.</h3>
                  <p>
                    Items and volume, access, disposal, and special handling
                    shape your quote. We confirm the price and date with you.
                  </p>
                  <a href="#faq">
                    More pickup answers{' '}
                    <ArrowDown size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
            <PickupForm
              googleMapsKey={process.env.GOOGLE_MAPS_BROWSER_KEY || ''}
            />
          </div>
        </section>
        <section className="faq section-pad" id="faq">
          <div className="wrap faq-grid">
            <h2>
              A few things
              <br />
              <em>you might ask.</em>
            </h2>
            <div>
              <details>
                <summary>Where do you offer junk removal?</summary>
                <p>
                  We serve Salt Lake County, Utah County, Weber County, and
                  Davis County in Utah. Share your pickup address and what needs
                  to go, and our crew will confirm the quote and scheduling
                  details.
                </p>
              </details>
              <details>
                <summary>What can you haul away?</summary>
                <p>
                  Bulk items, furniture, and the contents of trash outs are a
                  good place to start. We also offer chute-room clear outs,
                  weekly bulk removal, and donation and recyclable removal. Tell
                  us exactly what’s in your load so we can confirm what we can
                  take.
                </p>
              </details>
              <details>
                <summary>How much will my pickup cost?</summary>
                <p>
                  We quote based on the items, volume, access, and disposal
                  requirements. Mattresses, refrigerators, electronics, and
                  tires are quoted per item. Landfill fees and special handling
                  may apply. We’ll confirm the details with you before
                  scheduling.
                </p>
              </details>
              <details>
                <summary>
                  Can you help my apartment community regularly?
                </summary>
                <p>
                  Yes. Our weekly bulk removal service includes bulk item
                  removal, sweeping dumpster enclosures, and removal of
                  recyclable materials. Ask about coordinating with other WSI
                  services for your community.
                </p>
              </details>
              <details>
                <summary>
                  What about hazardous materials or infested items?
                </summary>
                <p>
                  Please flag these in your request before moving or preparing
                  the items. Hazardous materials and special cleanup needs
                  require review. Infested household items require completed
                  extermination procedures before removal.
                </p>
              </details>
              <details>
                <summary>Do you offer power washing?</summary>
                <p>
                  Power washing is on the horizon. It isn’t available to book
                  yet. For now, our crew is focused on bulk removal and trash
                  outs.
                </p>
              </details>
            </div>
          </div>
        </section>
        <section className="family section-pad" id="family">
          <div className="wrap">
            <div className="section-heading">
              <h2>
                One family.
                <br />
                <em>A world of solutions.</em>
              </h2>
              <div className="family-parent">
                <Image
                  className="wsi-family-logo"
                  unoptimized
                  src="/brand/waste-solution-innovators.png"
                  alt="Waste Solution Innovators"
                  width={483}
                  height={232}
                  loading="lazy"
                />
                <p>
                  Bulk Away is part of the Waste Solution Innovators family.
                  Different specialties. The same family spirit. Meet the brands
                  helping you take care of more.
                </p>
              </div>
            </div>
            <FamilyFinder>
              <div className="brand-links">
                <DraftSafeLink
                  href="https://wsitrashvalet.com"
                  data-brand="valet"
                >
                  <span className="brand-match">
                    <Sparkles size={16} aria-hidden="true" />
                    Your match
                  </span>
                  <div className="brand-mark">
                    <Image
                      unoptimized
                      src="/brand/valet.png"
                      alt="WSI Trash & Recycling Valet"
                      width="240"
                      height="110"
                      loading="lazy"
                    />
                  </div>
                  <h3>Better days start at the doorstep.</h3>
                  <p>
                    Doorstep trash and recycling collection for multifamily
                    communities.
                  </p>
                  <span>
                    Explore WSI Trash &amp; Recycling Valet{' '}
                    <ArrowUpRight size={18} />
                  </span>
                </DraftSafeLink>
                <DraftSafeLink
                  href="https://petwastepals.com"
                  data-brand="pals"
                >
                  <span className="brand-match">
                    <Sparkles size={16} aria-hidden="true" />
                    Your match
                  </span>
                  <div className="brand-mark">
                    <Image
                      unoptimized
                      src="/brand/pet-waste-pals.png"
                      alt="Pet Waste Pals"
                      width="180"
                      height="120"
                      loading="lazy"
                    />
                  </div>
                  <h3>All the love. Less of the mess.</h3>
                  <p>Pet waste management, groundskeeping, and poop patrol.</p>
                  <span>
                    Meet Pet Waste Pals <ArrowUpRight size={18} />
                  </span>
                </DraftSafeLink>
                <DraftSafeLink href="https://aepoc.co" data-brand="aepoc">
                  <span className="brand-match">
                    <Sparkles size={16} aria-hidden="true" />
                    Your match
                  </span>
                  <div className="brand-mark">
                    <Image
                      unoptimized
                      src="/brand/aepoc-vector.svg"
                      alt="AEPOC"
                      width={256}
                      height={61}
                      loading="lazy"
                    />
                  </div>
                  <h3>Bright ideas. Real-world progress.</h3>
                  <p>
                    Business strategy and design, plus software development,
                    team building, and AI implementation guidance. AEPOC also
                    leads design for our entire family of brands.
                  </p>
                  <span>
                    Discover AEPOC <ArrowUpRight size={18} />
                  </span>
                </DraftSafeLink>
              </div>
            </FamilyFinder>
          </div>
        </section>
        <section
          className="arcade-invitation wrap"
          aria-labelledby="arcade-invitation-title"
        >
          <Gamepad2 size={48} aria-hidden="true" />
          <div>
            <h2 id="arcade-invitation-title">
              Small game. <em>Big clear-out.</em>
            </h2>
            <p>Beam up some pixel junk. Get 5% off your next removal.</p>
          </div>
          <DraftSafeLink
            href="/arcade"
            prefetch={false}
            className="button button-ink"
          >
            Play the Bulk Away arcade{' '}
            <ArrowUpRight size={18} aria-hidden="true" />
          </DraftSafeLink>
        </section>
      </main>
      <footer>
        <div className="wrap footer-main">
          <a href="#main" className="wordmark" aria-label="Bulk Away home">
            Bulk Away
          </a>
          <p>
            Clearing the Way
            <br />
            <strong>for What’s Next.</strong>
          </p>
          <a className="button" href="#request">
            Request a pickup <ArrowUpRight />
          </a>
        </div>
        <nav
          className="wrap footer-utility"
          aria-label="Bulk Away contacts and information"
        >
          <a href="#services">What we haul</a>
          <a href="#service-area">Utah service area</a>
          <a href="#faq">Pickup questions</a>
          <DraftSafeLink href="/arcade" prefetch={false}>
            Play the arcade
          </DraftSafeLink>
          <a href="tel:+18016027705">801.602.7705</a>
          <a href="mailto:service@bulkaway.com">service@bulkaway.com</a>
        </nav>
        <div className="wrap footer-bottom">
          <a
            className="back-to-liftoff text-link"
            href="#main"
            aria-label="Back to top — back to lift-off"
          >
            Back to lift-off <Rocket size={20} aria-hidden="true" />
          </a>
          <span>
            © {new Date().getFullYear()} Bulk Away. All rights reserved.
          </span>
          <a
            className="wsi-footer-link"
            href="#family"
            aria-label="Meet the Waste Solution Innovators family"
          >
            <Image
              unoptimized
              src="/brand/waste-solution-innovators-dark.png"
              alt="Waste Solution Innovators"
              width={965}
              height={462}
              loading="lazy"
            />
          </a>
        </div>
      </footer>
    </>
  );
}
