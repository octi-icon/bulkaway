# Closing experience review

September 7, 2026. Follow-up to `COMFORT-FINISH-REVIEW.md` and the component inventory in `JOURNEY-ACCEPTANCE-REVIEW.md`.

## Assessment

The interface has a coherent, distinctive identity: atomic-era typography and illustration, vector brand marks, the make-space preview, restrained click feedback, and practical service/item selection. No additional illustration, transition, or interaction was justified by this pass. No production code was changed. This is an expert assessment, not evidence that actual customers universally find the site enjoyable.

## Research informing the decision

- [NN/G: The Role of Animation and Motion in UX](https://www.nngroup.com/articles/animation-purpose-ux/) recommends brief, unobtrusive motion that communicates feedback or state. Applied here: retain the existing action-triggered effects and user controls; do not layer more continuous effects over the request journey.
- [NN/G: A Theory of User Delight](https://www.nngroup.com/articles/theory-user-delight/) distinguishes surface enjoyment from meeting users' underlying needs. Applied here: accurate service guidance, retained quantities, recovery, and a usable form matter alongside the illustrations.
- [GOV.UK: Check answers](https://design-system.service.gov.uk/patterns/check-answers/) supports reviewing and correcting information before submission. The existing compact review/edit flow already provides this opportunity.
- [GOV.UK: Question pages](https://design-system.service.gov.uk/patterns/question-pages/) informs focused questioning and consistent navigation. The existing three-stage request flow and optional inline details remain appropriate for this request rather than adding more mandatory screens.

These sources inform design judgment; they do not establish conversion improvements for Bulk Away.

## Fresh checks in this pass

- Desktop make-space preview: completed all three removals, observed the “POOF, GONE!” feedback and completion link, used Undo, reset, and replayed a removal. An initial batched keyboard check captured intermediate state; settled individual actions were used to confirm behavior.
- Mobile service panels: weekly bulk service and donations/recyclables displayed the corresponding content and acceptance language.
- Mobile item handoff: selected Furniture, increased its quantity to two, and continued into the form. The inline form list opened with the same quantity. No horizontal page overflow in that state.
- Privacy and SMS pages at 390 px: visually inspected the opening layouts; no horizontal overflow or unresolved same-page anchor targets. The SMS page clearly states the future status of Twilio and the portal.
- Missing-page recovery: inspected the branded 404 and followed Back to Bulk Away successfully.
- Source review included the hero/replay feedback, animation rules, service interaction, item quantities, compact form styles, and draft-preserving links.

The full route/component inventory, image-loading checks, narrower 320 px and tablet checks, motion/cursor persistence, cookie controls, form keyboard checks, and delivery measurements are documented in the immediately preceding review. They were not all repeated in this unchanged build. Earlier success/restart testing used the no-email harness; no live email or SMS was sent in this pass.

## Validation boundary

The unchanged production build retains the preceding passing lint, TypeScript, 26 behavior tests, build, and HTTP checks. Recorded transfer sizes remain approximately 21 KB gzip CSS, 260 KB homepage declared JavaScript, and 153 KB policy-page declared JavaScript. These are payload measurements, not field Core Web Vitals or low-end-device frame-rate measurements.

No new concrete interface defect was established. Further refinement should be driven by customer usability observations or measured production behavior. Production Google email delivery on Render and domain/indexing activation still need launch verification. Team photos and future Twilio/Helm/portal integration remain intentionally pending. This review does not constitute screen-reader testing across platforms or WCAG certification.

## Subsequent requested review: hero image loading fixed

The next requested review found an additional performance issue through inspection of the delivered image attributes. This supersedes the earlier no-code-change conclusion for the current build.

**P2: The hero artwork was inadvertently lazy-loaded.** `SpaceSign` set `fetchPriority="high"`, but the image component rendered `loading="lazy"` by default. Browser inspection and the initial HTML both confirmed that combination. Explicit `loading="eager"` now ensures the hero does not wait for lazy-load visibility checks. Lower-page artwork remains lazy-loaded, and the original vector logo, dimensions, and animation behavior are unchanged. No dependency was added.

[Google's image-loading guidance](https://web.dev/articles/browser-level-image-lazy-loading) explicitly distinguishes fetch priority from loading behavior and recommends eager loading for initially visible imagery. This fix removes an avoidable delay; no numerical LCP improvement is claimed without timing measurements.

The HTTP regression assertion failed against the previous build with the actual hero tag containing `loading="lazy"`. It passed after rebuilding, as did lint, TypeScript, all 26 behavior tests, production compilation, and the full HTTP suite. The live browser confirmed `loading="eager"`, high fetch priority, and a loaded hero image.

Additional acceptance evidence in this follow-up:

- At 375 × 667, an empty first step displayed service/details errors and focused the visible service control. Its menu opened and supported choosing a service; notes then allowed progression to the pickup step.
- The calendar stayed within the short mobile viewport and scrolled internally. The initial focused day was present in the open calendar.
- A conservative computed-style text-contrast scan returned no failures in the inspected state. It excluded disabled controls, transparency/opacity chains and image backgrounds; this is not a complete contrast certification.
- All eight homepage image elements loaded during section navigation and supplied width/height attributes to reserve space. Their initial deferred state was not a broken-image result.
- The rebuilt desktop homepage at 1440 × 1000 had no duplicate element IDs, broken local anchor targets, or horizontal overflow.
- Privacy and SMS routes at 375 × 667 retained all policy sections without horizontal overflow or broken local anchors. The shared cookie dialog closed with Escape and returned focus to Cookie settings.
- The mobile 404 recovery page had no horizontal overflow and its Back to Bulk Away link returned home.

Further primary sources checked: [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), [W3C focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum), and [Google layout-shift guidance](https://web.dev/articles/optimize-cls). These informed the error-focus, overlay, and reserved-image-space checks. The component inventory and earlier interaction coverage remain in the companion reviews; this follow-up does not claim that every state combination was retested.

## Release-readiness follow-up

September 7, 2026, after the hero-loading correction. No further production-interface change was justified. The following additions close gaps in verification and documentation:

- Expanded `test:http` to request the shipped Bulk Away and AEPOC vector logos, social image, woman-and-man crew artwork and process illustration. The older compatibility assets remain checked as well.
- Added assertions that an unknown page returns HTTP 404 and includes home and pickup recovery links.
- Replaced a stale fixed test count in the photo-upload handoff notes with a link to dated acceptance evidence.

The expanded HTTP suite passed. Its first run reached the existing request rate limit from the preceding test run; the preview process was restarted and the unchanged suite then passed in full. Rate limits were not weakened. Only scripts and documentation changed, so the preceding production build and behavior-test results were not rerun or represented as new results. No email or SMS was sent.

Fresh browser checks:

- At 768 × 1024, the guided **A unit or property** answer recommended Trash outs and **Request this service** populated that form service.
- Entered a disposable job description and address, proceeded to contact details, edited the job through **Edit items & photos**, and returned directly to review with the revised description.
- Added disposable contact details, used **Edit pickup details**, and returned to review. A screenshot confirmed that name, phone and email were still present. Read-only DOM extraction returned empty values for phone/email despite the visible populated fields, so this conclusion uses visual evidence rather than that extraction.
- At 320 × 800, privacy-page cursor settings fit within the viewport; enabling the device pointer set the intended state. Restoring the atomic pointer and pausing motion, then navigating to SMS, retained both choices. Original motion settings were restored afterward. Neither policy page had horizontal overflow in these states.

Research checked [W3C redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html) and [multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/) for the repeat-editing path, and [Google INP guidance](https://web.dev/articles/optimize-inp) for the distinction between responsiveness measurements and asset-byte checks. The source inventory still includes all public pages and shipped components; it is not a claim of exhaustive state testing or real-device INP measurement.

Search metadata remains based on the confirmed services/counties and Organization data rather than inventing a public street address for LocalBusiness eligibility. [Google's LocalBusiness documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) informed that boundary. The Render handoff already selects a paid web-service instance for SMTP; [Render's current free-service documentation](https://render.com/docs/free) still states that ports 25, 465 and 587 are blocked on free web services. No deployment or purchase was performed. Configure and verify the production Google sender, domain and indexing at launch; future Twilio/Helm/portal work remains intentionally separate.
