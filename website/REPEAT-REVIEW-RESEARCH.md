# Bulk Away repeat experience review

Date: September 7, 2026. Scope: fresh primary-source research and source inspection of the shipped routes/components after `COMPLETE-EXPERIENCE-RESEARCH.md`. This report records source findings and design judgments, not browser results. The main agent performs reproduction and implementation separately.

## Is it fun and finished?

The visual language already gives Bulk Away a recognizable character: the supplied display/script fonts, rocket truck, atomic stars, ink/lime/gold palette, tilted sign, crew illustration, and actual county map belong together. The clearing preview, service finder, quantity list, preparation checklist, and county/family responses provide participation with useful outcomes. There is no missing user task that requires another illustration or game.

The remaining opportunity is reliability during less common transitions. NN/g distinguishes visual pleasure from the deeper satisfaction of an interface that supports a task reliably; this is general UX guidance, not measured evidence that Bulk Away converts better. Its later framework also says delight varies by person and should be evaluated through actual use. An expert review can assess coherence and friction, but cannot establish that every customer finds it fun. [Theory of User Delight](https://www.nngroup.com/articles/theory-user-delight/), [Three Pillars of User Delight](https://www.nngroup.com/articles/pillars-user-delight/).

## Fresh actionable findings

### 1. Mobile navigation can remain open after the visitor leaves it

`SiteHeader` in `components/interactive.tsx` closes on Escape and link activation. It has no focus-out or outside-pointer dismissal. The mobile CSS positions navigation as an overlay. Tabbing beyond its last link can therefore leave the panel covering content while focus continues elsewhere. Reproduce before choosing the exact fix.

Recommendation: treat the trigger and navigation as one disclosure region. Close when keyboard focus leaves that region and when a pointer activates outside it; retain Escape with focus returned to the trigger. Do not trap focus like a modal, and do not apply ARIA menu roles to ordinary site links. WAI's own disclosure navigation example closes on focus exit and explains why ordinary navigation uses disclosure semantics. This is an implementation reference, not a claim that every one of its optional behaviors is universally mandatory. [WAI disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/).

### 2. Preferred-date UI and server disagree about what “today” means

`PickupForm` builds its calendar minimum with the visitor's local `getFullYear/getMonth/getDate`. `validatePickup` instead compares the submitted date with today in `America/Denver`. A property manager travelling outside Mountain Time can encounter an inconsistent boundary: at 06:30 UTC on September 7, Los Angeles still has September 6 while Denver has September 7. The picker can offer September 6 and the validator then rejects it. In a timezone ahead of Utah, the reverse discrepancy hides a date that the server would accept.

Recommendation: derive both boundaries from one shared Utah calendar-date helper, with explicit `America/Denver` and deterministic year/month/day formatting. Keep selected pickup dates as date-only values, rather than converting an intended calendar day into a UTC timestamp. Add a boundary test around midnight, including winter/summer offsets. The date-formatting API supports an explicit time zone; applying the Utah zone here is a project-specific business rule. [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).

### 3. General legal navigation can still discard most of a request

The cookie dialog's policy link was correctly changed to an announced new tab. Global footer Privacy/SMS links still navigate in the same tab. `PickupForm` owns its uncontrolled input values, date state, step, and photos; only item choices and coarse started/completed flags survive in the shared layout provider. A legal detour can return a partly restored request: item choices remain while notes, address, contact details, date, and step disappear.

Recommendation: preserve a draft across legal detours in memory, or use announced new-tab policy links while an unfinished request exists. Do not silently persist addresses, contact details, or photos in browser storage. Merely preserving selected haul items is not complete draft recovery. WAI's multi-step guidance explicitly recommends retaining entered answers when allowing a return to earlier steps. WCAG's Redundant Entry criterion addresses repeating data in the same process; whether a general footer detour is within that criterion's scope depends on the implemented process, so this report treats it as a demonstrated continuity risk rather than declaring a conformance failure. [Multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/), [Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html).

## No-change judgments

| Area | Source assessment and recommendation |
| --- | --- |
| Hero and click effects | Bounded particles, no pointer interception, excluded inputs/dialogs, reduced-motion and shared pause checks, keyboard completion/undo/reset paths. Keep these; do not add ambient sound, cursor trails, or a game that delays requesting service. |
| Motion/transitions | Existing flourishes mostly use transforms/opacity, with a short explicit script reveal and paused final-state overrides. Keep transitions subordinate to content. Google recommends avoiding layout/paint-heavy animation unless justified; code inspection is not a measured performance score. [Animation performance guidance](https://web.dev/articles/animations-guide). |
| Service selection | The optional finder offers a direct route to a recommended service while all services remain available. The six-option request select remains bounded. GOV.UK advises considering simpler questions/radios before selects; this does not justify enlarging the already-shortened form again without a reproduced usability problem. [Select](https://design-system.service.gov.uk/components/select/). |
| Form steps/review | Three logical steps, mounted hidden panels, backward controls, optional supplementary details, explicit unbooked status and receipt are sound. Review edits should return to the summary without forcing duplicate entry. [Check answers](https://design-system.service.gov.uk/patterns/check-answers/). |
| Feedback | County, finder, checklist, selected-photo count, and haul-list feedback use `output`; submission failure uses an alert and success receives focus. Keep meaningful textual state, not sparkle-only confirmation. WAI explains how status updates should be exposed without unnecessarily interrupting work. [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html). |
| Artwork and icons | Supplied vector hero/AEPOC marks, local crew and process art, real county boundaries, and text-supported service icons cover current content roles. Real team/job photos remain useful future evidence, already planned by the owner. No generated substitute for testimonials or completed-job proof. |
| Cookie/privacy/SMS | Retain the requested choice dialog and honest forthcoming Twilio/portal status. Do not add fake tracking categories, live portal links, or alter business/legal promises merely for visual polish. |

## Source coverage

Reviewed route inventory: homepage, Privacy, SMS terms, missing-page view; layout/global experience, metadata, sitemap/robots, and API endpoints were identified separately from customer-facing pages. Production component source inspected: `SiteHeader`, `ServiceExplorer`, `ServiceFinder`, `AtomicSky`, `SpaceSign`, `CrewIllustration`, `ClickSparkles`, `SubmissionSparkle`, `MotionToggle`/`SiteExperience`, `CountyExplorer`, `HaulBuilder`/`HaulItemPicker`, `PreflightCheck`, `FamilyFinder`, `PickupForm`, service/date selectors, `PhotoUpload`, `RequestDock`, and `CookiePreferences`. Homepage static process/about/FAQ/family/footer structure and stylesheet interaction rules were considered. Unused scaffold UI exports and the unused `LaunchPad` are not shipped experience surfaces.

No browser operation, real delivery, legal certification, screen-reader certification, or new deployment was performed by this research agent. The preceding review's asset and form-state checks remain valid evidence for their explicitly recorded scope; they should not be relabeled as fresh testing. Root should append reproductions, changes, and actual verification before calling this pass complete.

## Implementation and verification — completed September 7, 2026

The main agent reproduced and fixed four specific gaps:

1. Tabbing from the last mobile navigation link to the hero CTA left `aria-expanded=true`. The header now closes on focus exit, outside pointer activation, home-link activation, and transition to the desktop breakpoint. Escape still returns focus to the menu button. Browser confirmation showed `aria-expanded=false` after keyboard exit, outside activation, and resizing to desktop.
2. Calendar and validation now share `pickupToday()` with an explicit America/Denver timezone. The displayed minimum also refreshes every minute and when the window regains focus, supporting a draft left open overnight. A new regression test covers Utah midnight in summer and winter and the spring daylight-saving transition. The selected date remains a date-only value.
3. Typing notes, opening footer Privacy, and returning home reproduced an empty notes field. New `DraftSafeLink` links protect policy, sister-brand, family-match, and county-source detours while a request is underway. They announce “New tab · keeps your request here”; otherwise normal navigation remains. The original mounted form retains its fields and selected files without storing personal information in localStorage. Activating the corrected footer Privacy link left the original page and its notes intact. Browser tooling did not expose the opened destination tab, so its rendering is not claimed. Reloading/closing the original tab is not draft persistence.
4. A fresh mobile screenshot showed the pickup shortcut overlapping footer privacy/motion controls. `RequestDock` now observes the footer and hides near it. The final mobile screenshot and DOM check confirmed the dock was absent and Cookie settings retained visible keyboard focus.

### Fresh coverage and checks

- Reviewed the shipped route/component inventory described above; opened homepage, Privacy, SMS, and the missing-page view in the browser. This is source coverage plus targeted rendered checks, not every possible combination of browser, assistive technology, and state.
- Inspected the homepage hero at mobile and 1440px desktop widths; Privacy/SMS at 820px tablet width; missing-page recovery at 390px. The reviewed pages had no horizontal overflow. Internal fragment targets resolved on home and both legal pages.
- Operated mobile-menu focus exit, outside activation, responsive dismissal, cookie settings/Escape, service selector, step-one continuation, preferred-date popover/Escape, and the protected policy handoff. The mobile calendar fit inside the 844px viewport (top 62.6px, bottom 462.3px), and prior notes remained intact.
- Inspected the final desktop family/footer layout with draft notices. All eight homepage images loaded successfully; the current browser error log was empty. No new illustration was necessary. Existing hero, checklist, county, FAQ, receipt/error, photo-processing and quantity evidence from prior reports remains explicitly prior evidence.
- All 26 logic tests passed, including the added timezone regression. HTTP verification passed for routes/assets, validation, request-size limits, multipart parsing, and invalid-image rejection before mail. Lint and TypeScript passed. The final production build passed after stopping the preview process that temporarily locked its build directory on Windows.
- The final normal production preview was restarted on port 8788. No real email, SMS, external enrollment, or deployment occurred. Render email/attachment delivery, production domain/HTTPS and public indexing remain launch verification, as agreed.

### Final judgment

The experience is visually distinctive and has purposeful optional participation. This pass improves navigation continuity and unobstructed controls rather than accumulating more effects. It is ready for owner acceptance testing within the current email-request scope. Expert review is not measured conversion evidence or a guarantee that every visitor finds the experience fun.
