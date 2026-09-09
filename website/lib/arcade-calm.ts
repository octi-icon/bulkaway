export const cleanupPlaces = [
  'The Courtyard',
  'The Loading Dock',
  'The Moonlight Lot',
];
const names = [
  'Sofa',
  'Mattress',
  'Boxes',
  'Refrigerator',
  'Tire',
  'Television',
];
export const cleanupItems = (stage: number) =>
  Array.from({ length: 4 }, (_, i) => ({
    id: stage * 4 + i,
    kind: (stage * 4 + i) % 6,
    name: names[(stage * 4 + i) % 6],
  }));
export type Cleanup = {
  stage: number;
  picked: number[];
  cargo: number;
  delivered: number;
  score: number;
  cleared: boolean;
  finished: boolean;
  selected: number;
  notice: string;
};
export function createCleanup(): Cleanup {
  return {
    stage: 0,
    picked: [],
    cargo: 0,
    delivered: 0,
    score: 0,
    cleared: false,
    finished: false,
    selected: -1,
    notice: 'Choose an item to beam it aboard. Your UFO holds 3.',
  };
}
export type CleanupAction =
  | { type: 'collect'; id: number }
  | { type: 'unload' }
  | { type: 'next' };
export function stepCleanup(s: Cleanup, action: CleanupAction): Cleanup {
  if (s.finished) return s;
  if (action.type === 'next') {
    if (!s.cleared) return s;
    return {
      ...s,
      stage: s.stage + 1,
      picked: [],
      cleared: false,
      selected: -1,
      notice: 'New stop. Same mission. Choose your first item.',
    };
  }
  if (action.type === 'unload') {
    if (!s.cargo) return s;
    const cleared = s.picked.length === 4;
    return {
      ...s,
      cargo: 0,
      delivered: s.delivered + s.cargo,
      score: s.score + s.cargo * 100,
      cleared,
      finished: cleared && s.stage === 2,
      selected: -1,
      notice: cleared
        ? 'Space reclaimed! Ready for the next stop.'
        : 'Load delivered! There’s room for more aboard.',
    };
  }
  const item = cleanupItems(s.stage).find((item) => item.id === action.id);
  if (!item || s.picked.includes(action.id) || s.cargo >= 3 || s.cleared)
    return s;
  const cargo = s.cargo + 1,
    picked = [...s.picked, action.id];
  return {
    ...s,
    cargo,
    picked,
    selected: action.id,
    notice:
      cargo === 3
        ? 'Full hold! Unload into the truck below.'
        : picked.length === 4
          ? 'Last item aboard. Unload to finish this stop.'
          : `${item.name} aboard! Choose another item or unload.`,
  };
}
