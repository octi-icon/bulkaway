'use client';
import { useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { HaulItemPicker, useHaulList } from '@/components/haul-list';
import { DraftSafeLink } from '@/components/draft-safe-link';

export function HaulBuilder() {
  const { items: selected, locked } = useHaulList();
  const [transferNotice, setTransferNotice] = useState('');
  return (
    <div className="haul-builder" id="haul-list">
      <div className="haul-intro">
        <h3>What’s taking up space?</h3>
      </div>
      <div>
        <HaulItemPicker />
        <p className="haul-guidance">
          Our crew confirms pricing and any special handling before pickup.
        </p>
        <div className="haul-actions">
          <output>
            {selected.length
              ? `${selected.length} item ${selected.length === 1 ? 'type' : 'types'} on your list`
              : 'Your fresh start begins with a list.'}
          </output>
          <a
            className="button"
            href="#request"
            aria-disabled={!selected.length || locked}
            onClick={(event) => {
              if (!selected.length || locked) {
                event.preventDefault();
                return;
              }
              const unhandled = window.dispatchEvent(
                new CustomEvent('bulk-items', {
                  cancelable: true,
                }),
              );
              if (unhandled) {
                event.preventDefault();
                setTransferNotice(
                  'Finish your current request first, or choose “Start another request” in the form below. Your list is still here.',
                );
              } else setTransferNotice('');
            }}
          >
            Continue with my list <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </div>
        {transferNotice && (
          <output className="haul-guidance">{transferNotice}</output>
        )}
      </div>
    </div>
  );
}

const counties = ['Weber', 'Davis', 'Salt Lake', 'Utah'];
export function CountyExplorer({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState('');
  return (
    <aside
      id="service-area"
      className="service-area wrap county-explorer"
      aria-label="Utah service areas"
      data-county={selected}
    >
      <div className="county-copy">
        <h2>Your Utah hauling crew.</h2>
        <p>Four counties. A whole lot of fresh starts.</p>
        <fieldset
          className="county-options"
          aria-label="Explore our service counties"
        >
          {counties.map((county) => (
            <button
              type="button"
              key={county}
              aria-pressed={selected === county}
              onClick={() => setSelected(county)}
            >
              <span>{county} County</span>
              <Check size={18} aria-hidden="true" />
            </button>
          ))}
        </fieldset>
        <div className="county-response">
          <output>
            {selected
              ? `Yes, we serve ${selected} County.`
              : 'Junk removal & trash outs, close to home.'}
          </output>
          <a className="text-link" href="#request">
            Request a pickup <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="county-map-art">
        {children}
        <p className="county-map-note">
          Map boundaries:{' '}
          <DraftSafeLink href="https://gis.utah.gov/products/sgid/boundaries/county/">
            State of Utah, SGID
          </DraftSafeLink>
          .
        </p>
      </div>
    </aside>
  );
}

const prepTips = [
  ['The stuff', 'Make a rough list of items and quantities.'],
  ['The route', 'Note stairs, gates, and where the items are.'],
  ['The snapshot', 'Consider a photo of the pile. Photos are optional.'],
];
export function PreflightCheck() {
  const [checked, setChecked] = useState<number[]>([]);
  const ready = checked.length === prepTips.length;
  return (
    <details className="preflight">
      <summary>
        <Rocket size={25} aria-hidden="true" />
        <span>A little pre-flight check?</span>
        <span className="optional-label">Optional quote prep</span>
        <ChevronDown className="disclosure-plus" size={22} aria-hidden="true" />
      </summary>
      <div className="preflight-body">
        <fieldset>
          <legend>Three handy tips before you request a pickup.</legend>
          {prepTips.map(([label, tip], index) => (
            <label key={label}>
              <input
                type="checkbox"
                checked={checked.includes(index)}
                onChange={(event) =>
                  setChecked(
                    event.target.checked
                      ? [...checked, index]
                      : checked.filter((item) => item !== index),
                  )
                }
              />
              <span>
                <strong>{label}</strong>
                {tip}
              </span>
            </label>
          ))}
        </fieldset>
        <div className="preflight-result" data-ready={ready}>
          <div className="preflight-lights" aria-hidden="true">
            {prepTips.map((_, index) => (
              <span key={index} data-lit={checked.includes(index)}>
                <Check size={18} />
              </span>
            ))}
          </div>
          <output>
            {ready
              ? 'Ready to give us the scoop!'
              : `${checked.length} of 3 tips checked`}
          </output>
          {ready && (
            <Sparkles className="prep-spark" size={30} aria-hidden="true" />
          )}
          <p className="prep-note">
            No heavy lifting needed. This checklist and photos are optional.
          </p>
          <a className="text-link" href="#request">
            Start my request <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="quiet-reset"
            disabled={!checked.length}
            onClick={() => setChecked([])}
          >
            Reset checklist
          </button>
        </div>
      </div>
    </details>
  );
}

const familyNeeds = [
  {
    id: 'valet',
    href: 'https://wsitrashvalet.com',
    brand: 'WSI Trash & Recycling Valet',
    label: 'Doorstep trash & recycling',
    match: 'WSI Trash & Recycling Valet takes it from the doorstep.',
  },
  {
    id: 'pals',
    href: 'https://petwastepals.com',
    brand: 'Pet Waste Pals',
    label: 'Pet waste & grounds',
    match: 'Pet Waste Pals helps keep shared spaces ready to enjoy.',
  },
  {
    id: 'aepoc',
    href: 'https://aepoc.co',
    brand: 'AEPOC',
    label: 'Business strategy & design',
    match:
      'AEPOC connects business strategy and design—and leads the design work for our family.',
  },
];
export function FamilyFinder({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState('');
  const match = familyNeeds.find((need) => need.id === selected);
  return (
    <div className="family-finder" data-match={selected}>
      <div className="family-chooser">
        <h3>What else can we help with?</h3>
        <fieldset
          className="family-options"
          aria-label="Find a family brand by need"
        >
          {familyNeeds.map((need) => (
            <button
              key={need.id}
              type="button"
              aria-pressed={selected === need.id}
              onClick={() => setSelected(selected === need.id ? '' : need.id)}
            >
              {need.label}
              <Check size={17} aria-hidden="true" />
            </button>
          ))}
        </fieldset>
        <output className={match ? undefined : 'sr-only'}>
          {match?.match || ''}
        </output>
        {match && (
          <DraftSafeLink
            className="text-link family-match-link"
            href={match.href}
          >
            Explore {match.brand} <ArrowUpRight size={18} aria-hidden="true" />
          </DraftSafeLink>
        )}
      </div>
      {children}
    </div>
  );
}
