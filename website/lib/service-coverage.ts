import { countyCoverage, SERVICE_AREA_MESSAGE } from './service-area.ts';

const UNAVAILABLE =
  'Address checking is temporarily unavailable. Please try again shortly or contact the crew directly.';
const INCOMPLETE =
  'We couldn’t verify that pickup address. Include the street number, street, city, state and ZIP, or contact the crew for help.';

export class CoverageError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'CoverageError';
    this.status = status;
  }
}

type GeocodeResult = {
  partial_match?: boolean;
  types?: string[];
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
};

// Server-only verification uses the submitted address, including manual edits.
// Do not pass browser-supplied county claims or reuse a website-restricted key.
export async function verifyServiceAddress(
  address: string,
  key: string | undefined,
  lookup: typeof fetch = fetch,
): Promise<void> {
  if (!key?.trim()) throw new CoverageError(UNAVAILABLE, 503);
  try {
    const params = new URLSearchParams({
      address,
      key,
      language: 'en',
      region: 'us',
    });
    const response = await lookup(
      `https://maps.googleapis.com/maps/api/geocode/json?${params}`,
      {
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
        redirect: 'error',
      },
    );
    if (!response.ok) throw new CoverageError(UNAVAILABLE, 503);
    const data = (await response.json()) as {
      status?: string;
      results?: GeocodeResult[];
    };
    if (data.status === 'ZERO_RESULTS')
      throw new CoverageError(INCOMPLETE, 400);
    if (data.status !== 'OK' || !Array.isArray(data.results))
      throw new CoverageError(UNAVAILABLE, 503);
    const match = data.results[0];
    if (
      data.results.length !== 1 ||
      !match ||
      match.partial_match ||
      !match.types?.some((type) =>
        ['street_address', 'premise', 'subpremise'].includes(type),
      )
    )
      throw new CoverageError(INCOMPLETE, 400);
    const component = (type: string) =>
      match.address_components?.find((item) => item.types.includes(type));
    const coverage = countyCoverage(
      component('country')?.short_name,
      component('administrative_area_level_1')?.short_name,
      component('administrative_area_level_2')?.long_name,
    );
    if (coverage === 'outside')
      throw new CoverageError(SERVICE_AREA_MESSAGE, 400);
    if (coverage !== 'covered') throw new CoverageError(INCOMPLETE, 400);
    if (
      !['street_number', 'route', 'postal_code'].every((type) =>
        component(type)?.long_name?.trim(),
      )
    )
      throw new CoverageError(INCOMPLETE, 400);
  } catch (error) {
    if (error instanceof CoverageError) throw error;
    // Never expose request URLs, credentials, submitted addresses or provider errors.
    throw new CoverageError(UNAVAILABLE, 503);
  }
}
