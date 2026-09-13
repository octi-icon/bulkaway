'use client';
import Image from '@/components/site-image';
import { useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Orbit,
  Recycle,
  Sofa,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceFinder } from '@/components/service-finder';
import { DraftSafeLink } from '@/components/draft-safe-link';
import { serviceRouteIds } from '@/lib/service-links';
export const services = [
  {
    title: 'Bulk item removal',
    icon: Sofa,
    heading: 'That thing taking up space? It’s time.',
    text: 'From a single bulky item to a bigger clear-out, get a pickup built around what you need gone. Give your old furniture a proper send-off and reclaim your room.',
    items: [
      'On-demand pickups',
      'Furniture & bulky items',
      'Special-item quotes',
    ],
    cta: 'Get my bulk pickup quote',
  },
  {
    title: 'Trash outs',
    icon: Building2,
    heading: 'A fresh start for your next chapter.',
    text: 'A move-out can leave more than an empty unit. We help property managers clear left-behind furniture and trash from apartments and properties, so the next stage of the reset can begin.',
    items: [
      'Apartment & property clear-outs',
      'Left-behind items & trash',
      'Quotes for your scope of work',
    ],
    cta: 'Plan my trash out',
  },
  {
    title: 'Weekly bulk service',
    icon: CalendarDays,
    heading: 'Make “all clear” a regular thing.',
    text: 'For apartment teams dealing with the same buildup week after week: bulk item removal, dumpster enclosure sweeping, and recyclable removal in one recurring service.',
    items: [
      'Weekly bulk item removal',
      'Dumpster enclosure sweeping',
      'Recyclable material removal',
    ],
    cta: 'Talk weekly service',
  },
  {
    title: 'Chute room clear outs',
    icon: Truck,
    heading: 'Clear the room. Keep things moving.',
    text: 'Buildup in the chute room? We clear out left-behind items and haul them away. Tell us which rooms need attention and how your team provides access.',
    items: [
      'Chute room clear outs',
      'Haul-off included in the quote',
      'Service for multifamily communities',
    ],
    cta: 'Clear my chute rooms',
  },
  {
    title: 'Donations & recyclables',
    icon: Recycle,
    heading: 'Out of your space. Onto what’s next.',
    text: 'Have donation items or recyclables ready to go? Tell us what you’ve set aside. We’ll confirm acceptance and handling options before we pick it up.',
    items: [
      'Donation pickup requests',
      'Recyclable material removal',
      'Item acceptance confirmed with you',
    ],
    cta: 'Ask about my items',
  },
];
export function LaunchPad() {
  const [launches, setLaunches] = useState(0);
  return (
    <div className={`launch-pad ${launches > 0 ? 'launched' : ''}`}>
      <div className="orbit orbit-one" aria-hidden="true" />
      <div className="orbit orbit-two" aria-hidden="true" />
      <Sparkles className="hero-spark spark-one" aria-hidden="true" />
      <Sparkles className="hero-spark spark-two" aria-hidden="true" />
      <div className="orbital-tag">
        YOUR SPACE.
        <br />
        <strong>REIMAGINED.</strong>
      </div>
      <Image
        key={launches}
        unoptimized
        className="hero-logo"
        src="/brand/bulk-away.png"
        alt="Bulk Away — Junk Removal · Trash Outs. A rocket-powered hauling truck."
        width="516"
        height="395"
        fetchPriority="high"
      />
      <Button
        className="launch-control"
        onClick={() => setLaunches(launches + 1)}
      >
        <Orbit size={18} />
        {launches > 0 ? 'Mission accomplished. Again?' : 'A little lift-off?'}
        <ArrowUpRight size={16} />
      </Button>
    </div>
  );
}
export function ServiceExplorer() {
  const [active, setActive] = useState(0);
  return (
    <>
      <noscript>
        <style>{`
          #service-finder, .service-menu { display: none; }
          .service-explorer { display: block; }
          .service-panel[hidden] { display: block !important; }
          .service-panel { min-height: 0; margin-block: 24px; }
        `}</style>
        <p>
          All five services are listed below. Call or email the crew to plan
          your pickup.
        </p>
      </noscript>
      <ServiceFinder
        onExplore={(name) => {
          const index = services.findIndex((entry) => entry.title === name);
          if (index < 0) return;
          setActive(index);
          requestAnimationFrame(() =>
            document.getElementById(`service-panel-${index}`)?.focus(),
          );
        }}
      />
      <div className="service-explorer">
        <div
          className="service-menu"
          role="tablist"
          aria-label="Removal services"
          aria-orientation="vertical"
        >
          {services.map((s, i) => (
            <button
              key={s.title}
              id={`service-tab-${i}`}
              role="tab"
              aria-selected={i === active}
              aria-controls={`service-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
                  e.preventDefault();
                  const next =
                    e.key === 'Home'
                      ? 0
                      : e.key === 'End'
                        ? services.length - 1
                        : (i +
                            (e.key === 'ArrowDown' ? 1 : -1) +
                            services.length) %
                          services.length;
                  setActive(next);
                  document.getElementById(`service-tab-${next}`)?.focus();
                }
              }}
            >
              <s.icon size={23} />
              <span>{s.title}</span>
              <span className="service-indicator" aria-hidden="true" />
            </button>
          ))}
        </div>
        {services.map((service, index) => (
          <div
            key={service.title}
            className="service-panel"
            id={`service-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`service-tab-${index}`}
            hidden={index !== active}
            tabIndex={0}
          >
            <service.icon
              className="service-display-icon"
              size={80}
              strokeWidth={1}
              aria-hidden="true"
            />
            <h3>{service.heading}</h3>
            <p>{service.text}</p>
            <ul>
              {service.items.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
            <a
              className="button button-ink"
              href="#request"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('bulk-service', { detail: service.title }),
                )
              }
            >
              {service.cta}
              <ArrowUpRight size={18} />
            </a>
            <DraftSafeLink
              className="text-link service-details-link"
              href={`/services#${serviceRouteIds[service.title]}`}
            >
              Service details & rates{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
            </DraftSafeLink>
          </div>
        ))}
      </div>
    </>
  );
}
