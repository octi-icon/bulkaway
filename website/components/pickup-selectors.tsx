'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { serviceNames } from '@/lib/pickup';

export function ServiceSelector({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="field">
      <label id="service-label" htmlFor="pickup-service">
        What’s the mission?
      </label>
      <Select
        name="service"
        value={value || null}
        onValueChange={(next) => onChange(next || '')}
        required
      >
        <SelectTrigger
          id="pickup-service"
          className="pickup-selector"
          aria-labelledby="service-label"
          aria-invalid={!!error}
          aria-describedby={error ? 'service-error' : undefined}
        >
          <SelectValue placeholder="Choose a service" />
        </SelectTrigger>
        <SelectContent
          className="pickup-options"
          align="start"
          alignItemWithTrigger={false}
        >
          {serviceNames.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <span id="service-error" className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}

function localDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function PickupDateSelector({
  minimumDate,
  error,
}: {
  minimumDate: string;
  error?: string;
}) {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const earliest = minimumDate
    ? new Date(`${minimumDate}T00:00:00`)
    : undefined;
  return (
    <div className="field">
      <label id="date-label" htmlFor="pickup-date">
        Preferred date <small>(optional)</small>
      </label>
      <input
        type="hidden"
        name="date"
        value={date ? localDateValue(date) : ''}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id="pickup-date"
          className="pickup-selector"
          aria-labelledby="date-label date-value"
          aria-invalid={!!error}
          aria-describedby={error ? 'date-error' : undefined}
        >
          <span id="date-value">
            {date
              ? date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Choose a date'}
          </span>
          <CalendarDays aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          className="pickup-calendar"
          align="end"
          aria-describedby="pickup-calendar-help"
        >
          <PopoverTitle>Choose your preferred date</PopoverTitle>
          <p id="pickup-calendar-help" className="sr-only">
            Use the arrow keys to move between days, Enter to choose, or Escape
            to close without changing your date.
          </p>
          <DayPicker
            mode="single"
            selected={date}
            defaultMonth={date || earliest}
            startMonth={earliest}
            disabled={earliest ? { before: earliest } : undefined}
            // Focus the calendar only after the user opens its popover.
            // oxlint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            onSelect={(next) => {
              setDate(next);
              setOpen(false);
            }}
          />
          <button
            type="button"
            className="clear-pickup-date"
            onClick={() => {
              setDate(undefined);
              setOpen(false);
            }}
          >
            No preferred date
          </button>
        </PopoverContent>
      </Popover>
      {error && (
        <span id="date-error" className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
