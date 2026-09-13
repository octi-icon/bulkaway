# Homepage section spacing and interactive dividers

Researched 2026-09-13. Scope: the Bulk Away homepage, its cream/ink/lime/gold atomic-retro style, Brookvale/Taldose typography, and custom truck artwork. This note recommends refinements; it does not establish that a particular animation increases conversion. Eight primary sources were consulted. Numeric spacing, timing, and composition choices below are design proposals to verify in the existing page.

## Recommendation

Give the existing sections stronger whitespace boundaries, then use two or three small interactive divider scenes at meaningful topic changes. Let the truck and atomic shapes carry the personality. Each scene should work as a finished still illustration and respond only to a deliberate activation. Preserve the homepage's existing junk/arcade interaction as its main play moment; these dividers should not become another unlock mechanic or repeat its copy.

## Evidence and implications

| Finding from the source | Application to this page |
| --- | --- |
| Motion attracts attention even when irrelevant; restrained feedback and clear state changes are its strongest uses. Multiple competing animations can overwhelm. [NN/g: The Role of Animation and Motion in UX](https://www.nngroup.com/articles/animation-purpose-ux/) | Keep dividers quiet while reading. Make activation feedback local and brief. A playful illustration is a brand choice, not an evidence-backed conversion device. |
| Nearby items are perceived as related. Whitespace separates groups, and responsive rearrangement can destroy those relationships. [NN/g: Proximity Principle](https://www.nngroup.com/articles/gestalt-proximity/) | Increase space between sections more than space within them. Keep a heading, its introduction, and its content visibly grouped on mobile. |
| Full-screen presentations with weak signs of continuing content can create false floors. [NN/g: The Fold Manifesto](https://www.nngroup.com/articles/page-fold-manifesto/) | Avoid viewport-height divider panels. Keep the next heading close enough to establish continuation; a heavy horizontal stripe must not resemble the footer. |
| WCAG 2.2 requires keyboard access and visible focus; AA pointer targets are at least 24 by 24 CSS pixels, subject to exceptions. Enhanced AAA targets are 44 by 44. Nonessential interaction animation can be disabled under AAA 2.3.3. [W3C: WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Choose a practical minimum 44-pixel target, a visible focus treatment, and a reduced-motion alternative. These proposals do not imply whole-page WCAG conformance. |
| Automatically starting motion lasting more than five seconds alongside other content needs pause/stop/hide unless essential. Automatically updating information has no five-second exception. [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | Avoid automatic loops entirely. A short animation is not automatically comfortable simply because it falls below five seconds. |
| The reduced-motion media feature reflects a device preference to remove, reduce, or replace nonessential motion. Large panning/scaling can trigger discomfort. [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) | Under reduced motion, immediately show the resulting still state. Do not merely speed up truck travel, spins, or bounces. |
| Button activation works with Space and Enter. Buttons have accessible names, and focus normally remains on a button when its action leaves the context intact. [W3C APG: Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) | Use an ordinary button for each scene action. Do not make an anonymous clickable container or require hovering, dragging, or precision tapping. |
| Transform and opacity are preferred animation properties; layout/paint changes need scrutiny. Layer promotion with will-change should follow measured need. [web.dev: High-performance CSS animations](https://web.dev/articles/animations-guide) | Animate a few small elements within a fixed-size scene. Avoid animated section heights, full-page effects, permanent layer promotion, and an extra animation library. |

## Three bounded divider concepts

These are original design inferences applying the evidence above. Use two if a third would crowd the page; quiet spacing is itself a valid divider.

### 1. Truck dispatch line

A thin ink roadway, one short gold dashed segment, and the existing truck sit between an explanation of the service and the next practical section. The truck's button gives one small forward nudge and settle on activation, taking roughly 450–650 ms within its reserved footprint. Two static star shapes can briefly fade beside it. It should look like the same truck from the brand, with no new illustration style.

The scene gives direct feedback for a playful action without asking visitors to learn rules. Use an honest short accessible name such as “Nudge truck”; do not imply that it books a pickup. Keep a clear raised/outlined button silhouette so it looks actionable. No hidden reward, score, sound, or content behind it.

### 2. Atomic switch

A horizontal rule terminates in an atomic star medallion with two small satellites. Activating the medallion rotates the central shape a small amount and switches a lime/gold accent, settling in 250–400 ms. The next activation reverses the state. A native toggle with a stable accessible name such as “Atomic accent” and a pressed state can communicate the binary change.

Use this as the lightest treatment between two dense information sections. Static satellites and a single moving center keep it legible. Do not orbit continuously or scatter particles across the page.

### 3. Stamp on the line

A small cream-and-ink badge interrupts a gold rule. Activation gives the badge a brief press and settle, with a tiny offset ink impression as the resulting still state. Keep the sequence around 250–400 ms. Use “Press stamp” as the accessible action name. This is suitable before the final contact section because its footprint remains modest.

Use a brand star or truck symbol inside the badge. Avoid invented certifications, guarantees, review counts, or claims of donation/recycling outcomes. The shape supplies the retro print character without explanatory copy.

## Spacing rhythm to try

The following are starting values, not research-derived thresholds. Measure the **total visible distance** between the last content of one section and the next section heading, including existing padding, margins, and the divider; do not add every token cumulatively.

| Relationship | Desktop starting range | Narrow-screen starting range |
| --- | --- | --- |
| Heading to its own introduction | 16–24 px | 12–20 px |
| Introduction to cards or main content | 32–48 px | 24–32 px |
| Content to next heading, no illustrated divider | 96–144 px | 64–88 px |
| Content to next heading, including illustrated divider | 144–200 px total | 104–144 px total |
| Divider illustration height within that total | 48–72 px | 44–56 px |

Keep the most related items closest together and reserve the largest gaps for topic changes. Align the divider to the page's existing content width. Avoid additional boxed bands with independent generous padding: they would undermine the intended breathing room. Use cream as the resting surface and ink for structure; lime/gold should punctuate the scene. Retain existing typography rather than adding decorative captions to every boundary.

## Interaction and verification contract

- A section, heading, CTA, or contact detail never waits for an animation or becomes concealed by one.
- Pointer hover and keyboard focus show a clear resting affordance; activation starts the scene. Touch has equivalent access without hover.
- Repeated activation must never queue a backlog. Allow at most one finite sequence per scene; subsequent intentional activations can replay after it settles. Do not restart from scroll, viewport re-entry, or pointer movement. This replay policy is a design inference intended to avoid repetitive distraction.
- Keep focus in place. Hide decorative child artwork from assistive technologies, but preserve the named control and any meaningful state. Do not announce purely decorative particle or frame changes.
- Reduced-motion mode retains the same usable controls and changes states instantly. No translation, rotation, scaling, bounce, or smooth-scroll effect is necessary to understand the result.
- No continuous timer, global pointer tracker, or always-running animation frame loop. Reuse existing assets and native CSS/JavaScript. Keep scene bounds stable so interaction does not shift surrounding content.
- Check the whole page at desktop and narrow widths, keyboard-only, touch, and reduced motion. Confirm that adjacent content reads as separate groups, the next section remains discoverable, focus stays visible, repeated taps settle cleanly, and no horizontal overflow or content shift appears. Inspect animation rendering if a scene stutters; transform alone is not a performance guarantee.

## Decision limits

The sources support restraint, grouping, accessible input, and performant implementation. They do not determine the ideal number of dividers, the exact pixel rhythm, or whether these particular scenes improve lead generation. The existing page's content density and a visual pass should decide final placement. If a divider is more noticeable than the adjacent heading or contact action, reduce its size or remove that instance.

## Implemented revision: automatic logo artwork

The user replaced the click-to-play direction with automatically responsive artwork and requested more section spacing. The research recommendations above record the initial options; this revision follows the updated brief.

- Created public/brand/haul-flight-divider.svg from the original logo truck linework, with an angular lime/ink fin, a gold orbit, and atomic stars. No additional library or embedded fonts.
- Removed both buttons. Each divider responds to its first viewport entry with a 1.4-second hauling motion. Its observer disconnects after entry and on unmount; scrolling back does not replay it.
- Art stays visible without JavaScript or IntersectionObserver. Reduced motion and site pause show the resting composition immediately. Decorations add no keyboard stops or screen-reader announcements.
- Main section padding is now 128px desktop and 104px mobile, with tailored spacing before artwork and for the family/arcade sections. Divider areas are 208px desktop and 160px mobile.
- Ten component tests and four focused browser checks passed, covering automatic activation, observer cleanup, unsupported-browser fallback, normal motion, reduced motion, site pause, stable geometry, unchanged scroll position, no buttons, no horizontal overflow, and the homepage accessibility scan. Typecheck, lint, build, and the focused design detector passed. Desktop and mobile screenshots were reviewed.

These checks do not establish full accessibility certification or measured conversion improvement.
