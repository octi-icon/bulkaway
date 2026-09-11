'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { DraftSafeLink } from '@/components/draft-safe-link';
import { usePathname } from 'next/navigation';
const mobileQuery = '(max-width: 900px)';
const subscribeMobile = (callback: () => void) => {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === '/';
  const [open, setOpen] = useState(false);
  const mobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(mobileQuery).matches,
    () => false,
  );
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const closeOutside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    const closeOnHistory = () => setOpen(false);
    window.addEventListener('popstate', closeOnHistory);
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('focusin', closeOutside);
    document.addEventListener('pointerdown', closeOutside);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('focusin', closeOutside);
      document.removeEventListener('pointerdown', closeOutside);
      desktop.removeEventListener('change', closeOnDesktop);
      window.removeEventListener('popstate', closeOnHistory);
    };
  }, [open]);
  return (
    <header ref={header} className="site-header">
      <div className="wrap header-inner">
        <a
          className="wordmark"
          href={home ? '#main' : '/'}
          aria-label="Bulk Away home"
          onClick={() => setOpen(false)}
        >
          Bulk Away
        </a>
        <button
          ref={menuButton}
          className="menu-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav
          id="navigation"
          className={open ? 'is-open' : ''}
          aria-label="Main navigation"
          inert={mobile && !open}
        >
          <DraftSafeLink
            onClick={() => setOpen(false)}
            href="/services"
            aria-current={pathname === '/services' ? 'page' : undefined}
          >
            Services & rates
          </DraftSafeLink>
          <a
            onClick={() => setOpen(false)}
            href={home ? '#how-it-works' : '/#how-it-works'}
          >
            How it works
          </a>
          <a onClick={() => setOpen(false)} href={home ? '#about' : '/#about'}>
            Our story
          </a>
          <DraftSafeLink
            onClick={() => setOpen(false)}
            href="/team"
            aria-current={pathname === '/team' ? 'page' : undefined}
          >
            Meet the team
          </DraftSafeLink>
          <a
            onClick={() => setOpen(false)}
            className="button button-small"
            href={home ? '#pickup-request' : '/#pickup-request'}
          >
            Request a pickup <ArrowUpRight size={18} />
          </a>
        </nav>
      </div>
    </header>
  );
}
