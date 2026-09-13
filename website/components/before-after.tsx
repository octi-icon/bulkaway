'use client';

import { useId, useState, type CSSProperties } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import styles from './before-after.module.css';

type ComparisonProps = {
  before?: string;
  after?: string;
  label?: string;
  beforeAlt?: string;
  afterAlt?: string;
  eager?: boolean;
};

export function BeforeAfter({
  before = 'trash-out-before',
  after = 'trash-out-after',
  label = 'Apartment trash out',
  beforeAlt = 'An apartment with furniture, a mattress, boxes, and rubbish left behind.',
  afterAlt = 'The same apartment with the left-behind contents removed.',
  eager = false,
}: ComparisonProps) {
  const [position, setPosition] = useState(50);
  const id = useId();
  return (
    <figure
      className={styles['space-comparison']}
      aria-label={`${label} before and after`}
    >
      <div
        className={styles['comparison-stage']}
        style={{ '--reveal': `${position}%` } as CSSProperties}
      >
        <img
          src={`/illustrations/services/${before}-1280.webp`}
          srcSet={`/illustrations/services/${before}-640.webp 640w, /illustrations/services/${before}-1280.webp 1280w`}
          sizes="(max-width: 800px) 90vw, 55vw"
          width={1536}
          height={1024}
          alt={`Before illustration: ${beforeAlt}`}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
        />
        <img
          className={styles['comparison-after']}
          src={`/illustrations/services/${after}-1280.webp`}
          srcSet={`/illustrations/services/${after}-640.webp 640w, /illustrations/services/${after}-1280.webp 1280w`}
          sizes="(max-width: 800px) 90vw, 55vw"
          width={1536}
          height={1024}
          alt={`After illustration: ${afterAlt}`}
          loading={eager ? 'eager' : 'lazy'}
        />
        <span
          className={`${styles['comparison-label']} ${styles['comparison-label-after']}`}
          aria-hidden="true"
          hidden={position === 0}
        >
          After
        </span>
        <span
          className={`${styles['comparison-label']} ${styles['comparison-label-before']}`}
          aria-hidden="true"
          hidden={position === 100}
        >
          Before
        </span>
        <span className={styles['comparison-divider']} aria-hidden="true">
          <ChevronsLeftRight size={25} />
        </span>
        <input
          id={id}
          className={styles['comparison-range']}
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          aria-label={`Reveal after: ${label}`}
          aria-valuetext={`${position}% of the after illustration revealed`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>
      <fieldset className={styles['comparison-tools']}>
        <legend className="sr-only">Choose a view: {label}</legend>
        <button
          type="button"
          aria-pressed={position === 0}
          onClick={() => setPosition(0)}
        >
          Before
        </button>
        <button
          type="button"
          aria-pressed={position === 50}
          onClick={() => setPosition(50)}
        >
          Compare
        </button>
        <button
          type="button"
          aria-pressed={position === 100}
          onClick={() => setPosition(100)}
        >
          After
        </button>
      </fieldset>
    </figure>
  );
}
