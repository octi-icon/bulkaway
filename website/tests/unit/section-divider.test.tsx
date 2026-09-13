import { afterEach, expect, test, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { SectionDivider } from '../../components/section-divider';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test('divider animates on entry once, without adding a clickable control', () => {
  let notify: IntersectionObserverCallback = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe() {}
    disconnect = disconnect;
  });
  const { container, unmount } = render(<SectionDivider variant="truck" />);
  const divider = container.firstElementChild!;
  expect(divider.getAttribute('data-arrived')).toBe('false');
  expect(container.querySelector('button, a, [tabindex]')).toBeNull();
  act(() => notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(divider.getAttribute('data-arrived')).toBe('true');
  expect(disconnect).toHaveBeenCalledOnce();
  unmount();
  expect(disconnect).toHaveBeenCalledTimes(2);
});

test('art stays available when intersection observation is unsupported', () => {
  vi.stubGlobal('IntersectionObserver', undefined);
  const { container } = render(<SectionDivider variant="star" />);
  expect(container.querySelector('img')?.getAttribute('src')).toBe('/brand/haul-flight-atomic.webp');
  expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
});
