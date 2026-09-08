'use client';
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type ReactNode,
} from 'react';
import {
  Check,
  Plus,
  Minus,
  Sofa,
  BedDouble,
  Refrigerator,
  Monitor,
  CircleDot,
  Boxes,
} from 'lucide-react';
import { haulItems, type HaulDraftItem } from '@/lib/haul-guide';
type HaulState = {
  items: HaulDraftItem[];
  setItems: (items: HaulDraftItem[]) => void;
  locked: boolean;
  setLocked: (locked: boolean) => void;
  requestStarted: boolean;
  setRequestStarted: (started: boolean) => void;
  requestComplete: boolean;
  setRequestComplete: (complete: boolean) => void;
};
const HaulContext = createContext<HaulState | null>(null);
export function HaulListProvider({ children }: { children: ReactNode }) {
  const [items, updateItems] = useState<HaulDraftItem[]>([]);
  const [locked, setLocked] = useState(false);
  const [requestStarted, setRequestStarted] = useState(false);
  const [requestComplete, setRequestComplete] = useState(false);
  const setItems = useCallback((next: HaulDraftItem[]) => {
    updateItems(next);
    // A new list after a receipt is a new draft, including for safe link detours.
    setRequestComplete(false);
  }, []);
  return (
    <HaulContext.Provider
      value={{
        items,
        setItems,
        locked,
        setLocked,
        requestStarted,
        setRequestStarted,
        requestComplete,
        setRequestComplete,
      }}
    >
      {children}
    </HaulContext.Provider>
  );
}
export function useHaulList() {
  const value = useContext(HaulContext);
  if (!value) throw new Error('Haul list needs its provider.');
  return value;
}
const icons = [Sofa, BedDouble, Refrigerator, Monitor, CircleDot, Boxes];
export function HaulItemPicker({ inForm = false }: { inForm?: boolean }) {
  const { items, setItems, locked } = useHaulList();
  const prefix = useId();
  function quantity(id: string, next: number | '') {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: next } : item,
      ),
    );
  }
  return (
    <fieldset
      className={`haul-options quantity-options${inForm ? ' form-haul-options' : ''}`}
      disabled={locked}
    >
      <legend>{inForm ? 'Your haul list' : 'Choose items & quantities'}</legend>
      {haulItems.map((item, index) => {
        const Icon = icons[index];
        const selected = items.find((entry) => entry.id === item.id);
        const invalid =
          selected &&
          (!Number.isInteger(selected.quantity) ||
            Number(selected.quantity) < 1 ||
            Number(selected.quantity) > 999);
        return (
          <div
            className="haul-item-row"
            data-selected={!!selected}
            key={item.id}
          >
            <button
              className="haul-item-toggle"
              type="button"
              aria-pressed={!!selected}
              onClick={() =>
                setItems(
                  selected
                    ? items.filter((entry) => entry.id !== item.id)
                    : [...items, { id: item.id, quantity: 1 }],
                )
              }
            >
              <Icon size={23} aria-hidden="true" />
              <span>{item.label}</span>
              {selected ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Plus size={18} aria-hidden="true" />
              )}
            </button>
            {selected && (
              <div className="item-quantity">
                <label htmlFor={`${prefix}-${item.id}`}>Quantity</label>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    aria-label={`Decrease ${item.label} quantity`}
                    disabled={locked || Number(selected.quantity) <= 1}
                    onClick={() =>
                      quantity(
                        item.id,
                        Math.max(1, Number(selected.quantity) - 1),
                      )
                    }
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <input
                    id={`${prefix}-${item.id}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={999}
                    step={1}
                    aria-label={`${item.label} quantity`}
                    aria-invalid={!!invalid}
                    aria-describedby={
                      invalid ? `${prefix}-${item.id}-error` : undefined
                    }
                    value={selected.quantity}
                    onChange={(event) =>
                      quantity(
                        item.id,
                        event.target.value === ''
                          ? ''
                          : Number(event.target.value),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Increase ${item.label} quantity`}
                    disabled={locked || Number(selected.quantity) >= 999}
                    onClick={() =>
                      quantity(
                        item.id,
                        Math.min(
                          999,
                          Math.max(1, Number(selected.quantity) + 1),
                        ),
                      )
                    }
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>
                {invalid && (
                  <small id={`${prefix}-${item.id}-error`}>
                    Enter a whole number, 1–999.
                  </small>
                )}
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
