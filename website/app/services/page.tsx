/* oxlint-disable next/no-img-element -- Prebuilt responsive WebP assets avoid a runtime image service. */
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Download,
  Check,
} from 'lucide-react';
import { BeforeAfter } from '@/components/before-after';
import { serviceCatalog } from '@/lib/service-catalog';
import { siteOrigin, serviceCounties } from '@/lib/site-data';
import { socialMetadata } from '@/lib/social-metadata';
import '../services.css';

export const metadata: Metadata = {
  title: 'Services & 2026 Rates | Bulk Away',
  description:
    'Explore Utah bulk item removal, trash outs, weekly bulk service, chute room clear outs, and donation pickup. Compare Bulk Away’s 2026 service rates.',
  alternates: { canonical: '/services' },
  ...socialMetadata(
    'Bulk Away Services & 2026 Rates',
    'Find the right fresh start for your home, business, or community. Explore all five services and pricing.',
    '/services',
  ),
};

export default function ServicesPage() {
  return (
    <div className="services-page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="services-header wrap">
        <Link className="wordmark" href="/" aria-label="Bulk Away home">
          Bulk Away
        </Link>
        <nav aria-label="Services page navigation">
          <a href="#rates">2026 rates</a>
          <Link className="button button-small" href="/#pickup-request">
            Request a pickup <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section
          className="services-intro wrap"
          aria-labelledby="services-title"
        >
          <div className="services-intro-copy">
            <h1 id="services-title">
              Big on hauling.
              <br />
              <em>Better at space.</em>
            </h1>
            <p>
              One old sofa. A whole apartment. The same pile every Monday.
              There’s a Bulk Away service for your kind of fresh start.
            </p>
            <p className="services-coverage">
              Junk removal and trash outs in Salt Lake, Utah, Weber, and Davis
              counties.
            </p>
            <a href="#service-guide" className="text-link">
              Find your service <ArrowDown size={19} aria-hidden="true" />
            </a>
          </div>
          <BeforeAfter eager />
        </section>

        <div className="service-guide" id="service-guide">
          <nav className="service-jump-nav wrap" aria-label="Jump to a service">
            {serviceCatalog.map((service) => (
              <a key={service.id} href={`#${service.id}`}>
                {service.name}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            ))}
          </nav>
          <div className="wrap">
            {serviceCatalog.map((service) => (
              <section
                className="service-story"
                id={service.id}
                key={service.id}
                aria-labelledby={`${service.id}-title`}
              >
                <div className="service-story-art">
                  <BeforeAfter
                    before={service.beforeImage}
                    after={service.afterImage}
                    label={service.name}
                    beforeAlt={service.beforeAlt}
                    afterAlt={service.alt}
                  />
                  <p>{service.headline}</p>
                </div>
                <div className="service-story-copy">
                  <h2 id={`${service.id}-title`}>{service.name}</h2>
                  <p>{service.description}</p>
                  <ul>
                    {service.includes.map((item) => (
                      <li key={item}>
                        <Check size={18} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>{service.detail}</p>
                  <details className="service-scope-notes">
                    <summary>What to include in your request</summary>
                    <p>{service.prepare}</p>
                    <p>{service.note}</p>
                  </details>
                  <div className="service-story-actions">
                    <Link
                      className="button button-ink"
                      href={`/?service=${service.id}#pickup-request`}
                    >
                      {service.cta}
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                    <a
                      className="service-rate-link"
                      href={`#rate-${service.id}`}
                    >
                      See rates
                    </a>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        <section
          className="service-pricing"
          id="rates"
          aria-labelledby="rates-title"
        >
          <div className="wrap">
            <div className="service-pricing-heading">
              <div>
                <h2 id="rates-title">
                  A little clarity.
                  <br />
                  <em>Before the clear-out.</em>
                </h2>
                <p>
                  2026 service pricing, straight from our rate sheet. Compare
                  the two columns, then tell us about your job for a confirmed
                  quote.
                </p>
              </div>
              <a
                className="rates-download"
                href="/downloads/bulk-away-rates-2026.pdf"
                download
              >
                <Download size={22} aria-hidden="true" />
                Download the 2026 rate sheet <span>PDF</span>
              </a>
            </div>
            <p className="rate-audience" id="rate-audience">
              Already use Pet Waste Pals or another Waste Solution Innovators
              company? Ask about bundle pricing for your property or business.
              Standard pricing applies when you use Bulk Away on its own. Our
              crew confirms the applicable rate and your job’s final quote.
            </p>
            <table
              className="service-rate-table"
              aria-describedby="rate-audience rate-conditions"
            >
              <caption className="sr-only">
                Bulk Away 2026 service rates
              </caption>
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">
                    Bundle pricing<small>With other WSI services</small>
                  </th>
                  <th scope="col">
                    Standard pricing<small>Without WSI services</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceCatalog.map((service) => (
                  <tr key={service.id} id={`rate-${service.id}`}>
                    <th scope="row">
                      <a href={`#${service.id}`}>{service.name}</a>
                      <small>{service.rateUnit}</small>
                    </th>
                    <td>
                      <span className="mobile-rate-label">Bundle</span>
                      <strong>{service.bundle}</strong>
                      {service.id === 'donations-recyclables' && (
                        <small>Estimated fuel surcharge</small>
                      )}
                    </td>
                    <td>
                      <span className="mobile-rate-label">Standard</span>
                      <strong>{service.standard}</strong>
                      {service.id === 'donations-recyclables' && (
                        <small>Minimum</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="rate-conditions" id="rate-conditions">
              <div>
                <h3>What’s included</h3>
                <ul>
                  <li>
                    Weekly subscriptions include once-weekly service, bulk item
                    removal, dumpster-enclosure sweeping, and recyclable
                    material removal. Extra loads may incur additional charges.
                  </li>
                  <li>
                    Chute room rates include haul-off. Ask about additional
                    discounts for scheduled weekly pickups.
                  </li>
                  <li>
                    On-demand bulk removal lists a 24–72-hour turnaround.
                    Availability and scheduling are confirmed with the crew.
                  </li>
                </ul>
              </div>
              <div>
                <h3>What can affect the total</h3>
                <ul>
                  <li>
                    Landfill charges may apply depending on local fee schedules.
                  </li>
                  <li>
                    Carpet removal, excess trash or bulk items, infested
                    household items, and hazardous waste require a custom quote.
                    Confirm acceptance before pickup.
                  </li>
                  <li>
                    Infestations such as bedbugs or cockroaches require
                    completed extermination procedures before removal.
                  </li>
                  <li>
                    Mattresses, refrigerators, electronics, and tires are
                    charged per item.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          className="services-next wrap"
          aria-labelledby="services-next-title"
        >
          <div>
            <h2 id="services-next-title">
              Your space.
              <br />
              <em>Your next move.</em>
            </h2>
            <p>
              Share the items, the location, and the access details. Our crew
              will help match the service to your job and confirm the quote.
            </p>
          </div>
          <div className="services-next-actions">
            <Link href="/#pickup-request" className="button button-ink">
              Let’s plan your pickup{' '}
              <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
            <a href="tel:+18016027705">Pickup questions? 801.602.7705</a>
            <a href="mailto:service@bulkaway.com">service@bulkaway.com</a>
            <small>
              Other questions & inquiries:{' '}
              <a href="tel:+18017131306">801.713.1306</a>
            </small>
          </div>
        </section>
      </main>
      <footer className="services-footer wrap">
        <Link href="/" className="text-link">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Bulk Away
        </Link>
        <nav aria-label="More from Bulk Away">
          <Link href="/team">Meet the team</Link>
          <Link href="/privacy">Privacy & cookies</Link>
          <Link href="/sms">SMS terms</Link>
        </nav>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Bulk Away services',
            itemListElement: serviceCatalog.map((service, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Service',
                name: service.name,
                description: service.description,
                url: `${siteOrigin}/services#${service.id}`,
                provider: {
                  '@type': 'Organization',
                  name: 'Bulk Away',
                  url: siteOrigin,
                },
                areaServed: serviceCounties.map((name) => ({
                  '@type': 'AdministrativeArea',
                  name: `${name}, Utah`,
                })),
              },
            })),
          }).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}
