'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from '@/lib/navigation';
import { Pause, Play, MousePointer2, ChevronDown } from 'lucide-react';
import { NavigationMotion } from '@/components/navigation-motion';

const MotionContext = createContext({
  paused: true,
  ready: false,
  saved: true,
  toggle: () => {},
});
const motionStorageKey = 'bulk-away-motion-v1';
type CursorPreferences = { deviceCursor: boolean; noClickSparkles: boolean };
const cursorDefaults: CursorPreferences = {
  deviceCursor: false,
  noClickSparkles: false,
};
const cursorStorageKey = 'bulk-away-cursor-v1';
const CursorContext = createContext({
  preferences: cursorDefaults,
  ready: false,
  saved: true,
  update: (_change: Partial<CursorPreferences>) => {},
});

export function SiteExperience({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(true);
  const [motionSaved, setMotionSaved] = useState(true);
  const [cursorPreferences, setCursorPreferences] =
    useState<CursorPreferences | null>(null);
  const [cursorSaved, setCursorSaved] = useState(true);
  useEffect(() => {
    let initial = cursorDefaults;
    try {
      const stored = JSON.parse(
        sessionStorage.getItem(cursorStorageKey) || 'null',
      );
      if (
        typeof stored?.deviceCursor === 'boolean' &&
        typeof stored?.noClickSparkles === 'boolean'
      )
        initial = stored;
    } catch {
      /* Controls remain usable when browser storage is blocked. */
    }
    let initialPaused = false;
    try {
      initialPaused = sessionStorage.getItem(motionStorageKey) === 'paused';
    } catch {
      /* Motion controls still work without browser storage. */
    }
    const frame = requestAnimationFrame(() => {
      setCursorPreferences(initial);
      setPaused(initialPaused);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (!cursorPreferences) return;
    document.documentElement.dataset.cursor = cursorPreferences.deviceCursor
      ? 'device'
      : 'atomic';
    document.documentElement.dataset.clickEffects =
      cursorPreferences.noClickSparkles ? 'off' : 'on';
    return () => {
      delete document.documentElement.dataset.cursor;
      delete document.documentElement.dataset.clickEffects;
    };
  }, [cursorPreferences]);
  function updateCursor(change: Partial<CursorPreferences>) {
    const next = { ...(cursorPreferences || cursorDefaults), ...change };
    setCursorPreferences(next);
    try {
      sessionStorage.setItem(cursorStorageKey, JSON.stringify(next));
      setCursorSaved(true);
    } catch {
      setCursorSaved(false);
    }
  }
  function toggleMotion() {
    const next = !paused;
    setPaused(next);
    try {
      sessionStorage.setItem(motionStorageKey, next ? 'paused' : 'on');
      setMotionSaved(true);
    } catch {
      setMotionSaved(false);
    }
  }
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const historyDestination = useRef<string | null>(null);
  useEffect(() => {
    const restoreHistory = () => {
      historyDestination.current =
        window.location.pathname !== previousPath.current
          ? window.location.pathname
          : null;
    };
    window.addEventListener('popstate', restoreHistory);
    return () => window.removeEventListener('popstate', restoreHistory);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'paused' : 'on';
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [paused]);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (historyDestination.current === pathname) {
      historyDestination.current = null;
      return; // Leave Back/Forward position restoration to the router.
    }
    const frame = requestAnimationFrame(() => {
      const main = document.getElementById('main');
      // New pages get a reading starting point; same-page anchors keep native behavior.
      main?.focus({ preventScroll: true });
      const hash = window.location.hash.slice(1);
      let target = main;
      try {
        if (hash)
          target = document.getElementById(decodeURIComponent(hash)) || main;
      } catch {
        /* Use the main landmark for an invalid fragment. */
      }
      if (hash && target)
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
      if (hash === 'pickup-request') target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return (
    <MotionContext.Provider
      value={{
        paused,
        ready: cursorPreferences !== null,
        saved: motionSaved,
        toggle: toggleMotion,
      }}
    >
      <CursorContext.Provider
        value={{
          preferences: cursorPreferences || cursorDefaults,
          ready: cursorPreferences !== null,
          saved: cursorSaved,
          update: updateCursor,
        }}
      >
        {children}
        <NavigationMotion
          enabled={!paused}
          ready={cursorPreferences !== null}
        />
      </CursorContext.Provider>
    </MotionContext.Provider>
  );
}

export function CursorOptions() {
  const { preferences, ready, saved, update } = useContext(CursorContext);
  return (
    <details className="cursor-options">
      <summary>
        <MousePointer2 size={16} aria-hidden="true" /> Cursor options{' '}
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <div className="cursor-options-content">
        <fieldset disabled={!ready}>
          <legend>Make pointing comfortable</legend>
          <label>
            <input
              type="checkbox"
              checked={preferences.deviceCursor}
              onChange={(event) =>
                update({ deviceCursor: event.target.checked })
              }
            />{' '}
            <span>Use my device cursor</span>
          </label>
          <p>
            Use your browser and system pointer settings, including your
            preferred size and color.
          </p>
          <label>
            <input
              type="checkbox"
              checked={preferences.noClickSparkles}
              onChange={(event) =>
                update({ noClickSparkles: event.target.checked })
              }
            />{' '}
            <span>Turn off click sparkles</span>
          </label>
          <p>
            Keep the atomic cursor without the click bursts. Pause motion also
            stops these effects.
          </p>
        </fieldset>
        <output className="cursor-save-note">
          {saved
            ? 'Applies across the site and reloads in this browser tab. No tracking.'
            : 'Applied for now. Your browser could not save these options for reloading.'}
        </output>
      </div>
    </details>
  );
}

export function MotionToggle() {
  const { paused, ready, saved, toggle } = useContext(MotionContext);
  return (
    <button
      className="motion-toggle"
      type="button"
      aria-pressed={paused}
      disabled={!ready}
      title={
        saved
          ? 'Remembered in this tab. Your device’s reduced-motion setting still applies.'
          : 'Applied for now. Your browser could not save this choice for reloading.'
      }
      onClick={toggle}
    >
      {paused ? (
        <Play size={14} aria-hidden="true" />
      ) : (
        <Pause size={14} aria-hidden="true" />
      )}
      {paused ? 'Play motion' : 'Pause motion'}
    </button>
  );
}
