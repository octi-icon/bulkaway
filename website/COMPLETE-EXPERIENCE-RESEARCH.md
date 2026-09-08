# Bulk Away complete experience review

Research date: September 7, 2026. This is a fresh, bounded review of the implemented experience and eleven primary sources. It builds on, rather than repeats, the form, submenu, engagement, and final-pass reports. Source inspection is not browser verification. Implementation and rendered results should be recorded separately.

## Judgment

The brand has a coherent point of view: supplied script/display type, ink/lime/gold palette, rocket truck, Googie sign, illustrated crew, geographic county map, and the theme of making room. Its existing optional clearing demo, quantities, service finder, pre-flight checklist, county response, family matching, and bounded click sparkles already provide many opportunities to participate. Adding another game or illustration is not supported by a missing user task. A finished experience now depends on those interactions behaving consistently, especially when visitors change routes, pause motion, use the keyboard, and preserve a request draft.

Fresh first-party category checks reinforce practical rather than decorative gaps. [1-800-GOT-JUNK?'s property-management page](https://www.1800gotjunk.com/us_en/commercial/property-management) identifies specific commercial scenarios, routes visitors toward availability/contact, and displays its own proof. [College HUNKS' national-account page](https://www.collegehunkshaulingjunk.com/why-us/national-accounts/) explains commercial coordination and service needs. Bulk Away already names apartment trash outs, recurring bulk removal, enclosure sweeping, and chute rooms. Keep those concrete facts prominent. Do not borrow competitors' service guarantees, ratings, insurance claims, national scope, or disposal claims. This two-page content comparison does not establish industry-wide uniqueness or measured conversion performance.

Real team/job photographs remain the useful future evidence the owner has already agreed to provide. Generated illustrations cannot substitute for that evidence. The absence of those future photos is not a reason to add placeholders or fabricated testimonials now.

## Concrete remaining findings

### 1. Motion preference should travel with the visitor

**Observed in source:** `MotionToggle` appears only on the homepage. Its effect deletes `html[data-motion]` on unmount. `ClickSparkles` is mounted globally in `RootLayout`, including privacy, SMS, and missing-page routes. Consequently the implementation can discard a manually paused preference when moving to a legal page, where there is no corresponding pause control. This is a source-derived failure hypothesis, not a rendered reproduction.

**Recommendation:** Own the motion choice in a route-stable shared component/state, expose a consistent control wherever click effects exist, and retain the choice during same-site navigation. No personal-data storage is required. Continue respecting operating-system reduced-motion preferences. Ensure pausing transitions leaves every information panel visible in its final state instead of freezing an entrance animation at zero opacity.

**Evidence:** WAI recommends a way to disable nonessential interaction-triggered motion; this specific criterion is AAA, so it must not be misrepresented as a blanket AA failure. [WAI Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). NN/g's own guidance asks designers to evaluate purpose, frequency, and attention before adding motion, and warns about peripheral distraction. Its guidance is older general UX evidence, not a hauling conversion experiment. [Animation for Attention and Comprehension](https://www.nngroup.com/articles/animation-usability/).

### 2. Cookie-policy access still has a draft continuity risk

**Observed in source:** The pickup form's consent privacy link was fixed in the previous pass. However, the policy link inside `CookiePreferences` still navigates in the same tab and calls `finish()`. A visitor who opens cookie settings during a request and then reads the notice can leave the page and lose the in-memory form. The general footer privacy/SMS links similarly change routes; these should be considered against the draft-preservation requirement.

**Recommendation:** At minimum, the cookie dialog's policy link should preserve the draft using a clearly announced new tab, consistent with the form's own notice. Reading a policy need not itself save a new preference. Keep legal access independent from checkbox consent. This is a project-specific continuity inference; it is not a recommendation to open all website links in new tabs.

### 3. Verify hidden and floating states, not only closed screenshots

**Observed in source:** The header closes on Escape and navigation-link activation, while the request dock is conditionally displayed. Form disclosures were recently corrected. Service-finder and pre-flight disclosures still use plus icons, whereas the four form disclosures now use chevrons. FAQ and photo-tip summaries use their own cues.

**Recommendation:** Check mobile menu focus moving outside its open navigation; confirm menu dismissal/focus visibility. Check dock visibility while tabbing through footer and controls. Standardize expand/collapse direction cues if the rendered treatment is inconsistent; reserve plus for item addition. Keep disclosures independently open and their input state mounted. Do not animate their height through delayed or clipping states merely to make them feel more elaborate.

**Evidence:** WAI explains how persistent and nonpersistent overlays can obscure focus, including menus and sticky UI. [Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). GOV.UK places details around supplementary content and cautions against hiding information most users need. [Details component](https://design-system.service.gov.uk/components/details/).

### 4. Finish by checking icon meaning, type reflow, and stable geometry

**Source inventory:** The principal supplied logos have explicit dimensions and text alternatives. The fresh-start door is decorative with empty alternative text. The county illustration has a descriptive image role plus readable county controls. The crew image is brand illustration. The service icons supplement actual text; there is no content hole that requires a new raster image.

**Recommendation:** Keep decorative icons silent when adjacent text names the action, and keep icon-only controls individually named. Verify all key buttons at narrow widths, enlarged text, and long labels; quantity/remove/close controls deserve particular attention. Confirm imagery's aspect ratios remain reserved while loading. Inspect the success receipt, long file names, large quantities, and failure text rather than asserting every state is done from the initial form.

**Evidence:** WAI's image decision tree distinguishes decorative, informative, and functional imagery. [WAI alt decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/). Pointer targets at AA require 24 CSS pixels or qualifying spacing/exceptions; larger practical targets are useful, but 44 pixels must not be described as the AA minimum. [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). User-adjusted text spacing must not cause loss of content or function. [Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html). Google describes image dimensions and reserved space as ways to prevent layout shifts; this does not establish a measured CLS score here. [Optimize CLS](https://web.dev/articles/optimize-cls). GOV.UK recommends meaningful button text and distinguishing primary/secondary actions rather than making every action compete. [Button component](https://design-system.service.gov.uk/components/button/).

## Actual route and component review matrix

This is the review coverage to execute, not a list of passing tests.

| Surface | Required states and questions |
| --- | --- |
| Homepage header/hero | Desktop/mobile menu; Escape and focus exit; hero clear/undo/reset/completion; motion paused before and after interaction; immediate pickup route |
| County/service area | All four county selections; label/map correspondence; narrow reflow; pickup link |
| Services | Every tab with keyboard and pointer; optional finder branches/reset/recommendation; service handoff without clearing draft |
| Haul list | Select/remove each type; quantities; synchronized form; empty/locked list; no accidental submission |
| Process/about | Optional pre-flight checks/reset; decorative art vs real evidence; no heading/image overlap |
| Pickup form | All disclosures open/close and nested photo tips; service/calendar overlays; photo errors/removal; all three steps; review edit; independent permissions; validation and retained failures; confirmed receipt |
| FAQ | Every answer open/close, expansion cues, readable long text |
| Brand family | Each match and reset; real external link destination; sharp supplied marks |
| Footer/dock | Help links; top/request anchors; fixed control focus; dismiss and draft-return behavior |
| Privacy route | Contents anchors, readable columns and headings, SMS link, direct contact, return route, motion control, cookie settings |
| SMS route | Honest future status, consent/STOP/HELP content, contents anchors, privacy route, contact, no fake active portal |
| Missing route | Actual 404 status, clear home/request recovery, contact, narrow layout, global controls |
| Global cookie/effects | First visit, options, close/Escape, reopened settings, remembered state, policy access with draft, reduced motion, legal-route effect controls |

The unused `LaunchPad` export and unused scaffold UI are not shipped surfaces and should not inflate this coverage claim. No visual redesign, new marketing claims, live SMS integration, indexing enablement, or real-email send is implied by this review. Render email credentials, actual transport/attachment verification, HTTPS/domain, and the deliberately gated launch indexing remain deployment checks.

## Completion record

Pending root implementation and actual verification. This research alone does not establish full WCAG conformance, browser-wide reliability, a measured engagement uplift, or that every route/state has been operated.

## Implementation and verification record — September 7, 2026

Implemented:
- `SiteExperience` owns motion pause in the shared layout. Both the hero and the global footer expose synchronized controls. Same-site route changes no longer remove the preference; no new browser storage is used. Existing operating-system reduced-motion rules remain authoritative.
- Page changes move focus to the main landmark and open at the beginning, or at an explicitly requested fragment. Native Back/Forward restoration is left to the router. This fixes the reproduced footer-navigation problem: Privacy and SMS previously opened partway down with their headings off-screen.
- The cookie dialog's policy link opens an announced new tab and does not close the dialog or save preferences. Reading a policy is distinct from making a privacy choice, and the original request remains mounted.
- Service-finder and preparation disclosures now use the same directional expansion cue as the form, preserving plus signs for adding haul items.
- Legal-page wordmarks and primary buttons no longer inherit prose-link underlines; ordinary policy links remain visibly underlined.
- Added a loopback-only visual harness, `scripts/preview-form-states.mjs`, to exercise the actual success/error UI without forwarding POSTs or sending email. It was stopped after verification and is not the delivered preview.

### Coverage and observed results

The homepage, Privacy, SMS terms, and real 404 route were opened and inspected. Every shipped component was reviewed in source; unused scaffold components were excluded. The matrix above was used as coverage guidance, not as a claim that all possible combinations, devices, or assistive technologies have been tested.

- Hero clear/complete/undo/reset and pause/play were operated. Paused content remained available; the completion message/CTA still appeared.
- County feedback and map selection were inspected. Existing geometry remains unchanged. Service recommendation's community branch selected weekly bulk service and moved focus to the matching panel. Service tabs responded to keyboard navigation including ArrowRight and End. The shared haul picker and its form quantities retain the previously verified behavior.
- All three preparation checks completed, produced ready feedback, and reset. All six FAQ answers were opened, confirmed at final opacity 1, and closed. Family selection highlighted AEPOC and produced the correct destination. Other family URLs were inspected in source; no messages or external enrollments were made.
- All eight rendered homepage images eventually loaded, including both vector logos, crew illustration, process illustration, and family marks. Every internal homepage hash link resolved. Asset requests returned 200: hero vector 43KB, AEPOC vector 2KB, door illustration 62KB, crew illustration 79KB, social card 145KB. These are transfer payload sizes, not a Lighthouse or field-performance score.
- Mobile menu opened, Escape closed it, and focus returned to its trigger. The mobile request dock was present away from the form; its conditional suppression/dismissal logic was reviewed. Prior submenu-specific keyboard, quantity, calendar, nested-photo, and SMS checks remain recorded in FORM-SUBMENU-AUDIT.md.
- Privacy/SMS contents links, contact links, and return paths were reviewed. The missing route returned HTTP 404 and its home recovery was operated at mobile width. Home/Privacy/SMS each returned HTTP 200 with a route-specific title and one h1.
- Before fixing motion ownership, navigating to Privacy removed data-motion and offered no pause control. After fixing it, Home → Privacy → SMS retained `paused`, offered “Play motion,” positioned both new pages at scrollY 0, and focused main. Returning to /#request reached the request section while retaining pause. The Back/Forward exclusion was source-reviewed; browser history restoration was not explicitly exercised.
- Cookie first-visit options, remembered-choice selection/save, reopened settings, and Escape were operated. In a filled test request, activating the policy link left the original form and dialog mounted with target=_blank. As in the preceding pass, the in-app automation did not expose a newly created tab; actual new-tab rendering is not claimed.
- In the no-email harness, the actual form advanced through all three steps and submitted to a simulated success. The real receipt component rendered at mobile width without horizontal overflow, showed the submitted values and reference, and received focus. Start another request reset to step 1. A second controlled submission returned a delivery error: the form retained name and notes, focused the alert, and exposed call/email recovery. No real transport was exercised by these two submissions.
- The existing 25 logic tests and HTTP checks passed, including invalid-request/image rejection before mail. Lint and TypeScript passed; the final production build passed. Browser checks are evidence for the paths described above, not a certification of full WCAG conformance or all-browser compatibility.

### Assessment

The site has a coherent, playful identity and optional interactions connected to the service: clearing, choosing items, finding the right service, and preparing a request. The completed fixes address continuity and control rather than adding distractions. No new illustration is needed to fill a current content gap. Real crew/job photography remains the owner's planned future addition. Real Google email/attachment delivery on Render, production domain/HTTPS, and enabling gated indexing remain launch checks. Twilio and the portal remain forthcoming as agreed.
