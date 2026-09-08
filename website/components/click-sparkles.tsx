'use client';
import { useEffect, useState } from 'react';
import { SparkleRays } from '@/components/sparkle-rays';

const clickRays = [
  [-32, -27],
  [33, -23],
  [-25, 32],
  [30, 30],
];

export function ClickSparkles() {
  const [bursts, setBursts] = useState<
    {
      id: number;
      x: number;
      y: number;
      word?: { x: number; y: number };
    }[]
  >([]);
  useEffect(() => {
    let sequence = 0;
    const timers = new Map<number, ReturnType<typeof setTimeout>>();
    const sparkle = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        document.hidden ||
        document.documentElement.dataset.motion === 'paused' ||
        document.documentElement.dataset.clickEffects === 'off' ||
        window.matchMedia('(forced-colors: active)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      if (
        !target ||
        target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], :disabled, [aria-disabled="true"], dialog, [data-arcade]',
        )
      )
        return;
      // Pointer clicks work across the page; keyboard activation stays on controls.
      if (
        !event.detail &&
        !target.closest(
          'a, button, summary, [role="button"], [role="tab"], [role="option"]',
        )
      )
        return;
      const rect = target.getBoundingClientRect();
      const id = ++sequence;
      const x = event.detail ? event.clientX : rect.x + rect.width / 2;
      const y = event.detail ? event.clientY : rect.y + rect.height / 2;
      const clearingItem = !!target.closest('.clutter-chip');
      const burst = {
        id,
        x,
        y,
        word: clearingItem
          ? {
              x: Math.max(90, Math.min(window.innerWidth - 90, x)),
              y: Math.max(36, y - 42),
            }
          : undefined,
      };
      if (timers.size >= 3) {
        const oldest = timers.keys().next().value!;
        clearTimeout(timers.get(oldest));
        timers.delete(oldest);
      }
      setBursts((current) => [...current.slice(-2), burst]);
      timers.set(
        id,
        setTimeout(
          () => {
            setBursts((current) => current.filter((item) => item.id !== id));
            timers.delete(id);
          },
          clearingItem ? 1250 : 850,
        ),
      );
    };
    // Capture before a cleared demo item becomes disabled.
    document.addEventListener('click', sparkle, true);
    return () => {
      document.removeEventListener('click', sparkle, true);
      timers.forEach(clearTimeout);
    };
  }, []);
  return (
    <div className="atomic-click-layer" aria-hidden="true">
      {bursts.map((burst) => (
        <span
          key={burst.id}
          className="atomic-click-burst"
          style={{ left: burst.x, top: burst.y }}
        >
          <SparkleRays rays={clickRays} />
          {burst.word && (
            <span
              className="atomic-click-word"
              style={{
                left: burst.word.x - burst.x,
                top: burst.word.y - burst.y,
              }}
            >
              POOF, GONE!
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
