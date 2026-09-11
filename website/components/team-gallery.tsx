'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Camera, Orbit, Sparkles } from 'lucide-react';

type Person = {
  slug: string;
  name: string;
  role: string;
  group: 'advisory' | 'support';
};
const people: Person[] = [
  {
    slug: 'robert-watson',
    name: 'Robert Watson',
    role: 'Principal & CHRO',
    group: 'advisory',
  },
  {
    slug: 'kris-watson',
    name: 'Kris Watson',
    role: 'Principal & CFO',
    group: 'advisory',
  },
  {
    slug: 'justin-watson',
    name: 'Justin Watson',
    role: 'Principal & Chairman of the Board',
    group: 'advisory',
  },
  {
    slug: 'shauna-loftin',
    name: 'Shauna Loftin',
    role: 'Principal & CSO',
    group: 'advisory',
  },
  {
    slug: 'andrea-gray',
    name: 'Andrea Gray',
    role: 'Principal',
    group: 'advisory',
  },
  {
    slug: 'eddie-carey',
    name: 'Eddie Carey',
    role: 'Director of Business Development',
    group: 'support',
  },
  {
    slug: 'regina-enman',
    name: 'Regina Enman',
    role: 'HR Manager',
    group: 'support',
  },
  {
    slug: 'heather-rapallo',
    name: 'Heather Rapallo',
    role: 'Recruiting & Training Manager',
    group: 'support',
  },
  {
    slug: 'skylar-clemons',
    name: 'Skylar Clemons',
    role: 'Project Manager',
    group: 'support',
  },
];

function Portrait({
  slug,
  name,
  eager = false,
}: {
  slug: string;
  name: string;
  eager?: boolean;
}) {
  const [original, setOriginal] = useState(false);
  return (
    <div className="crew-portrait" data-original={original}>
      {/* Pre-sized local WebP variants avoid runtime image processing. */}
      {/* oxlint-disable-next-line next/no-img-element */}
      <img
        src={`/team/${slug}${original ? '-original' : ''}-640.webp`}
        srcSet={`/team/${slug}${original ? '-original' : ''}-320.webp 320w, /team/${slug}${original ? '-original' : ''}-640.webp 640w`}
        sizes="(max-width: 560px) 82vw, (max-width: 900px) 42vw, 400px"
        width={640}
        height={800}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        alt={`${name}${original ? ', original photograph' : ', Bulk Away styled portrait'}`}
      />
      <button
        type="button"
        className="crew-photo-toggle"
        aria-label={
          original
            ? `Back to atomic portrait of ${name}`
            : `Show original photo of ${name}`
        }
        onClick={() => setOriginal(!original)}
      >
        {original ? (
          <Sparkles size={17} aria-hidden="true" />
        ) : (
          <Camera size={17} aria-hidden="true" />
        )}
        <span>{original ? 'Back to atomic' : 'Show original photo'}</span>
      </button>
    </div>
  );
}

export function TeamGallery() {
  const [group, setGroup] = useState<'all' | 'advisory' | 'support'>('all');
  return (
    <section
      className="crew-section section-pad"
      id="team"
      aria-labelledby="crew-heading"
    >
      <div className="wrap">
        <div className="crew-heading">
          <h1 id="crew-heading">
            Real people.<em>Big lift-off energy.</em>
          </h1>
          <p>
            Meet the people behind Bulk Away—and the Waste Solution Innovators
            team in our corner.
          </p>
        </div>
        <article className="crew-leader" aria-labelledby="bill-name">
          <Portrait slug="bill-loftin" name="Bill Loftin" eager />
          <div className="crew-leader-copy">
            <div className="crew-leader-title">
              <Orbit aria-hidden="true" />
              <span>Bulk Away Division Leader</span>
            </div>
            <h2 id="bill-name">Bill Loftin</h2>
            <p className="crew-leader-role">
              Principal &amp; CMRO
              <br />
              Waste Solution Innovators
            </p>
            <p>
              At the helm of Bulk Away, Bill leads our division with the backing
              of the Waste Solution Innovators family.
            </p>
            <Link className="button" href="/#pickup-request">
              Put our team to work <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </article>
        <div className="crew-directory-heading">
          <h2>A whole team in your corner.</h2>
          <fieldset className="crew-filters">
            <legend className="sr-only">Choose a team group</legend>
            {(
              [
                ['all', 'Everyone'],
                ['advisory', 'Advisory board'],
                ['support', 'WSI support'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={group === value}
                aria-controls="crew-directory"
                onClick={() => setGroup(value)}
              >
                {label}
              </button>
            ))}
          </fieldset>
        </div>
        <p className="crew-directory-note">
          Advisory and support roles below are with Waste Solution Innovators.
          Tap a portrait’s camera button to meet the original.
        </p>
        <output className="sr-only">
          {group === 'all'
            ? 'Showing all 9 advisory and support team members.'
            : group === 'advisory'
              ? 'Showing 5 advisory board members.'
              : 'Showing 4 WSI support team members.'}
        </output>
        <div id="crew-directory" className="crew-directory">
          {people.map((person) => (
            <article
              key={person.slug}
              className="crew-person"
              hidden={group !== 'all' && group !== person.group}
            >
              <Portrait slug={person.slug} name={person.name} />
              <div className="crew-person-copy">
                <h3>{person.name}</h3>
                <p>{person.role}</p>
                <span>
                  {person.group === 'advisory'
                    ? 'Advisory board'
                    : 'WSI support'}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
