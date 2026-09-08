# Bulk Away performance and finish review

September 7, 2026. Fresh primary-source research and independent source/build inspection after `REPEAT-REVIEW-RESEARCH.md`. This research agent did not operate the browser, modify production files, send requests to external services, or run a new build. The main agent is responsible for implementation and rendered verification, recorded separately below when complete.

## Judgment

Bulk Away already has sufficient illustration and interactive variety for its current service-request scope. The strongest remaining refinement is to deliver the existing experience with less unused styling and fewer unrelated dependencies. Adding another animation library, decorative image, game, or loading screen would not solve a demonstrated gap. This is an expert judgment about the supplied site, not measured conversion or customer-satisfaction evidence.

## Concrete findings

### 0. Static build compression was available but not enabled

The main agent's fresh HTTP baseline found that HTML used gzip, but the 245,456-byte hashed stylesheet was served as identity even with `Accept-Encoding: gzip`. Follow-up inspection of the installed framework explains the difference: the production server's static-cache fast path negotiates among existing compressed sidecars, and the build script did not request their generation.

The installed Vinext CLI supports **`vinext build --precompress`**. `cli-args.js` parses the flag; `cli.js` sets `VINEXT_PRECOMPRESS=1`; `build/precompress.js` creates beneficial Brotli/gzip/zstd variants for fingerprinted build assets. Its production server negotiates those variants and retains immutable caching. Enable this supported build option, rebuild, then verify real response encoding, `Vary`, decoded content integrity, and actual transferred bytes. This is preferable to inventing a separate compression server. Local installed source is the version-specific evidence; upstream implementation confirms the design. [Vinext production server](https://github.com/cloudflare/vinext/blob/main/packages/vinext/src/server/prod-server.ts), [Vinext build integration](https://github.com/cloudflare/vinext/blob/main/packages/vinext/src/index.ts).

### 1. Automatic Tailwind scanning includes unused scaffold components

The starting build's shared stylesheet is **245,456 bytes uncompressed**. `app/globals.css` imports Tailwind with automatic source discovery. The repository retains many unused scaffold components under `components/ui`, including charts, sidebars, messaging, tables, and other unrelated interfaces. JavaScript tree shaking does not prevent Tailwind from scanning those source files as text.

Use explicit source discovery for the application, top-level production components, and the three actually imported local UI modules. Dependency inspection found:

- `interactive.tsx` and `pickup-form.tsx` import `ui/button.tsx`.
- `pickup-selectors.tsx` imports `ui/select.tsx` and `ui/popover.tsx`.
- Those three UI files import no additional local UI modules.
- The date picker is imported directly from `react-day-picker`, has no custom utility `classNames`, and receives its normal `.rdp-*` styling through `@import 'react-day-picker/style.css'` in `app/pickup-selectors.css`. It does not depend on the unused scaffold `ui/calendar.tsx`.

The official supported syntax is `@import "tailwindcss" source(none);`, followed by stylesheet-relative `@source` registrations. Preserve `tw-animate-css` and `shadcn/tailwind.css` imports and scan the full strings in the used popover/select modules, including state variants, because their popup animations and focus styles depend on generated utilities. Measure the resulting raw and compressed CSS and inspect opened controls after the change. Do not delete the unused scaffold merely to influence scanning. [Tailwind source detection and explicit sources](https://tailwindcss.com/docs/detecting-classes-in-source-files).

### 2. A global effect shares a module with homepage image components

`app/layout.tsx` imports `ClickSparkles` from `atomic-experience.tsx`. That module also imports `next/image` for the hero and crew artwork. The starting client manifest gives `atomic-experience` a static image-shim dependency; the image chunk is **32,831 bytes uncompressed**. This is a concrete import-graph coupling, but the exact transfer saving must be confirmed through route network evidence: a manifest alone does not establish when a browser actually fetches a chunk.

If the main agent confirms image code is loaded on text-only legal routes, separating the global click effect from homepage image components is a focused optimization. Preserve its bounded particles, event behavior, reduced-motion checks, cleanup, and pause control. Avoid splitting the whole request form behind an unmeasured loading delay. Google recommends code splitting according to when code is needed; applying that here is an implementation inference. [Code splitting](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting).

### 3. Form dependency weight warrants measurement, not a rushed replacement

The starting pickup-form chunk is **220,364 bytes uncompressed**. It contains the actual form plus the accessible service selector/calendar dependencies. The default framework chunks are also material: framework **190,109**, vinext **146,677**, and browser entry **113,941 bytes**. These disk sizes are neither compressed transfer totals nor an interaction-latency score.

Do not replace the tested calendar or Base UI controls solely to reduce a file-size number. A late-loaded calendar needs a readable loading state and preserved keyboard focus; it can shift delay from initial navigation to opening the control. Measure first. Interaction to Next Paint includes input delay, event processing, and presentation delay, so transfer-size reduction alone cannot establish a good INP score. [Optimize INP](https://web.dev/articles/optimize-inp).

## Keep the existing strengths

| Area | Fresh source evidence and decision |
| --- | --- |
| Images | Hero is a supplied vector with explicit dimensions and high fetch priority. Below-fold process, crew, and brand artwork is lazy loaded with reserved dimensions. Keep these choices. Loading the hero lazily would be counterproductive; lazy loading is for images not needed immediately. [Browser image loading](https://web.dev/articles/browser-level-image-lazy-loading). |
| Fonts | Five local WOFF2 files range from 24,704 to 33,800 bytes. All use `font-display: swap`; Brookvale and Taldose are preloaded. Preserve the actual brand fonts. Investigate body-font discovery only if browser timing reveals delay; indiscriminately preloading every weight can compete with other important requests. Preload is appropriate for fonts known to be needed immediately. [Web font loading](https://web.dev/articles/optimize-webfont-loading). |
| Sparkles | The click handler retains at most three bursts, four SVG particles per click, and bounded cleanup timers. It exits for hidden documents, paused/reduced motion, and form-entry targets. No continuous pointer-move render loop. Keep the effect unless measured rendering evidence identifies a problem. |
| Other motion | Most decorative transitions use transforms/opacity. Do not add blanket `will-change`, continuous animated shadows/filters, or perpetual JavaScript animation loops. Google recommends transform/opacity and measuring expensive paint/layout effects. [CSS animation performance](https://web.dev/articles/animations-guide). |
| Scroll-dependent features | Crew entry and request-dock visibility use IntersectionObserver instead of a high-frequency scroll handler. Observers are disconnected on cleanup. Keep. |
| Photos | Preview object URLs are revoked on cleanup; files are limited in count/size; preview rendering does not upload until submission. Keep the optional photo flow and real filename feedback. No new third-party image service is required. |
| Delivery | Preserve existing immutable caching for fingerprinted assets and shorter caching with validators for nonfingerprinted public files. Enable the missing built-in static precompression described above; no competing middleware layer is needed. Render also provides delivery features, but deployed headers must be verified on the actual service. [Render web services](https://render.com/docs/web-services), [Render edge caching](https://render.com/docs/web-service-caching). |
| Legal/404 pages | Distinct headings, reading navigation, normal text links, clear home/request recovery, and common motion/cookie controls are present. Keep their focused reading experience. A decorative image is not required on every page. |
| Service engagement | Finder, item quantities, checklist, county coverage, and family matcher have useful outcomes. Keep their visible textual feedback rather than adding an animation-only result. |

## Coverage and limits

Fresh source scope: homepage, Privacy, SMS terms, missing-page view, root layout/global experience, route metadata/robots/sitemap inventory, API endpoint inventory, header/navigation, service explorer and finder, hero clearing interaction, atomic background, crew artwork, click/submission sparkles, haul provider/picker, county explorer, prep checklist, family matcher, three-step request form, service/date selectors, photo picker, request dock, cookie dialog, and draft-safe links. Used UI button/select/popover dependency closure was inspected separately from unused scaffold exports. Stylesheets, build manifest, local font files, major chunk sizes, and installed production-server delivery code were inspected.

This is not a new all-browser, assistive-technology, field-performance, legal, or security certification. No actual Render email/attachment delivery, SMS integration, deployment, or public-indexing switch was performed. The existing local no-email harness remains appropriate for receipt/error visual checks. Final delivery claims must distinguish browser measurements, source findings, simulated delivery, and launch checks.

## Implementation and verification

The main agent will append actual changes, measurements, and rendered checks here. Findings above describe the starting build and should not be relabeled as final asset sizes.

### Completed changes and measured delivery

- Enabled the framework's existing `vinext build --precompress` support. The standalone deployment now contains useful gzip/Brotli variants and negotiates them with the browser while retaining immutable caching for hashed assets.
- Changed Tailwind to explicit source detection: all app surfaces, top-level shipped components, lib, and the three imported UI primitives. Kept the animation utility imports and DayPicker stylesheet. Unused scaffold components remain available in source but no longer expand the production CSS.
- Split global `ClickSparkles` into its own client module and shared particle markup into `sparkle-rays.tsx`. Homepage artwork and submission celebration retain their behavior. Before the change, the Privacy page's actual module-preload links included `atomic-experience` and the 32,831-byte image module. Afterward they contain the independent click module and no image module.

`scripts/measure-delivery.mjs` measures actual local production HTTP response-body bytes with `Accept-Encoding: gzip`. Results are saved in `PERFORMANCE-BASELINE.json` and `PERFORMANCE-AFTER.json`. JavaScript totals below include the unique script/module-preload assets declared in server HTML, not a claim about all browser activity or user timings.

| Measurement | Before | After |
| --- | ---: | ---: |
| Shared CSS, uncompressed bytes | 245,456 | 101,628 |
| Shared CSS, transferred response-body bytes | 245,456 (identity) | 21,133 (gzip) |
| Homepage declared JS, transferred bytes | 802,547 | 258,824 |
| Privacy/SMS declared JS, transferred bytes | 520,112 | 152,020 |
| Privacy/SMS declared JS, uncompressed bytes | 520,112 | 482,080 |

CSS transfer is about 91.4% smaller; its uncompressed content is about 58.6% smaller. Homepage JS gains come from compression: decoded JS is essentially unchanged (803,064 bytes after, versus 802,547 before). Legal-page decoded JS falls by 38,032 bytes following the module split. These are payload measurements on the local production server, not Lighthouse, measured LCP/INP/CLS, a mobile-network simulation, or field performance. No all-device frame-rate claim is made.

### Fresh verification

- All 26 logic tests passed, plus lint, TypeScript, and the final production build with precompression. The build generated compressed variants for 18 assets.
- Extended HTTP verification checks real gzip and Brotli negotiation, `Vary: Accept-Encoding`, immutable cache headers, and exact decoded-content equality for the shared stylesheet and framework script. These and the existing route, validation, request-limit, multipart, and invalid-photo checks passed. One repeated test run hit the intentional request rate limit; a clean local preview restart allowed the complete suite to run and pass without changing protection.
- Opened homepage, Privacy, SMS, and 404 in the browser. Inspected desktop policy/family layouts and mobile SMS/404/form layouts; no horizontal overflow was observed. Confirmed the 404 home recovery.
- The hero produced a real particle burst and “POOF, GONE!” after keyboard activation. Clearing all three items revealed the reward and moved focus to Reset. Motion pause persisted through Privacy to SMS, and resumed correctly. The effect overlay remains `pointer-events: none`.
- Service popup exposed all six readable choices. Selected Trash outs, entered notes, advanced through the three steps, opened the calendar, selected flexible timing, and entered a test address. The calendar stayed within the mobile viewport. Expanded review and SMS disclosures retained their styling. Returned to step one, selected Furniture, increased quantity to two, and confirmed both pickers stayed synchronized while notes persisted. Opened photo guidance and its nested tips. No email was sent.
- All eight homepage images loaded after visiting their sections, including the vector logos, crew illustration, process artwork, and family marks. The browser error log was empty. Artwork, factual copy, real county geometry, legal terms, and the already verified interactions were preserved.
- Every shipped component remains in the source review inventory; previous receipt/error, upload, menu, focus and navigation evidence remains documented in prior reports rather than being relabeled as new testing. No new illustration was justified by a content gap.

### Completion boundary

The current site refinement and performance implementation are complete for owner acceptance testing. Actual email/attachment delivery on Render, production HTTPS/domain, enabling public indexing, and future Twilio/portal work retain their previously agreed launch boundaries. Customer research and real-device/field performance measurement would provide evidence this local expert review cannot establish.
