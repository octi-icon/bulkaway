import { countyCoverage, SERVICE_AREA_MESSAGE } from './service-area.ts';

export class AddressCoverageError extends Error {}

// Small interface boundary around the browser-only Google Places library.
export type AddressPrediction = {
  placeId: string;
  types?: string[];
  text: { toString(): string };
  toPlace(): {
    formattedAddress?: string;
    addressComponents?: {
      longText: string;
      shortText: string;
      types: string[];
    }[];
    fetchFields(options: { fields: string[] }): Promise<unknown>;
  };
};
export type PlacesLibrary = {
  AutocompleteSessionToken: new () => object;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions(request: {
      input: string;
      sessionToken: object;
      includedRegionCodes: string[];
      includedPrimaryTypes: string[];
      locationRestriction: {
        north: number;
        south: number;
        east: number;
        west: number;
      };
      language: string;
      region: string;
    }): Promise<{ suggestions: { placePrediction?: AddressPrediction }[] }>;
  };
};
type MapsWindow = Window & {
  google?: { maps: { importLibrary(name: string): Promise<PlacesLibrary> } };
  bulkAwayMapsReady?: () => void;
};
let library: Promise<PlacesLibrary> | undefined;

export function loadAddressLibrary(key: string): Promise<PlacesLibrary> {
  if (library) return library;
  const browser = window as MapsWindow;
  library = new Promise<void>((resolve, reject) => {
    if (browser.google?.maps?.importLibrary) return resolve();
    const script = document.createElement('script');
    const fail = () => {
      window.clearTimeout(timer);
      script.remove();
      browser.bulkAwayMapsReady = () => {};
      reject(new Error('Maps unavailable'));
    };
    const timer = window.setTimeout(fail, 12000);
    browser.bulkAwayMapsReady = () => {
      window.clearTimeout(timer);
      resolve();
    };
    script.onerror = fail;
    const params = new URLSearchParams({
      key,
      loading: 'async',
      callback: 'bulkAwayMapsReady',
      v: 'quarterly',
      language: 'en',
      region: 'US',
      auth_referrer_policy: 'origin',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    document.head.appendChild(script);
  })
    .then(() => browser.google!.maps.importLibrary('places'))
    .catch((error) => {
      library = undefined;
      throw error;
    });
  return library;
}

export function createAddressSession(places: PlacesLibrary) {
  let token = new places.AutocompleteSessionToken();
  return {
    async search(input: string) {
      const { suggestions } =
        await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: token,
          includedRegionCodes: ['us'],
          includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
          // This envelope also contains neighboring counties; check the selected county below.
          locationRestriction: {
            north: 41.6,
            south: 39.5,
            west: -112.6,
            east: -110.9,
          },
          language: 'en-US',
          region: 'us',
        });
      return suggestions.flatMap(({ placePrediction }) =>
        placePrediction?.types?.some((type) =>
          ['street_address', 'premise', 'subpremise'].includes(type),
        )
          ? [placePrediction]
          : [],
      );
    },
    async select(prediction: AddressPrediction) {
      const place = prediction.toPlace();
      // End the billing session and request the components needed for coverage.
      token = new places.AutocompleteSessionToken();
      await place.fetchFields({
        fields: ['formattedAddress', 'addressComponents'],
      });
      if (!place.formattedAddress) throw new Error('Address unavailable');
      const component = (type: string) =>
        place.addressComponents?.find((item) => item.types.includes(type));
      const coverage = countyCoverage(
        component('country')?.shortText,
        component('administrative_area_level_1')?.shortText,
        component('administrative_area_level_2')?.longText,
      );
      if (coverage === 'outside')
        throw new AddressCoverageError(SERVICE_AREA_MESSAGE);
      if (coverage === 'unknown')
        throw new AddressCoverageError(
          'We couldn’t identify that county. Enter the full street address, city, state and ZIP, or contact the crew for help.',
        );
      if (
        !['street_number', 'route', 'postal_code'].every((type) =>
          component(type)?.longText?.trim(),
        )
      )
        throw new AddressCoverageError(
          'Choose a full street address with a street number and ZIP code. A state, city or street name alone isn’t enough.',
        );
      return place.formattedAddress;
    },
  };
}
