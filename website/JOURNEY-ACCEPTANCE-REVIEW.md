# Complete-journey acceptance review

Reviewed September 7, 2026. This is a fresh primary-source and application-source review, with emphasis on transitions between states rather than another layer of decoration. The main task independently operates the live site and records its results below. This research does not claim new browser measurements, sent email, or a full accessibility certification.

## Research criteria

1. **Returning to edit is part of completion.** A customer should be able to inspect their answers and change them without repeating unrelated questions. The current compact review and direct edit controls serve this purpose. Returning from an edit should show the updated values. [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/)
2. **Completion needs a clear outcome and next step.** A receipt should distinguish a sent request from a confirmed booking and give a reference and contact route. The existing receipt does this. The next request must also begin in a coherent, independent state. The latter is this review's application-specific inference from the confirmation pattern, not a quoted rule about this implementation. [GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)
3. **Errors must identify the problem and help correction.** Field-associated messages and deliberate focus are more useful than a generic failed-submit message. Preserve already entered values while allowing corrections. [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
4. **Short steps should retain context.** Logical grouping, visible progress, optional stages, and retaining input when revisiting completed steps are appropriate for this request form. A fourth mandatory review page is not warranted by the current source review. [WAI multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/)
5. **Disclosures must maintain an understandable relationship to their trigger.** Expanded/collapsed state and standard keyboard activation matter. Native details/summary already supplies the foundation; the recent anchoring fix should be retained and exercised after typing. [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
6. **The calendar requires an exit as well as an entry.** Choosing a date, moving through dates, closing without changing it, and returning focus to the trigger are relevant acceptance cases. The project's date component uses a popover and DayPicker rather than copying this example verbatim. [WAI date picker example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
7. **Motion should be optional.** Preserve the site pause control and system reduced-motion support; the existing celebration is supplementary to a textual result. [WAI animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
8. **Animation work and asset bytes are different measurements.** Prefer composited transform/opacity effects to repeated layout work. Existing bounded sparkles do not justify adding a larger animation dependency. [Google animation performance guidance](https://web.dev/articles/animations-guide)
9. **Image dimensions reserve layout space.** Declared dimensions and deliberate lazy loading are relevant protections, but source inspection cannot prove the site's field CLS. Previous gzip byte savings likewise do not prove real-device INP or LCP. [Google CLS guidance](https://web.dev/articles/optimize-cls)

## Concrete fresh finding

### Completed request → service CTA can carry prior request state

Starting source: `components/pickup-form.tsx`, the `bulk-service` listener compared with the explicit **Start another request** handler.

- The explicit restart clears receipt, reference, service, selected items, review data, SMS choice, messages and validation state.
- A service CTA dispatches `bulk-service`; the listener sets the service, first step, request-start flags and idle status, but does not reset prior items or `smsSelected`.
- Success replaces the form DOM with a receipt. Changing its status back to idle mounts blank uncontrolled contact/address/notes fields while controlled state can survive.
- Consequently, after a completed request with SMS selected, choosing another service can start a new blank form with the previous optional SMS choice and item quantities still selected. This is a concrete code-path discrepancy. The main task should reproduce it before claiming a rendered fix.

Recommended scope: give every intentional **new request after success** entry the same reset semantics, then apply the requested service. Preserve the current in-progress draft when a user merely changes service before submission. Keep receipt data immutable while the customer explores elsewhere. Do not silently enroll anyone in SMS or introduce a new backend integration.

## Cross-state review and no-change judgments

| Journey | Starting-source evidence | Judgment / acceptance case |
| --- | --- | --- |
| Step one → two → three → edit | Steps are hidden, not unmounted. Review snapshots update on successful step submission. `goToStep(0/1, true)` returns to step three. | Keep structure. Verify edited notes/address/date and quantities, along with retained contact fields. |
| Invalid input → correction | `validatePickupStep` filters early-stage errors, validates all fields on final submit, selects the earliest error step, and focuses its first invalid control. An effect opens enclosing details. | Keep field messages; operate correction paths. Do not claim that unit validation tests alone verify disclosure focus. |
| Valid item → invalid quantity → correction | Shared picker permits an empty temporary quantity, flags non-whole/out-of-range input, and validates 1–999. | Useful editability; do not clamp every keystroke. Verify the invalid item appears in both shared views and a valid correction reaches review. |
| Photo reject → replace/remove → review | Selection limits are checked before accepting files; previous accepted files survive rejected additions. Object URLs are revoked on preview cleanup. Removal returns focus to the chooser. | Keep. A rejected optional photo need not block a request containing only previously accepted files. Review count must match accepted files. |
| Preferred date → flexible → edit | Calendar stores a date-only value in a hidden input; optional clear sets it empty. Minimum date follows America/Denver and refreshes on focus/interval. | Keep the shared Utah day logic. Verify clear and review agree; previous chosen dates must still receive final validation if a draft spans midnight. |
| Server field error → correction | API includes field names; client routes to the owning step, opens invalid disclosures, and exposes the delivery alert. | Preserve data. Exercise with a local simulated response; do not send live test mail. |
| Uncertain delivery → retry/contact | Error helper distinguishes confirmed reference from unreadable/non-success responses; request ID persists while outcome is uncertain. API rejects a different payload under an existing processed ID. | Existing call/email instruction is deliberate duplicate protection, not a reason to silently mint a new ID on failure. |
| Receipt → other page / other item | Receipt uses a frozen submitted snapshot, independently of the current haul context. Completed state suppresses the dock. | Keep immutable receipt. Fix inconsistent service-driven restart described above. |
| Draft → policy / sibling brand | DraftSafeLink opens reading detours in a new tab when started/items exist and tells users why. Consent policy links explicitly announce a new tab. | Keep the mounted form and File objects; no need to add personal data to localStorage. |
| Cookie dialog → policy → close | Policy opens separately without saving settings or dismissing the dialog. Explicit controls save necessary/session or optional 180-day choice. | Keep current behavior. Avoid another modal or decorative consent animation. |

## Page and shipped-component inventory

All public source routes were included: homepage `/`, `/privacy`, `/sms`, and `app/not-found.tsx`. Supporting `api/pickup`, `api/health`, metadata, robots and sitemap were inventoried. Privacy/SMS contain headings, section navigation, real contact paths, and clear statements that Twilio/client portal are future features. The 404 has a branded explanation and both home/request recovery. No additional decorative image is needed on these reading/recovery pages.

| Surface / component | Source review result |
| --- | --- |
| SiteHeader | Mobile menu closes on link, Escape, outside pointer/focus and desktop breakpoint; trigger exposes expanded state. |
| AtomicSky / SpaceSign | Hero game has progress, undo, reset and a real-request link after completion. This makes the play relevant; no extra game stage is justified. Vector logo retains declared proportions. |
| CrewIllustration / process art | Source points to the woman-and-man artwork and separate fresh-start process art; dimensions and lazy loading are explicit. No factual team photo is invented. |
| ServiceExplorer / ServiceFinder | Five actual service panels, keyboard tab navigation, and short guided matching. Service CTA is the newly identified restart seam. |
| HaulBuilder / HaulItemPicker / provider | One shared list with item quantities; invalid values are visible. A completed receipt does not accept an uncontrolled list transfer: current text directs the customer to restart. |
| CountyExplorer / map | Selection has readable coverage feedback; same connected county geometry remains unchanged. No replacement generative map. |
| PreflightCheck | Three optional tasks, completion text and reset support preparing a quote; checklist never blocks the form. |
| PickupForm / ServiceSelector / PickupDateSelector / PhotoUpload | All steps, disclosures, labels, state ownership, validation, review, receipt and error paths reviewed. Live cases belong in the main-task record. |
| FAQ | Six native disclosures with direct answers. Additional accordion exclusivity is not required; comparing multiple answers is useful. |
| FamilyFinder / brand cards | Match text and real sibling-brand links. AEPOC stays business strategy/design, not graphic-design positioning. |
| RequestDock | Dismissible; avoids hero, form and footer, sending/completed states. No second sticky CTA warranted. |
| SiteExperience / MotionToggle | Shared navigation focus/scroll and per-session motion choice; history navigation is intentionally left to router restoration. |
| ClickSparkles / SparkleRays / SubmissionSparkle | At most three click bursts; timed cleanup; input/dialog exclusions; pointer-transparent artwork and reduced-motion gates. Success includes text independent of flourish. |
| CookiePreferences / DraftSafeLink | Choices and draft reading detours remain transparent. No analytics or ad tracker is added. |
| Used button/select/popover primitives | Used wrappers and relevant sizing/portal rules remain part of source coverage. Unused scaffold UI exports are not user-visible website components. |
| Styles / delivery | Explicit Tailwind sources and `vinext build --precompress` remain present. Do not broaden scans or add another animation library. Fresh transferred-byte measurements, if taken, must be distinguished from prior results. |

## Assessment

The site already has a coherent atomic-era visual vocabulary and meaningful playful interactions: clearing clutter previews the service, the service finder reduces uncertainty, the item builder prepares a useful quote, and the checklist helps customers get ready. My expert-review judgment is that more effects or illustrations would add little at this stage. That is not a user-research finding or proof of market-wide uniqueness.

The worthwhile refinement identified in this pass is consistency between completing one request and starting the next. Completion should be assessed with these mixed-state journeys, not just screenshots of isolated open components.

## Main-task implementation and verification

### Reproduced defect and implemented fix

The main task reproduced the starting-build defect in the browser: select Furniture, complete all three steps with optional SMS checked, receive the simulated BA-00000001 receipt, then use **Get my bulk pickup quote**. The new blank form retained Furniture and `smsConsent: true`.

`PickupForm` now uses one fresh-request reset for the receipt button and service/list entry paths after success. Consent, contact form, date, notes, photos, review, errors, receipt and request identifier begin independently. Success clears the shared item draft while keeping the submitted receipt snapshot intact. A new item list made after receipt is accepted directly by **Continue with my list**, and its disclosure opens when the form remounts. New list changes mark the shared state unfinished so reading detours preserve it. Changing service before completing a request still retains the unfinished draft.

The local QA harness now accepts loopback port overrides. It was run on 8788 with the production build upstream on 8791 because the browser could not open its alternate 8790 origin. The harness intercepts all writes; none were forwarded and no email/SMS was sent. Both QA processes were stopped afterward; the normal production preview was restored on 8788.

### Current-build browser acceptance

- At the existing 522 × 791 viewport, repeated the consent-selected success journey. The receipt retained **1 × Furniture**, the external item builder was empty, and the service CTA started with no items, no photos, blank contact fields, and both consent checkboxes unchecked.
- Entered notes, reused the service CTA before submission, and verified the notes survived.
- Chose September 10, cleared it with **No preferred date**, and verified the review displayed **Flexible — arrange with the crew**.
- Edited notes from review, returned using **Back to review**, and verified the updated notes and retained address. Submitted that second request through the no-email harness.
- After that receipt, selected **2 × Mattresses** in the external builder and used **Continue with my list**. The form opened at step one with its item disclosure expanded, exactly those new quantities, blank notes, and SMS unchecked.
- Entered quantity zero, attempted next, and observed the quantity error, open disclosure, and focus on **Mattresses quantity**. Corrected it to three and advanced successfully.
- Exercised item disclosure closing/opening after typing. Browser automation can recenter a focused control before pressing it, so this pass does not add a zero-scroll-delta claim to the previous dedicated disclosure measurements.
- At 1440 × 1000, visually inspected the desktop hero. Cleared all three preview items, observed the completed slogan, restored the mattress with Undo, then reset. No horizontal page overflow or completed-but-broken image was found.
- Visually inspected `/privacy` at 1440 × 1000 and `/sms` at 390 × 844. Their heading and internal-anchor checks found no missing targets or horizontal overflow. Inspected the branded missing-page recovery at 390 × 844. This supplements the all-component source inventory; it does not imply every combination in every browser was operated again.
- Current browser error-log check returned no errors during the exercised form flow.

### Build and delivery evidence

All 26 existing behavior tests passed. Lint, TypeScript checking, and the precompressed production build passed. HTTP verification passed for routes, health, referenced font/logo assets, gzip/Brotli negotiation, immutable caching, decoded asset integrity, cross-origin rejection, validation, body limits and invalid multipart/photo rejection before mail delivery.

Fresh HTTP-only measurements: CSS **21,146 gzip bytes**; homepage declared JavaScript **258,837 gzip bytes**; privacy/SMS declared JavaScript **152,044 gzip bytes**. These remain within tens of bytes of the previous measured performance pass. No new animation library, image or runtime dependency was added. These are transferred-payload measurements, not field Core Web Vitals or real-device timing.

Production Google/Render delivery and attachment checks, domain/indexing activation, and future SMS/portal integration remain separate launch work. The source-and-browser review supports the current interface's coherence; it is not an accessibility certification, customer usability study, or market-wide uniqueness claim.

## Additional form acceptance research

September 7, 2026. Bounded primary-source and read-only implementation review after the completion record above. Earlier restart, disclosure, date-boundary, and navigation fixes were checked rather than reported again. This subsection adds no browser or submission claims.

### One current instruction gap

In `components/pickup-form.tsx`, **Pickup address** requests street, city, state and ZIP only through its placeholder. Its persistent helper instead discusses service availability. The placeholder disappears when the field contains text. The field uses `autocomplete="street-address"`; HTML defines that purpose separately from city, state and postal code, so this token cannot be relied on to fill all requested address parts. `lib/pickup.ts` checks address length (8–300 characters), so a street-only value receives no reminder. The verified issue is the missing persistent complete-address instruction; actual saved-profile autofill behavior was not operated. [HTML autofill definitions](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill), [WAI form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)

Narrow recommendation: retain the existing field and add a persistent, programmatically associated instruction to include street, city, state and ZIP, including after autofill. Preserve error association alongside that hint. No geocoding service, stricter guessed address parser, or new required field is justified by this finding.

### No additional source defect established

- **Contact labels and input purpose:** name, phone and email retain real labels and the matching `name`, `tel` and `email` autocomplete tokens. Keep them. [WAI identify input purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html)
- **Optional texts:** the checkbox starts unchecked, remains independent of required phone/email contact agreement, and unchecked SMS is accepted by validation. Fresh-request reset clears the choice. This matches the interaction principle that checkbox options should not be preselected; it is not a legal opinion on consent wording. [GOV.UK checkboxes](https://design-system.service.gov.uk/components/checkboxes/)
- **Backward navigation and review edits:** inactive steps stay mounted; the two review edit buttons identify their targets, and successful edits return directly to step three with a refreshed review snapshot. No new data-loss path was found. [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/)
- **Calendar dismissal:** controlled popover state, date selection, explicit flexible-date clearing and Escape instructions remain present. Earlier browser evidence already records Escape returning focus to the trigger. The main task's current browser check should verify dismissal without changing a selected date; source review alone cannot certify focus behavior. [WAI date picker example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
- **Validation recovery:** client errors route to the earliest owning step, reveal invalid disclosures and focus the first invalid control; field messages remain associated with inputs. Server field errors retain values and expose the delivery alert. Existing retry protections should remain. No new correction blocker was established by this review. [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)

### Main-task follow-through: persistent address guidance

Implemented the additional form research finding in `components/pickup-form.tsx`. The pickup-address field now has an explicit concise label and persistent guidance: “Include street, city, state & ZIP so we can confirm service availability.” Its accessible description includes both this guidance and any address error. No additional required field, strict address parser, autofill suppression or layout redesign was introduced.

Fresh browser checks at 768 × 1024 confirmed that an empty first step focuses the service selector, correction advances, notes survive Back, a selected date remains unchanged after Escape, and clearing the date is available. The browser tool's raw hidden-input values were not used as evidence of loss; the rendered date text confirmed preservation. No request was sent.

After the change, at 390 × 844, an empty address focused `pickup-address`; its description referenced `address-help address-error`. Entered street text and visually confirmed that the full-address instructions remained visible, with no horizontal overflow. Production build, lint and TypeScript passed. The preceding 26 passing behavior tests and full HTTP suite remain applicable; they were not repeated for this label/help-text change. No actual browser-autofill session or live email delivery is claimed.

The site-wide inventory and prior public-page, SEO, asset, motion and performance findings remain the broader acceptance baseline. This bounded pass found no additional design or interaction change warranted. Restored the viewport and left a clean preview at /?preview=address-guidance#main.
