export const SERVICE_AREA_MESSAGE =
  'We serve Salt Lake, Utah, Davis and Weber counties in Utah. Please enter a pickup address in one of these counties.';

export function countyCoverage(
  country?: string,
  state?: string,
  county?: string,
) {
  if (!country || !state || !county) return 'unknown';
  const name = county
    .trim()
    .replace(/\s+county$/i, '')
    .toLowerCase();
  return country.toUpperCase() === 'US' &&
    state.toUpperCase() === 'UT' &&
    ['salt lake', 'utah', 'davis', 'weber'].includes(name)
    ? 'covered'
    : 'outside';
}
