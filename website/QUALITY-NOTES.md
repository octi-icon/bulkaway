# SEO and accessibility verification

Reviewed September 6, 2026 against the local production build.

## Brand

Retained “Clearing the Way for What’s Next.” as the brand slogan, visible in the hero's closing line and footer and included in social metadata and structured data. Descriptive search titles continue to name Utah junk removal and trash outs. The supplied corporate WSI marks are displayed in the family section and footer, separately from the Trash & Recycling Valet logo.

## SEO included

- Server-rendered homepage with service descriptions, semantic headings, contact details, family links, and confirmed Salt Lake, Utah, Weber, and Davis county coverage.
- Descriptive page titles and descriptions; homepage and privacy page have separate canonical URLs.
- Organization, WebSite, and Service catalog structured data, including service areas, contact information, slogan, and parent organization logo.
- Self-hosted fonts, responsive layouts, explicit image dimensions, and deferred loading for secondary logos.
- Robots and sitemap routes controlled by `PUBLIC_LAUNCH`. Preview remains `noindex, nofollow` with crawling disallowed and an empty sitemap. At public launch set `SITE_URL` to the final HTTPS domain and `PUBLIC_LAUNCH=true`, then verify the live responses. Search Console verification, sitemap submission, and Google Business Profile setup are external launch work and have not been performed.

A slogan or aesthetic does not establish a ranking advantage. The service and location wording follows [Google's SEO guidance](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

## Accessibility scope

WCAG 2.2 AA is the target. This is a targeted implementation and browser review, not a full conformance certification or an automated axe report.

Verified:

- Visible text contrast scan: no below-threshold results in the reviewed homepage state, using 4.5:1 for ordinary text and 3:1 for large text. The DOM scan composites ancestor background colors; it does not evaluate every image, pseudo-element, transient state, or assistive-technology presentation.
- Narrow layout at 320 CSS pixels and desktop at 1440 pixels: no document horizontal overflow. Form fields stack on small phones and use 16px input text.
- Menu exposes expanded state; Escape closes it and returns focus to the trigger.
- Service tabs implement a single tab stop with Up/Down/Home/End navigation and correctly associated panels.
- Clutter demo moves focus to the next item, then Reset; Reset returns focus to the first item. Reset's accessible name contains its visible label.
- Empty-form validation focuses the first invalid field, marks seven required controls invalid, and associates inline error text through `aria-describedby`. No email was sent during this check.
- Form controls have labels and appropriate autocomplete attributes; server failure and success states provide programmatic focus and announcements in the implementation.
- Skip link, visible focus indicators, image alternative text, native FAQ disclosures, motion pause control, and reduced-motion CSS are present.

Still required before asserting full WCAG conformance: complete screen-reader testing with NVDA/VoiceOver, 200% text resizing and text-spacing overrides, all interaction and provider-response states, full non-text contrast/target-size evaluation, and the deployed site's full-page and complete-process review. Relevant criteria include 1.1.1, 1.3.1, 1.4.3, 1.4.4, 1.4.10–12, 2.1.1, 2.2.2, 2.4.1, 2.4.3, 2.4.7, 2.4.11, 2.5.3, 2.5.8, 3.3.1–2, and 4.1.2–3. See the [W3C WCAG 2.2 reference](https://www.w3.org/WAI/WCAG22/quickref/).

## Privacy and SMS additions

Added a sitewide native cookie dialog and settings access, expanded /privacy, and added /sms with its own canonical URL and sitemap entry. The dialog states that analytics/advertising are unused and offers necessary-only storage or an explicit 180-day remember preference. Direct policy visits remain readable without an automatic modal.

Browser verification at 1440px and 390px: first-visit dialog and mobile options render; remembered settings survive a reload and restore the checkbox; Escape removes the persistent choice and returns focus to Cookie settings; necessary-only dismissal works. The SMS page has no horizontal overflow. The optional SMS control starts unchecked and is not required. Form validation does not treat SMS as a required field. No real email or text was sent.

All 10 unit tests pass, including absent/false consent, rejection of ambiguous consent values, versioned opt-in recording, and rejection of outdated disclosures. Type checks, lint, production build, and HTTP route/asset checks pass. Twilio, portal enrollment, and STOP/HELP processing remain future integration work. The email is the current durable preference record when delivery succeeds; this website does not claim an active SMS subscription.

## Optional photo upload verification

Added optional local previews and removal, 5-file / 5 MiB each / 10 MiB combined limits, bounded multipart parsing, content validation and metadata stripping, and normalized JPEG email attachments. Browser checks verified a selected image preview, removal, restored focus, and no mobile horizontal overflow. All 14 unit tests, type checks, lint, production build, and HTTP route checks passed; the production route rejects invalid image contents before sending mail. Live Google attachment delivery is pending the configured Render mail credentials.

## Form popup reliability

Replaced native service/date popups with Base UI Select and Popover plus React DayPicker. In the embedded browser, the previous native select reported expanded while no options were visible; clicking the date body focused a segment instead of opening the calendar. The new popups render in the page, use full-field triggers, and support Escape, keyboard selection, disabled past dates, and clearing an optional date. Existing server validation and email handling remain in place.

Verified visible desktop and 390px mobile menus, full service names, three calendar open/Escape cycles, service keyboard selection, calendar arrow/Enter selection, and clearing the date. Type checks, targeted lint, production build and all 14 existing tests passed. No live request was sent. Native-popup visual reproduction and the replacement interactions were checked through the browser; no standalone browser regression runner is configured.

## Three-step pickup request

The form now groups items/photos, location/preferred date, and contact/consent into three steps. Previously entered fields remain mounted when hidden, preserving text, date, and optional photos during Back/Edit navigation. The third step summarizes service, details, photo count, address and preferred date; no request is submitted until the final action passes complete validation. Step changes focus the heading; invalid fields focus within the affected visible step. Progress and edit controls are disabled during delivery.

Added tests for step-scoped validation and routing errors to the earliest affected step. All 16 tests pass. Browser checks at desktop and 390px verified empty-step validation, date selection reflected in the review, back/edit retention, final contact-consent validation, unchecked optional SMS, and no horizontal overflow. No live email was sent. Full screen-reader and real-provider delivery testing remain outstanding as described above.

## Interaction flourishes

Added illuminated service indicators, brief service-panel transitions, directional action-arrow responses, native FAQ toggle/answer motion, and animated pickup-progress segments. Research rationale and primary sources are recorded in FLOURISH-RESEARCH.md. No dependencies were added.

Production build, TypeScript and lint pass. Browser checks verified desktop service switching by keyboard, mobile FAQ open/close with Enter, preserved FAQ content, step-two progress state, no mobile overflow, and removal of the new animations while motion is paused. Reduced-motion alternatives are included in CSS; OS-level reduced-motion emulation was not exercised in this pass. No real pickup request was sent.

## Click and submission sparkles

ClickSparkles adds four decorative stars to primary clicks on service tabs and the haul-away demo. At most three bursts remain mounted, with timer cleanup after 650 ms. SubmissionSparkle mounts only in the request's successful response branch; eight stars and one orbital ring animate around the persistent confirmation check and are removed after 1.2 seconds. Both use transform/opacity animations and ignore pointer events. Form-entry clicks do not trigger the effect. Pause and reduced-motion settings suppress the decorative bursts.

Verified click particles appear and are removed, Pause prevents click particles, and the submission component renders/cleans up at desktop and 390px width. The submission component was checked through a temporary local preview route, which was removed before the final build; no real request or email was sent. Build, lint, TypeScript and all 16 existing tests pass. No device frame-rate benchmark was conducted.

## Sitewide click sparkle correction

Expanded ClickSparkles from two controls to ordinary primary clicks across all pages, mounted once in the shared layout. Editable fields, disabled controls and native dialogs are excluded. Keyboard activations spark on actionable controls. Added a dark SVG outline for contrast on cream, larger particles, and a 750 ms burst with cleanup at 850 ms; the three-burst cap remains. Verified four particles on ordinary homepage and privacy-page headings, and zero while clicking the form textarea. Lint, TypeScript and production build pass.

## Word bursts and illustrated crew

Clearing a demo item now adds a brief POOF, GONE! label beside the stars, while ordinary clicks retain stars only. The existing successful-request branch includes MESSAGE AWAY! above its confirmation copy. The label is decorative, ignores pointer events, stays within the viewport, and follows the existing motion controls.

Added an AI-generated retro illustration to the family-business sign, with descriptive alt text and the sign's live lettering preserved. The optimized 960 x 640 WebP is 78,810 bytes and lazy loaded. Its source and provenance are retained under assets/generated; it is an illustration, not a photograph of actual staff or fleet.

Lint, TypeScript and the production build pass. Browser checks at 1440px and 390px verified the illustration loads without horizontal overflow, demo word bursts appear within the viewport and clean up, and ordinary clicks do not show a word. Submission wording was checked in the successful-response branch; no real email was sent in this pass.
