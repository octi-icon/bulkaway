# Post-address acceptance review

September 8, 2026. This is a fresh acceptance pass on the production preview after Google address autocomplete, using the full component inventory in `JOURNEY-ACCEPTANCE-REVIEW.md` as the broader baseline. It does not claim every combination in every browser was retested.

## Assessment and implementation decision

The atomic-era typography, vector truck sign, make-space preview, connected county map, crew and process illustrations, service matching, and shared quantity list form a coherent experience. The playful interactions support understanding the service and preparing a request. No new image, animation library, or component redesign is justified by this pass. This is an expert inspection judgment, not a customer study or evidence of market-wide uniqueness.

No new reproducible defect was found. Production code is unchanged in this pass; this record captures the current checks and remaining launch dependencies. The browser was returned from the address simulation to the normal production preview.

## Fresh browser checks

- Desktop 1440 × 1000: inspected hero proportions and completed all three preview removals. Completion exposed the slogan, Undo/Reset controls, and the real-request link.
- Mobile 390 × 844: opened the item disclosure below its heading, selected Furniture, changed quantity to two, and verified a missing service focuses the service selector. Its six options opened below the trigger. Correcting the service advanced the form.
- Entered a manual address and separate building/unit. Opened the calendar, checked its visible layout and accessible day labels, dismissed with Escape, and advanced with a flexible date. Review retained the full address and unit. No request was submitted.
- At 320 × 800: inspected privacy, SMS, and branded 404 layouts; each had one H1 and no horizontal overflow. Legal-page in-page links had valid targets. Cookie settings remained usable in a scrolling dialog, and necessary-only dismissal returned focus to Cookie settings.
- At 320 pixels: opened mobile navigation and followed its service link.
- Tablet 768 × 1024: inspected service, process, story/crew, and family sections. End-key navigation selected the final service tab and exposed the matching panel. Business strategy & design selected AEPOC and its matching link. No horizontal overflow or failed completed image was observed.
- The preceding address-specific keyboard, delayed selection, manual fallback, and simulated outage checks remain recorded in `GOOGLE-ADDRESS-SETUP.md`; live Google credentials were not tested here.

## Code, delivery, and SEO checks

Fresh lint, TypeScript, and all 30 behavior tests passed. The complete HTTP verification passed: public pages, 404 status and recovery, health, fonts, logos and illustrations, compressed delivery, immutable caching, decoded asset integrity, indexing directives, launch-aware sitemap, and rejection of invalid/cross-origin/oversized requests before email delivery.

Current gzip payloads measured over local production HTTP:

| Route | HTML bytes | Declared JavaScript bytes |
| --- | ---: | ---: |
| Home | 58,624 | 262,414 |
| Privacy | 8,492 | 153,259 |
| SMS | 6,841 | 153,259 |
| Missing page | 4,398 | 152,763 |

Shared CSS: 21,611 gzip bytes. These measure delivery size, not interaction latency, Lighthouse scores, or field Core Web Vitals. Address search loads Google's library only after a qualifying search, and the normal local preview has no Google key. Click bursts remain bounded to three with timer cleanup and motion/preference gates. Titles, descriptions, social metadata, canonical URLs, and the existing launch-controlled indexing configuration remain in place.

## Research and decisions

- [WAI form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) supports persistent labels and guidance. The full-address instruction stays visible after typing, with errors associated separately.
- [WAI combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) supports editable suggestions with manual selection and keyboard dismissal. Retain manual input and avoid treating a suggestion as a confirmed service booking.
- [Optimizing INP](https://web.dev/articles/optimize-inp) and [efficient CSS animation](https://web.dev/articles/animations-guide) support limiting unnecessary interaction/render work. No additional runtime effect is warranted by the observed experience.
- [Google page experience guidance](https://developers.google.com/search/docs/appearance/page-experience) considers overall usability, mobile presentation, and performance rather than a single decorative feature or score. Retain clear service copy and measure real deployed performance after launch.

## Remaining launch dependencies

Configure and verify the restricted Google browser key on the actual Render hostname; verify real mailbox delivery and photo attachments after SMTP configuration; verify production domain/HTTPS and activate indexing when launching. Twilio messaging and the client portal remain future integrations, accurately described as unavailable today. No live email or SMS was sent in this review. This acceptance pass is not a WCAG certification or legal opinion.
