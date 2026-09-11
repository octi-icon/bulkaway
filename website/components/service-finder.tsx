'use client';
import { useRef, useState } from 'react';
import { ArrowUpRight, Check, Compass, ChevronDown } from 'lucide-react';
import {
  freshStartChoices,
  communityChoices,
  recommendService,
} from '@/lib/service-guide';

export function ServiceFinder({
  onExplore,
}: {
  onExplore: (service: string) => void;
}) {
  const [goal, setGoal] = useState('');
  const [area, setArea] = useState('');
  const firstChoice = useRef<HTMLButtonElement>(null);
  const suggestion = recommendService(goal, area);
  return (
    <details className="service-finder" id="service-finder">
      <summary>
        <Compass size={23} aria-hidden="true" />
        <span>Not sure which service? Find your fresh start.</span>
        <ChevronDown size={21} aria-hidden="true" />
      </summary>
      <div className="finder-body">
        <fieldset className="finder-choices">
          <legend>What needs a fresh start?</legend>
          {freshStartChoices.map((choice) => (
            <button
              type="button"
              key={choice.id}
              ref={
                choice.id === freshStartChoices[0].id ? firstChoice : undefined
              }
              aria-pressed={goal === choice.id}
              onClick={() => {
                setGoal(choice.id);
                setArea('');
              }}
            >
              <span>{choice.label}</span>
              <Check size={18} aria-hidden="true" />
            </button>
          ))}
        </fieldset>
        {goal === 'community' && (
          <fieldset className="finder-choices finder-followup">
            <legend>What needs attention in your community?</legend>
            {communityChoices.map((choice) => (
              <button
                type="button"
                key={choice.id}
                aria-pressed={area === choice.id}
                onClick={() => setArea(choice.id)}
              >
                <span>{choice.label}</span>
                <Check size={18} aria-hidden="true" />
              </button>
            ))}
          </fieldset>
        )}
        <output className={suggestion ? 'finder-status' : 'sr-only'}>
          {suggestion ? `A good place to start: ${suggestion.service}.` : ''}
        </output>
        {suggestion && (
          <div className="finder-result">
            <p>{suggestion.reason}</p>
            <div className="finder-actions">
              <button
                className="text-link"
                type="button"
                onClick={() => onExplore(suggestion.service)}
              >
                See service details{' '}
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
              <a
                className="button button-ink"
                href="#request"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('bulk-service', {
                      detail: suggestion.service,
                    }),
                  )
                }
              >
                Request this service{' '}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
        {goal && (
          <button
            className="quiet-reset"
            type="button"
            onClick={(event) => {
              setGoal('');
              setArea('');
              if (event.detail === 0)
                requestAnimationFrame(() => firstChoice.current?.focus());
            }}
          >
            Reset my answers
          </button>
        )}
        <a
          className="finder-other text-link"
          href="#request"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('bulk-service', { detail: 'Help me choose' }),
            )
          }
        >
          Something else? Ask the crew{' '}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </details>
  );
}
