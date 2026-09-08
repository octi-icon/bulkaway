'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { useHaulList } from '@/components/haul-list';

export function RequestDock() {
  const { items, locked, requestStarted, requestComplete } = useHaulList();
  const [visibility, setVisibility] = useState({
    hero: true,
    request: true,
    footer: true,
  });
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('.hero');
    const request = document.getElementById('request');
    const footer = document.querySelector('footer');
    if (!hero || !request || !footer || !('IntersectionObserver' in window))
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibility((current) => {
          const next = { ...current };
          for (const entry of entries)
            next[
              entry.target === hero
                ? 'hero'
                : entry.target === request
                  ? 'request'
                  : 'footer'
            ] = entry.isIntersecting;
          return next;
        });
      },
      { rootMargin: '120px 0px' },
    );
    observer.observe(hero);
    observer.observe(request);
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  if (
    dismissed ||
    visibility.hero ||
    visibility.request ||
    visibility.footer ||
    locked ||
    requestComplete
  )
    return null;
  const started = requestStarted || items.length > 0;
  return (
    <aside className="request-dock" aria-label="Quick pickup request">
      <a href="#request">
        <span>
          {started ? 'Back to my request' : 'Request a pickup'}
          {items.length > 0 && (
            <small>
              {items.length} item {items.length === 1 ? 'type' : 'types'} on
              your list
            </small>
          )}
        </span>
        <ArrowUpRight size={21} aria-hidden="true" />
      </a>
      <button
        type="button"
        aria-label="Dismiss pickup shortcut"
        onClick={() => setDismissed(true)}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}
