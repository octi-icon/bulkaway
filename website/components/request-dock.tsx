'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Orbit, X } from 'lucide-react';
import Link from '@/components/site-link';
import { usePathname } from '@/lib/navigation';
import { useHaulList } from '@/components/haul-list';

export function RequestDock() {
  const { items, locked, requestStarted, requestComplete } = useHaulList();
  const pathname = usePathname();
  const [visibility, setVisibility] = useState({
    request: true,
    footer: true,
  });
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const request = document.getElementById('pickup-request');
    const footer =
      document.querySelector('footer') ||
      document.querySelector('.privacy-controls');
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibility((current) => {
          const next = { ...current };
          for (const entry of entries)
            next[entry.target === request ? 'request' : 'footer'] =
              entry.isIntersecting;
          return next;
        });
      },
      { rootMargin: '120px 0px' },
    );
    if (request) observer.observe(request);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);
  if (
    dismissed ||
    (pathname === '/' && visibility.request) ||
    visibility.footer ||
    locked ||
    requestComplete
  )
    return null;
  const started = requestStarted || items.length > 0;
  return (
    <aside className="request-dock" aria-label="Quick pickup request">
      <Link
        href={pathname === '/' ? '#pickup-request' : '/#pickup-request'}
        onClick={() => {
          if (pathname === '/')
            requestAnimationFrame(() =>
              document
                .getElementById('pickup-request')
                ?.focus({ preventScroll: true }),
            );
        }}
      >
        <Orbit className="request-dock-orbit" size={26} aria-hidden="true" />
        <span>
          {started ? 'Back to my request' : 'Request a pickup'}
          <small>
            {items.length > 0
              ? `${items.length} item ${items.length === 1 ? 'type' : 'types'} on your list`
              : 'Bulk items · Trash outs'}
          </small>
        </span>
        <ArrowUpRight size={21} aria-hidden="true" />
      </Link>
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
