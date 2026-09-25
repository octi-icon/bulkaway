'use client';
import Image from '@/components/site-image';
import Link from '@/components/site-link';
import { SparkleRays } from '@/components/sparkle-rays';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Box,
  RotateCcw,
  Sofa,
  BedDouble,
  CheckCircle2,
  Undo2,
} from 'lucide-react';
export { MotionToggle } from '@/components/site-experience';
const UnlockedArcade = lazy(() =>
  import('@/components/bulk-arcade')
    .then((module) => ({ default: module.BulkArcade }))
    .catch(() => ({
      default: function ArcadeFallback() {
        return (
          <p>
            The arcade couldn’t load here.{' '}
            <Link href="/arcade">Open the arcade page</Link> to try again.
          </p>
        );
      },
    })),
);

export function CrewIllustration() {
  const artwork = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const element = artwork.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={artwork}
      className={`about-artwork${inView && loaded ? ' has-arrived' : ''}`}
    >
      <Image
        className="about-illustration"
        src="/illustrations/bulk-away-crew-woman.webp"
        alt="Retro illustration of a woman and a man carrying a sofa to a finned truck outside an apartment building."
        width={960}
        height={640}
        unoptimized
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
const successRays = [
  [-64, -8],
  [-48, -42],
  [-12, -54],
  [35, -48],
  [63, -17],
  [56, 32],
  [14, 51],
  [-40, 39],
];

export function SubmissionSparkle() {
  const [celebrating, setCelebrating] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setCelebrating(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="submission-sparkle" aria-hidden="true">
      <CheckCircle2 className="submission-check" />
      {celebrating && (
        <span className="submission-burst">
          <span className="submission-orbit" />
          <SparkleRays rays={successRays} />
        </span>
      )}
    </div>
  );
}

const clutter = [
  { name: 'That old sofa', icon: Sofa },
  { name: 'Mystery boxes', icon: Box },
  { name: 'One last mattress', icon: BedDouble },
];

export function AtomicSky() {
  return (
    <div className="atomic-sky" aria-hidden="true">
      <div className="sky-ellipse ellipse-a" />
      <div className="sky-ellipse ellipse-b" />
      {Array.from({ length: 9 }, (_, i) => (
        <i
          key={i}
          className={`atomic-star star-${i}`}
          style={{
            animationDuration: `${5 + (i % 3) * 1.3}s`,
            animationDelay: `${-i * 0.83}s`,
          }}
        />
      ))}
    </div>
  );
}

export function SpaceSign() {
  const [cleared, setCleared] = useState<number[]>([]);
  const [showArcade, setShowArcade] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const [footprint, setFootprint] = useState(0);
  const keyboardUnlock = useRef(false);
  const itemButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const resetButton = useRef<HTMLButtonElement>(null);
  const allClear = cleared.length === clutter.length;
  useEffect(() => {
    if (!allClear) return;
    const reduced =
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'paused';
    const timer = setTimeout(() => setShowArcade(true), reduced ? 0 : 520);
    return () => clearTimeout(timer);
  }, [allClear]);
  useEffect(() => {
    if (showArcade && keyboardUnlock.current)
      resetButton.current?.focus({ preventScroll: true });
  }, [showArcade]);
  if (showArcade)
    return (
      <div
        ref={stage}
        style={{ minHeight: footprint || undefined }}
        className="space-sign hero-arcade"
        id="hero-arcade"
      >
        <div className="hero-arcade-reveal">
          <p>
            Space cleared. <strong>Arcade unlocked.</strong>
          </p>
          <button
            ref={resetButton}
            type="button"
            onClick={() => {
              setShowArcade(false);
              setCleared([]);
              requestAnimationFrame(() =>
                itemButtons.current[0]?.focus({ preventScroll: true }),
              );
            }}
          >
            <RotateCcw size={16} aria-hidden="true" /> Back to logo
          </button>
        </div>
        <Suspense fallback={<output>Warming up the arcade…</output>}>
          <UnlockedArcade embedded />
        </Suspense>
      </div>
    );
  return (
    <div
      ref={stage}
      className={`space-sign ${cleared.length ? 'has-cleared' : ''} ${allClear ? 'all-clear' : ''}`}
    >
      <div className="space-artwork">
        <div className="sign-fin" aria-hidden="true" />
        <div className="sign-surface">
          <div className="sign-pin pin-a" aria-hidden="true" />
          <div className="sign-pin pin-b" aria-hidden="true" />
          <Image
            key={cleared.length}
            className="hero-logo"
            src="/brand/bulk-away-vector.svg"
            alt="Bulk Away — Junk Removal and Trash Outs, with our rocket-powered hauling truck"
            width={516}
            height={395}
            unoptimized
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="space-seal">
          <span>
            PLAY THE<br />GAME
          </span>
          <strong>
            get 5%
            <br />
            off.
          </strong>
        </div>
        <div
          className="clutter-controls"
          aria-label="Try our make-space preview"
        >
          {clutter.map((item, i) => (
            <button
              ref={(element) => {
                itemButtons.current[i] = element;
              }}
              key={item.name}
              type="button"
              className={`clutter-chip chip-${i} ${cleared.includes(i) ? 'is-cleared' : ''}`}
              disabled={cleared.includes(i)}
              aria-label={`Clear ${item.name.toLowerCase()} in the preview`}
              onClick={(event) => {
                const remaining = clutter.findIndex(
                  (_, index) => index !== i && !cleared.includes(index),
                );
                if (remaining < 0) {
                  setFootprint(stage.current?.offsetHeight || 0);
                  keyboardUnlock.current = event.detail === 0;
                }
                // Warm the cabinet while the original junk-clearing animation finishes.
                void import('@/components/bulk-arcade').catch(() => {});
                setCleared((current) => [...current, i]);
                if (event.detail === 0)
                  requestAnimationFrame(() => {
                    if (remaining < 0)
                      resetButton.current?.focus({ preventScroll: true });
                    else
                      itemButtons.current[remaining]?.focus({
                        preventScroll: true,
                      });
                  });
              }}
            >
              <item.icon size={20} />
              {item.name}
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </div>
      <div className="space-reward" aria-hidden={!allClear}>
        {allClear && (
          <span className="space-reward-wipe">Oh, the possibilities.</span>
        )}
      </div>
      <div className="space-demo-caption">
        <output className="demo-progress">
          {allClear
            ? '3 of 3 gone. Hello, possibilities.'
            : `${cleared.length} of 3 cleared in the preview`}
        </output>
        <div className="demo-actions">
          <button
            type="button"
            disabled={!cleared.length}
            aria-label="Undo last preview removal"
            onClick={(event) => {
              const last = cleared[cleared.length - 1];
              setCleared((current) => current.slice(0, -1));
              if (event.detail === 0)
                requestAnimationFrame(() =>
                  itemButtons.current[last]?.focus({ preventScroll: true }),
                );
            }}
          >
            <Undo2 size={17} aria-hidden="true" />
            Undo last
          </button>
          <button
            ref={resetButton}
            type="button"
            onClick={(event) => {
              setCleared([]);
              if (event.detail === 0)
                requestAnimationFrame(() =>
                  itemButtons.current[0]?.focus({ preventScroll: true }),
                );
            }}
            disabled={!cleared.length}
            aria-label="Reset the make-space preview"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>
      <div className="demo-next-step">
        {allClear && (
          <a className="text-link" href="#request">
            Make room for real <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
