export const recyclingBins = [
  { id: 'paper', label: 'Paper', key: '1' },
  { id: 'plastic', label: 'Plastic', key: '2' },
  { id: 'metal', label: 'Metal', key: '3' },
  { id: 'glass', label: 'Glass drop-off', key: '4' },
  { id: 'aside', label: 'Special drop-off', key: '5' },
  { id: 'trash', label: 'Trash', key: '6' },
] as const;
export type RecyclingBin = (typeof recyclingBins)[number]['id'];
export type RecyclingSprite =
  | 'paper'
  | 'box'
  | 'bottle'
  | 'jug'
  | 'can'
  | 'jar'
  | 'battery'
  | 'bag';
export const sortingPoints = {
  recycling: 200,
  trash: 100,
  aside: 150,
} as const;
export const sortingStream = (bin: RecyclingBin) =>
  bin === 'trash' || bin === 'aside' ? bin : 'recycling';
type Material = {
  name: string;
  bin: RecyclingBin;
  sprite: RecyclingSprite;
  color: string;
  note: string;
};
export const recyclingItems: readonly Material[] = [
  {
    name: 'Dry newspaper',
    bin: 'paper',
    sprite: 'paper',
    color: '#f3efd7',
    note: 'Clean, dry paper belongs in the paper stream.',
  },
  {
    name: 'Empty plastic bottle',
    bin: 'plastic',
    sprite: 'bottle',
    color: '#bacfdc',
    note: 'Empty, rinsed plastic bottles go with plastic.',
  },
  {
    name: 'Empty aluminum can',
    bin: 'metal',
    sprite: 'can',
    color: '#e8c55d',
    note: 'Aluminum cans belong in the metal stream.',
  },
  {
    name: 'Used tissue',
    bin: 'trash',
    sprite: 'paper',
    color: '#b8d46a',
    note: 'Used tissues go in trash, not the clean paper stream.',
  },
  {
    name: 'Dry cardboard box',
    bin: 'paper',
    sprite: 'box',
    color: '#e8c55d',
    note: 'Flatten clean, dry cardboard for the paper stream.',
  },
  {
    name: 'Rinsed plastic milk jug',
    bin: 'plastic',
    sprite: 'jug',
    color: '#f3efd7',
    note: 'Rigid plastic jugs go with plastic bottles.',
  },
  {
    name: 'Rinsed steel food can',
    bin: 'metal',
    sprite: 'can',
    color: '#bacfdc',
    note: 'Steel food cans go with the other metals.',
  },
  {
    name: 'Greasy cardboard with food stuck on it',
    bin: 'trash',
    sprite: 'box',
    color: '#b8d46a',
    note: 'This food-soiled piece goes in trash. Separate clean cardboard for recycling.',
  },
  {
    name: 'Rinsed glass jar',
    bin: 'glass',
    sprite: 'jar',
    color: '#e8c55d',
    note: 'Glass needs its own collection or drop-off, not the mixed curbside bin.',
  },
  {
    name: 'Mixed bagged household trash',
    bin: 'trash',
    sprite: 'bag',
    color: '#d5b6d1',
    note: 'Mixed bagged trash stays out of recycling. Recyclables should be loose and clean.',
  },
  {
    name: 'Rechargeable lithium battery',
    bin: 'aside',
    sprite: 'battery',
    color: '#e8c55d',
    note: 'Battery drop-off only. Keep lithium batteries out of regular recycling and trash.',
  },
  {
    name: 'Plastic shopping bag',
    bin: 'aside',
    sprite: 'bag',
    color: '#f3efd7',
    note: 'Film tangles sorting equipment. Set it aside for an accepting bag drop-off.',
  },
];
export type SortingRun = {
  queue: number[];
  index: number;
  score: number;
  streak: number;
  bestStreak: number;
  firstTry: number;
  tried: boolean;
  sorted: boolean;
  finished: boolean;
  notice: string;
  chosen: RecyclingBin | null;
  totals: { recycling: number; trash: number; aside: number };
};
export function createSorting(random: () => number = Math.random): SortingRun {
  const queue: number[] = [];
  for (let start = 0; start < recyclingItems.length; start += 4) {
    const batch = [start, start + 1, start + 2, start + 3];
    for (let i = batch.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [batch[i], batch[j]] = [batch[j], batch[i]];
    }
    queue.push(...batch);
  }
  return {
    queue,
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    firstTry: 0,
    tried: false,
    sorted: false,
    finished: false,
    notice: 'Choose a destination for this item.',
    chosen: null,
    totals: { recycling: 0, trash: 0, aside: 0 },
  };
}
export function sortMaterial(run: SortingRun, bin: RecyclingBin): SortingRun {
  if (run.finished || run.sorted) return run;
  const item = recyclingItems[run.queue[run.index]];
  if (bin !== item.bin)
    return {
      ...run,
      tried: true,
      streak: 0,
      chosen: bin,
      notice: `Try again. ${item.note}`,
    };
  const streak = run.tried ? 0 : run.streak + 1;
  const stream = sortingStream(bin);
  const base = sortingPoints[stream];
  const bonus = run.tried ? 0 : Math.min(4, streak - 1) * 25;
  const earned = run.tried ? Math.floor(base / 4) : base + bonus;
  return {
    ...run,
    sorted: true,
    chosen: bin,
    score: run.score + earned,
    streak,
    bestStreak: Math.max(run.bestStreak, streak),
    firstTry: run.firstTry + (run.tried ? 0 : 1),
    totals: { ...run.totals, [stream]: run.totals[stream] + 1 },
    notice: `+${earned}${bonus ? ` (${bonus} streak bonus)` : ''} · ${item.note}`,
  };
}
export function nextMaterial(run: SortingRun): SortingRun {
  if (!run.sorted || run.finished) return run;
  if (run.index === run.queue.length - 1) return { ...run, finished: true };
  return {
    ...run,
    index: run.index + 1,
    tried: false,
    sorted: false,
    chosen: null,
    notice: 'Choose a destination for this item.',
  };
}
