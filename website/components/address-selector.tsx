'use client';
// Editable combobox needs a styled, attributed popup; native datalist cannot supply it.
/* oxlint-disable jsx-a11y/prefer-tag-over-role */

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  createAddressSession,
  loadAddressLibrary,
  AddressCoverageError,
  type AddressPrediction,
} from '@/lib/google-address';

export function AddressSelector({
  apiKey,
  active,
  error,
  onResolvingChange,
}: {
  apiKey: string;
  active: boolean;
  error?: string;
  onResolvingChange: (resolving: boolean) => void;
}) {
  const [address, setAddress] = useState('');
  const [manual, setManual] = useState(!apiKey);
  const [focused, setFocused] = useState(false);
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [highlighted, setHighlighted] = useState(-1);
  const [message, setMessage] = useState('');
  const [chosen, setChosen] = useState('');
  const [coverageError, setCoverageError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const selection = useRef(0);
  const selectionPending = useRef(false);
  const session = useRef<ReturnType<typeof createAddressSession> | null>(null);
  const enabled = !!apiKey && !manual;
  const open = enabled && active && focused && predictions.length > 0;

  useEffect(() => {
    input.current?.setCustomValidity(coverageError);
  }, [coverageError]);

  useEffect(() => {
    const cancelSelection = () => {
      ++selection.current;
      selectionPending.current = false;
      onResolvingChange(false);
    };
    return cancelSelection;
  }, [active, onResolvingChange]);

  useEffect(() => {
    if (open && highlighted >= 0)
      document
        .getElementById(`address-option-${highlighted}`)
        ?.scrollIntoView({ block: 'nearest' });
  }, [open, highlighted]);

  useEffect(() => {
    const current = ++generation.current;
    if (
      !enabled ||
      !active ||
      !focused ||
      selectionPending.current ||
      address.trim().length < 3 ||
      address === chosen
    ) {
      return;
    }
    const timeout = window.setTimeout(() => {
      if (current !== generation.current) return;
      ++generation.current;
      setMessage(
        'Address search is taking too long. You can enter the full address manually.',
      );
    }, 15000);
    const debounce = window.setTimeout(async () => {
      setMessage('Finding addresses…');
      try {
        const library = await loadAddressLibrary(apiKey);
        if (current !== generation.current) return;
        session.current ||= createAddressSession(library);
        const results = await session.current.search(address.trim());
        if (current !== generation.current) return;
        setPredictions(results);
        setMessage(
          results.length
            ? `${results.length} suggestions. Use up and down arrows, then Enter to choose.`
            : 'No matching addresses. Try more detail or enter the full address manually.',
        );
      } catch {
        if (current === generation.current)
          setMessage(
            'Address search is unavailable. You can enter the full address manually.',
          );
      } finally {
        window.clearTimeout(timeout);
      }
    }, 300);
    return () => {
      // This is a request sequence counter, not a DOM ref needing a snapshot.
      // oxlint-disable-next-line react-hooks/exhaustive-deps
      ++generation.current;
      window.clearTimeout(debounce);
      window.clearTimeout(timeout);
    };
  }, [address, chosen, enabled, active, focused, apiKey]);

  async function choose(prediction: AddressPrediction) {
    ++generation.current;
    const current = ++selection.current;
    selectionPending.current = true;
    onResolvingChange(true);
    setPredictions([]);
    setHighlighted(-1);
    setMessage('Getting the full address…');
    setCoverageError('');
    const timeout = window.setTimeout(() => {
      if (current !== selection.current) return;
      ++selection.current;
      selectionPending.current = false;
      onResolvingChange(false);
      setManual(true);
      setMessage(
        'Couldn’t load that address. Please enter the full address manually.',
      );
    }, 12000);
    try {
      const fullAddress = await session.current!.select(prediction);
      if (current !== selection.current) return;
      setChosen(fullAddress);
      setAddress(fullAddress);
      setMessage('Address selected. Add a unit or building below if needed.');
    } catch (failure) {
      if (current === selection.current) {
        if (failure instanceof AddressCoverageError) {
          setCoverageError(failure.message);
          setMessage('');
        } else {
          setManual(true);
          setMessage(
            'Couldn’t load that address. Please enter the full address manually.',
          );
        }
      }
    } finally {
      window.clearTimeout(timeout);
      if (current === selection.current) {
        selectionPending.current = false;
        onResolvingChange(false);
      }
    }
  }

  return (
    <div className="field full address-selector">
      <label htmlFor="pickup-address">Pickup address</label>
      <input
        ref={input}
        id="pickup-address"
        name="address"
        value={address}
        onChange={(event) => {
          ++generation.current;
          ++selection.current;
          selectionPending.current = false;
          onResolvingChange(false);
          setPredictions([]);
          setHighlighted(-1);
          setMessage('');
          setCoverageError('');
          setAddress(event.target.value);
          setFocused(true);
        }}
        onFocus={() => {
          setPredictions([]);
          setHighlighted(-1);
          setFocused(true);
        }}
        onBlur={() => {
          ++generation.current;
          setFocused(false);
          setMessage('');
        }}
        autoComplete={enabled ? 'off' : 'street-address'}
        role={enabled ? 'combobox' : undefined}
        aria-autocomplete={enabled ? 'list' : undefined}
        aria-expanded={enabled ? open : undefined}
        aria-controls={open ? 'address-suggestions' : undefined}
        aria-activedescendant={
          open && highlighted >= 0 ? `address-option-${highlighted}` : undefined
        }
        aria-invalid={!!error || !!coverageError}
        aria-describedby={`address-help${error || coverageError ? ' address-error' : ''}`}
        placeholder={
          enabled ? 'Start typing your address' : 'Street, city, state & ZIP'
        }
        required
        maxLength={300}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            ++generation.current;
            ++selection.current;
            selectionPending.current = false;
            onResolvingChange(false);
            setFocused(false);
            setPredictions([]);
            setMessage('');
          } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (!enabled) return;
            event.preventDefault();
            setFocused(true);
            if (predictions.length)
              setHighlighted((previous) =>
                event.key === 'ArrowDown'
                  ? (previous + 1) % predictions.length
                  : previous <= 0
                    ? predictions.length - 1
                    : previous - 1,
              );
          } else if (event.key === 'Enter' && open && highlighted >= 0) {
            event.preventDefault();
            void choose(predictions[highlighted]);
          }
        }}
      />
      {open && (
        <div className="address-results">
          <div
            id="address-suggestions"
            role="listbox"
            aria-label="Suggested pickup addresses"
          >
            {predictions.map((prediction, index) => (
              <button
                key={prediction.placeId}
                id={`address-option-${index}`}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={highlighted === index}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => void choose(prediction)}
              >
                <MapPin size={18} aria-hidden="true" />
                <span>{prediction.text.toString()}</span>
              </button>
            ))}
          </div>
          <span className="google-maps-attribution" translate="no">
            Google Maps
          </span>
        </div>
      )}
      {(coverageError || error) && (
        <span id="address-error" className="field-error" role="alert">
          {coverageError || error}
        </span>
      )}
      <small id="address-help">
        Serving Salt Lake, Utah, Davis &amp; Weber counties. Include the street,
        city, state &amp; ZIP.
      </small>
      {apiKey && (
        <>
          <button
            type="button"
            className="address-mode"
            onClick={() => {
              ++generation.current;
              ++selection.current;
              selectionPending.current = false;
              onResolvingChange(false);
              setManual((previous) => !previous);
              setPredictions([]);
              setMessage('');
              session.current = null;
              input.current?.focus({ preventScroll: true });
            }}
          >
            {manual ? 'Search with Google instead' : 'Enter address manually'}
          </button>
        </>
      )}
      <output className="address-status">{message}</output>
    </div>
  );
}
