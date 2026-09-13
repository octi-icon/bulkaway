'use client';

import { useState } from 'react';
import Link from '@/components/site-link';
import { ArrowUpRight, Camera, Orbit, Sparkles } from 'lucide-react';
import styles from './team-gallery.module.css';

type Person = {
  slug: string;
  name: string;
  role: string;
  group: 'advisory' | 'operations';
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
    group: 'operations',
  },
  {
    slug: 'regina-enman',
    name: 'Regina Enman',
    role: 'HR Manager',
    group: 'operations',
  },
  {
    slug: 'heather-rapallo',
    name: 'Heather Rapallo',
    role: 'Recruiting & Training Manager',
    group: 'operations',
  },
  {
    slug: 'skylar-clemons',
    name: 'Skylar Clemons',
    role: 'Project Manager',
    group: 'operations',
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
    <div className={styles['crew-portrait']} data-original={original}>
      {/* Pre-sized local WebP variants avoid runtime image processing. */}
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
        className={styles['crew-photo-toggle']}
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
  const [group, setGroup] = useState<'all' | 'advisory' | 'operations'>('all');
  return (
    <section
      className={`${styles['crew-section']} section-pad`}
      id="team"
      aria-labelledby="crew-heading"
    >
      <div className="wrap">
        <div className={styles['crew-heading']}>
          <h1 id="crew-heading">
            Real people.<em>Big lift-off energy.</em>
          </h1>
          <p>
            Meet the people behind Bulk Away—and the Waste Solution Innovators
            team in our corner.
          </p>
        </div>
        <article className={styles['crew-leader']} aria-labelledby="bill-name">
          <Portrait slug="bill-loftin" name="Bill Loftin" eager />
          <div className={styles['crew-leader-copy']}>
            <div className={styles['crew-leader-title']}>
              <Orbit aria-hidden="true" />
              <span>Bulk Away Division Leader</span>
            </div>
            <h2 id="bill-name">Bill Loftin</h2>
            <p className={styles['crew-leader-role']}>
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
        <div className={styles['crew-directory-heading']}>
          <h2>A whole team in your corner.</h2>
          <fieldset className={styles['crew-filters']}>
            <legend className="sr-only">Choose a team group</legend>
            {(
              [
                ['all', 'Everyone'],
                ['advisory', 'Advisory board'],
                ['operations', 'Business & operations'],
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
        <p className={styles['crew-directory-note']}>
          Roles shown are with Waste Solution Innovators.
        </p>
        <output className="sr-only">
          {group === 'all'
            ? 'Showing all 9 team members.'
            : group === 'advisory'
              ? 'Showing 5 advisory board members.'
              : 'Showing 4 business and operations team members.'}
        </output>
        <div id="crew-directory" className={styles['crew-directory']}>
          {people.map((person) => (
            <article
              key={person.slug}
              className={styles['crew-person']}
              hidden={group !== 'all' && group !== person.group}
            >
              <Portrait slug={person.slug} name={person.name} />
              <div className={styles['crew-person-copy']}>
                <h3>{person.name}</h3>
                <p>{person.role}</p>
                {person.group === 'advisory' && <span>Advisory board</span>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
