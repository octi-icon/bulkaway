import { describe, expect, it } from 'vitest';
import {
  createSorting,
  sortMaterial,
  nextMaterial,
  recyclingItems,
} from '@/lib/arcade-recycling';

describe('recycling bay', () => {
  it('rewards proper recycling twice as much as trash and reduces retries without removing cargo', () => {
    const oneItem = (bin: 'paper' | 'trash') => ({
      ...createSorting(),
      queue: [recyclingItems.findIndex((item) => item.bin === bin)],
    });
    expect(sortMaterial(oneItem('paper'), 'paper').score).toBe(200);
    expect(sortMaterial(oneItem('trash'), 'trash').score).toBe(100);
    const wrong = sortMaterial(oneItem('trash'), 'paper');
    expect(wrong.score).toBe(0);
    expect(wrong.sorted).toBe(false);
    expect(sortMaterial(wrong, 'trash').score).toBe(25);
  });
  it('keeps each material exactly once and puts special handling in the final batch', () => {
    const run = createSorting(() => 0.5);
    expect(new Set(run.queue).size).toBe(12);
    expect(
      run.queue.slice(0, 8).every((id) => recyclingItems[id].bin !== 'aside'),
    ).toBe(true);
    expect(
      run.queue.slice(8).filter((id) => recyclingItems[id].bin === 'aside'),
    ).toHaveLength(2);
  });
  it('requires correction and awards each item only once', () => {
    let run = createSorting(() => 0.5);
    const target = recyclingItems[run.queue[0]].bin;
    run = sortMaterial(run, 'aside');
    expect(run.index).toBe(0);
    expect(run.score).toBe(0);
    expect(nextMaterial(run)).toBe(run);
    run = sortMaterial(run, target);
    expect(run.score).toBe(50);
    expect(run.streak).toBe(0);
    expect(sortMaterial(run, target)).toBe(run);
    expect(nextMaterial(run).index).toBe(1);
  });
  it('finishes after all twelve items, tracks first tries, and cannot farm points', () => {
    let run = createSorting(() => 0.5);
    for (let i = 0; i < 12; i++) {
      run = sortMaterial(run, recyclingItems[run.queue[run.index]].bin);
      run = nextMaterial(run);
    }
    expect(run.finished).toBe(true);
    expect(run.firstTry).toBe(12);
    expect(run.bestStreak).toBe(12);
    expect(run.score).toBe(2950);
    expect(run.totals).toEqual({ recycling: 7, trash: 3, aside: 2 });
    expect(sortMaterial(run, 'paper')).toBe(run);
    expect(nextMaterial(run)).toBe(run);
  });
});
