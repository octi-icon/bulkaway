'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { MotionToggle, CursorOptions } from '@/components/site-experience';
import { DraftSafeLink } from '@/components/draft-safe-link';

const storageKey = 'bulk-away-privacy-v1';
const lifetime = 180 * 24 * 60 * 60 * 1000;

export function CookiePreferences() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const restoreTrigger = useRef(false);
  const savedRemember = useRef(false);
  const [details, setDetails] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    try {
      const choice = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (
        choice?.version === 1 &&
        typeof choice.expires === 'number' &&
        choice.expires > Date.now() &&
        choice.expires <= Date.now() + lifetime
      ) {
        savedRemember.current = true;
        return;
      }
      localStorage.removeItem(storageKey);
    } catch {
      /* Privacy controls remain usable when storage is blocked. */
    }
    try {
      if (sessionStorage.getItem(storageKey) === 'necessary') return;
    } catch {
      /* Closing the dialog still works without storage. */
    }
    // Keep the policy pages immediately readable when opened directly.
    if (
      ['/privacy', '/sms'].includes(window.location.pathname.replace(/\/$/, ''))
    )
      return;
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLElement>('h2')?.focus();
  }, []);

  function finish(persist: boolean) {
    let saved = true;
    try {
      if (persist)
        localStorage.setItem(
          storageKey,
          JSON.stringify({ version: 1, expires: Date.now() + lifetime }),
        );
      else localStorage.removeItem(storageKey);
    } catch {
      saved = false;
    }
    try {
      sessionStorage.setItem(storageKey, 'necessary');
    } catch {
      saved = false;
    }
    savedRemember.current = persist && saved;
    setRemember(persist && saved);
    setStatus(
      saved
        ? 'Privacy settings saved. Analytics and advertising remain off.'
        : 'Analytics and advertising remain off. Your browser could not save your choice, so this notice may appear again.',
    );
    dialog.current?.close();
    if (restoreTrigger.current) trigger.current?.focus();
    else
      document
        .querySelector<HTMLElement>('main')
        ?.focus({ preventScroll: true });
  }

  return (
    <>
      <div className="privacy-controls">
        <nav className="wrap" aria-label="Privacy, messaging and accessibility">
          <DraftSafeLink href="/privacy">Privacy &amp; cookies</DraftSafeLink>
          <button
            ref={trigger}
            type="button"
            onClick={() => {
              restoreTrigger.current = true;
              setDetails(true);
              setRemember(savedRemember.current);
              dialog.current?.showModal();
              dialog.current?.querySelector<HTMLElement>('h2')?.focus();
            }}
          >
            Cookie settings
          </button>
          <DraftSafeLink href="/sms">SMS terms</DraftSafeLink>
          <MotionToggle />
          <CursorOptions />
        </nav>
        <output className="sr-only">{status}</output>
      </div>
      <dialog
        ref={dialog}
        className="cookie-dialog"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-description"
        onCancel={(event) => {
          event.preventDefault();
          finish(false);
        }}
      >
        <button
          className="cookie-close"
          type="button"
          aria-label="Close and use necessary only"
          onClick={() => finish(false)}
        >
          <X size={22} aria-hidden="true" />
        </button>
        <h2 id="cookie-title" tabIndex={-1}>
          A little space.
          <br />
          <em>For your privacy.</em>
        </h2>
        <p id="cookie-description">
          No ad trackers. No analytics cookies. We use browser storage for your
          privacy choice and cursor and motion accessibility options. You decide
          how long your privacy choice stays.
        </p>
        {details && (
          <div className="cookie-options" id="cookie-options">
            <h3>
              Necessary storage <span>Always active</span>
            </h3>
            <p>
              Remembers your privacy choice and any cursor and motion
              accessibility options for this browser tab’s session. It contains
              no contact information.
            </p>
            <h3>
              Analytics &amp; advertising <span>Not used</span>
            </h3>
            <p>There are no optional trackers to enable on this site.</p>
            <label className="cookie-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Remember my choice on this device for 180 days</span>
            </label>
            <p>
              Optional. Choose necessary only to remove a previously remembered
              choice.
            </p>
          </div>
        )}
        <Link
          className="cookie-policy-link"
          href="/privacy#cookies"
          target="_blank"
          rel="noreferrer"
        >
          Read our privacy &amp; cookie notice (opens a new tab)
        </Link>
        <div className="cookie-actions">
          <button
            className="button button-ink"
            type="button"
            onClick={() => finish(false)}
          >
            Use necessary only
          </button>
          {details ? (
            <button
              className="button cookie-secondary"
              type="button"
              onClick={() => finish(remember)}
            >
              Save my settings
            </button>
          ) : (
            <button
              className="button cookie-secondary"
              type="button"
              aria-expanded={details}
              aria-controls="cookie-options"
              onClick={() => setDetails(true)}
            >
              Cookie options
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
