# A shorter-feeling Bulk Away pickup request

Research completed September 7, 2026. This report informs the implementation requested by the owner. It is not a conversion experiment, legal opinion, or a claim of complete WCAG conformance.

## Decision

Keep the existing three logical stages: the job, the pickup, and contact/send. Reduce the amount each visitor has to inspect within those stages. The primary problem is the amount of simultaneously expanded material, especially in stages one and three, rather than an excessive number of required text fields.

The coherent change set is: a visible description with an explicitly offered equivalent item-list route; item choices and optional photos revealed when wanted; contact fields before a concise final summary; optional upcoming SMS preferences behind a clear disclosure with the full consent language beside its checkbox; and reliable return/edit/error behavior that preserves answers. Preserve the existing backend contract and the explicit distinction between requesting a quote and confirming a booking.

This is a design inference from the sources below and a source-code inventory, not a claim that three stages universally outperform four.

## Current implementation inventory

Reviewed `components/pickup-form.tsx`, `components/photo-upload.tsx`, `components/haul-list.tsx`, and `lib/pickup.ts` before finalizing recommendations.

| Stage | What the visitor currently sees | Why it feels long |
| --- | --- | --- |
| 1: The stuff | Service selector, six item categories and selected quantities, multiple instructions, details textarea, full photo input, limits, count, privacy note, photo tips | Two ways of describing a job and the entire optional upload workflow are presented together. A user with a simple selected-item request has to scan much that does not apply. |
| 2: The pickup | One address field and preferred date | Already relatively short. Date is optional in validation; keep flexibility prominent and avoid implying a confirmed slot. |
| 3: Your details | Six-row pickup review and edit controls before name, phone, email, contact agreement, lengthy optional future SMS program language | The visitor encounters a recap before the work of this stage. Optional future functionality visually competes with completing the current request. |

The server requires service, a valid item list **or** a description, address, name, phone, email, and permission to respond. Date, photographs, extra notes when items exist, and SMS consent are optional. Selected items already travel from the haul list into the form; requesting the same information in prose would be unnecessary duplication. Phone and email are currently both operational requirements. Removing either would change the service contract and is not justified solely by general form research.

The implementation owner measured the incumbent first-stage form including its form chrome in the local production preview: **1,677 pixels high at a 944 × 791 viewport**, and **1,757 pixels high at a 390 × 844 viewport**. These are local layout measurements, not timing or conversion measures.

## Evidence reviewed

All links are first-party guidance, standards documentation, or original research from the organization conducting it. No competitor conversion claims, unsourced statistics, or affiliate UX roundups are used.

1. **Visible work matters more than step count.** Baymard's original checkout research finds that the fields people must consider are a more useful optimization target than merely counting screens. This is directly relevant to optional controls competing for attention. Its research concerns e-commerce, so its numerical results should not be projected onto Bulk Away. [Baymard: Minimize form fields](https://baymard.com/blog/checkout-flow-average-form-fields).

2. **Ask only necessary questions, keep optional labels explicit, and group deliberately.** GOV.UK recommends starting from focused question pages but explicitly allows related questions to share a page. It also recommends short hints rather than long explanatory text read at every input. This supports preserving three related groups and trimming repetitive scaffolding. [GOV.UK: Question pages](https://design-system.service.gov.uk/patterns/question-pages/).

3. **Long forms benefit from logical stages, recognizable optional work, and progress.** WAI describes stages as a way to make complex forms less daunting and recommends saving answers when visitors revisit completed stages. Bulk Away already has this foundation; it needs lighter stages and dependable editing rather than a new wizard for every field. [WAI: Multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/).

4. **Hide supplementary material, not essential instructions.** GOV.UK's details pattern is intended for content only some visitors need. It warns against hiding information needed by most people and documents discoverability limitations. Thus an optional photo workflow can be disclosed; the required job description, address, and contact agreement must remain apparent. [GOV.UK: Details](https://design-system.service.gov.uk/components/details/).

5. **A review should support correction and sending.** GOV.UK recommends a check-answers opportunity before completion, clear submission wording, section-specific changes, and prefilled edits that return directly to review. A concise review within Bulk Away's final stage is a contextual adaptation: GOV.UK's reference pattern itself uses a separate review page. [GOV.UK: Check answers](https://design-system.service.gov.uk/patterns/check-answers/).

6. **Do not make people provide the same information again.** WCAG 2.2's redundant-entry criterion addresses information already provided within a process. Preserve item selections, quantities, typed notes, contact fields, and date across changes, back navigation, and optional disclosure toggles. [W3C: Redundant Entry, 3.3.7](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html).

7. **Label and instruct without overloading.** W3C explains that both missing guidance and excessive information can cause problems. Required/optional wording and short context-specific hints should remain visible; label association should not depend on placeholders. [W3C: Labels or Instructions, 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html).

8. **A disclosure needs an operable, stateful control.** WAI's disclosure pattern specifies keyboard activation and expanded/collapsed state. Prefer native `details`/`summary` where appropriate, or an actual button with `aria-expanded` and a related panel. An icon by itself is insufficient. [WAI APG: Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

9. **Errors must be identifiable in words.** W3C requires automatically detected errors to identify the affected entry and explain the error in text. Collapsing optional panels must never conceal an unresolved item, upload, or consent error. [W3C: Error Identification, 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html).

10. **Recovery should preserve attempts.** GOV.UK recommends retaining entered values and showing errors at the attempted transition, rather than interrupting unfinished typing. The existing explicit Continue/Send validation remains appropriate. A collapsed erroneous panel should open before error focus moves into it. [GOV.UK: Recover from validation errors](https://design-system.service.gov.uk/patterns/validation/).

11. **Changing an answer should not unexpectedly move the visitor elsewhere.** W3C's on-input guidance distinguishes changing content from changing context and recognizes explicit submit controls as a way to initiate transitions. Keep item, service, and preference choices local; do not auto-advance after selection. [W3C: On Input, 3.2.2](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html).

12. **Preserve browser-assisted completion.** W3C explains the value of programmatically identifying common personal-data fields. Keep the existing autocomplete purpose values for name, email, telephone, and address. [W3C: Identify Input Purpose, 1.3.5](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html).

13. **Use recognizable field semantics for autofill.** Google's browser-development guidance explains the role of name, type, ID, and autocomplete in detecting fields. Do not replace the existing text fields with custom non-input widgets merely for visual compactness. [web.dev: Avoid re-entering data in forms](https://web.dev/learn/forms/auto/).

14. **Uploading is real effort.** GOV.UK says uploads should be requested only when needed to deliver a service and provides visible selected-file and error states. Bulk Away's owner explicitly wants optional photos: retain that useful facility, but keep it skippable, show counts after selection, and preserve validation and removal. [GOV.UK: File upload](https://design-system.service.gov.uk/components/file-upload/).

15. **SMS consent is a substantive choice.** Twilio requires informed, unambiguous, freely given consent that identifies the sender and subject, permits withholding consent, explains withdrawal, and retains proof. Its policy also discusses reconfirming after time has passed. The future program therefore must not be preselected or bundled into service contact permission. Re-check consent freshness and campaign requirements when Twilio is actually launched. [Twilio Messaging Policy](https://www.twilio.com/en-us/legal/messaging-policy).

## Recommended implementation

### 1. Make the first stage a small, useful job description

Keep service selection visible and continue honoring service links already chosen elsewhere on the site. Offer the equivalent item-list route with a clearly labeled “Choose items & quantities” disclosure; the user specifically requested selectable items and quantities. Open it automatically for a shared list or item error, and show the selected count in its summary. The default visible description still provides a complete entry route, so the disclosure does not hide the only way to specify the job. This is a context-specific application of supplementary disclosure, not a pattern directly prescribed by GOV.UK. Reduce repeated explanatory content in the chooser. Quantity controls should appear only for selected items; retain large usable controls and unambiguous labels.

Support two legitimate ways to specify a job without making visitors complete both. Keep the description mounted and visible throughout, labeling it optional once selected items satisfy the job requirement. This avoids a sudden layout/focus change while visitors add quantities and keeps any typed notes apparent. With no selected items, its description requirement applies again. Do not erase either input method when visitors use the other. Do not introduce a mandatory mode-selection question before these routes.

Use one short introductory instruction explaining the either/or requirement. Keep any special-handling qualification concise and close to relevant selections. Avoid two paragraphs that restate the same rule.

### 2. Make photographs an optional expansion

Initially show “Add photos (optional)” with a camera cue. Expand to the existing picker, file limits, privacy handling, thumbnails, and removal controls on request. Replace “No photos selected” at rest with the compact optional entry point; after use, the summary should show the selected count. Keep the panel open when selection fails and preserve successfully accepted files. Do not conditionally unmount file state or clear selections when closing it.

The upload capacity and server-side validation remain unchanged. This is progressive disclosure, not the removal of the requested capability.

### 3. Keep pickup logistics concise

The existing single address input and optional preferred date are already efficient. Put “optional” in the preferred-date label and keep a short indication that leaving it blank is flexible. Retain one honest statement that the crew confirms availability and the quote. Do not add a compulsory time window, full address lookup dependency, account, or calendar-only scheduling step.

### 4. Let the last stage begin with the visitor's remaining work

Place name, phone, and email before the pickup recap. Keep these in a clear reading order, with a single name field and useful autocomplete. Present a concise visible summary of the service/job and pickup address/date near the final action. Put long descriptions and detailed attachments behind an explicit review expansion if necessary, without hiding all review information. Section-specific Edit actions should preserve all fields and return directly to the final stage after validating the changed section.

Keep the required response permission visible. The send label must remain an actual request action, not “Book now.” No request is sent by opening a summary, editing an item, or completing an earlier stage.

### 5. Give future texts an optional place without diluting consent

Use an explicit “Pickup texts (optional, coming soon)” disclosure. Inside it, keep the existing future-availability notice, complete consent language, unchecked SMS checkbox, and SMS/privacy links together. Opening this panel must not opt in. The disclosure summary may reflect whether the checkbox was selected, but the underlying selection must survive closing/reopening and stage changes. Errors expand it. Sending without opening it records no SMS consent.

This recommendation is an interface application of Twilio's policy, not a declaration that a future campaign is approved. Do not start Twilio messaging or imply a live portal as part of this change.

### 6. Recover predictably and preserve readability

Retain visible step count, explicit Continue/Back, descriptive field errors, and normal keyboard focus. Focus the destination heading on a deliberate step change. For validation, show the right stage and open the correct panel before focusing its error or control. Do not reduce text size or target area merely to achieve a smaller screenshot. Preserve data in memory through every internal step/disclosure/edit path; do not introduce new local-storage retention of personal information.

## Approaches not selected

- **One giant compact form:** reduces steps but puts all consent, upload, and contact work back on screen.
- **A conversational chatbot or one-field-per-screen wizard:** adds many transitions, makes comparison and editing harder, and brings no evidence-backed advantage for this small request.
- **An additional mandatory photo/review/preferences step:** optional work should not become a gate simply to shorten each screen.
- **Hiding required information in an accordion:** makes the screen shorter at the expense of task discoverability.
- **Deleting phone or email immediately:** operational implications have not been studied. First reduce unnecessary visible material while preserving delivery requirements.
- **Tiny typography, reduced touch targets, or a second scrollbar inside the form:** optimizes pixel count rather than usability.
- **Automatic SMS selection, abbreviated consent that changes its meaning, or implied booking:** incompatible with the existing product and consent model.
- **Completion-time promises or claimed percentage conversion gains:** no Bulk Away completion-time or conversion data exists to support them.

## Verification gates for the implementation owner

1. At desktop and 390/320-pixel mobile widths, inspect all three default stages with optional sections closed. Compare visible height and the distance to Continue/Send against the incumbent, without shrinking labels or controls.
2. Complete a common item-only job without notes, photos, date, or SMS. Confirm the same required server payload is produced and no duplicate prose entry is demanded.
3. Complete a description-only commercial job; changing service must retain written details. Items and text may both be provided without either being lost.
4. Select multiple quantities, type extra details, close/reopen the item panel, change stages, and edit from review. Values must remain correct. Removing the last selected item must restore the description requirement visibly.
5. Add accepted photos, close/reopen, remove one, and exercise invalid file/quantity conditions. Errors must be visible and reachable. No actual email is necessary to test client flow.
6. Verify keyboard Enter/Space on disclosures, focus after Continue/Back/Edit, expanded state, and accessible labels. Ensure optional panels do not add focusable hidden controls to the tab order.
7. Leave SMS untouched, then deliberately opt in, close/reopen, and opt out. Confirm that only the checkbox changes consent and unchanged disclosure-version handling survives.
8. Exercise a failed transition and failed delivery without losing the draft; verify final send protection, server validation, and request lock still work.

Implementation verification results belong below after changes are built. The research phase has not run those checks, sent a request, or measured conversion.

## Implementation and observed verification

Implemented September 7, 2026. The three stages and required server fields remain intact. The first stage keeps the service and written-description route visible, with explicit expandable item/quantity and photo options. Shared selections open the item picker, and collapsed summaries show quantities or attachment counts. The textarea stays mounted and becomes optional when items satisfy the job description. Contact fields precede a visible service/address recap and expandable review. Review edits return directly to stage three. Upcoming SMS is an optional disclosure with full original terms and its explicit checkbox together; the summary reflects an affirmative selection.

Native disclosures preserve their controls and draft values in the document. Invalid fields open enclosing panels before receiving focus. No new dependency, personal-data storage, price claim, or live messaging integration was introduced.

### Measured default first stage

| Viewport | Before, including form heading and actions | After | Reduction in rendered height |
| --- | ---: | ---: | ---: |
| 944 × 791 | 1,677px | 757px | About 55% |
| 390 × 844 | 1,757px | 770px | About 56% |

These measurements compare the initial empty form with optional sections closed. They measure visible layout, not completion time or conversion. Expanding tools intentionally increases the height. On the tested phone, stage two measured about 595px and the default contact stage about 889px.

### Observed checks

- Item-only route: selected Furniture, changed quantity to three, collapsed the picker, and advanced with no notes, photos, date, or SMS required.
- Review editing: entered test contact fields, edited job notes, and returned directly to review with name, quantity, address, and notes preserved.
- Error recovery: entered quantity zero, collapsed the item panel, then attempted to continue. The panel reopened, displayed the error, and focused Furniture quantity. Removing the last item restored the description requirement; the retained description supported continuation.
- SMS: keyboard opening did not select consent. Explicit checking updated the summary; closing retained the selection. Reopening and unchecking restored no consent. The original disclosure/version and server consent tests remain unchanged.
- Photos: attached a local site illustration, closed the panel, and verified one attachment in review. An unsupported SVG produced a visible error while retaining the accepted image. Removal worked. No pickup was submitted.
- Inspected the revised desktop and mobile controls and checked narrow-width overflow. Browser error log was empty. The preview was cleared of test data afterward.
- Lint, TypeScript, all 22 existing tests, and production build passed. Tests include item validation, photos, step validation, mail content, and explicit SMS consent handling.

This was targeted browser and automated verification, not a full assistive-technology audit or customer usability study. Delivery was not exercised because this change does not alter the mail transport.

## Evidence limits

The standards and first-party design systems give strong accessibility and interaction principles. They do not prescribe the perfect layout or prove a business outcome for this brand. Baymard is original empirical research, but its purchasing context differs from local quote requests. Optional disclosures reduce initial visible content, while also creating a discovery cost; consequently required controls and core review information remain exposed. A short usability round with prospective residential and multifamily customers would be the appropriate next source of evidence once the implementation is ready, not an excuse to postpone the improvements already authorized.
