# Service content availability review

Date: September 7, 2026. Scope: primary-source research and inspection of `ServiceExplorer` in `components/interactive.tsx`; no application changes or browser testing by this research agent.

## Finding and recommendation

The inspected component renders only `services[active]`, initially index zero. All five tab buttons point to the same `service-panel` element, whose label and content change with selection. The other services' detailed headings, descriptions, and item lists are absent from this component's initial markup. This is a content-availability risk; it does not establish that Google has failed to index the page or every service mention elsewhere on it.

Render all five service panels in the server response, with only the active panel displayed. Give each panel its own stable ID and a matching tab relationship. Retain the current single-page structure and existing copy; this finding does not justify creating separate service pages or adding keywords.

## Search evidence and limits

- Google states that Search does not interact with pages to load content. Therefore, details introduced only after a tab click are not a reliable way to make those details available to its renderer. Google recommends checking rendered HTML with Search Console's URL Inspection tool. [Google: Fix lazy-loaded content](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading).
- Google processes both initial and rendered HTML, recommends server rendering or prerendering, and notes that some bots cannot execute JavaScript. **Inference for this site:** including every service's real HTML before interaction removes one avoidable content-delivery dependency. A service array embedded in a script bundle is not the same evidence as its text appearing in the document. Verify the production HTTP response and hydrated DOM. [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- Google expressly permits tabs and accordions that hide/show content for visitors. Keeping inactive panels hidden is compatible with that policy when visitors can reveal the same content normally. This does not establish a ranking benefit, equal weighting of all panels, or a guarantee of indexing. [Google: Hidden text and link abuse](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-link-abuse).

## Tab behavior to preserve

W3C's pattern describes one displayed panel and hidden inactive panels. Each tab uses `aria-controls` for its corresponding panel; each panel uses `aria-labelledby` for its own tab. Preserve `aria-selected`, the named tablist, and one tab in the page's tab sequence. For this existing vertical list, retain Up/Down wrapping and Home/End behavior; keyboard orientation should match the actual layout. A panel beginning with nonfocusable content should remain keyboard focusable. [W3C APG: Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

Automatic activation is appropriate when content appears instantly; W3C's example specifically recommends having the panel content already in the DOM. The example also cautions that production implementations require assistive-technology testing. [W3C APG: Automatic tabs example](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-automatic/).

Implementation implications, inferred from the existing code: update the service finder's focus target to the selected panel's new ID, and keep each request CTA bound to its own service. Ensure CSS does not override the inactive panels' `hidden` state. Hidden panels must not leave their links in the keyboard sequence. Retaining mounted panels can change animation replay behavior, so inspect the current entrance animation after switching tabs.

## Is a no-JavaScript fallback worthwhile?

Yes, as a separate usability improvement. Hidden server-rendered panels still cannot be opened when the tab controls have no working script. A small plain-language service summary generated from the same service data, with a usable contact route, would make the alternatives readable when scripting is disabled. Do not imply that the JavaScript-dependent request flow works without it, and avoid exposing dead tab controls alongside a fallback.

The stronger approach is progressive enhancement: start with readable service sections and introduce the tab interface after it initializes. That also covers a failed script download or hydration failure. A `noscript` fallback only handles scripting being disabled; it does not detect such failures. WHATWG explicitly describes this limitation and favors enhancing a working scriptless page. For the bounded hidden-panel fix, a `noscript` summary is optional and should not be presented as an SEO requirement. [HTML Standard: The noscript element](https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element).

## Verification for the implementing agent

Check that the production response contains all five distinct panel headings/descriptions and unique IDs. In the browser, verify exactly one panel is visible, each association resolves, keyboard navigation reaches the expected tab/panel, the finder focuses its selected panel, and each CTA selects the correct request service. Inspect desktop/mobile layout and animation changes. If a fallback is added, check it with JavaScript disabled and distinguish that result from blocked-script behavior. Public Search Console inspection remains a post-deployment check; local source review cannot certify Google indexing.

## Implemented and verified by the main task

`ServiceExplorer` now renders every panel with stable `service-panel-0` through `service-panel-4` IDs, corresponding tab relationships, and `hidden` on inactive panels. The finder focuses the newly selected panel's ID. Each request link still dispatches its own service. The original headings, descriptions, icons, request labels and animation styles remain. A scoped `noscript` style shows the five descriptions and removes the inactive tab/finder controls when scripting is disabled. This fallback was source-reviewed; disabled-JavaScript browser operation was not exercised and it does not cover hydration/download failure.

The new initial-HTML regression check failed before the fix: one rendered panel rather than five. After the change, all five headings and request links were present, with distinct IDs/labels and four initially hidden panels. The full HTTP suite, all 26 behavior tests, lint, TypeScript and production build passed.

Browser acceptance at 1440 × 1000 and 375 × 812 confirmed exactly one displayed panel, no duplicate IDs or horizontal overflow, ArrowDown/Home/End and wrapping ArrowUp selection, and Tab moving from the selected tab to its panel. The service finder focused `service-panel-3` for chute rooms. The donation panel's request link populated Donations & recyclables in the form. Existing animation rules remain unchanged; no frame-rate claim is made.

## Copy, page and delivery review

Fresh delivered-HTML checks for `/`, `/privacy` and `/sms` found distinct descriptive titles, descriptions, matching canonical URLs and exactly one H1 on each. All currently emit `noindex, nofollow`, intentionally controlled by the pre-launch setting. The current branded 404, fonts, vector logos, illustrations and social image passed the HTTP checks. Homepage copy, FAQ, family relationships and policy copy were reviewed against the established service/ownership facts; no new factual or marketing claims were introduced. Prior component and interaction coverage is recorded in `JOURNEY-ACCEPTANCE-REVIEW.md` and `EXPERIENCE-CLOSING-REVIEW.md` rather than represented as entirely new testing here.

[Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link) and [JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) informed the checks. The original slogan and concise, service-specific copy were retained; adding keyword-heavy headings or extra location pages was not justified by this finding.

Fresh local delivery measurements: homepage response 58,508 bytes gzip; homepage declared JavaScript 260,088 bytes gzip; shared CSS 21,405 bytes gzip. No dependency was added. These are transferred payloads, not Core Web Vitals, rankings or conversion measurements. Production domain/indexing activation and email delivery still require launch verification; no real pickup request, email or SMS was sent in this pass.
