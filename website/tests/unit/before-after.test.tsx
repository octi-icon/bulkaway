import { afterEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BeforeAfter } from '../../components/before-after';
afterEach(cleanup);
test('view buttons and slider share a single accessible comparison position', () => {
  render(<BeforeAfter label="Chute room" />);
  const slider = screen.getByRole('slider', {
    name: 'Reveal after: Chute room',
  });
  fireEvent.click(screen.getByRole('button', { name: 'After' }));
  expect(slider.getAttribute('aria-valuetext')).toBe(
    '100% of the after illustration revealed',
  );
  fireEvent.change(slider, { target: { value: '25' } });
  expect(slider.getAttribute('aria-valuetext')).toBe(
    '25% of the after illustration revealed',
  );
  expect(
    screen.getByRole('button', { name: 'After' }).getAttribute('aria-pressed'),
  ).toBe('false');
  fireEvent.click(screen.getByRole('button', { name: 'Before' }));
  expect(slider.getAttribute('aria-valuetext')).toBe(
    '0% of the after illustration revealed',
  );
});
