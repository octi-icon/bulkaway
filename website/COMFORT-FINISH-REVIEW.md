# Site review after cursor accessibility options

September 7, 2026. This review combines the existing complete-journey/component inventory in `JOURNEY-ACCEPTANCE-REVIEW.md`, a fresh source scan, primary-source research, current browser checks and a rebuilt production preview. It does not claim every state in every browser was retested.

## Finding and implementation

**Verified:** Pause motion was lost on reload. In the starting build the ticker changed from `animation-play-state: paused` before reload to `running` afterward, despite remaining in the same tab.

Motion pause/resume now persists in `sessionStorage` under `bulk-away-motion-v1`, independently of cursor and sparkle choices. Server-rendered HTML starts with `data-motion="paused"`; the page restores the preference before allowing animation. Controls are disabled until preferences have loaded. Storage failures leave the current-page control usable and explain the limitation in its title. The privacy notice and cookie settings now describe motion preferences alongside cursor preferences. No cursor artwork or new effects were added.

Added an HTTP regression assertion for the initially paused server-rendered document. Browser acceptance confirmed both Pause → reload → still paused and Play → reload → running. Device reduced-motion CSS remains authoritative.

## Research and decisions

- [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) supports an independently usable pause mechanism. Remembering it across reloads is this project's usability improvement; that persistence requirement is not asserted as a direct WCAG rule.
- [W3C disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) supports familiar keyboard activation. Native disclosures continue to open inline; no new modal or custom accordion was introduced.
- [Google motion accessibility guidance](https://web.dev/learn/accessibility/motion) supports retaining explicit controls and respecting reduced-motion preferences. Existing play is supplementary to functional text and buttons.
- [Google animation performance guidance](https://web.dev/articles/animations-guide) supports restrained animation work. The current bounded sparkles, static vectors, lazy crew artwork and precompressed assets warrant preservation, not another animation dependency.

## Coverage and observed results

| Area | Review result |
| --- | --- |
| Homepage header and hero | Mobile menu opened and closed with Escape; desktop/tablet layout inspected. Original vector logo and make-space interaction retained. Pause/resume reload persistence verified on the new build. |
| Service finder and tabs | Shared waste areas → chute room returned the correct recommendation. See service details changed the panel. Reset cleared the recommendation. Home and ArrowDown navigated the service tabs correctly. |
| Counties and item builder | Weber and Utah selection returned matching coverage feedback. Connected geographic shapes retained. Shared item quantities and receipt restart logic remain covered by the prior journey tests and current 26-test suite. |
| Process and checklist | All three optional tips could be checked, completion appeared, and reset worked. No additional illustration gap found. |
| About and brand family | Woman-and-man artwork loaded at 960 px; tablet proportions visually inspected. AEPOC remains a vector logo and business strategy/design match. Selecting and deselecting the match worked. |
| Form, selects and disclosures | With motion paused, chose a service using the keyboard, typed notes, opened items, photos and photo tips, advanced to the next step, opened the calendar and closed it with Escape. Focus returned to `pickup-date`. No live submission was sent. |
| FAQ | Multiple answers opened together at narrow width, preserving comparison. Six answers remain present in source. |
| Privacy and SMS | Both routes visited at 320 px. Headings and links remained readable without horizontal page overflow. SMS internal anchors resolved. Cursor/motion choice survived policy navigation. Future Twilio/portal language retained. |
| Cookie preferences | Dialog opened from the footer and fit within the narrow viewport with internal scrolling. Escape closed it and returned focus to Cookie settings. |
| 404 | Branded recovery content inspected and Back to Bulk Away returned to the homepage. |
| Shared controls and supporting code | Reviewed motion/cursor state, click and submission sparkles, request dock, safe draft links, photo cleanup/limits, metadata, robots, sitemap, and used button/select/popover integration against the previous component inventory. |

The homepage had no horizontal overflow at 320, 768 or 1440 px in the inspected states. All eight displayed image elements were loaded without errors; Bulk Away and AEPOC use vector assets rather than enlarged low-resolution raster logos. The current browser error-log check returned no errors.

The bundled static detector scanned the app and shipped top-level components. It reported two visual-style warnings in `privacy-controls.css`: the SMS status callout's left border and the cookie dialog's top accent. These are visible, intentional existing treatments; neither demonstrated a functional, contrast or layout failure in the inspected views. They were retained rather than redesigning the supplied brand in response to generic style heuristics. Raw results are in `ACCESSIBILITY-FINISH-DETECTOR.json`.

## Validation and performance

Lint, TypeScript, all 26 behavior tests and the precompressed build passed. HTTP verification passed for initial paused markup, routes, fonts/logos, health, gzip/Brotli negotiation, immutable caching, exact decoded asset integrity, origin checks, validation and invalid multipart/image rejection before email delivery.

Fresh transferred payloads: CSS **21,405 bytes gzip**; homepage declared JavaScript **259,938 bytes gzip**; privacy/SMS declared JavaScript **153,270 bytes gzip**. The small increase includes the previous cursor options and this motion persistence work; no runtime dependency was added. Full measurements are in `ACCESSIBILITY-FINISH-DELIVERY.json`. These are local HTTP payloads, not field Core Web Vitals, frame-rate results or a Lighthouse score.

## Completion boundary

No further concrete interface defect was established in this pass. The brand's typography, vector identity, palette and task-related interactions form a coherent experience; adding more decoration is not justified by this review. This is expert review, not a customer usability study or accessibility certification. Screen-reader operation, OS forced-color preference changes, production email delivery on Render, domain/indexing activation and future Twilio/Helm/portal integration remain outside the current local acceptance evidence.
