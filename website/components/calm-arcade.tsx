'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, ArrowRight } from 'lucide-react';
import {
  createCleanup,
  stepCleanup,
  cleanupItems,
  cleanupPlaces,
  type Cleanup,
  type CleanupAction,
} from '@/lib/arcade-calm';

export function CalmArcade({
  onUpdate,
  onFinish,
  sound,
}: {
  onUpdate: (s: Cleanup) => void;
  onFinish: (s: Cleanup) => void;
  sound: (kind: 'collect' | 'bank') => void;
}) {
  const [state, setState] = useState(createCleanup);
  const current = useRef(state);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [state.stage]);
  function act(action: CleanupAction) {
    const next = stepCleanup(current.current, action);
    if (next === current.current) return;
    current.current = next;
    setState(next);
    if (action.type !== 'next')
      sound(action.type === 'unload' ? 'bank' : 'collect');
    onUpdate(next);
    if (next.finished) onFinish(next);
  }
  const items = cleanupItems(state.stage);
  const selected = items.findIndex((item) => item.id === state.selected);
  return (
    <div className="calm-mission" data-stop={state.stage}>
      <div className="calm-heading">
        <span>Stop {state.stage + 1} of 3 · No clock. No collisions.</span>
        <h2 ref={heading} tabIndex={-1}>
          {cleanupPlaces[state.stage]}
        </h2>
        <p>Choose junk. Beam it aboard. Unload into the truck.</p>
      </div>
      <fieldset className="calm-yard">
        <legend className="sr-only">
          Choose junk in {cleanupPlaces[state.stage]}
        </legend>
        <div
          className="calm-pilot"
          data-side={
            selected < 0 ? 'center' : selected % 2 === 0 ? 'left' : 'right'
          }
          data-row={selected > 1 ? 'lower' : 'upper'}
          aria-hidden="true"
        >
          <Image src="/arcade/saucer.svg" width={100} height={58} alt="" />
          <span className="calm-hold">
            {Array.from({ length: 3 }, (_, i) => (
              <i key={i} data-filled={i < state.cargo} />
            ))}
          </span>
        </div>
        <div className="calm-ground">
          {items.map((item) => {
            const picked = state.picked.includes(item.id),
              blocked = picked || state.cargo === 3;
            return (
              <button
                type="button"
                key={item.id}
                className="calm-junk"
                data-picked={picked}
                aria-disabled={blocked}
                aria-label={
                  picked ? `${item.name} picked up` : `Beam up ${item.name}`
                }
                onClick={() => act({ type: 'collect', id: item.id })}
              >
                {picked ? (
                  <Check size={32} aria-hidden="true" />
                ) : (
                  <Image
                    src={`/arcade/junk-${item.kind}.svg`}
                    width={58}
                    height={48}
                    alt=""
                  />
                )}
                <span>
                  {item.name}
                  <small>
                    {picked
                      ? 'Cleared'
                      : state.cargo === 3
                        ? 'Unload first'
                        : 'Beam aboard'}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <output className="calm-notice" aria-live="polite" aria-atomic="true">
        {state.notice}
      </output>
      <div className="calm-loading-bay">
        <Image
          src="/arcade/truck.svg"
          width={150}
          height={74}
          alt="Bulk Away hauling truck"
        />
        {state.cleared ? (
          <button
            type="button"
            className="calm-unload"
            onClick={() => act({ type: 'next' })}
          >
            Next stop <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="calm-unload"
            disabled={!state.cargo}
            onClick={() => act({ type: 'unload' })}
          >
            Unload{' '}
            {state.cargo
              ? `${state.cargo} ${state.cargo === 1 ? 'item' : 'items'}`
              : 'into truck'}
          </button>
        )}
      </div>
    </div>
  );
}
