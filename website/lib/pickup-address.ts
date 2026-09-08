export function formatPickupAddress(address: string, unit = '') {
  return [address.trim(), unit.trim()].filter(Boolean).join(' · ');
}
