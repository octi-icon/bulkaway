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
import { readBest, levels } from '@/lib/arcade-engine';
import {
  createArcadeAudio,
  type ArcadeAudio,
  type ArcadeSound,
} from '@/lib/arcade-audio';
import type { ArcadeRuntime, ArcadeReadout } from '@/lib/arcade-runtime';
import { CalmArcade } from '@/components/calm-arcade';
import type { Cleanup } from '@/lib/arcade-calm';
import '@/app/arcade/arcade.css';

const bestKey = 'bulk-away-arcade-best-v2';
const empty: ArcadeReadout = {
  score: 0,
  cargo: 0,
  lives: 3,
  time: 75,
  delivered: 0,
  notice: 'Ready for lift-off.',
  level: 1,
  levelIntro: 0,
  effects: { split: 0, repulsor: 0 },
  launchReady: false,
};
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
  const [cleanupRun, setCleanupRun] = useState(0);
  const [copied, setCopied] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const runtime = useRef<ArcadeRuntime | null>(null);
  const ticket = useRef(0);
  const result = useRef<HTMLHeadingElement>(null);
  const resumeButton = useRef<HTMLButtonElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const audioFx = useRef<ArcadeAudio | null>(null);
  const soundOn = useRef(false);
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
  function tone(kind: ArcadeSound) {
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
    setCleanupRun((run) => run + 1);
    ++ticket.current;
    runtime.current?.destroy();
    runtime.current = null;
    setError('');
    setCalm(true);
    setCopied(false);
    setHud(empty);
    setPhase('calm');
  }
  function cleanupReadout(value: Cleanup): ArcadeReadout {
    return {
      ...empty,
      cargo: value.cargo,
      delivered: value.delivered,
      score: value.score,
      level: value.stage + 1,
      notice: value.notice,
    };
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
    setCalm(false);
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
            {calm ? 'Delivered' : 'Cargo'}{' '}
            <strong>{calm ? `${hud.delivered}/12` : `${hud.cargo}/5`}</strong>
          </span>
          <span>
            {calm ? 'Pace' : 'Time'}{' '}
            <strong>{calm ? 'YOURS' : `${Math.ceil(hud.time)}s`}</strong>
          </span>
          <span>
            {calm ? 'Hold' : 'Shields'}{' '}
            <strong>{calm ? `${hud.cargo}/3` : hud.lives}</strong>
          </span>
        </div>
        {!calm && active && (
          <div className="arcade-mission">
            <div
              className="arcade-level-line"
              data-new-level={phase === 'playing' && hud.levelIntro > 0}
              aria-live="polite"
              aria-atomic="true"
            >
              <strong>
                {active || phase === 'finished'
                  ? `Level ${hud.level} / 3 · ${levels[hud.level - 1].name}`
                  : '3 levels. One out-of-this-world shift.'}
              </strong>
              <span className="arcade-level-lamps" aria-hidden="true">
                {levels.map((level, i) => (
                  <i key={level.name} data-lit={i < hud.level} />
                ))}
              </span>
            </div>
            <div className="arcade-power-rack" aria-label="Power-up status">
              <span
                data-active={hud.effects.split > 0}
                title="Split Beam: lift two items at once"
              >
                <b aria-hidden="true">B</b>
                <span>
                  Split
                  <small>
                    {hud.effects.split > 0
                      ? `${Math.ceil(hud.effects.split)}s`
                      : 'Find B'}
                  </small>
                </span>
              </span>
              <span
                data-active={hud.effects.repulsor > 0}
                title="Repulsor: turn collisions into bonus points"
              >
                <b aria-hidden="true">R</b>
                <span>
                  Repel
                  <small>
                    {hud.effects.repulsor > 0
                      ? `${Math.ceil(hud.effects.repulsor)}s`
                      : 'Find R'}
                  </small>
                </span>
              </span>
              <button
                type="button"
                className="arcade-launch"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => runtime.current?.launch()}
                disabled={phase !== 'playing' || !hud.launchReady || !hud.cargo}
                title="Collect an H capsule, then press Space or this button with cargo aboard."
                aria-label="Launch cargo"
              >
                <b aria-hidden="true">H</b>
                <span>
                  Launch
                  <small>
                    {hud.launchReady
                      ? hud.cargo
                        ? 'Ready'
                        : 'Load up'
                      : 'Find H'}
                  </small>
                </span>
              </button>
            </div>
          </div>
        )}
        <div className="arcade-playfield">
          <canvas
            ref={canvas}
            className="arcade-canvas"
            tabIndex={active ? 0 : -1}
            aria-label="UFO cleanup playfield. Use arrow keys or W A S D to move. Hover above junk to collect. Fly over lettered capsules for power-ups. Space launches cargo with an H charge. Bring cargo to the truck at the bottom. P or Escape pauses."
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
              <p>You have a tractor beam. And a few new tricks.</p>
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
                75 seconds. Three levels. Grab B, R &amp; H power-ups.
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
            <CalmArcade
              key={cleanupRun}
              onUpdate={(value) => setHud(cleanupReadout(value))}
              onFinish={(value) => finish(cleanupReadout(value), true)}
              sound={tone}
            />
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
        {!calm && (
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
        )}
        <div className="arcade-deck-actions">
          {!calm && (
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
          )}
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
            {calm ? (
              'SOUND'
            ) : (
              <>
                PAUSE <span aria-hidden="true">/</span> SOUND
              </>
            )}
          </span>
        </div>
        {phase === 'calm' && (
          <button type="button" className="calm-mode-exit" onClick={reset}>
            Choose mode
          </button>
        )}
        <div className="arcade-best">
          <Trophy size={20} aria-hidden="true" />
          <span>
            {calm ? (
              <>
                Your cleanup<strong>{hud.delivered}/12</strong>
              </>
            ) : (
              <>
                Your arcade best<strong>{best.toLocaleString()}</strong>
              </>
            )}
          </span>
        </div>
      </div>
      <CabinetBase className="cabinet-base">
        {embedded && (
          <summary>
            How to play &amp; options{' '}
            <span className="embedded-best">Best: {best.toLocaleString()}</span>
          </summary>
        )}
        <div id="arcade-instructions" className="arcade-instructions">
          {calm ? (
            <p>
              <strong>Your relaxed route.</strong> Select an item to beam it
              into the three-item hold. Unload whenever you like. When all four
              items at a stop have reached the truck, choose Next stop. Clear
              three stops to finish.
            </p>
          ) : (
            <>
              <p>
                <strong>Fly.</strong> Arrow keys / WASD, drag on the screen, or
                hold the direction buttons.
              </p>
              <p>
                <strong>Collect.</strong> Hover just above junk. Your beam works
                automatically. Carry up to 5 items.
              </p>
              <p>
                <strong>Haul.</strong> Drop loads at the truck below. Full loads
                earn a bonus. Dodge traffic marked !.
              </p>
              <p>
                <strong>Power up.</strong> Fly directly over a lettered capsule.
                B activates Split Beam for 10 seconds: line up two items. R
                activates Repulsor for 8 seconds: ram hazards for 75 bonus
                points each. H stores one cargo launch: press Space or Launch
                cargo to unload anywhere. Save it for a full load!
              </p>
              <p>
                <strong>Level up.</strong> Every 25 seconds, a new area opens.
                Neighborhood Sweep has passing cars; Commercial Chaos adds
                swooping UFOs; Orbital Rush brings falling debris. Move out of
                marked warning columns before debris drops. Each new level
                clears nearby hazards and gives two seconds of protection.
              </p>
            </>
          )}
        </div>
        <div className="arcade-comfort">
          <p>
            Want a gentler shift? Untimed cleanup lets you choose items and
            unload your UFO across three stops. It uses ordinary buttons, has no
            clock or collisions, and earns the same 5% offer. Sound starts off.
            In timed play, pause with P or Escape; leaving the game also pauses
            it.
          </p>
          <button onClick={startCalm} disabled={phase === 'loading'}>
            <Sofa size={18} aria-hidden="true" />
            {calm ? 'Restart cleanup' : 'Play untimed cleanup'}
          </button>
        </div>
        <p className="arcade-storage-note">
          {storageNote} Records are for this three-level edition. Untimed
          cleanup doesn’t change the arcade record.{' '}
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
