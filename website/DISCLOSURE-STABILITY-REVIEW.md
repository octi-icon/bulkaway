# Bulk Away disclosure stability and completion review

September 7, 2026. Fresh primary-source research and source inspection prompted by the user's two screenshots. This independent research task did not operate the browser, edit production code, run the build, or send a pickup request. Rendered reproduction and implementation belong to the main task and should be recorded separately.

## Assessment

The item list should expand in normal document flow immediately below “Choose items & quantities.” A jump to the bottom of that list is disorienting even if the actual DOM order is correct. The screenshots establish the symptom; they do not establish whether scrolling, focus, or positioning caused it. The most valuable refinement is to make that interaction predictable and verify similar disclosures, rather than add more illustrations or effects.

The site already offers an unusually coherent, optional set of playful interactions for this business: clearing demo items, an actionable haul list, service matching, geographic coverage exploration, quote preparation, and restrained sparkles. This is a design assessment, not a claim that no competitor uses comparable features.

## Evidence and hypotheses

1. **The item chooser is a disclosure, not a popup.** `components/pickup-form.tsx` renders `<details className="form-disclosure form-haul-list">`, then its `<summary>`, explanatory paragraph, item picker, and special-handling note. There is no opening callback that deliberately scrolls to the list's end. HTML defines summary as the disclosure caption and native activation as toggling its parent's open attribute. Keep the native semantics and content order. [HTML Living Standard](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element)

2. **Scroll anchoring is a plausible cause, requiring reproduction.** A browser may compensate for an expanding area above the current anchor by moving the page. Focused content is a priority anchor candidate. For example, an already-focused textarea below the disclosure could make the expansion appear to occur above the user. Only the hero demo currently sets `overflow-anchor: none`; the form does not. Test opening the list after typing in the textarea, after using the service selector, from a clean page, and through keyboard activation. Record `activeElement`, scroll position, and summary bounds before/after. The W3C specification also lists geometry/transform changes that suppress anchoring, so this is not a universal explanation. [CSS Scroll Anchoring specification](https://www.w3.org/TR/css-scroll-anchoring-1/)

3. **Do not revive the previously fixed hidden scroll container.** `app/atomic.css` already gives `.request` `overflow: clip`, with a comment explaining the earlier invisible scrolling caused by hidden overflow. `overflow: hidden` permits programmatic scrolling; clip does not create that same scrolling behavior. Preserve this distinction while investigating any remaining ancestors. [CSS Overflow specification](https://www.w3.org/TR/css-overflow/)

4. **Focus is a separate mechanism.** The form intentionally moves focus for step navigation, validation, and delivery feedback. None of these should execute simply because a user opens item choices. Inspect active-element changes in the reproduction rather than removing useful error/step focus. `focus({preventScroll:true})` can decouple focus from browser scrolling where that is actually intended. [MDN focus API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)

5. **The service dropdown has different positioning rules.** The site already supplies `alignItemWithTrigger={false}` to its Base UI select, which disables the library's default overlapping selected-item alignment; the wrapper requests bottom placement. A bounded popup can reasonably flip near an edge, unlike the inline item disclosure. Do not force a tall calendar or list beyond the viewport in pursuit of “always below.” Current online Base UI documentation is newer than the installed 1.7.0; confirm implementation against the installed package before changing APIs. [Base UI Select documentation](https://base-ui.com/react/components/select)

6. **A good performance score would not disprove this bug.** Google explains that layout shifts within 500 ms of qualifying input are excluded from CLS. Consequently, a fast but disorienting expansion can escape that metric. Check actual viewport stability across open/close actions, not just load performance. [Google: optimize CLS](https://web.dev/articles/optimize-cls)

## Recommended fix boundary

- Establish one reproducible trigger and an explicit before/after measurement before changing behavior.
- If browser anchoring is confirmed, prefer a narrow exclusion of the affected dynamic region over disabling anchoring for the entire document. Verify that focus, step navigation, and ordinary scrolling still work.
- Keep the summary visible and the first revealed content directly beneath it. The first new item should be reachable with the next appropriate Tab steps. Enter and Space must retain native disclosure behavior. [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
- Do not turn every disclosure into a dialog or automatically scroll to the end. Do not smooth-scroll after every toggle: that hides the underlying issue and adds another moving target.
- Retest item choices, photos, nested photo tips, review/edit, SMS details, service finder, preparation checklist, and FAQs. Include closing as well as opening.
- Preserve progressive disclosure for optional information. The normal request path can use a written description instead of choosing items; photos and preparation remain optional. Required conditions should stay discoverable in the normal path. [GOV.UK details guidance](https://design-system.service.gov.uk/components/details/)

## Fresh source review of shipped experience

This table is source inspection, not a claim of new browser testing for every state.

| Area | Inspected behavior / completion criterion |
| --- | --- |
| Header / mobile navigation | Outside pointer, focus leaving the header, Escape, and desktop breakpoint close the menu. Escape restores the trigger. Verify tabbing through it and resizing with it open. |
| Hero / clutter demonstration | Existing artwork has declared dimensions; the main logo receives high fetch priority. Clearing, undo/reset, and completion provide purposeful feedback. Keep decorative movement out of the layout anchor calculation. |
| Global sparkles / motion | Click effects cap concurrent bursts at three and clear timers. Inputs, textareas, dialogs, disabled targets, hidden documents, reduced motion, and manually paused motion are excluded. Shared motion state survives route changes. |
| Service tabs / finder | Five service options match the offered scope; tab keys/focus are implemented, and the finder routes toward those options. Keep service choice separate from a confirmed appointment. |
| Haul builder / item picker | Six selectable item types with contextual 1–999 quantity controls, pressed states, labels, and invalid feedback. The same state appears in the request; no separate text-only approximation. Main new regression target is expansion geometry. |
| County explorer | Four named counties, pressed state, explicit feedback, and supplied geographic SVG. Existing accurate boundaries are retained; a new decorative map is unnecessary. |
| Preparation checklist | Three optional checks, completion feedback, reset, and a direct request link. It remains independent of submitting the form. |
| Form steps / validation | Three named steps; fields remain mounted with inactive steps hidden. Invalid fields inside disclosures are revealed before focus. An opening action must not accidentally invoke these navigation paths. |
| Service select / date picker | Accessible labels, error association, bounded overlay styling, keyboard date help, optional clearing, and Utah-derived minimum date. Verify bottom-edge and short-viewport opening, selection, Escape, and return focus. |
| Photos | Explicit limits, client rejection, preview object URLs with cleanup, named remove controls, and safety guidance. Nested photo tips need the same no-jump check as the main list. Server delivery/metadata processing is covered by existing separate tests, not new research claims. |
| Submission states | Disabled sending state, validated receipt reference, retained draft on failure, email/call fallback, and “not booked yet” language. Do not send live mail simply to verify a visual change. |
| FAQ | Six native disclosures with visible captions and short answers. Expansion animation should settle into fully readable text and stop under reduced motion/pause. |
| Brand family | WSI, valet, pet waste, and AEPOC are correctly positioned in current copy; AEPOC emphasizes business strategy/design. Draft-safe links preserve in-progress requests in a separate tab with an explanatory note. |
| Privacy / SMS | Content pages share motion and cookie controls, with no invented live portal or SMS signup. Policy links in request contexts protect draft state. Legal correctness is not certified by this UX audit. |
| Cookie dialog | Existing preference controls and policy-reading behavior are separate from request submission. Check focus containment and return; do not add analytics or tracking as a refinement. |
| Floating request shortcut | Suppressed around hero, request, and footer; dismissible and hidden after completion/sending. Confirm it does not cover footer controls at small viewport heights. |
| 404 | Branded heading, home/request links, and direct contact fallback; shared controls remain available. No replacement illustration needed. |
| Images / icons | Main page/illustration components declare image dimensions; below-fold art is lazy-loaded. Icons accompanying text are mostly explicitly decorative. Real team photography is owner-supplied later; do not substitute fabricated team claims. |
| Performance / navigation | Precompression remains enabled in build command. Shared experience manages new-path entry separately from history navigation. Keep existing stylesheet savings; do not add an animation package for this fix. |

## Motion and performance criteria

The site's optional motion can support the brand, but it must not obscure essential choices or force customers to wait for input controls. WAI's animation-from-interaction criterion supports disabling nonessential interaction-triggered animation; preserve both system preference handling and the user's pause control. This is a criterion-specific observation, not a full accessibility certification. [WAI animation guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

Google recommends diagnosing specific slow interactions and distinguishing input delay, handler work, and presentation delay. Field data is ideal; local flow testing is useful when it is unavailable. A smaller compressed stylesheet is worthwhile, but does not establish real-device responsiveness. For this change, avoid repeated layout reads/writes or continuous scroll handlers; compare only the interaction being corrected. [Google: optimize INP](https://web.dev/articles/optimize-inp)

## Completion record boundary

The main task should append the reproduced cause, exact implemented fix, viewport/input combinations exercised, and final build/test output. This report intentionally does not declare the screenshot defect fixed. Existing tests and earlier review notes are useful regression coverage, but cannot substitute for observing the disclosure stay in place in the current build.

### Main-task reproduction evidence

The main task reported an exact reproduction at **522 × 791**: after typing in the notes textarea, the collapsed item summary was at viewport y **380.86**, with page scrollY **6972** and the textarea active. Clicking the summary expanded the list and moved page scrollY to **7566.4**, placing the summary at **−213.54**. The unwanted displacement was **594.4 px**. The same toggle before typing did not jump. This supports the focused-content scroll-anchoring hypothesis. A narrowly scoped `.pickup-form { overflow-anchor: none; }` is being evaluated by the main task; it is not yet recorded as a verified fix here.

## Completed implementation and verification

### Cause and final fix

The native item disclosure already places its content after its summary. The defect was the viewport jumping over that content, not reversed DOM order. A form-subtree-only anchoring exclusion was tested and rejected: the browser still moved the viewport, consistent with selecting an anchor outside the excluded subtree. The final rule is `html:has(.pickup-form:focus-within) { overflow-anchor: none; }`, scoped to editing the request form. It prevents viewport anchor compensation while interacting with the form, and normal anchoring returns when focus leaves it. Native details, keyboard behavior, field validation focus, and page scrolling remain in place. No timers, scroll listeners, or forced scroll-to-top handler were added.

Also removed the bulk-removal hint's unconditional sentence claiming selected quantities were already included. It appeared even when no items were selected; the remaining hint still asks for useful item-size/access information.

### Actual browser evidence

- At the user's 522×791 viewport, the previous typing-then-pointer-opening sequence pushed the heading above the screen. With the final rule, pointer opening showed the heading at about y382 and the first choices directly below it. Automation can reposition its target before pointer activation, so this is a visibility result rather than a claim of zero pointer-induced positioning in every browser.
- At 390×844, typed notes, moved back to the summary with Shift+Tab, and pressed Enter. Before and after: scrollY **7468**, summary y **408.0625**. The first item appeared at y **533.7375**. This directly verifies zero unwanted scroll movement in that keyboard sequence.
- Photo disclosure closure: scrollY **7767.2002** and summary y **408.1688** were unchanged. Review disclosure closure: scrollY **7732.3999** and summary y **408.0750** were unchanged. Opening SMS after typing an email left its summary visible at y **409.1750** with the content below it.
- Checked the desktop form at 1440×1000. The expanded heading, explanatory text, two-column item choices, and notes appeared in their intended order, with the heading in view.
- All six FAQ answers opened. Computed root anchoring returned to `auto` outside the request form. Privacy, SMS, and 404 were opened after the final build: each had a heading, resolved internal anchors, no observed horizontal overflow, and normal anchoring. These checks supplement the report's source review of all shipped components and the explicitly recorded prior image, interaction, delivery, and responsive checks.

### Final checks and boundaries

All 26 existing logic tests passed, as did lint, TypeScript, the final precompressed production build, and HTTP verification for routes/assets, gzip/Brotli content integrity, immutable caching, validation, limits, and invalid-photo rejection before delivery. Performance changes from the preceding pass remain intact; this fix adds only a conditional CSS rule. No new illustration or animation was justified by the broader source review.

No real email was sent, and no SMS integration or deployment occurred. Render email/attachment verification and public indexing remain launch work. This is verified evidence for the reported regression and documented paths, not a blanket guarantee for all browsers, assistive technologies, or interaction sequences.

### Repeatable acceptance check

1. Start a request, choose Bulk item removal, and type in Give us the scoop.
2. Activate Choose items & quantities by pointer; confirm its caption stays in view and Furniture/Mattresses begin below it.
3. Close it, focus the notes, Shift+Tab to the caption, and press Enter; confirm the viewport stays still.
4. Check photo/review/SMS disclosures after entering fields. Their captions remain above their contents.
5. Leave the form for FAQ or a policy page; normal page navigation and motion controls continue to work.
