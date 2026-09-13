'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/lib/navigation';

const arrivalKey = 'bulk-away-navigation';

/** Optional motion observes navigation; it never delays or takes over routing. */
export function NavigationMotion({
  enabled,
  ready,
}: {
  enabled: boolean;
  ready: boolean;
}) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const streak = useRef<SVGSVGElement>(null);
  const animations = useRef<Animation[]>([]);
  const cueTime = useRef(-Infinity);

  useEffect(() => {
    if (!ready) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => {
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
      cueTime.current = -Infinity;
    };
    const cue = () => {
      if (!enabled || reduced.matches || !streak.current) return;
      if (performance.now() - cueTime.current < 500) return;
      stop();
      cueTime.current = performance.now();
      animations.current.push(
        streak.current.animate(
          [
            { transform: 'translateX(-180px)', opacity: 0 },
            { opacity: 1, offset: 0.15 },
            { opacity: 1, offset: 0.8 },
            { transform: 'translateX(calc(100vw + 20px))', opacity: 0 },
          ],
          { duration: 480, easing: 'cubic-bezier(.2,.65,.3,1)' },
        ),
      );
    };
    const arrive = () => {
      if (!enabled || reduced.matches) return;
      cue();
      // Keep compositing local; long pages and the arcade stay untouched.
      const heading = document.querySelector('main h1');
      if (heading)
        animations.current.push(
          heading.animate(
            [
              { opacity: 0.86, translate: '0 6px' },
              { opacity: 1, translate: '0 0' },
            ],
            {
              duration: 280,
              easing: 'ease-out',
            },
          ),
        );
    };
    const routeChanged = previousPath.current !== pathname;
    previousPath.current = pathname;
    let pendingArrival = false;
    try {
      const stored = JSON.parse(sessionStorage.getItem(arrivalKey) || 'null');
      pendingArrival =
        stored?.path === location.pathname && Date.now() - stored?.time < 8000;
      if (pendingArrival) sessionStorage.removeItem(arrivalKey);
    } catch {
      /* Navigation also works when storage is unavailable. */
    }
    if (routeChanged || pendingArrival) arrive();

    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.defaultPrevented
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest('a[href]')
          : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self')
      )
        return;
      const destination = new URL(link.href, location.href);
      if (
        destination.origin !== location.origin ||
        !/^https?:$/.test(destination.protocol)
      )
        return;
      // A small lift-off cue also acknowledges the mobile menu's section links.
      cue();
      if (destination.pathname !== location.pathname) {
        try {
          sessionStorage.setItem(
            arrivalKey,
            JSON.stringify({ path: destination.pathname, time: Date.now() }),
          );
        } catch {
          /* The route observer still handles client navigation. */
        }
      }
    };
    const onHistory = () => {
      // Preserve native Back/Forward scroll restoration without entrance motion.
      previousPath.current = location.pathname;
      try {
        sessionStorage.removeItem(arrivalKey);
      } catch {
        /* Optional storage. */
      }
      stop();
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onHistory);
    reduced.addEventListener('change', stop);
    return () => {
      stop();
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onHistory);
      reduced.removeEventListener('change', stop);
    };
  }, [enabled, ready, pathname]);

  return (
    <div className="navigation-lift-off" aria-hidden="true">
      <svg
        ref={streak}
        width="160"
        height="24"
        viewBox="0 0 160 24"
        focusable="false"
      >
        <path
          d="M0 12h108M36 6h58M54 18h48"
          fill="none"
          stroke="var(--lime)"
          strokeWidth="2"
        />
        <path d="m126 0 3 9 15 3-15 3-3 9-3-9-15-3 15-3Z" fill="var(--gold)" />
      </svg>
    </div>
  );
}
