# Bulk Away: clearer hierarchy, useful play

Research completed September 7, 2026, before the second engagement implementation. This report extends `ENGAGEMENT-RESEARCH.md`; it does not repeat the earlier feature list as new work.

## What exists and what is still missing

Reviewed the first research report and the current `interactive.tsx`, `engagement.tsx`, `atomic-experience.tsx`, and `pickup-form.tsx` components. Bulk Away already offers sitewide click sparkles, a clear-away hero demo, an accurate interactive county map, service tabs, shared selectable haul items with quantities, preparation checkboxes, photo tips, a family-brand finder, a three-step request, and a genuine-response success celebration. It has ample ambient personality. Another independent widget in every section would compete with these features.

The remaining opportunity is to connect exploration to useful next steps: help visitors recognize their service, explain what the crew needs for that service, return mobile visitors to an unfinished request, and give the hero demo a satisfying, reversible outcome. The hero's exact proportions require visual review across viewports; no published source can prescribe a scientifically correct pixel ratio for this particular artwork and typeface.

Evidence below describes what primary sources say or what a first-party page exposes. Applications are design inferences for Bulk Away, not measured conversion, ranking, or accessibility-conformance outcomes. No new prices, service availability, acceptance promises, response deadlines, or operational integrations are supported by this research.

## Primary-source findings

### 1. Make the headline and action win the hero's hierarchy

**Evidence:** NN/G identifies contrast, scale, and proximity as tools for communicating an intended order of importance. It describes similarly prominent, tightly packed elements as a source of visual clutter. **Application:** judge the complete hero, not only the logo's width: headline and primary pickup action first; supporting copy second; the interactive sign as the visual reward. Reduce competing badge/chip scale where necessary and maintain distinct groups of copy, actions, trust statement, and demo. Responsive adjustments should retain readable controls rather than uniformly shrink the whole scene. [NN/G: Visual Hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)

### 2. Guidance must earn its extra steps

**Evidence:** GOV.UK's suitability pattern is for complicated eligibility, and explicitly advises against it when start-page information can reasonably explain the service. It also advises against asking questions that must be repeated later. **Application:** Bulk Away needs an optional plain-language service finder, not a mandatory eligibility quiz. A single question with at most one related follow-up can clarify bulk pickup versus property trash outs versus recurring community service. Keep the five service tabs directly usable. [GOV.UK: Check a Service Is Suitable](https://design-system.service.gov.uk/patterns/check-a-service-is-suitable/)

### 3. One clear question and short hints

**Evidence:** GOV.UK question-page guidance ties headings to the question at hand and recommends short hint text. Long hints can burden screen-reader users. **Application:** introduce the optional finder with a concrete question such as “What needs a fresh start?” and concise choices. Avoid a lengthy onboarding modal, percentage scores, or jargon such as property segmentation. Keep service-specific form hints to a short sentence or compact list. [GOV.UK: Question Pages](https://design-system.service.gov.uk/patterns/question-pages/)

### 4. Conditional questions need simple behavior

**Evidence:** GOV.UK documents related questions revealed by radio choices, but cautions against complex conditional content and notes known notification issues. Its radio component recommends conditional reveals for questions, not arbitrary hidden content. **Application:** if a property selection needs one follow-up, use a plainly labeled native radio group and a stable result area. Do not nest multiple hidden question levels or assume copying a design-system pattern guarantees accessibility. Another valid simpler implementation is direct situation buttons selecting a visible service panel. [GOV.UK: Radios](https://design-system.service.gov.uk/components/radios/)

### 5. Choosing is different from leaving

**Evidence:** WCAG's On Input explanation distinguishes ordinary content updates from unexpected changes of context caused by input. **Application:** exploring a service can update a result beside the choices. It should not automatically jump to the form, submit anything, or move focus away from the selected control. A separate, clearly named action applies the suggested service and takes the visitor to the request. [WAI: On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)

### 6. Helpful information belongs beside its input

**Evidence:** WAI recommends relevant instructions, required/optional indications, and programmatic association of field guidance. It notes that placeholders vanish during entry and are often lower contrast. **Application:** adapt the persistent notes hint to the chosen service: bulky items need quantities and access; trash outs need scope and item location; weekly service needs site/enclosure information; chute rooms need the number/location of rooms; donation requests need the items and condition for acceptance review. Keep the actual label and typed notes unchanged. Associate concise instructions with the textarea. [WAI: Form Instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)

### 7. Keep longer help optional

**Evidence:** GOV.UK's details component reveals secondary help on request. **Application:** preserve the current photo tips and checklist as optional disclosures; do not turn every service hint into another expanded card. Essential quote/acceptance limitations remain visible. [GOV.UK: Details](https://design-system.service.gov.uk/components/details/)

### 8. Preserve effort across shortcuts

**Evidence:** WCAG Redundant Entry addresses information already entered or provided in the same process, with stated exceptions. **Application:** service selection and return-to-request controls must preserve item quantities, notes, address, photos, and contact details. A mobile action returning to a request should not dispatch the existing `bulk-items` event, which deliberately returns to step one. Navigating back to an existing form should retain its current step. [WAI: Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)

### 9. A mobile persistent action has a cost

**Evidence:** NN/G advises keeping sticky interface elements small because they consume space otherwise available to content, especially on mobile. It discusses partial persistence as a tradeoff. **Application:** a compact return-to-request affordance may help on this long page, especially after list building, but show it only outside the request area and after the main hero action has passed. Do not add a full-width, multi-row sales banner to every screen. [NN/G: Sticky Headers](https://www.nngroup.com/articles/sticky-headers/)

### 10. Persistent UI cannot cover keyboard focus

**Evidence:** WAI identifies sticky headers, footers, and cookie banners as common causes of obscured focus; scroll padding is one possible mitigation. **Application:** hide the mobile return control when the request or privacy dialog/banner occupies the viewport, allow for safe-area insets and page-bottom space, and test focused controls near the bottom edge. A floating button is not safe merely because it is small. [WAI: Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)

### 11. Observe visibility without a continuous scroll workload

**Evidence:** MDN describes Intersection Observer as asynchronous observation of element intersection, avoiding repeated main-thread geometry polling for common visibility use cases. **Application:** use a small number of observers to decide whether the hero/request is visible. Do not introduce a global scroll handler that continuously sets React state or calculates every element's position. [MDN: Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

### 12. Reversibility makes exploration easier

**Evidence:** NN/G's user-control heuristic calls for clear ways to backtrack, cancel, and undo. **Application:** the hero demo already has Reset; adding “Undo last” after the first removal lets visitors experiment without replaying all three actions. Keep a clear “2 of 3 cleared” state and restore the relevant item's keyboard focus on undo. A service finder should offer “Change my answer” or Reset without clearing the real request. [NN/G: User Control and Freedom](https://www.nngroup.com/articles/user-control-and-freedom/)

### 13. Distinguish toy completion from request completion

**Evidence:** GOV.UK confirmation guidance includes what happened, a reference if one exists, what happens next, and contact information. **Application:** after the demo clears, offer an explicit “Make room for real” pickup link while retaining the word preview. Do not imply the demo placed a request. The real form's existing success state must remain dependent on the server response, with a reference and team-confirmation caveat. A fake receipt, arrival countdown, or delivery progress meter would obscure that distinction. [GOV.UK: Confirmation Pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)

### 14. Give persistent feedback, announce sparingly

**Evidence:** WAI Status Messages covers programmatically exposed action outcomes, waiting, progress, and errors without unnecessary interruption. **Application:** use a short polite hero progress message or service match announcement; do not announce every decorative star, make all dynamic panels assertive, or narrate every pointer interaction. Visible text and selected states must explain the action even with animation disabled. [WAI: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

### 15. Reserve motion for the state change

**Evidence:** NN/G describes subtle motion as useful feedback and warns that irrelevant movement captures attention away from tasks. **Application:** a brief service-match light or undo return transition can reuse the atomic visual language. No additional marquee, auto-rotating claim, continuously traveling truck, or time-filling loader is needed. [NN/G: Animation Purpose](https://www.nngroup.com/articles/animation-purpose-ux/)

### 16. Motion control and rendering efficiency are separate duties

**Evidence:** WAI's Animation from Interactions criterion addresses disabling nonessential interaction motion; it is Level AAA. web.dev recommends transform/opacity animation where possible and caution with costly rendering effects. **Application:** honor both Bulk Away's Pause control and system reduced motion, with stable final states. Keep any new effects bounded and local; no animation package, whole-section blur, or pointer-following scene is justified. This is an implementation target, not an assertion that the complete site meets AAA. [WAI: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [web.dev: Animation Guide](https://web.dev/articles/animations-guide)

## Current first-party examples, interpreted narrowly

- **Taskrabbit:** its service index groups recognizable customer tasks, including one-item moving, couch removal, and office tasks. The transferable idea is concrete situation language; Bulk Away's verified catalog is much smaller and should not inherit Taskrabbit's services. This observation does not establish that Taskrabbit's interface is optimal. [Taskrabbit: Services](https://www.taskrabbit.com/services)
- **Retool:** its current homepage exposes an app-builder prompt and starter prompts near the top. The relevant idea is helping someone begin a meaningful task through examples. Bulk Away should use bounded, deterministic service choices, not imitate an AI assistant. [Retool](https://retool.com/)
- **Overpass:** the current first-party page organizes work examples, named services, and contextual “See more” paths. Its claims/testimonials are its own and are not evidence of outcomes for Bulk Away. The useful translation is a clear route from a visitor's need to the relevant service detail, while maintaining distinct brand presentation. [Overpass Studio](https://www.overpass.studio/)

The attempted commercial-service URLs for 1-800-GOT-JUNK? and Junk King could not be retrieved in this pass and were not used as evidence. This research did not operate competitor widgets or verify their interactive behavior in a browser.

## Implementation shortlist

1. **Rebalance the hero as a whole.** Root task to inspect desktop, tablet, and narrow phone views: reduce oversized competing sign/badge elements where needed, preserve chip hit areas, strengthen grouping of headline/copy/action/trust, and provide consistent space around the demo. Do not add a second illustration to the hero.
2. **Optional service finder.** A compact “Find your fresh start” disclosure or inline panel with plain-language choices. Suggested mapping: individual bulky items → Bulk item removal; property left-behinds → Trash outs; recurring community buildup → Weekly bulk service; a blocked chute-room area → Chute room clear outs; donation/recyclable items → Donations & recyclables. If splitting household/property requires two questions, retain a simple back action and never ask more than one follow-up. Show a suggested service and reason, with explicit explore/request actions. Keep the original catalog visible and usable independently.
3. **Contextual form hints.** Use the selected service to provide relevant examples without creating required fields, replacing notes, or changing accepted service values. Use accurate guidance only; no promised response time, price, capacity, or acceptance determination.
4. **Mobile request return.** Compact native link, optionally showing the number of selected items, outside the hero/request areas. It returns to the currently active form state. Hide it around cookies/dialogs and when the request itself is visible. Retain readable targets, safe area, focus visibility, and a static no-motion version.
5. **Hero progression and reversible play.** Persistent progress, Undo last, existing Reset, and a real-request CTA after clearing. The copy must clearly identify the demo. Keep keyboard focus correct as buttons disappear/reappear; no auto-navigation or accidental form selection.

These are the complete recommended additions for this round. More interactions should wait for observation of actual customers using these flows. “Implement everything” should mean this coherent chosen set, not all possible ideas or every pattern observed in references.

## Ideas rejected for this round

- Required service quiz or a separate long questionnaire: duplicates an existing small service catalog and adds friction.
- Pricing, truck-load, or carbon-savings calculator: no verified operational model or rates.
- Drag-and-drop junk game, 3D truck loading, or mandatory swipe gesture: difficult equivalence for keyboard/touch, poor task value compared with existing quantity controls.
- Persistent chat bubble, countdown, invented dispatcher, fake live booking: operational capabilities are not connected.
- Automatic phone/geolocation prompts, visitor-name personalization, local-storage drafts, or new analytics: not needed for these local interactions; persistence introduces additional privacy and lifecycle concerns.
- Auto-playing audio, haptics requirement, magnetic controls, scroll hijacking, extra orbiting objects: compete with an already lively page and reduce predictability.
- Automatic external-brand navigation or hover-only tooltips: visitors need explicit controls and usable touch/keyboard equivalents.
- Another large generated illustration: current hero, crew, doorway, and map already establish the visual world. Improve their hierarchy and functional context first.

## Verification gates

- At 320/390px, tablet, and desktop widths: no horizontal overflow; no clipped script; primary action and service purpose read clearly; demo controls remain tappable in every state. Inspect initial, partially cleared, and fully cleared hero states.
- Every finder branch maps to an existing service string. Selection only updates local exploration; an explicit action alone applies it to the form. Cancel/reset does not change entered request data.
- Keyboard controls have visible focus; focus does not jump on ordinary selections; Undo restores the intended demo item; Reset restores all items. Test repeated undo/reset, not just the happy path.
- Form hints remain associated with fields, visible after typing, and concise. Changing services preserves notes, quantities, photos, address, contact values, and consent choices.
- Mobile return action retains current form step and is absent while request/privacy UI is visible. Test cookie banner open, privacy dialog open, bottom-page links, keyboard focus, and narrow landscape if possible.
- Reduced motion and the site Pause control disable new movement without hiding meaningful feedback. No unbounded timers, nodes, loops, or recurring announcements.
- Pure service routing should be unit-tested because the wrong mapping changes a customer's request. Run existing form tests, typecheck, lint, and production build after integration.
- No real email/SMS test, deployment, live booking, or new tracking is required to validate these improvements. Use controlled success behavior only if changing the existing submission presentation.
- Record what was actually verified after implementation. No field engagement/conversion measurement or complete assistive-technology audit has been performed by this research.

## Implementation and verification — September 7, 2026

All five shortlisted improvements are implemented. The hero review found that the headline/sign composition was sound, but supporting instructions were too small, mobile spacing was accumulated across overrides, and the 1100px breakpoint enlarged the heading and artwork unexpectedly. The revised heading scales continuously (82.5px at 1100px; 82.59px at 1101px), the desktop sign stays at 88% with a 560px maximum, and mobile grouping uses deliberate spacing. The demo instruction sits above the artwork with no fin overlap. Original artwork, brand fonts, logo vectors, and the existing sparkles remain.

The optional service finder uses native pressed buttons, one community follow-up, a stable result announcement, and separate explore/request actions. Service-specific notes guidance is persistently visible and associated with the textarea through `aria-describedby`, separate from its short label. The mobile shortcut returns to the current form step; it does not dispatch an event that resets the form. Demo progress, Undo, Reset, and the completion request link are implemented without changing the real haul list.

Verified in the local production preview:

- Inspected desktop hero rendering at 1280×720 and 1440×1000, narrow phone rendering at 320×780 and 390×844, and DOM sizing at the 1100/1101px boundary. No horizontal overflow at those inspected widths. Corrected an instruction/artwork overlap found during review.
- Cleared all three preview items, restored the most recent item with keyboard Undo, and restored the initial state with keyboard Reset. Focus returned to the intended item. The real-request link appears only after clearing. Direct coordinate pointer clicks confirmed that all three can clear without moving the page; locator-based automation itself scrolled while positioning the last target, so that movement was not treated as evidence of a remaining application focus jump.
- Selected shared waste areas → recurring bulk buildup. The request service stayed empty until an explicit request action. “See service details” selected Weekly bulk service and focused its panel. “Request this service” selected the matching form service. Keyboard finder reset returned focus to its first choice.
- Typed distinct request notes, advanced to step two, browsed the family section, then used the mobile return shortcut. Step two and the exact notes were retained. The shortcut disappeared when the request area was visible.
- Verified the mobile shortcut was visible outside the hero/request, hidden while the cookie dialog was open, and removable with its dismiss button. Narrow rendering remained within the viewport.
- Checked the site's Pause motion control and stable demo feedback. Reviewed reduced-motion rules for the new summary-icon transition. This was not a device-level reduced-motion or full screen-reader audit.
- Lint and TypeScript checks passed; all 22 tests passed, including service routing, form validation, quantities, photo processing, and consent records. The production build completed successfully. The inspected browser error log was empty.

No new animation dependency, tracking, draft storage, real email/SMS submission, or deployment was added. No conversion uplift, SEO ranking gain, or full WCAG conformance is claimed. The remaining launch dependency is the existing operational configuration, including Render email credentials; this round changes on-page guidance and interaction only.
