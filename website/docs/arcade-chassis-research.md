# Bulk Away arcade: item weight, starting chassis, and scope limits

Research date: 13 September 2026. Scope: a short optional marketing arcade, currently a 60-second round with two optional one-minute extensions, pixel canvas graphics, opt-in sound, and a 5% reward. This document recommends one bounded refinement. It does not propose tracking, monetization, additional rounds, or a new game mode.

## Evidence and its limits

Riot's first-party design course recommends iterating through play, analysis, and adjustment. It identifies excessive downtime, repetition without meaningful variation, overloaded interfaces, time pressure, and too many choices as possible causes of disengagement. These are design principles, not experimental proof of an ideal number of chassis or seconds per pickup. [Riot URF Academy, module 3, pp. 6–13](https://www.riotgames.com/darkroom/original/95f528a2ccdefd27d2d0910ad36c5154:97a92a52820d947c346ee46c4293948c/pdf-viewer.pdf)

Riot also argues that a feature needs a specific theory about what players will experience, followed by playtesting with the intended audience; plausible ideas can fail when played. This supports testing whether chassis alter routes or pickup choices before building further systems. It does not establish that an arcade increases bookings. [Riot: Prototype, Building a Game's Substance](https://www.riotgames.com/en/r-and-d-office/prototype-building-a-games-substance)

At the start of this review, the engine gave sofas and refrigerators a 0.8-second charge time and other items 0.48 seconds, while banking each item for 100 points. Consequently, the heavier items took longer without a corresponding base reward. That edition used a 235-unit/second normal movement speed, five-item base capacity, eight with Cargo Bay, and a 100-point full-load bonus. These are local observations from [arcade-engine.ts](../lib/arcade-engine.ts), not external research.

## Item-specific suction and rewards

**Recommended starting values, based on design judgment:** keep each item worth one cargo slot and differentiate time plus points. Extra cargo-weight arithmetic would add another rule before this change has demonstrated value.

| Item | Suction seconds | Banked points | Intended read |
| --- | ---: | ---: | --- |
| Tire | 0.40 | 70 | Quick pickup |
| Boxes | 0.48 | 90 | Quick pickup |
| Television | 0.65 | 120 | Middle ground |
| Mattress | 0.90 | 170 | Bulky, worth waiting |
| Sofa | 1.10 | 210 | Heavy haul |
| Refrigerator | 1.30 | 250 | Largest commitment and payout |

These figures are a tuning seed, not a validated optimum. They keep each heavy pickup below roughly 2.2% of the first minute before travel time. Pure points per suction second remain in a fairly narrow band; points per cargo slot improve with size. Thus small items offer quick exposure windows, while bulky loads repay the longer commitment and limited hold space. Travel and hazards must remain part of the actual comparison: points divided only by suction time cannot establish balance.

Use visible size/silhouette, a consistent filling progress indicator, and a brief point value at capture or bank to explain the rule through play. The indicator should reflect the actual charge fraction; the beam shape should match its effective area. Keep hazard warnings more visually prominent than score flourishes. Riot explicitly prioritizes readable mechanics, importance-based visual hierarchy, recognizable silhouettes, and restrained noise. [Riot: Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/)

**Accounting requirement:** item values must survive all routes to delivery: docking, Cargo Launch, normal time expiration, and manual finish. A count alone cannot reconstruct a mixed load's value. Keep delivered-item count separate from score, and document whether the existing full-load bonus remains. Ensure extensions and restart clear or preserve cargo consistently. Preserve existing collision behavior unless intentionally changing it; do not introduce cargo loss incidentally. These are correctness consequences of variable rewards, not new design features.

Retain gradual charge decay when temporarily out of range as the existing forgiving rule. Avoid adding a repeated-press or hold-to-suck input. Validate partial progress and simultaneous beams with every item type; larger visual sprites should not silently have larger pickup collision regions unless that is intended.

## Three starting chassis

**Suggested bounded option set, all numbers provisional:**

| Chassis role | Speed | Hold | Suction-time multiplier | Plain-language tradeoff |
| --- | ---: | ---: | ---: | --- |
| Balanced, default | 235 | 5 | 1.00 | Steady speed and cargo space |
| Scout | 280 | 4 | 1.10 | Faster travel, smaller hold, slower lifting |
| Hauler | 195 | 7 | 1.00 | Bigger loads, slower travel |

Select a chassis before starting; lock it for that run and keep it through both extensions. Give each a recognizable silhouette and a one-sentence strength/cost explanation. The default should already be selected so visitors can immediately play. Three choices are a scope decision, not a scientifically optimal count.

A meaningful result is that the Scout suits scattered quick pickups and evasive movement while the Hauler benefits from a planned clustered load. Merely changing all colors, or improving all three stats on the same chassis, does not establish this. Run the same seeded routes on each chassis; compare score, trips, damage, and the player's explanation of why they chose it. Equal pick rates and identical scores are unnecessary; an option that consistently wins both safe and risky routes deserves retuning.

Cargo Bay must remain useful for all three chassis: an additive hold increase, such as +3, preserves the chassis difference better than setting every upgraded ship to eight. Likewise, apply chassis speed before a documented dash multiplier, rather than accidentally erasing the tradeoff during upgrades. Keep beam capacity and suction speed separate so Twin Beam continues to have a distinct role. These are recommendations for understandable interactions, not extra upgrade proposals.

## Compact and accessible selection

Use one small labeled group with three native radio inputs and clickable labels, followed by the existing Start button. Include the role and its tradeoff directly in each label; do not require hovering to discover a disadvantage. A radio group represents one selection and provides a familiar keyboard model: Tab enters/exits, arrows change choices, and Space selects. Preserve visible focus and checked states. [W3C radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)

Aim for 44-pixel-tall label targets as a practical touch design choice. WCAG 2.2's AA minimum target rule is 24 by 24 CSS pixels or applicable spacing/exceptions; a compact design should not be justified by shrinking the clickable area below that baseline. [W3C target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)

Show a checkmark or border plus text for selection, and visible words or shapes for chassis roles and pickup progress. Color must not be the only way to convey information. [W3C use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) Keep nonessential shake, sparkles, and selection motion suppressible when reduced motion is requested; the distinction between essential gameplay movement and decorative animation matters. [W3C animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

Keep sound opt-in and never make it the only confirmation of capture, danger, or completion. Web Audio started without user interaction is subject to autoplay restrictions; initialize/resume it from the existing deliberate sound/start interaction and tolerate refusal. [MDN autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

## Performance boundaries

Six item definitions and three chassis records should be inexpensive; repeated rendering and state updates are the material risks. Cache reusable sprite drawing, avoid unnecessary per-frame scaling, and keep static layers from being rebuilt without cause. MDN recommends prerendering repeated objects and caching scaled images. Implement only optimizations justified by this game's profile. [MDN optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

Keep simulation progress elapsed-time-based rather than frame-count-based, so high-refresh displays do not change pickup times or movement. `requestAnimationFrame` supplies timing information and is commonly paused for hidden tabs. [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) Explicitly handle hiding/resuming the page so a background interruption cannot consume the run or cause a jump; visibility events provide the mechanism. [MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

Judge page health with Google's stated good thresholds—LCP at most 2.5s, INP at most 200ms, CLS at most 0.1 at the 75th percentile, separately for mobile and desktop—when representative field data exists. A local run cannot claim these field percentiles. [Google Web Vitals](https://web.dev/articles/vitals) INP measures qualifying interactions, not continuous animation smoothness; separately profile a complete run with busy scenes on an ordinary mobile device. [Google INP](https://web.dev/articles/inp)

Proposed local acceptance: no new sustained frame stalls, timer drift, input loss, or continuing audio after exit; compare the same device, scene, and build conditions. A 60Hz screen allows about 16.7ms between frames, but that is a physical frame interval, not evidence that this implementation meets a universal game performance target.

## When to stop expanding

The purpose is a pleasant optional brand experience that returns visitors to the service journey. GOV.UK recommends evaluating whether users complete their actual task and combining performance measures with observation; its benchmarking guidance includes completion, time, abandonment, perceived ease, and confidence. Those principles transfer to checking the booking journey, although its government-service requirements do not bind this site. [GOV.UK service performance](https://www.gov.uk/service-manual/measuring-success/using-data-to-improve-your-service-an-introduction), [GOV.UK usability benchmarking](https://www.gov.uk/service-manual/measuring-success/usability-benchmarking-a-website-or-whole-service)

**Proposed stop criteria, explicitly product judgment:**

1. Ship this refinement once new players can select, collect, unload, and finish without explanation; can describe the heavy-item tradeoff; and can find the service/offer action afterward. Observe keyboard and touch users, including the existing accessible/calm route.
2. Stop feature growth when chassis differ usefully, mixed cargo rewards are correct, the 60/120/180-second boundaries work, and performance/accessibility checks pass. More sessions or higher scores alone do not justify expansion.
3. Before another feature, name a specific observed problem and the smallest change likely to fix it. Reject proposals with no observed user need, unclear benefit to the service journey, or requirements for another tutorial or screen.
4. If a small round of representative playtests finds no material comprehension or enjoyment improvement after one tuning pass, keep the clearer version and stop. A small sample discovers problems; it does not prove conversion lift.
5. If the arcade makes quoting harder to find, causes serious mobile stalls, confuses the 5% offer, or frustrates people who cannot play the action mode, fix or simplify that experience before adding content.

Keep the 5% reward and maximum three-minute run unchanged. Existing traffic/booking information, consenting observation, and manual comparison are sufficient for this decision; this research does not recommend installing event tracking. There is no evidence here that longer play, extra chassis, an endless mode, or more rewards would improve commercial outcomes.

## Implemented starting balance

The implementation follows the principles above with a stronger quick-lift identity for the default chassis. The chosen values supersede the provisional tables for this build; they remain tuning judgments. Lifter is the existing lime domed craft, Scout has a pale swept silhouette, and Hauler has a broader gold hull. All start with three shields and the same collision rules. Ion Dash uses a common protected burst speed of 540 for 0.65 seconds, then returns to chassis speed; this is an explicit shared power-up rather than a permanent removal of the speed tradeoff.

| Chassis | Speed | Slots | Lift-time multiplier |
| --- | ---: | ---: | ---: |
| Scout | 280 | 4 | 1.00 |
| Lifter (default) | 225 | 5 | 0.80 |
| Hauler | 205 | 7 | 1.00 |

| Item | Base seconds | Banked points |
| --- | ---: | ---: |
| Boxes | 0.45 | 100 |
| Tire | 0.60 | 125 |
| Television | 0.85 | 175 |
| Mattress | 1.10 | 225 |
| Sofa | 1.40 | 300 |
| Refrigerator | 1.65 | 350 |

At 1.65 seconds the longest lift is 2.75% of a first shift, before travel. Lifter reduces it to 1.32 seconds. The point value appears beneath the filling charge bar; item instructions expose the complete table. Cargo keeps both its count and accumulated value. Extensions preserve both, and normal finish, manual finish, truck delivery, and Cargo Launch credit the same value once. Full deliveries still add 100 points. Scoring uses fresh v4 best-score keys, preserving older saved records.

Native radio labels are 56 CSS pixels high; a default is selected, and choosing a chassis does not start the timer. The hangar replaces the former decorative title illustration. No new route, download library, account, tracker, reward requirement, or longer play limit was added. The untimed accessible cleanup remains a separate unchanged mode.

Automated checks exercise individual pickup durations/rewards, mixed-load accounting, capacity limits, extension persistence, collision preservation, and all existing game rules. A deterministic 30-seed sweep of nearest-item and value-weighted routes also completed for each chassis. It was a simulation sanity check, not a user study: the pilot did not deliberately dodge hazards, so the results cannot establish chassis balance or conversion impact. The default Lifter scored highest on those routes, reinforcing the need to observe actual evasive play before claiming the faster Scout is equally competitive. No balance or business-outcome claim is made from those runs.

Release verification: 63 automated tests, lint, type checking, production build, and production HTTP checks passed. Browser checks at 375×667 and 1366×768 showed all chassis choices and both start actions, with no horizontal overflow. Scout launched with four slots, default Lifter launched and paused, and Hauler launched with seven slots and retained its identity with ten after Cargo Bay at the first dock. All three preview SVGs returned HTTP 200. These are local browser checks, not physical-device coverage, assistive-technology certification, field Web Vitals, or a conversion study.
