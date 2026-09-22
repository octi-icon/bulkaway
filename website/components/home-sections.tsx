import { useRouteLoaderData } from 'react-router';
import Image from '@/components/site-image';
import { ArrowDown, ArrowUpRight, Check, Phone, Sparkles } from 'lucide-react';
import { DraftSafeLink } from '@/components/draft-safe-link';
import { CrewIllustration } from '@/components/atomic-experience';
import { PreflightCheck } from '@/components/engagement';
import { PickupForm } from '@/components/pickup-form';

export function HowItWorksSection({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const Heading = standalone ? 'h1' : 'h2';
  return (
    <section className="how section-pad" id="how-it-works">
      <div className="wrap">
        <div className="how-heading">
          <div className="how-heading-copy">
            <Heading>
              From “ugh”
              <br />
              to <em>all gone.</em>
            </Heading>
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
                Tell us what needs to go, where it is, and when you’d like it
                gone.
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
              <p>We take care of the haul. You get back to the good stuff.</p>
            </div>
          </li>
        </ol>
        <PreflightCheck requestHref={standalone ? '/pickup' : '#request'} />
      </div>
    </section>
  );
}

export function StorySection({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? 'h1' : 'h2';
  return (
    <section className="about section-pad" id="about">
      <div className="wrap about-grid">
        <div className="about-sign">
          <CrewIllustration />
          <span>Good people.</span>
          <strong>Heavy lifting.</strong>
          <em>Great feeling.</em>
        </div>
        <div className="about-copy">
          <Heading>
            A family business.
            <em>With lift-off energy.</em>
          </Heading>
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
            Bulk Away is women-majority owned, family owned and operated, and
            part of the Waste Solution Innovators family of brands. Real people,
            practical solutions, and a shared drive to make everyday spaces work
            better.
          </p>
          <p>
            Led by Bill Loftin, our division is backed by the advisory board and
            business and operations professionals at Waste Solution Innovators.
          </p>
          <DraftSafeLink className="text-link" href="/team">
            Meet the team <ArrowUpRight size={18} />
          </DraftSafeLink>
        </div>
      </div>
    </section>
  );
}

export function PickupSection({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const Heading = standalone ? 'h1' : 'h2';
  const { googleMapsKey } = useRouteLoaderData<{ googleMapsKey: string }>(
    'root',
  )!;
  return (
    <section id="request" className="request section-pad">
      <div className="wrap request-grid">
        <div className="request-copy">
          <Heading>
            Ready for
            <em>some space?</em>
          </Heading>
          <p>
            Your next fresh start is one request away. Send us the details and
            our crew will be in touch to line up your quote and pickup.
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
                Items and volume, access, disposal, and special handling shape
                your quote. We confirm the price and date with you.
              </p>
              <a href={standalone ? '/#faq' : '#faq'}>
                More pickup answers <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        <PickupForm googleMapsKey={googleMapsKey} />
      </div>
    </section>
  );
}
