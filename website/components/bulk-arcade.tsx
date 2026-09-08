'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  Gamepad2,
  Pause,
  Play,
  Sofa,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { readBest } from '@/lib/arcade-engine';
import { createArcadeAudio, type ArcadeAudio } from '@/lib/arcade-audio';
import type { ArcadeRuntime, ArcadeReadout } from '@/lib/arcade-runtime';
import '@/app/arcade/arcade.css';

const bestKey = 'bulk-away-arcade-best-v1';
const empty: ArcadeReadout = {
  score: 0,
  cargo: 0,
  lives: 3,
  time: 75,
  delivered: 0,
  notice: 'Ready for lift-off.',
};
const things = [
  'Sofa',
  'Mattress',
  'Boxes',
  'Refrigerator',
  'Tire',
  'Television',
];
type Phase = 'ready' | 'loading' | 'playing' | 'paused' | 'calm' | 'finished';

export function BulkArcade({ embedded = false }: { embedded?: boolean }) {
  const CabinetTitle = embedded ? 'h2' : 'h1';
  const CabinetBase = embedded ? 'details' : 'div';
  const [phase, setPhase] = useState<Phase>('ready');
  const [hud, setHud] = useState(empty);
  const [best, setBest] = useState(0);
  const [storageNote, setStorageNote] = useState(
    'Personal best stays on this device. No account needed.',
  );
  const [error, setError] = useState('');
  const [sound, setSound] = useState(false);
  const [calm, setCalm] = useState(false);
  const [remaining, setRemaining] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const runtime = useRef<ArcadeRuntime | null>(null);
  const ticket = useRef(0);
  const result = useRef<HTMLHeadingElement>(null);
  const resumeButton = useRef<HTMLButtonElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const audioFx = useRef<ArcadeAudio | null>(null);
  const soundOn = useRef(false);
  const nextCleanup = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setBest(readBest(localStorage.getItem(bestKey)));
      } catch {
        setStorageNote(
          'Your browser blocked storage. Scores last for this visit.',
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      // Latest runtime/audio handles must be cleaned up; this ref is a request counter.
      // oxlint-disable-next-line react-hooks/exhaustive-deps
      ++ticket.current;
      runtime.current?.destroy();
      audioFx.current?.destroy();
      void audio.current?.close();
    };
  }, []);
  useEffect(() => {
    if (phase === 'playing') canvas.current?.focus({ preventScroll: true });
    if (phase === 'finished') result.current?.focus({ preventScroll: true });
    if (phase === 'paused')
      resumeButton.current?.focus({ preventScroll: true });
  }, [phase]);
  function finish(value: ArcadeReadout, easy = false) {
    setHud(value);
    setPhase('finished');
    if (!easy) {
      setBest((previous) => Math.max(previous, value.score));
      try {
        const saved = readBest(localStorage.getItem(bestKey));
        localStorage.setItem(bestKey, String(Math.max(saved, value.score)));
      } catch {
        setStorageNote(
          'Your browser blocked storage. Scores last for this visit.',
        );
      }
    }
  }
  function tone(kind: 'collect' | 'bank' | 'hit') {
    audioFx.current?.play(kind);
  }
  function toggleSound() {
    const next = !soundOn.current;
    try {
      if (next) {
        audio.current ||= new AudioContext();
        audioFx.current ||= createArcadeAudio(audio.current);
        void audio.current.resume().catch(() => {
          soundOn.current = false;
          audioFx.current?.setEnabled(false);
          setSound(false);
        });
      }
      soundOn.current = next;
      audioFx.current?.setEnabled(next);
      setSound(next);
    } catch {
      setError('Sound is unavailable in this browser. You can still play.');
    }
  }
  async function start() {
    runtime.current?.destroy();
    runtime.current = null;
    const current = ++ticket.current;
    setCalm(false);
    setError('');
    setCopied(false);
    setHud(empty);
    setPhase('loading');
    try {
      const { startArcade } = await import('@/lib/arcade-runtime');
      if (current !== ticket.current || !canvas.current) return;
      runtime.current = startArcade(canvas.current, {
        update: setHud,
        finish: (value) => finish(value),
        pause: () => setPhase('paused'),
        sound: tone,
        beam: (value) => audioFx.current?.beam(value),
        silence: () => audioFx.current?.silence(),
      });
      setPhase('playing');
      canvas.current.focus({ preventScroll: true });
    } catch {
      if (current !== ticket.current) return;
      setPhase('ready');
      setError(
        'The game couldn’t load. Try again, or play the untimed cleanup below.',
      );
    }
  }
  function startCalm() {
    ++ticket.current;
    runtime.current?.destroy();
    runtime.current = null;
    setError('');
    setCalm(true);
    setCopied(false);
    setHud(empty);
    setRemaining(Array.from({ length: 12 }, (_, i) => i));
    setPhase('calm');
    requestAnimationFrame(() =>
      nextCleanup.current
        ?.querySelector('button')
        ?.focus({ preventScroll: true }),
    );
  }
  function collect(id: number) {
    if (!remaining.includes(id)) return;
    const next = remaining.filter((item) => item !== id);
    setRemaining(next);
    const value = {
      ...empty,
      score: (12 - next.length) * 100,
      delivered: 12 - next.length,
      notice: `${things[id % 6]} cleared. ${next.length} items left.`,
    };
    setHud(value);
    tone('collect');
    if (!next.length) finish(value, true);
    else
      requestAnimationFrame(() =>
        nextCleanup.current
          ?.querySelector('button')
          ?.focus({ preventScroll: true }),
      );
  }
  function pause() {
    runtime.current?.pause();
    setPhase('paused');
  }
  function resume() {
    setPhase('playing');
    canvas.current?.focus({ preventScroll: true });
    runtime.current?.resume();
  }
  function reset() {
    ++ticket.current;
    runtime.current?.destroy();
    runtime.current = null;
    setPhase('ready');
    setHud(empty);
    setError('');
  }
  const active = phase === 'playing' || phase === 'paused';
  return (
    <section
      className={`arcade-cabinet${embedded ? ' arcade-embedded' : ''}`}
      aria-label="Space Reclaimed arcade machine"
      data-arcade
    >
      <div className="cabinet-marquee">
        <span className="cabinet-brand">Bulk Away presents</span>
        <CabinetTitle>
          Space <em>Reclaimed.</em>
        </CabinetTitle>
        <span className="cabinet-freeplay">
          FREE PLAY <span aria-hidden="true">·</span> BIG LIFT-OFF ENERGY
        </span>
      </div>
      <div className="cabinet-screen-frame">
        <div className="arcade-hud" aria-label="Game statistics">
          <span>
            Score <strong>{hud.score.toLocaleString()}</strong>
          </span>
          <span>
            {calm ? 'Cleared' : 'Cargo'}{' '}
            <strong>{calm ? `${hud.delivered}/12` : `${hud.cargo}/5`}</strong>
          </span>
          <span>
            {calm ? 'Pace' : 'Time'}{' '}
            <strong>{calm ? 'YOURS' : `${Math.ceil(hud.time)}s`}</strong>
          </span>
          <span>
            {calm ? 'Pressure' : 'Shields'}{' '}
            <strong>{calm ? 'NONE' : hud.lives}</strong>
          </span>
        </div>
        <div className="arcade-playfield">
          <canvas
            ref={canvas}
            className="arcade-canvas"
            tabIndex={active ? 0 : -1}
            aria-label="UFO cleanup playfield. Use arrow keys or W A S D to move. Hover above junk to collect. Bring cargo to the truck at the bottom. P or Escape pauses."
            aria-describedby="arcade-instructions"
            hidden={!active}
          >
            Use the untimed cleanup mode below for a game with text-based
            controls.
          </canvas>
          {(phase === 'ready' || phase === 'loading') && (
            <div className="arcade-title-screen">
              <Image
                className="arcade-saucer"
                src="/arcade/saucer.svg"
                width="174"
                height="102"
                alt=""
              />
              <h2>
                Earth has a<br />
                <em>clutter problem.</em>
              </h2>
              <p>You have a tractor beam.</p>
              <button
                className="arcade-start"
                onClick={start}
                disabled={phase === 'loading'}
              >
                <Play size={20} aria-hidden="true" />
                {phase === 'loading'
                  ? 'Preparing for lift-off…'
                  : 'Start a 75-second shift'}
              </button>
              <button
                className="arcade-text-button"
                onClick={startCalm}
                disabled={phase === 'loading'}
              >
                Play untimed cleanup instead
              </button>
              <span className="arcade-screen-note">
                No coins. No installs. Just a little space.
              </span>
            </div>
          )}
          {phase === 'paused' && (
            <div className="arcade-pause-screen">
              <Pause size={32} aria-hidden="true" />
              <h2>Holding orbit.</h2>
              <p>Your shift is paused.</p>
              <button
                className="arcade-start"
                ref={resumeButton}
                onClick={resume}
              >
                <Play size={18} aria-hidden="true" />
                Resume shift
              </button>
              <button className="arcade-text-button" onClick={reset}>
                End this run
              </button>
            </div>
          )}
          {phase === 'calm' && (
            <div className="arcade-calm-screen">
              <h2>A little less clutter.</h2>
              <p>
                No clock, traffic, or reflexes needed. Choose each item to clear
                it.
              </p>
              <div className="arcade-cleanup-items" ref={nextCleanup}>
                {remaining.map((id) => {
                  return (
                    <button key={id} onClick={() => collect(id)}>
                      <Image
                        className="arcade-item-sprite"
                        src={`/arcade/junk-${id % 6}.svg`}
                        width="42"
                        height="36"
                        alt=""
                      />
                      {things[id % 6]}{' '}
                      <span className="sr-only">{id < 6 ? 'one' : 'two'}</span>
                    </button>
                  );
                })}
              </div>
              <output>
                {hud.delivered ? hud.notice : '12 items. Take your time.'}
              </output>
            </div>
          )}
          {phase === 'finished' && (
            <div className="arcade-finish-screen">
              <Sparkles size={34} aria-hidden="true" />
              <h2 ref={result} tabIndex={-1}>
                POOF, GONE!
              </h2>
              <p>
                {hud.delivered} {hud.delivered === 1 ? 'piece' : 'pieces'} of
                pixel junk cleared.
                <br />
                Let’s tackle the real stuff.
              </p>
              <div className="arcade-reward">
                <strong>5% off</strong>
                <span>your next removal</span>
                <code>SPACE5</code>
              </div>
              <Link
                href={embedded ? '#request' : '/?offer=SPACE5#request'}
                className="arcade-start"
                onClick={() => {
                  if (embedded)
                    window.dispatchEvent(new Event('bulk-away:arcade-offer'));
                }}
              >
                Use my 5% reward <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <p className="arcade-reward-note">
                The crew applies the discount when quoting your next removal. No
                booking or text signup is created by playing.
              </p>
              <div className="arcade-result-actions">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('SPACE5');
                      setCopied(true);
                    } catch {
                      setCopied(false);
                      setError(
                        'Your code is SPACE5. Select the code above to copy it.',
                      );
                    }
                  }}
                >
                  {copied ? 'Code copied' : 'Copy code'}
                </button>
                <button onClick={calm ? startCalm : start}>Play again</button>
                <button onClick={reset}>Choose mode</button>
              </div>
              <output className="sr-only">
                {copied ? 'SPACE5 copied to clipboard.' : ''}
              </output>
            </div>
          )}
        </div>
        <p className="arcade-status" role={active ? undefined : 'status'}>
          {active
            ? hud.notice
            : 'Finish either game mode. Get 5% off your next removal.'}
        </p>
      </div>
      <div className="cabinet-control-deck">
        <div className="arcade-dpad" aria-label="Directional controls">
          {(
            [
              ['arrowup', 'Up', ArrowUp],
              ['arrowleft', 'Left', ArrowLeft],
              ['arrowdown', 'Down', ArrowDown],
              ['arrowright', 'Right', ArrowRight],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              className={`arcade-direction ${key}`}
              aria-label={`Move ${label.toLowerCase()}`}
              disabled={phase !== 'playing'}
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                runtime.current?.direction(key, true);
              }}
              onPointerUp={() => runtime.current?.direction(key, false)}
              onPointerCancel={() => runtime.current?.direction(key, false)}
              onLostPointerCapture={() =>
                runtime.current?.direction(key, false)
              }
            >
              <Icon aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="arcade-deck-actions">
          <button
            className="arcade-round-button"
            onPointerDown={(event) => event.preventDefault()}
            onClick={phase === 'paused' ? resume : pause}
            disabled={!active}
            aria-label={phase === 'paused' ? 'Resume game' : 'Pause game'}
          >
            {phase === 'paused' ? (
              <Play aria-hidden="true" />
            ) : (
              <Pause aria-hidden="true" />
            )}
          </button>
          <button
            className="arcade-round-button sound"
            onPointerDown={(event) => event.preventDefault()}
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
          >
            {sound ? (
              <Volume2 aria-hidden="true" />
            ) : (
              <VolumeX aria-hidden="true" />
            )}
          </button>
          <span>
            PAUSE <span aria-hidden="true">/</span> SOUND
          </span>
        </div>
        <div className="arcade-best">
          <Trophy size={20} aria-hidden="true" />
          <span>
            Your arcade best<strong>{best.toLocaleString()}</strong>
          </span>
        </div>
      </div>
      <CabinetBase className="cabinet-base">
        {embedded && <summary>How to play &amp; options <span className="embedded-best">Best: {best.toLocaleString()}</span></summary>}
        <div id="arcade-instructions" className="arcade-instructions">
          <p>
            <strong>Fly.</strong> Arrow keys / WASD, drag on the screen, or hold
            the direction buttons.
          </p>
          <p>
            <strong>Collect.</strong> Hover just above junk. Your beam works
            automatically. Carry up to 5 items.
          </p>
          <p>
            <strong>Haul.</strong> Drop loads at the truck below. Full loads
            earn a bonus. Dodge traffic marked !.
          </p>
        </div>
        <div className="arcade-comfort">
          <p>
            Want a gentler shift? Untimed cleanup uses ordinary buttons, has no
            moving hazards, and earns the same 5% offer. Sound starts off. Pause
            anytime with P or Escape; leaving the game also pauses it.
          </p>
          <button onClick={startCalm} disabled={phase === 'loading'}>
            <Sofa size={18} aria-hidden="true" />
            Play untimed cleanup
          </button>
        </div>
        <p className="arcade-storage-note">
          {storageNote} Untimed cleanup doesn’t change the arcade record.{' '}
          <button
            onClick={() => {
              setBest(0);
              try {
                localStorage.removeItem(bestKey);
                setStorageNote('Personal best cleared from this device.');
              } catch {
                setStorageNote(
                  'Record cleared for this visit; browser storage could not be changed.',
                );
              }
            }}
          >
            Clear personal best
          </button>
        </p>
        {error && (
          <p className="arcade-error" role="alert">
            {error}
          </p>
        )}
        <div className="arcade-coin-slot" aria-hidden="true">
          <Gamepad2 />
          <span>
            FREE PLAY
            <br />
            ALWAYS A FRESH START
          </span>
          <Check size={18} />
        </div>
        <Link
          className="arcade-exit"
          href={embedded ? '#request' : '/#request'}
        >
          Back to real-life junk removal{' '}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </CabinetBase>
    </section>
  );
}
