export function formatPickupAddress(address: string, unit = '') {
  return [address.trim(), unit.trim()].filter(Boolean).join(' · ');
}

// A format check for the form step, not a substitute for server county verification.
export function pickupAddressError(address: string) {
  const message =
    'Enter a full Utah pickup address: street number, street, city, UT and ZIP code.';
  if (address.length > 300 || /[\r\n]/.test(address)) return message;
  const match = address
    .trim()
    .match(
      /^(\d+[a-z]?(?:[-/]\d+[a-z]?)?\s+.+?)\s*,?\s+\b(?:UT|Utah)\s+(\d{5}(?:-\d{4})?)(?:\s*,?\s+(?:USA|US|United States))?$/i,
    );
  if (!match || match[1].split(/[\s,]+/).filter(Boolean).length < 3)
    return message;
  return undefined;
}
