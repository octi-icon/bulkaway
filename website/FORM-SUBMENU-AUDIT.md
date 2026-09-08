# Form submenu audit and refinement

September 7, 2026. This pass investigates the expanded interaction states missed by the preceding visual review. It preserves the existing atomic-era design and the three-step request form.

## Research

- [GOV.UK details](https://design-system.service.gov.uk/components/details/): disclosures suit supplementary information; critical instructions should remain visible. Keep optional photos/SMS and detailed review disclosed, without hiding the service choice or required contact fields.
- [GOV.UK accordions](https://design-system.service.gov.uk/components/accordion/): concealed content adds interaction effort. Do not add more nested menus or force an exclusive accordion that closes another panel and loses the visitor’s place.
- [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): Enter/Space toggle disclosure state. Retain native details/summary semantics and use a directional chevron to distinguish expansion from the item picker’s add action.
- [WAI date-picker example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/): preserve day-keyboard navigation, selected-day focus, Escape dismissal, and return to the date trigger. The example itself is illustrative, not production certification.
- [DayPicker accessibility](https://daypicker.dev/guides/accessibility): retain the library’s calendar semantics and keyboard behavior; add brief screen-reader instructions to the popup rather than replacing its calendar controls.
- [Base UI Select](https://base-ui.com/react/components/select): retain its popup positioning and focus behavior. The service list already respects available height; the separate calendar did not.
- [MDN overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow): hidden overflow remains a scroll container, including programmatic/focus scrolling; clip does not. This directly supports the diagnosed request-section fix.
- [MDN scroll anchoring](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_anchoring/Overview) and [overflow-anchor](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-anchor): useful initial hypothesis, but the observed scroll was inside the request section. Do not disable document-wide anchoring to mask the actual bug.

Fresh first-party category comparison: [1-800-GOT-JUNK?](https://www.1800gotjunk.com/us_en) and [College HUNKS junk removal](https://www.collegehunkshaulingjunk.com/junk-removal/) emphasize service scope, booking/contact, pricing/process clarity, and organizational proof. A Junk King page failed to load and is not counted as inspected. This was a content comparison, not a visual or conversion benchmark. Bulk Away already supplies service/coverage/quote explanations and a coherent atomic truck, type, palette, and interactions. Its distinctive visual identity remains an assessment of the existing site, not proof of industry-wide uniqueness. Additional animation would not remedy the reproduced form defects. Genuine crew/job photos remain a later owner-supplied trust addition; no reviews, certification, response promises, or results were invented.

## Reproduction and root cause

At 1280 × 900, repeatedly opening/closing the item disclosure moved its trigger approximately 608px. Opening photos and moving keyboard focus reproduced unintended scrolling inside `.request`: `scrollTop` reached 372px while the section used `overflow: hidden`. The section’s orbit decoration extended its scrollable bounds. A direct pointer click reproduced the shift, so this was not just automated locator scrolling.

Ranked hypotheses were browser anchoring, focus scrolling, and responsive layout. DOM measurements showed the request section moving its own content while the ordinary layout offsets remained unchanged. Changing only `.request` to `overflow: clip` kept the orbit clipped and removed the invisible scrolling container. Repeating items → photos → nested photo tips → close/reopen produced internal scrollTop 0.

At 320 × 480, the calendar was 391.7px tall with a top coordinate of -169.6px. The positioner supplied 217px of available height, but the popup had no maximum height. This hid the month/header controls above the viewport. The calendar now uses the supplied available height and viewport height as limits, allows its content to scroll, and prevents flex children from shrinking to unusable sizes.

## Changes

1. Request-section decorative clipping no longer allows internal scrolling.
2. Calendar size is bounded by the positioner’s available space; short screens get scrollable contents rather than clipped controls.
3. All four form disclosures use down/up chevrons. Plus/check remain the item-add/selected language.
4. Expanded disclosure headings receive 12px separation from their contents.
5. The calendar exposes concise arrow-key, Enter, and Escape instructions to assistive technology.

The form retains multiple independently open disclosures and mounted input state. No automatic panel closing, delayed opening animation, nested modal, extra required fields, or email changes were added.

## Regression procedure

Use the actual built page, not a source-only selector assertion:
1. On desktop, open/close items, photos, nested photo tips, review, and SMS using pointer and keyboard. After each operation read `.request.scrollTop`; it must remain 0.
2. Choose furniture, change quantity, collapse/reopen, and advance. Confirm quantities remain in review.
3. Open service choice; Escape must close and return focus to `#pickup-service`.
4. Open date choice, use arrow keys/Enter, reopen, clear or Escape. Confirm the chosen date reaches review and focus returns to `#pickup-date`.
5. At 320 × 480, calendar bounding box must remain within the viewport, with scrollable overflow if needed; month navigation and clearing must remain reachable.
6. Opening SMS must not select its checkbox. Closing/reopening must preserve an explicit selection.
7. Review edit actions must return directly to review without clearing the draft.

Automated logic checks: 25 tests, lint, and TypeScript passed. The final production build passed. Live verification results follow below. No real request/email was sent, and these checks are not a full WCAG or cross-browser certification.

### Final live results

- Built preview at 1280 × 900 and 320 × 480: expanded item/photo panels and nested photo tips remained usable without horizontal overflow. `.request.scrollTop` stayed 0 through the tested operations; a direct pointer click closed the photos panel with internal scroll still 0.
- The previously clipped mobile calendar now measured top 5.4px and bottom 222.4px inside the 480px viewport; client height 215px and scroll height 390px confirmed accessible internal overflow. Month navigation, selecting October 1, reopening, and clearing the date worked. Selection/clearing restored focus to the date trigger.
- Service popup Escape dismissal restored focus to `pickup-service`. The calendar arrow-key selection was checked before the sizing-only change; the final build retained the same library controls.
- Two furniture items remained in the review after collapsing/advancing. A selected date reached review; clearing produced the flexible-date text.
- Review and SMS disclosures opened via keyboard. Opening SMS left consent false; an explicit Space selection survived closing/reopening, and was then deselected. Editing items returned directly to step 3 with the address and quantity preserved.
- No browser console errors were returned in the final flow. A narrow-screen automated pointer sequence hit a neighboring target during smooth page repositioning; its steps were re-read and independently exercised with keyboard activation. This is recorded rather than treating every automation click as proof of the intended selection.
- No email submission or actual SMS occurred. Test entries were cleared and the preview left at the request form. Photo attachment transport was covered by the existing passing tests; file chooser selection was not repeated in this pass.
