export const haulItems = [
  { id: 'furniture', label: 'Furniture', special: false },
  { id: 'mattresses', label: 'Mattresses', special: true },
  { id: 'refrigerators', label: 'Refrigerators', special: true },
  { id: 'electronics', label: 'Electronics', special: true },
  { id: 'tires', label: 'Tires', special: true },
  { id: 'boxes', label: 'Boxes & miscellaneous items', special: false },
] as const;

export type HaulItem = { id: string; quantity: number };
export type HaulDraftItem = { id: string; quantity: number | '' };
export function validateHaulItems(raw: unknown): {
  items: HaulItem[];
  error: string;
} {
  if (raw === undefined) return { items: [], error: '' };
  const invalid = {
    items: [],
    error:
      'Choose known items and enter a whole-number quantity from 1 to 999 for each.',
  };
  if (!Array.isArray(raw) || raw.length > haulItems.length) return invalid;
  const seen = new Set<string>();
  const items: HaulItem[] = [];
  for (const item of raw) {
    if (
      !item ||
      typeof item !== 'object' ||
      !haulItems.some((known) => known.id === item.id) ||
      seen.has(item.id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 999
    )
      return invalid;
    seen.add(item.id);
    items.push({ id: item.id, quantity: item.quantity });
  }
  return { items, error: '' };
}
export function formatHaulItems(items: HaulItem[]) {
  return items
    .map(
      (item) =>
        `${item.quantity} × ${haulItems.find((known) => known.id === item.id)?.label || item.id}`,
    )
    .join('\n');
}
