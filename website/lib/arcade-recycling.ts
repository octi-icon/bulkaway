export const recyclingBins = [
  { id: 'paper', label: 'Paper', key: '1' },
  { id: 'plastic', label: 'Plastic', key: '2' },
  { id: 'metal', label: 'Metal', key: '3' },
  { id: 'glass', label: 'Glass', key: '4' },
  { id: 'aside', label: 'Set aside', key: '5' },
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
    name: 'Empty glass bottle',
    bin: 'glass',
    sprite: 'bottle',
    color: '#b8d46a',
    note: 'Glass bottles go in the glass stream.',
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
    name: 'Rinsed glass jar',
    bin: 'glass',
    sprite: 'jar',
    color: '#b8d46a',
    note: 'Empty glass jars belong with glass bottles.',
  },
  {
    name: 'Dry paper envelope',
    bin: 'paper',
    sprite: 'paper',
    color: '#e8c55d',
    note: 'Clean paper envelopes belong in the paper stream.',
  },
  {
    name: 'Empty plastic shampoo bottle',
    bin: 'plastic',
    sprite: 'bottle',
    color: '#d5b6d1',
    note: 'This empty, rinsed rigid bottle goes with plastic.',
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
  const earned = run.tried ? 50 : 100 + Math.min(4, streak - 1) * 25;
  return {
    ...run,
    sorted: true,
    chosen: bin,
    score: run.score + earned,
    streak,
    bestStreak: Math.max(run.bestStreak, streak),
    firstTry: run.firstTry + (run.tried ? 0 : 1),
    notice: `+${earned} · ${item.note}`,
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
