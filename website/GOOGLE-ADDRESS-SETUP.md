# Google address selector — September 8, 2026

## Configuration

Set `GOOGLE_MAPS_BROWSER_KEY` on the Render Web Service, then restart/redeploy. Enable Maps JavaScript API and Places API (New). Use website and API restrictions for this browser-visible key; it is unrelated to the private SMTP password. The Render blueprint and `.env.example` document the variable. No real key was requested, read, added or tested locally.

## Delivered behavior

The existing address input becomes an editable autocomplete when configured. It queries after three characters with a 300 ms debounce, restricts to US predictions and biases toward the Wasatch Front. The suggestions open inline below the field, retain Google Maps attribution, and support arrow keys, Enter, Escape and pointer selection. Only the selected formatted address is requested from Place Details. Session tokens group searches and are renewed after selection.

The key is read at server runtime. Google's library loads only on the first qualifying address search, not on page load or merely visiting step two. With no key, the same form uses manual entry. The manual option, no-results message, timeout and outage states keep the request usable. Search results and selections have separate cancellation controls: old queries cannot replace new input, while an accepted selection survives moving into the unit field. Forward submission waits for that selection, and completion does not steal focus. Failed library downloads can be retried.

Optional apartment/unit/building information is validated separately (maximum 100 characters) and carried through step validation, review, receipt, idempotency payload and crew email. It is not sent to Google by the integration. Address search does not validate service coverage or postal deliverability.

The privacy page now includes address-search terms and Google privacy links at `/privacy#address-search`. Its revised date is September 8, 2026. The input links there before searches. This is implementation disclosure, not legal certification.

## Verification

- Production build, lint and TypeScript passed.
- 30 behavior tests passed, including session reuse/renewal, minimal Place Details fields, lookup failures, retry after failed script download, unit validation and email formatting, and frozen receipt address/unit data.
- HTTP verification passed for routes, 404, indexing directives, compressed assets, fonts/logos/artwork, validation and invalid photo rejection. No emails sent.
- In a separate loopback-only fixture preview, mobile 390 × 844: tested keyboard selection, pointer selection, last-option keyboard scrolling, no results, simulated outage, switching to manual during a delayed search, and full address/unit transfer into review. A two-second Place Details delay verified the Next button waits while Unit remains editable; focus stayed in Unit and the completed address reached review. No horizontal overflow was observed in these states.
- The code review identified selection-on-blur cancellation and a permanently cached loading error. Both were fixed and re-reviewed; the delayed-selection browser case and loader retry test cover them.

The fixture lives only in `scripts/preview-form-states.mjs` behind `QA_ADDRESS=true`; it is not the production server and never forwards submissions. Dummy configuration and all fixture results are local simulations, not evidence of Google credentials, billing or live suggestion accuracy. The fixtures are stopped after testing. Live verification on the actual Render hostname remains necessary once the owner supplies the restricted key.

## Primary references

- [Google Place Autocomplete Data API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-data): predictions, selection details and session lifecycle.
- [Google script loading](https://developers.google.com/maps/documentation/javascript/load-maps-js-api): asynchronous loading and callback initialization.
- [Google Maps security guidance](https://developers.google.com/maps/api-security-best-practices): browser API-key restrictions.
- [Places policies and attribution](https://developers.google.com/maps/documentation/places/web-service/policies): attribution and public terms/privacy requirements.
- [WAI combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/): editable combobox interaction model.
