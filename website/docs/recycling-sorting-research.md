# Space Reclaimed: recycling and trash zones

## Implemented design

- Flying game: clean cardboard and empty cans carry an R marker and unload at the left recycling dock for 2× base value. The right Bulk / Trash truck takes mixed trash and bulky items for crew handling; it does not imply curbside acceptance or landfill disposal. Both docks remain visible. The HTML destination strip labels them and shows held counts.
- Mixed loads unload only matching items. Wrong docks retain cargo and explain the route; empty deliveries award nothing. Cargo Launch banks base points plus the existing full express-load bonus, but no recycling bonus. End-of-run cargo earns base points only. Results show recycling count and bonus; scoring version is v5 so old records are not compared with the new rules.
- The optional untimed sorting yard now has distinct Recycling (200 base points), Trash (100), and Special drop-off (150) sections. Twelve materials include used tissue, food-soiled cardboard and mixed bagged trash. Glass is labeled as drop-off. First-try streaks add up to 100 points; corrections earn 25% of base value, with no time penalty or cargo loss. Repeated answers cannot earn extra points.
- Original pickup controls, three chassis, upgrades, 8-bit graphics, sound toggle, reduced motion and 5% reward remain. No external assets or runtime dependencies were added.
- Verification: deterministic flight tests cover both mixed-load orders, wrong docks, duplicate deliveries, upgrades, launch and finishing; sorting component/browser tests exercise all twelve items, keyboard/touch, results, correction and axe at mobile/desktop sizes.

Researched September 24, 2026. Scope: adding distinct recycling and trash destinations, with extra points for correctly delivered recycling, to the existing hauling arcade. Local facts below come from government sources; accessibility guidance comes from W3C and Microsoft. Scoring values and interaction recommendations are design proposals, not experimentally established optimums.

## Local recycling facts that should shape the game

Salt Lake City's current blue-cart list accepts cardboard boxes, aluminum cans, steel food cans, paper, and various plastic containers. It excludes glass, plastic bags, foam, food residue, construction waste, scrap metal, clothing, electronics, small appliances, and several other categories. Recyclables should be loose, rather than enclosed in plastic garbage bags. This makes empty cans and visibly clean cardboard strong starting examples; an opaque tied garbage bag should never be used as the recycling icon. [Salt Lake City: blue recycling cart](https://www.slc.gov/sustainability/blue-recycling-cart-updated/)

Accepted material depends on the collection service. The city explicitly notes that other haulers can have different rules for plastics and mixed paper. Its signage page identifies plastic film as a major contaminant. Avoid teaching “anything with a recycling symbol belongs here”; stick to a narrow, legible set of game materials. [Salt Lake City: recycling signage](https://www.slc.gov/sustainability/recycling-signage/)

Utah DEQ directs residents to their city or home collection company for curbside questions, and distinguishes ordinary bin recycling from hard-to-manage materials. It points glass to dedicated collection and electronics to take-back programs or specialized recyclers. A two-zone game should omit those ambiguous categories from its basic sorting lesson, or explicitly describe its destinations as a fictional sorting facility. [Utah DEQ: recycling resources](https://deq.utah.gov/dwmrc/recycling-resources)

Electronics are a separate stream, not a trash-versus-blue-cart guessing game. Utah publishes manufacturer take-back programs with mail-back or collection-site routes. Salt Lake County also describes resident e-waste collection and data wiping before disposal. Neither source supports labeling televisions as ordinary curbside recycling. [Utah DEQ: electronic waste take-back programs](https://deq.utah.gov/dwmrc/electronic-waste-take-back-programs), [Salt Lake County: safe disposal](https://www.saltlakecounty.gov/health/household-hazardous-waste/safe-disposal/)

Bulky waste is another distinct service: Salt Lake City's Call 2 Haul handles items such as furniture, mattresses, appliances, tires, and electronic waste that do not fit or belong in weekly carts. The city encourages donating reusable items first. Being eligible for a bulk collection does not establish that an item belongs in a blue recycling cart, or that every collected item is recycled. [Salt Lake City: Call 2 Haul](https://www.slc.gov/sustainability/call-2-haul-bulk-waste-collection/)

## Recommended material vocabulary

| Collectible | Proposed game destination | Visual and wording requirements |
| --- | --- | --- |
| Empty aluminum can | Recycling | Obvious cylindrical can, metallic highlights, small recycling marker |
| Clean cardboard box | Recycling | Brown folded box or flattened cardboard; avoid greasy food packaging |
| Bag of mixed household trash | Trash | Tied dark bag, trash marker; describe the contents as mixed trash |
| Sofa or mattress retained from the current roster | Hauling/trash destination in the fictional game | State that bulky items are routed by the game, not a local curbside guide; do not imply reusable furniture must be landfilled |
| Television, refrigerator, tire | Prefer to omit from a strict two-bin lesson | If retained, identify a specialized facility context; never silently present all three as ordinary blue-cart materials |
| Glass, batteries, loose plastic film | Omit from the simple roster | These deserve a separate handling lesson or the existing Recycling Bay's explanatory model |

The first three rows give the clearest two-stream mechanic. The bulky-item rows preserve possible compatibility with the existing hauling fantasy, but weaken the educational clarity of a plain “Trash” label. Choose that tradeoff explicitly rather than inferring recyclability from item size, metal content, or current point value. These are design judgments informed by the local sources above.

Suggested short public-facing note: “Game sorting rules: cans and clean cardboard go to Recycling; mixed trash goes to Trash. Real-life rules vary by hauler. Glass, electronics, and bulky items may need separate handling.” Link the real-life reference from instructions or results, rather than interrupting active play.

## Gameplay recommendation

Keep two permanent, spatially separated destinations visible in the same playfield: **RECYCLING** with a recycling icon and can/box motif, and **TRASH** with a bin icon and bag motif. Use consistent positions through the run. Give each a generous approach area; do not create a precision landing challenge merely to deliver a load. Labels should describe the destination, not just a color.

Keep pickup and flight controls unchanged. Show cargo composition explicitly, for example “Recycle 3 · Trash 2,” so the next route is a deliberate choice. A mixed hold should unload only the stream accepted at the approached destination, leaving the remainder aboard. This avoids an extra destination selector and makes each zone useful. An incorrect-zone visit should say “Your cans go to Recycling” or “Trash cargo is still aboard,” without taking lives or destroying cargo. Reject repeated empty deliveries without adding points or replaying success effects.

Award the ordinary delivery value once when an item leaves the hold. Add a clearly separate recycling bonus only for recyclable cargo actually delivered to Recycling. A starting proposal is a fixed +50 per correctly recycled item; playtest relative to existing 100–350 point values. Fixed per-item bonuses are easier to explain than hidden multipliers. Show “2 recycled · +100 bonus” and include a recycled-count/bonus breakdown in results. Do not award the same bonus on pickup, on arrival at the wrong destination, on pause/resume, or again when ending a shift.

Keep full-load bonuses separate from recycling bonuses. Partial stream deliveries make the old “hold is full when unloading” rule ambiguous: either describe the new rule explicitly or track completion of an original full load. Do not accidentally award multiple full-load bonuses by delivering the two halves of one mixed load.

Automatic end-of-shift banking and the Cargo Launch power must also have explicit semantics. If they bypass the player's sorting decision, a defensible rule is ordinary delivery credit without the recycling bonus. If launch targets a stream or a selected destination, show that destination before launch and apply the same accepted-cargo rule as normal delivery. Do not let a generic launch quietly become a guaranteed maximum recycling bonus.

## Feedback and accessibility

Microsoft's game accessibility guidance recommends multiple channels for important cues, and additional shape, icon, or text distinctions for color-coded information. Apply that to cargo, zones, success, and mismatch states. A recycling chime can reinforce a successful deposit, but the visible text and score must communicate the complete result with sound off. Do not use a green-versus-red glow as the sole indicator. [Xbox Accessibility Guideline 103](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/103)

W3C likewise requires a visible alternative when color conveys meaning. Use distinct silhouettes and persistent labels, not only a colored outline around otherwise identical items. Readability must survive the game's small rendered canvas; show longer explanations in adjacent HTML rather than cramming them into tiny pixel lettering. [W3C: use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)

Keep the existing keyboard and untimed alternatives usable. Keyboard access must cover functionality without requiring precise timing for individual keystrokes. If a new action involves dragging, keyboard support alone does not satisfy the separate need for a simple pointer alternative; labeled tap/click controls can cover it. The proposed fly-to-zone mechanic needs no new drag gesture. [W3C: keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [W3C: dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)

Expose meaningful delivery and mismatch messages in the existing HTML status region without moving focus. Prefer a polite, discrete announcement after an action; do not send every moving cargo count or animation frame through a live region. W3C's status guidance concerns programmatically available result/progress information without forced focus changes. [W3C: status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages)

Preserve the site's motion preference and reduced-motion behavior. Disable decorative unloading scatter, bounce, and score travel when reduced motion is requested; retain a static result label. Interaction-triggered nonessential movement should be suppressible. [W3C: animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

Any new HTML controls should follow the existing 44px practical touch target convention. WCAG 2.2 AA's minimum is 24 by 24 CSS pixels, subject to its exceptions and spacing provisions; 44px is the project's more comfortable target, not the wording of the minimum criterion. [W3C: target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## Implementation implications and focused verification

The current `lib/arcade-engine.ts` stores aggregate `cargo` and `cargoValue`; `bankCargo` clears the entire hold. Its roster contains sofa, mattress, boxes, refrigerator, tire, and television. Separate destinations therefore need retained material identity or explicit per-stream counts and values. A label-only truck change cannot support correct scoring. These observations are from local code inspection on the research date.

- Verify a pure recycling load, pure trash load, mixed load, empty hold, and wrong-zone approach; each item must be credited at most once.
- Verify pickup counts and destination behavior after a capacity upgrade, shield loss, Cargo Launch, checkpoint continuation, shift ending, and restart.
- Confirm the recycling bonus is visible in instructions, successful deliveries, and final results, and that ordinary cleanup remains worthwhile.
- Inspect at mobile size and in grayscale; zones, cargo, and mismatch feedback must remain distinguishable. Test sound off, reduced motion, keyboard, and untimed play.
- Keep old and new personal-best scoring comparable only if their scoring rules are unchanged; otherwise version the stored best or clearly distinguish it.

The existing optional Recycling Bay is a separate, untimed material-sorting activity documented in `docs/recycling-bay.md`. Preserve that distinction. This proposal adds route decisions to active hauling rather than replacing that deeper explanatory activity.
