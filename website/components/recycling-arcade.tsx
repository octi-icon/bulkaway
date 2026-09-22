'use client';
import { useEffect, useRef, useState } from 'react';
import {
  createSorting,
  sortMaterial,
  nextMaterial,
  recyclingItems,
  recyclingBins,
  type SortingRun,
  type RecyclingBin,
  type RecyclingSprite,
} from '@/lib/arcade-recycling';
import './recycling-arcade.css';

// Pixel-grid silhouettes retain the cabinet's game art without another asset download.
const shapes: Record<RecyclingSprite, string> = {
  paper:
    'M8 8H40V36H8Z M12 12H36V16H12Z M12 20H24V22H12Z M28 20H36V30H28Z M12 26H24V28H12Z',
  box: 'M8 14L24 6L40 14V34L24 42L8 34Z M8 14L24 22L40 14 M24 22V42 M16 10L32 18V25',
  bottle: 'M20 4H28V14L34 20V40H14V20L20 14Z M18 24H30V32H18Z',
  jug: 'M16 4H26V10L36 16V40H10V18L16 10Z M26 16H32V26H26Z M14 26H22V34H14Z',
  can: 'M14 8H34V40H14Z M14 12H34 M14 34H34 M20 8V4H28V8 M18 20H30V26H18Z',
  jar: 'M14 8H34V14L38 18V38H10V18L14 14Z M14 8V4H34V8 M14 24H34V30H14Z',
  battery: 'M10 12H38V36H10Z M18 12V8H30V12 M27 16L19 25H25L21 32L31 22H25Z',
  bag: 'M10 8H18V18H30V8H38V40H10Z M20 24H28V32H20Z',
};

export function RecyclingArcade({
  onFinish,
  sound,
}: {
  onFinish: (run: SortingRun) => void;
  sound: (kind: 'collect' | 'bank') => void;
}) {
  const [run, setRun] = useState(createSorting);
  const current = useRef(run);
  const heading = useRef<HTMLHeadingElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const bay = useRef<HTMLElement>(null);
  const item = recyclingItems[run.queue[run.index]];
  const batch = Math.floor(run.index / 4);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [run.index]);
  useEffect(() => {
    if (run.sorted) next.current?.focus({ preventScroll: true });
  }, [run.sorted]);

  function sort(bin: RecyclingBin) {
    const value = sortMaterial(current.current, bin);
    if (value === current.current) return;
    current.current = value;
    setRun(value);
    if (value.sorted) sound('collect');
  }
  function advance() {
    const value = nextMaterial(current.current);
    if (value === current.current) return;
    current.current = value;
    if (value.finished) {
      sound('bank');
      onFinish(value);
    } else setRun(value);
  }
  return (
    // Shortcuts only bubble from focus inside this named game region, never the page.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <section
      className="recycling-bay"
      ref={bay}
      aria-label="Recycling sorting game"
      onKeyDown={(event) => {
        if (event.repeat || event.altKey || event.ctrlKey || event.metaKey)
          return;
        const bin = recyclingBins.find((bin) => bin.key === event.key);
        if (bin) {
          event.preventDefault();
          sort(bin.id);
        }
      }}
    >
      <header className="recycling-heading">
        <span>RECYCLING BAY · {batch + 1}/3</span>
        <h2>Give it another life.</h2>
        <div className="recycling-readout">
          <span>
            Sorted <b>{run.index + Number(run.sorted)}/12</b>
          </span>
          <span>
            Points <b>{run.score.toLocaleString()}</b>
          </span>
          <span>
            Streak <b>{run.streak}</b>
          </span>
        </div>
      </header>
      <div className="recycling-conveyor" data-sorted={run.sorted}>
        <span className="recycling-batch">
          {
            [
              'The basics',
              'New shapes, same materials',
              'Watch for special handling',
            ][batch]
          }
        </span>
        <svg
          key={run.index}
          viewBox="0 0 48 48"
          aria-hidden="true"
          className="recycling-material"
          style={{ color: item.color }}
          shapeRendering="crispEdges"
        >
          <path
            d={shapes[item.sprite]}
            fill="currentColor"
            fillRule="evenodd"
            stroke="#17131e"
            strokeWidth="2"
          />
        </svg>
        <div className="recycling-belt" aria-hidden="true" />
        <h3 ref={heading} tabIndex={-1}>
          {item.name}
        </h3>
      </div>
      <fieldset
        className="recycling-bins"
        aria-label="Sort into a destination"
      >
        {recyclingBins.map((bin) => (
          <button
            type="button"
            key={bin.id}
            data-bin={bin.id}
            data-result={
              run.chosen === bin.id
                ? run.sorted
                  ? 'correct'
                  : 'retry'
                : undefined
            }
            aria-disabled={run.sorted}
            onClick={() => sort(bin.id)}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              shapeRendering="crispEdges"
            >
              {bin.id === 'aside' ? (
                <path d="M4 7H20V21H4Z M8 7V3H16V7 M12 10V15 M12 17V19" />
              ) : (
                <path d="M3 5H21V8H3Z M5 8H19V22H5Z M8 5V2H16V5 M9 12V18 M15 12V18" />
              )}
            </svg>
            <span>{bin.label}</span>
            <kbd>{bin.key}</kbd>
          </button>
        ))}
      </fieldset>
      <output className="recycling-feedback" aria-live="polite" aria-atomic="true">
        {run.notice}
      </output>
      <button
        ref={next}
        type="button"
        className="recycling-next"
        disabled={!run.sorted}
        onClick={advance}
      >
        {run.index === 11 ? 'Finish sorting →' : 'Next item →'}
      </button>
    </section>
  );
}
