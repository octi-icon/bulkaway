# Bulk Away: useful moments of play

Research date: September 7, 2026. Research was completed before implementation. The integration record below documents the selected additions now running in the local production preview.

## Scope and current experience

The existing site already has a three-item clear-away demo, click sparkles, a word burst, twinkling stars, motion controls, a service tab panel, a three-step request form, optional photos, submission feedback, and expandable FAQs. The next additions should give visitors useful choices and tangible progress rather than layer another animation onto every section.

Reviewed source: `app/page.tsx`, `components/interactive.tsx`, `lib/county-map.ts`, and the previous `FLOURISH-RESEARCH.md`. Current services, county coverage, and family relationships come from the user's confirmed scope and the site, not from competitors. No research here establishes a conversion lift, ranking benefit, or WCAG conformance claim for Bulk Away.

## Evidence from primary sources

Each **evidence** statement describes the linked source. Each **application** is our design inference for this site.

1. **Progressive disclosure.** Evidence: NN/G recommends presenting important options first and exposing specialized options on request. It also cautions that overly deep disclosure and poorly labeled paths cause problems. Application: use a compact, optional situation picker to reach existing service information; do not hide the entire service catalog behind a mandatory quiz. [NN/G: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)

2. **Immediate, understandable feedback.** Evidence: NN/G describes appropriate feedback as a way to show that an action registered and communicate current system state. Application: a selected county, matched service, or checked preparation item should receive a persistent visible state; sparkles alone cannot confirm a meaningful choice. [NN/G: Visibility of System Status](https://www.nngroup.com/articles/visibility-system-status/)

3. **Service tabs.** Evidence: the APG defines selected tabs, associated panels, roving keyboard focus, and orientation-sensitive arrow navigation. Automatic activation is recommended only when panels are available without noticeable latency. Application: preserve the existing service explorer's keyboard behavior and local content. Situation shortcuts may select an existing tab rather than create a second service-information system. [WAI APG: Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

4. **Native task checkboxes.** Evidence: the APG describes checked/unchecked states, accessible labels, group labels, and Space-key activation. Application: a quote-prep checklist should use real labeled checkbox inputs in a fieldset. A checkmark can look like a retro inspection stamp without replacing native behavior. [WAI APG: Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)

5. **Optional detail reveal.** Evidence: a disclosure has a control and an expanded/collapsed state, operable with Enter and Space. Application: secondary preparation guidance can live in a short disclosure, but essential service limitations and actual contact routes stay available. Native details/summary is suitable when no custom behavior is needed. [WAI APG: Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

6. **Buttons versus navigation.** Evidence: the APG distinguishes action buttons from navigation links and specifies stable labels and pressed states for toggle buttons. Application: county or family filters should be buttons with meaningful selected states. Visiting another WSI brand remains an ordinary, explicitly labeled link, not an automatic side effect of exploring a category. [WAI APG: Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

7. **Map target alternatives.** Evidence: WCAG 2.2's target-size minimum is 24 by 24 CSS pixels, subject to stated exceptions; WAI recommends larger targets where practical and equivalent alternatives for dense spatial presentations. Application: retain the accurate county geometry but provide large named county controls alongside it. Narrow Davis County should not be the only way to select Davis. Use approximately 44px minimum control heights as a project design target, not a claim that AA requires 44px everywhere. [WAI: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

8. **Selection cannot rely on color alone.** Evidence: WAI requires that color not be the only visual means of conveying information or prompting a response. Application: map selection also needs a label, outline or marker, and matching selected control; service and family selections should have text/state semantics in addition to lime or gold. [WAI: Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)

9. **Status announcements.** Evidence: WAI describes programmatically exposed status messages that can be announced without taking focus. It warns that excessive live regions can become too chatty and distinguishes tab/disclosure state changes from status messages. Application: announce concise checklist progress or confirmed submission status where useful. Do not put whole service panels, every sparkle, or all county prose into assertive live regions. [WAI: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

10. **Multi-step orientation and preservation.** Evidence: WAI recommends identifying progress through a multi-page form and allowing review of completed steps while preserving entered data. Application: protect the existing three-step form, focus movement, backward navigation, and photos when integrating shortcuts. A checklist must remain optional and cannot become a fourth required step. [WAI: Multi-page Forms](https://www.w3.org/WAI/tutorials/forms/multi-page/)

11. **Interaction-triggered motion.** Evidence: SC 2.3.3 (Level AAA) allows users to disable nonessential motion from interaction; WAI discusses both a site control and the operating-system reduced-motion preference. Application: any new stamp, highlight sweep, or scene transition must have a complete static state under both existing motion mechanisms. This is a design target and does not certify the whole site at AAA. [WAI: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

12. **Autoplay restraint.** Evidence: SC 2.2.2 addresses automatically starting moving/blinking/scrolling information lasting more than five seconds alongside other content, requiring a pause/stop/hide mechanism unless essential. Application: avoid introducing another autonomous carousel or continuously moving route truck. Existing pause controls must continue to govern the page's ambient movement. [WAI: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

13. **Cheap animation properties.** Evidence: web.dev recommends transform and opacity where possible, warns against layout/paint-heavy properties, and discourages speculative layer promotion with will-change. Application: short local transitions need no animation library or continuous JavaScript loop. Do not animate county geometry, blur an entire section, or introduce pointer-following React updates. [web.dev: High-performance CSS Animations](https://web.dev/articles/animations-guide)

14. **Responsiveness measurement.** Evidence: INP observes click/tap/key interactions through the next paint. A field 75th-percentile INP of 200ms or lower is the good threshold; hover and scrolling alone are not INP interactions. Application: test real selections and typing, and check bundle growth and work per action. A fast local demo or successful build cannot establish field INP. [web.dev: Interaction to Next Paint](https://web.dev/articles/inp)

15. **An established service-site discovery pattern.** Observation: 1-800-GOT-JUNK?'s first-party item page exposes recognizable item categories and an item lookup prompt, plus visible acceptance limits. This is evidence of its interface, not evidence of superior conversion. Application: Bulk Away can make furniture/property/weekly-service situations recognizable while retaining its own verified offerings and custom-quote caveats. Do not import this competitor's acceptance claims, prices, service inventory, or copy. [1-800-GOT-JUNK?: What We Take](https://www.1800gotjunk.com/us_en/what-we-take)

## Implementable shortlist

### 1. Service discovery: “What's taking up space?”

Add an optional haul-list builder near the existing service explorer. Recognizable item buttons can include furniture, mattresses, appliances, electronics, and tires, restricted to the existing confirmed copy. Each selection stays visibly selected and updates a short item summary. The explicit “Use this list in my request” action transfers that summary into the existing form. It must append or otherwise preserve typed notes instead of silently overwriting them. Selection alone sends nothing.

This is an interface for describing a request, not acceptance approval or a cart with fixed prices. Keep special handling/custom-quote information alongside mattresses, refrigerators, electronics, and tires; do not generalize the competitor's appliance list into Bulk Away's scope. Retain the existing service explorer independently for property trash outs, weekly service, and chute rooms. An optional situation shortcut can select an existing service tab, but omit it if it merely duplicates that menu.

### 2. Service area: an interactive county map

Keep the existing connected north-up map and the State of Utah boundary attribution. Add four large county buttons in geographic order: Weber, Davis, Salt Lake, Utah. Selection emphasizes the corresponding county in its real location and displays “Yes, we serve [county]” plus an explicit quote-request link. This makes the geography personally relevant without inventing travel times, local prices, or a live availability map.

All paths must use the same transform/viewBox. No separating, enlarging, morphing, or independently rotating a county on selection. If the SVG itself is clickable, named buttons provide equivalent keyboard and touch control. Selection should not cause navigation until the visitor chooses the CTA. Avoid a geolocation permission prompt and do not claim that a county click validates a street address.

### 3. How it works: a “Pre-flight check” for the quote

Offer an optional, compact three-item checklist after the process steps: list what needs to go; note stairs/access and item location; take optional photos if convenient. Use factual quote preparation, not instructions to move heavy furniture or promise universal acceptance. Label progress “2 of 3 tips checked” so it cannot be mistaken for a booking milestone.

The completed state can show a small static “Ready for your request” stamp and a direct request CTA. Native checkboxes, reversible choices, and a reset support experimentation. Keep progress in local component state; no account, analytics, persistent storage, or information transmission is necessary. State explicitly that photos and the checklist are optional. Do not gate the main form.

### 4. Family: “What else can we help with?”

Make the family relationship navigable by need: doorstep trash/recycling, pet waste, and design/software. Choosing a need spotlights the matching existing brand card and its live link. Preserve the logos and accurate descriptions. All brand cards and links can remain visible, with a reset to show the whole family equally.

This turns the section into useful cross-brand discovery. Do not rotate brands automatically, hide names behind card flips, imply a shared booking portal, or send visitors off-site merely because they click a selector. AEPOC's graphic/software design role for the family remains explicit.

### 5. Form feedback: strengthen what is already true

The current step count, review, optional photo previews, and “MESSAGE AWAY!” success state already provide several strong interactions. Preserve those. If adding a visual dispatch receipt, populate it only from the actual successful response and submitted request, and retain that date/price are subject to team confirmation. Keep error details visible and entered data intact. No simulated countdown, fake availability, invented arrival time, or automatic text-message confirmation.

A compact “Photo tips” disclosure can explain framing the items and showing access constraints while keeping the upload visibly optional. Do not ask users to include people, private documents, or move heavy objects for a picture. A footer “Back to lift-off” link may add brand voice to ordinary in-page navigation; use a meaningful accessible name such as “Back to top,” keep native linking behavior, and disable smooth movement when motion is reduced. These are low-cost companion improvements, not evidence-backed conversion claims.

## Exclusions and reasons

- No pricing/volume calculator: no confirmed public rate model or sizing rules exist here.
- No full-screen game or obligatory quiz: it would obstruct the primary request flow.
- No additional constant background movement, scroll hijacking, magnetic buttons, sound, or 3D scenes: the site already has ambient motion, and these add little task value.
- No animated map distortion: geographic fidelity is an explicit user requirement.
- No “live” dispatcher, truck tracker, chatbot, or booking calendar: those services are not connected.
- No badges claiming certification, guaranteed donation/recycling, or unverified same-day availability.
- No third-party tracking or persistent checklist state just to measure the new interactions.
- No claim that implementing these patterns improves SEO or conversions; those outcomes require separate evaluation.

## Validation criteria for integration

1. Desktop, tablet, and narrow mobile: no horizontal overflow, clipped labels, huge empty map margins, or crowded controls. Check text enlargement and reflow as well as viewport presets.
2. Keyboard: every new action operates with expected keys; tab order is logical; visible focus survives state changes. No hover-only information and no unintentional focus jumps.
3. County map: compare path data/viewBox and shared transforms to the current official-boundary source. Selection must not modify geometry, relative size, order, or orientation. Named controls expose the same selection as the map.
4. Selection: a persistent non-color cue and programmatic state identify the active choice. Check normal, hover, focus, and selected contrast on both cream and ink backgrounds.
5. Checklist: unchecked/checked/reset work; completion never changes request status; all main form fields remain available regardless of progress.
6. Form integration: selected service matches the existing enumerated service value; back/edit retain contact details, address/date, notes, and photos; optional consent remains unchecked unless the visitor explicitly checks it.
7. Motion: verify both system reduced motion and the site's Pause control. Static final states remain visible and understandable. No extra requestAnimationFrame or scrolling listener is required for these recommendations.
8. Performance: compare production bundle output before/after; prefer existing icons, SVG paths, and local state. Exercise repeated selections and typing without unbounded nodes/timers. Document field INP as unmeasured until real-user data exists.
9. Semantics: check the accessibility tree for named buttons, checkbox labels, and selected states. Live regions announce meaningful progress sparingly; decorative sparkles remain hidden from assistive technology.
10. Truth and side effects: exploratory actions send no email/SMS, create no booking, request no location, and write no unnecessary storage. Verify successful-submission presentation with a controlled response; do not send a real customer request merely to test decoration.

## Research limits

This review used first-party interface observations and primary accessibility/performance guidance. It is not a moderated usability study or a complete accessibility audit. The Junk King services URL was attempted but returned an error and is not evidence in this report. Parent-task research may add a separate evaluation of the user's visual reference sites; it should distinguish observed design choices from proven outcomes in the same way.

## Integration and verification — September 7, 2026

**Follow-up: editable quantities.** The original text-transfer behavior documented below was superseded at the user's request. The service-area builder and request form now share one selectable haul list, with editable whole-number quantities (1–999), plus/minus controls, and removal by deselecting. Selections remain separate from written notes, appear in the final review, and are validated on the server and included in the crew email. Notes are optional when a valid list is present; descriptions remain available for unlisted items. The quantity list is locked during sending. No persistence or external service was introduced. Desktop/mobile checks confirmed bidirectional synchronization, quantity validation/focus, item removal, review rendering, and note preservation. The revised 19-test suite, lint, TypeScript, and production build pass; no live email was sent. The bundle figures and append-to-notes tests below describe the earlier integration, not this follow-up.

Implemented the selected set, preserving the site's existing clear-away demo, sparkles, service tabs, three-step request, real-response submission celebration, and brand assets:

- **Haul-list builder:** six selectable item categories with persistent checkmarks, a count, and explicit transfer into the request. Known labels append to notes, repeated transfers do not duplicate lines, and an oversized addition is rejected without truncating existing text. Sending/completed forms do not silently consume another list. Custom-quote and acceptance review language remains visible.
- **County explorer:** four large named controls in north-to-south order, selected coverage feedback, and an emphasized outline/underlined map label. Interactive paths exactly match the existing verified shared-scale SVG; no county geometry moves, resizes, or changes orientation.
- **Pre-flight checklist:** optional native disclosure, three native checkboxes, local reversible progress, reset, and a short completion sparkle. This does not book anything or gate the request.
- **Family finder:** need-based choices, an explicit matching external link, and a visible “Your match” marker on the corresponding brand card. All three existing cards remain available. Selecting the active need again resets the finder.
- **Photo tips:** optional native disclosure explaining useful framing and access photos. Existing privacy guidance and upload limits remain intact.
- **Back to lift-off:** native footer link returning focus to the main content, with a small rocket response.

No new animation dependency, background timer loop, analytics, location permission, or persistent storage was added. The site's Pause control and CSS reduced-motion preference disable the new decorative motion; every choice retains a static selected state.

Validation completed:

- Production build, TypeScript check, and lint pass. The test suite passes all 19 tests, including three new note-preservation/deduplication/size-limit tests.
- Browser checks at 1440px desktop, 820px tablet, 390px phone, and 320px narrow phone found no horizontal overflow. New selection controls are at least 46px high; item controls are 64px high.
- Confirmed keyboard item/county selection, native checkbox activation, checklist completion/reset, family selection/reset, and back-to-top focus.
- Confirmed written notes and pickup address survive list transfers from a later form step; repeat transfers do not duplicate prior items. The service defaults only when empty. Optional SMS consent is not altered.
- Confirmed the actual Pause control disables new check animations; system reduced-motion rules were inspected in CSS, not verified through an OS setting change.
- Browser console reported no errors during final checks. No live email or SMS was sent.
- Production engagement component is 8,418 bytes / 3,240 gzip bytes; shared haul-guide chunk is 814 bytes / 494 gzip bytes. These are chunk sizes, not total page overhead: icons, CSS, and inline map geometry are additional. A reliable pre-change bundle baseline was not captured, so no percentage or field performance improvement is claimed. Field INP remains unmeasured.

The user-provided Retool, Overpass, and Robby Yeager homepages were also consulted as visual references. Their presentation informed exploration of task-oriented discovery and deliberate feedback; no conversion or performance outcome is inferred from their appearance. Donut Studios could not be retrieved in this research pass and was not treated as evidence.
