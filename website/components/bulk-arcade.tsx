'use client';
import { useEffect, useRef, useState } from 'react';
import Link from '@/components/site-link';
import Image from '@/components/site-image';
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
  Zap,
  Package,
  ScanLine,
} from 'lucide-react';
import {
  readBest,
  levels,
  upgrades,
  chassis,
  capacity,
  junkTypes,
  approachingHazards,
  type Chassis,
  type Upgrade,
} from '@/lib/arcade-engine';
import {
  createArcadeAudio,
  type ArcadeAudio,
  type ArcadeSound,
} from '@/lib/arcade-audio';
import type { ArcadeRuntime, ArcadeReadout } from '@/lib/arcade-runtime';
import { CalmArcade } from '@/components/calm-arcade';
import type { Cleanup } from '@/lib/arcade-calm';
import { RecyclingArcade } from '@/components/recycling-arcade';
import type { SortingRun } from '@/lib/arcade-recycling';
import '@/app/arcade/arcade.css';

const bestKey = 'bulk-away-arcade-best-v5';
const empty: ArcadeReadout = {
  score: 0,
  cargo: 0,
  recyclingCargo: 0,
  recycled: 0,
  recyclingBonus: 0,
  chassis: 'lifter',
  lives: 3,
  time: 60,
  delivered: 0,
  notice: 'Ready for lift-off.',
  level: 1,
  levelIntro: 0,
  effects: { split: 0, repulsor: 0 },
  launchReady: false,
  leg: 1,
  upgrades: [],
  dashCooldown: 0,
};
type Phase =
  | 'ready'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'docked'
  | 'calm'
  | 'recycling'
  | 'finished';

export function BulkArcade({ embedded = false }: { embedded?: boolean }) {
  const CabinetTitle = embedded ? 'h2' : 'h1';
  const CabinetBase = 'details';
  const [phase, setPhase] = useState<Phase>('ready');
  const [build, setBuild] = useState<Chassis>('lifter');
  const [hud, setHud] = useState(empty);
  const [best, setBest] = useState(0);
  const [extendedBest, setExtendedBest] = useState(0);
  const [storageNote, setStorageNote] = useState(
    'Personal best stays on this device. No account needed.',
  );
  const [error, setError] = useState('');
  const [sound, setSound] = useState(false);
  const [calm, setCalm] = useState(false);
  const [cleanupRun, setCleanupRun] = useState(0);
  const [copied, setCopied] = useState(false);
  const [recyclingResult, setRecyclingResult] = useState<SortingRun | null>(
    null,
  );
  const [recyclingReturn, setRecyclingReturn] = useState<'ready' | 'finished'>(
    'ready',
  );
  const canvas = useRef<HTMLCanvasElement>(null);
  const cabinet = useRef<HTMLElement>(null);
  const alignOnStart = useRef(false);
  const runtime = useRef<ArcadeRuntime | null>(null);
  const ticket = useRef(0);
  const result = useRef<HTMLHeadingElement>(null);
  const resumeButton = useRef<HTMLButtonElement>(null);
  const dockTitle = useRef<HTMLHeadingElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const audioFx = useRef<ArcadeAudio | null>(null);
  const soundOn = useRef(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setBest(readBest(localStorage.getItem(bestKey)));
        setExtendedBest(readBest(localStorage.getItem(`${bestKey}-extended`)));
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
    if (phase === 'playing') {
      canvas.current?.focus({ preventScroll: true });
      if (alignOnStart.current) {
        alignOnStart.current = false;
        const bounds = cabinet.current?.getBoundingClientRect();
        if (bounds && (bounds.bottom > window.innerHeight || bounds.top < 0))
          window.scrollTo({
            top: window.scrollY + bounds.top - 8,
            behavior: 'instant',
          });
      }
    }
    if (phase === 'finished') result.current?.focus({ preventScroll: true });
    if (phase === 'paused')
      resumeButton.current?.focus({ preventScroll: true });
    if (phase === 'docked') dockTitle.current?.focus({ preventScroll: true });
  }, [phase]);
  function finish(value: ArcadeReadout, easy = false) {
    setHud(value);
    setPhase('finished');
    if (!easy) {
      const key = value.leg > 1 ? `${bestKey}-extended` : bestKey;
      (value.leg > 1 ? setExtendedBest : setBest)((previous) =>
        Math.max(previous, value.score),
      );
      try {
        const saved = readBest(localStorage.getItem(key));
        localStorage.setItem(key, String(Math.max(saved, value.score)));
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
  function resumeAudio() {
    if (soundOn.current && audio.current?.state === 'suspended') {
      void audio.current.resume().catch(() => {
        soundOn.current = false;
        audioFx.current?.setEnabled(false);
        setSound(false);
      });
    }
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
    setRecyclingResult(null);
    resumeAudio();
    runtime.current?.destroy();
    runtime.current = null;
    const current = ++ticket.current;
    setCalm(false);
    setError('');
    setCopied(false);
    setHud({ ...empty, chassis: build });
    alignOnStart.current = true;
    setPhase('loading');
    try {
      const { startArcade } = await import('@/lib/arcade-runtime');
      if (current !== ticket.current || !canvas.current) return;
      runtime.current = startArcade(
        canvas.current,
        {
          update: setHud,
          finish: (value) => finish(value),
          pause: () => setPhase('paused'),
          dock: (value) => {
            setHud(value);
            setPhase('docked');
          },
          sound: tone,
          beam: (value) => audioFx.current?.beam(value),
          silence: () => audioFx.current?.silence(),
        },
        build,
      );
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
    setRecyclingResult(null);
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
    resumeAudio();
    setPhase('playing');
    canvas.current?.focus({ preventScroll: true });
    runtime.current?.resume();
  }
  function chooseUpgrade(choice: Upgrade) {
    resumeAudio();
    if (runtime.current?.upgrade(choice)) setPhase('playing');
  }
  function reset() {
    setRecyclingResult(null);
    ++ticket.current;
    runtime.current?.destroy();
    runtime.current = null;
    setPhase('ready');
    setCalm(false);
    setHud(empty);
    setError('');
  }
  function startRecycling() {
    resumeAudio();
    ++ticket.current;
    runtime.current?.destroy();
    runtime.current = null;
    audioFx.current?.silence();
    setRecyclingReturn(phase === 'finished' ? 'finished' : 'ready');
    setError('');
    setPhase('recycling');
  }
  const active = phase === 'playing' || phase === 'paused';
  const inFlight = active || phase === 'docked';
  const currentBest = hud.leg > 1 ? extendedBest : best;
  return (
    <section
      ref={cabinet}
      className={`arcade-cabinet${embedded ? ' arcade-embedded' : ''}`}
      aria-label="Space Reclaimed arcade machine"
      data-arcade
      data-phase={phase}
      data-recycling-result={Boolean(recyclingResult)}
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
            <strong>
              {calm ? `${hud.delivered}/12` : `${hud.cargo}/${capacity(hud)}`}
            </strong>
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
        {!calm && inFlight && (
          <div className="arcade-mission">
            <div
              className="arcade-level-line"
              aria-live="polite"
              aria-atomic="true"
            >
              <strong>
                {`Level ${hud.level}/3 · ${levels[hud.level - 1].name}`}
              </strong>
            </div>
            <output className="arcade-advance-notice">
              {approachingHazards(hud.time, hud.leg) || '\u00a0'}
            </output>
            <div className="arcade-power-rack" aria-label="Power-up status">
              <span
                data-active={hud.effects.split > 0}
                title="Split Beam: lift two items at once"
              >
                <b aria-hidden="true">B</b>
                <span>
                  {hud.upgrades.includes('beam') ? 'Twin' : 'Split'}
                  <small>
                    {hud.effects.split > 0
                      ? `${Math.ceil(hud.effects.split)}s`
                      : hud.upgrades.includes('beam')
                        ? 'Installed'
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
              {hud.upgrades.includes('drive') && (
                <button
                  className="arcade-dash"
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => runtime.current?.dash()}
                  disabled={phase !== 'playing' || hud.dashCooldown > 0}
                >
                  <Zap size={16} aria-hidden="true" />{' '}
                  {hud.dashCooldown > 0
                    ? `Dash · ${Math.ceil(hud.dashCooldown)}s`
                    : 'Dash · Shift'}
                </button>
              )}
            </div>
          </div>
        )}
        {active && !calm && (
          <div className="arcade-cargo-streams" aria-label="Cargo destinations">
            <span>← Recycling ×2 · {hud.recyclingCargo}</span>
            <span>Bulk / Trash · {hud.cargo - hud.recyclingCargo} →</span>
          </div>
        )}
        <div className="arcade-playfield">
          <canvas
            ref={canvas}
            className="arcade-canvas"
            tabIndex={phase === 'playing' ? 0 : -1}
            aria-label="UFO cleanup playfield. Use arrow keys or W A S D to move. Hover above junk to collect. Deliver R-marked clean boxes and cans to Recycling at bottom left for double points. Other items go to Bulk / Trash at bottom right. Mixed cargo needs both docks. Space launches cargo with an H charge for base points. P or Escape pauses."
            aria-describedby="arcade-instructions"
            hidden={!inFlight}
          >
            Use the untimed cleanup mode below for a game with text-based
            controls.
          </canvas>
          {(phase === 'ready' || phase === 'loading') && (
            <div className="arcade-title-screen">
              <h2>Choose your UFO.</h2>
              <fieldset
                className="arcade-chassis"
                disabled={phase === 'loading'}
              >
                <legend className="sr-only">Starting chassis</legend>
                {(Object.keys(chassis) as Chassis[]).map((id) => (
                  <label key={id} data-selected={build === id}>
                    <Image
                      src={`/arcade/chassis-${id}.svg`}
                      width={64}
                      height={38}
                      alt=""
                    />
                    <span>
                      <strong>{chassis[id].name}</strong>
                      <small>{chassis[id].tip}</small>
                    </span>
                    <input
                      type="radio"
                      name="arcade-chassis"
                      value={id}
                      checked={build === id}
                      onChange={() => setBuild(id)}
                    />
                  </label>
                ))}
              </fieldset>
              <button
                className="arcade-start"
                onClick={start}
                disabled={phase === 'loading'}
              >
                <Play size={20} aria-hidden="true" />
                {phase === 'loading'
                  ? 'Preparing for lift-off…'
                  : 'Start a 1-minute shift'}
              </button>
              <button
                className="arcade-text-button"
                onClick={startCalm}
                disabled={phase === 'loading'}
              >
                Play untimed cleanup instead
              </button>
              <span className="arcade-screen-note">
                Play a minute. Upgrade for more. Up to 3 minutes per run.
              </span>
              <button
                className="arcade-text-button"
                onClick={startRecycling}
                disabled={phase === 'loading'}
              >
                Play Recycling Bay
              </button>
            </div>
          )}
          {phase === 'docked' && (
            <div
              className="arcade-upgrade-screen"
              aria-labelledby="arcade-dock-title"
            >
              <h2 id="arcade-dock-title" ref={dockTitle} tabIndex={-1}>
                Nice haul. Go again?
              </h2>
              <p>
                Next: {levels[Math.min(hud.level, levels.length - 1)].name}.
                Choose an upgrade for another minute and repair one shield.
              </p>
              <div className="arcade-upgrade-options">
                {(Object.keys(upgrades) as Upgrade[])
                  .filter((key) => !hud.upgrades.includes(key))
                  .map((key) => {
                    const Icon =
                      key === 'beam'
                        ? ScanLine
                        : key === 'hold'
                          ? Package
                          : Zap;
                    return (
                      <button key={key} onClick={() => chooseUpgrade(key)}>
                        <Icon size={22} aria-hidden="true" />
                        <span>
                          <strong>{upgrades[key].name}</strong>
                          <small>
                            {key === 'hold'
                              ? `Carry ${capacity(hud) + 3} items. Make fewer trips to the truck.`
                              : upgrades[key].tip}
                          </small>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" />
                      </button>
                    );
                  })}
              </div>
              <button
                className="arcade-text-button"
                onClick={() => runtime.current?.finish()}
              >
                Finish &amp; get my 5% reward
              </button>
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
              <button
                className="arcade-text-button"
                onClick={() => runtime.current?.finish()}
              >
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
          {phase === 'recycling' && (
            <RecyclingArcade
              sound={tone}
              onFinish={(value) => {
                setRecyclingResult(value);
                setPhase('finished');
              }}
            />
          )}
          {phase === 'finished' && (
            <div className="arcade-finish-screen">
              <Sparkles size={34} aria-hidden="true" />
              <h2 ref={result} tabIndex={-1}>
                {recyclingResult ? 'SORTED. NICE WORK!' : 'POOF, GONE!'}
              </h2>
              <p>
                {recyclingResult
                  ? `${recyclingResult.queue.length} materials sorted · ${recyclingResult.score.toLocaleString()} sorting points.`
                  : `${hud.delivered} ${hud.delivered === 1 ? 'piece' : 'pieces'} of pixel junk cleared.`}
                <br />
                Let’s tackle the real stuff.
              </p>
              {recyclingResult && (
                <span className="recycling-result">
                  {recyclingResult.firstTry}/12 first try · Best streak{' '}
                  {recyclingResult.bestStreak}
                  <br />
                  {recyclingResult.totals.recycling} recycled ·{' '}
                  {recyclingResult.totals.trash} trash ·{' '}
                  {recyclingResult.totals.aside} special drop-off
                </span>
              )}
              {!recyclingResult && !calm && hud.recycled > 0 && (
                <span className="recycling-result">
                  {hud.recycled} recycled · +{hud.recyclingBonus} recycling
                  bonus included
                </span>
              )}
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
                <button onClick={startRecycling}>
                  {recyclingResult
                    ? 'Sort another load'
                    : 'Next stop: Recycling Bay'}
                </button>
                <button onClick={reset}>Choose mode</button>
              </div>
              <output className="sr-only">
                {copied ? 'SPACE5 copied to clipboard.' : ''}
              </output>
            </div>
          )}
        </div>
        <p className="arcade-status" role={active ? undefined : 'status'}>
          {active ? hud.notice : 'Finish a game. Get 5% off your next removal.'}
        </p>
      </div>
      <div className="cabinet-control-deck">
        {phase === 'recycling' && (
          <button
            className="calm-mode-exit"
            onClick={() => setPhase(recyclingReturn)}
          >
            {recyclingReturn === 'finished'
              ? 'Back to my reward'
              : 'Choose mode'}
          </button>
        )}
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
              className="arcade-round-button arcade-pause-button"
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
            {calm || phase === 'recycling' ? (
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
                {hud.leg > 1 ? 'Extended best' : '1-minute best'}
                <strong>{currentBest.toLocaleString()}</strong>
              </>
            )}
          </span>
        </div>
      </div>
      <CabinetBase className="cabinet-base">
        {
          <summary>
            How to play &amp; options{' '}
            <span className="embedded-best">
              Best: {currentBest.toLocaleString()}
            </span>
          </summary>
        }
        <div id="arcade-instructions" className="arcade-instructions">
          {phase === 'recycling' || recyclingResult ? (
            <p>
              <strong>Sort the salvage.</strong> Recycling earns 200 points,
              trash 100, special drop-off 150. First-try streaks add up to 100;
              corrected answers earn a quarter of base points. Choose a bin or
              use keys 1–6 inside the yard, then Next item. Glass has its own
              drop-off; batteries and clean plastic bags need specialist
              collection. Local acceptance rules vary.
            </p>
          ) : calm ? (
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
                automatically. Scout flies fastest with 4 slots; Hauler flies
                slower with 7; Lifter carries 5 and lifts in 20% less time.
                Cargo Bay adds 3 slots to your chosen chassis.
              </p>
              <p>
                <strong>Sort your haul.</strong> R-marked clean cardboard and
                cans go left to Recycling for double their base points. Trash
                and bulky items go right to the truck for crew handling. Mixed
                loads need both docks; a wrong dock keeps your cargo. The
                destination strip shows your hold. Bigger items take longer to
                lift. Cargo Launch and items still aboard at the end earn base
                points without the recycling bonus. Full express loads earn 100
                extra. Dodge traffic marked !.
              </p>
              <table className="arcade-item-values">
                <caption>Item rewards &amp; lift time</caption>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Base points</th>
                    <th scope="col">Seconds*</th>
                  </tr>
                </thead>
                <tbody>
                  {junkTypes.map((item) => (
                    <tr key={item.name}>
                      <th scope="row">{item.name}</th>
                      <td>{item.points}</td>
                      <td>{item.seconds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="arcade-item-footnote">
                *Scout / Hauler timing. Lifter needs 20% less time.
              </p>
              <p>
                <strong>Power up.</strong> Fly directly over a lettered capsule.
                B activates Split Beam for 10 seconds: line up two items. R
                activates Repulsor for 8 seconds: ram hazards for 75 bonus
                points each. H stores one cargo launch: press Space or Launch
                cargo to unload anywhere. Save it for a full load!
              </p>
              <p>
                <strong>Set your pace.</strong> Each level is one minute in the
                same location. Traffic builds gradually; a short heads-up
                precedes UFOs and falling debris. Existing hazards keep moving.
                After a minute, finish for your reward or choose an upgrade to
                enter the next location. There are three optional levels, with
                later routes adding convoys, wider UFO patrols and aimed debris.
                New levels start with a clear approach and three seconds of
                protection. Ion Dash uses Shift or the Dash button and recharges
                in six seconds.
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
          {storageNote} One-minute best: {best.toLocaleString()}. Extended best:{' '}
          {extendedBest.toLocaleString()}. Untimed cleanup doesn’t change the
          arcade record.{' '}
          <button
            onClick={() => {
              setBest(0);
              setExtendedBest(0);
              try {
                localStorage.removeItem(bestKey);
                localStorage.removeItem(`${bestKey}-extended`);
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
