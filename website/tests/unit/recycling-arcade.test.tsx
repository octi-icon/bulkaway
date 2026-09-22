import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { RecyclingArcade } from '@/components/recycling-arcade';
import { recyclingItems } from '@/lib/arcade-recycling';
afterEach(cleanup);

it('supports scoped keyboard sorting, correction, focus and completing a load', () => {
  const finish = vi.fn(),
    sound = vi.fn();
  render(<RecyclingArcade onFinish={finish} sound={sound} />);
  const game = screen.getByRole('region', { name: 'Recycling sorting game' });
  fireEvent.keyDown(game, { key: '5' });
  expect(screen.getByRole('status').textContent).toContain('Try again');
  expect(sound).not.toHaveBeenCalled();
  for (let i = 0; i < 12; i++) {
    const heading = screen.getByRole('heading', { level: 3 });
    const item = recyclingItems.find(
      (item) => item.name === heading.textContent,
    )!;
    const keys = {
      paper: '1',
      plastic: '2',
      metal: '3',
      glass: '4',
      aside: '5',
    };
    fireEvent.keyDown(heading, { key: keys[item.bin] });
    const next = screen.getByRole('button', {
      name: i === 11 ? 'Finish sorting →' : 'Next item →',
    });
    expect(document.activeElement).toBe(next);
    fireEvent.click(next);
  }
  expect(finish).toHaveBeenCalledOnce();
  expect(finish.mock.calls[0][0]).toMatchObject({
    finished: true,
    firstTry: 11,
  });
  expect(sound).toHaveBeenLastCalledWith('bank');
});
