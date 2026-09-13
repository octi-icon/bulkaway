# Arcade expansion research

Researched September 13, 2026. Scope: the existing Space Reclaimed browser arcade, a shorter cabinet, a meaningful upgrade after the first minute, optional longer play, richer levels and synthesized sound. Mechanics and tuning values below are design proposals, not findings established by the external sources.

## Existing implementation

The deterministic [engine](../lib/arcade-engine.ts) runs a 75-second shift in an 800 × 800 world. Three levels change every 25 seconds, with increasingly frequent hazards: cars, swooping UFOs, and warned falling debris. Cargo capacity is five; full-load deliveries earn an extra 100 points. B and R capsules temporarily enable split pickup and collision repulsion; H enables one cargo launch. These are collected bonuses, not chosen permanent upgrades.

The [runtime](../lib/arcade-runtime.ts) intentionally renders that world to a 320 × 320 canvas. Pointer positions map through the displayed canvas rectangle to world coordinates. Pause clears held keys and pointer targets, silences audio, cancels animation, and resets the timing origin on resume. Visibility loss, window blur, and canvas blur already pause. Preserve these behaviors.

The [component](../components/bulk-arcade.tsx) starts sound disabled, creates/resumes an AudioContext from the sound button, and keeps an untimed text-control cleanup alternative. The [audio module](../lib/arcade-audio.ts) already synthesizes collection, cargo bank, hit, power, level and repulsion cues plus a continuous beam voice. It has gain envelopes, cleanup and a 24-voice limit. Extend it rather than add a dependency or downloadable soundtrack.

The [CSS](../app/arcade/arcade.css) gives the full cabinet an 890px maximum width, a square canvas at full width, a large marquee, 510px title/result minimum heights, and a large control/instruction base. Embedded mode compresses much of this but its active square still follows all available width. No viewport-height budget currently coordinates the playfield with the surrounding controls. Reducing canvas resolution would not solve that CSS height problem.

## Viewport and cabinet

Use a square playfield whose displayed side is the smaller of its container width and the available height after marquee, HUD, controls, and surrounding page spacing. Prefer a stable `svh` budget for the active game: small viewport units account for expanded browser UI; `dvh` changes as that UI expands and retracts and can resize content during scrolling. Retain a normal fallback before the modern declaration. [MDN CSS length reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length)

Make the compact cabinet treatment shared by full-page and embedded modes. Put optional instructions in a disclosure, shorten the marquee, keep statistics on one row, and move decorative material out of the active height budget. Cap the square itself, not only its outer frame; otherwise the full-width canvas still overflows. Keep text and buttons at usable sizes rather than scaling the entire cabinet with a transform. On short landscape screens, a side control column is preferable to an extremely small playfield. Allow document scrolling at high zoom instead of clipping controls to meet an absolute fit target.

If CSS budgeting proves too brittle because wrapping changes the chrome height, observe the actual cabinet pieces with ResizeObserver and calculate a playfield size only when those pieces resize. Avoid reading and writing geometry in every animation frame. ResizeObserver observes element dimensions, including changes unrelated to viewport resize. [MDN Resize Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API)

Keep the existing world and low-resolution backing canvas. Its pointer mapping already supports proportional CSS resizing. Prototype acceptance sizes: 1440 × 900, 1366 × 768, 390 × 844, 375 × 667, and 844 × 390. Inspect ready, active, paused, upgrade, results and untimed modes; a screenshot of only the title screen cannot establish the active cabinet fits.

## Scoped session and upgrade design

Recommended proposal: a complete 60-second opening shift, followed by an untimed dock choice. Completing the opening shift earns the existing reward. The player can finish immediately, or select one of three upgrades to explicitly launch another 60-second leg. A second optional leg can cap total active play at three minutes. This avoids changing a short game into an unexpectedly long commitment; no source is being claimed to prove 60 seconds is the ideal duration.

Show a small dock panel associated with the cabinet, with the frozen world still visible, a heading such as “Shift complete. One more neighborhood?”, three concise upgrade buttons, and a plainly visible “Finish shift” action. No countdown, rotating offer, forced extra leg, or covering launch animation. Tell the player the extra duration in each action or adjacent shared copy. Pause the simulation and beam immediately when this panel appears. Selecting an upgrade both records the choice and starts the explicitly described extra leg.

| Permanent choice for this run | Initial tuning proposal | Meaningful play difference |
| --- | --- | --- |
| Wide Beam | Beam width 43 → 65; 25% faster lifting | Easier positioning and faster clearing; keep the temporary B capsule's two-target role |
| Cargo Bay | Capacity 5 → 8 | Fewer truck trips and longer collection routes; keep the full-load bonus rule explicit |
| Ion Drive | Flight speed 235 → 290; replenish one shield up to the normal maximum | Faster deliveries and a recovery choice for a damaged ship |

Offer only unowned upgrades at later docks, and display the installed upgrade in a compact HUD label. If repeatable upgrades are chosen instead, specify rank caps and exact effects; do not leave button labels disconnected from actual numbers. Tuning needs playtesting: the three branches should change strategy, not create one clearly dominant score multiplier. Do not require currency, add a tree, or introduce a new shop screen for this scope.

Separate active elapsed time, current-leg remaining time, and checkpoint state in the engine. Existing level calculation uses `ROUND_SECONDS - time`; merely increasing remaining time rewinds progression. Trigger a checkpoint once, stop simulation until a choice, and reject repeated selection calls. Preserve cargo, score, installed upgrades, and chosen run length. Clear active hazards or grant brief protection at departure so a player does not return directly into an unavoidable collision.

Decide explicitly when unbanked cargo scores. The existing end-of-run path automatically counts it and clears the hold; a dock must not call that path twice or lose its cargo on continuation. If extended scores share one leaderboard with short scores, longer runs dominate. Store separate short-shift and extended bests, or clearly label a single best as an unrestricted run. Never silently mix the old 75-second scores into a newly labeled 60-second best.

## Levels and dimensional detail

Reuse the existing three environment identities, with more deliberate spatial differences: a neighborhood street crossing; a commercial loading yard with two offset traffic lanes; an orbital salvage zone with clearly warned falling debris. Change junk placement patterns and hazard routes as well as palette. Use sparse, seeded formations so each destination is legible rather than just faster random traffic. This is a proposed game design based on the existing `levels`, `addJunk`, and hazard types.

Add dimension inside the world through small ground shadows, separate distant/background and foreground silhouettes, different building heights, cargo rising along the beam, and a short unloading scatter. Keep decorative depth separate from collision geometry. Avoid full-scene camera shake, perspective distortion, or overlays that conceal the truck and hazards. Reduce or remove decorative movement for both `prefers-reduced-motion` and the site's existing paused-motion preference; essential movement can remain. W3C's animation-from-interactions guidance supports disabling nonessential interaction-triggered animation and identifies vestibular concerns. [W3C animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## Audio and interaction details

Keep explicit sound opt-in and a visible mute button. Create or resume the AudioContext from the activating user gesture and handle a rejected resume. Browser autoplay restrictions apply to Web Audio, and the first-party guidance recommends user controls. On a user-initiated resume, retry `AudioContext.resume()` if sound is enabled and the context is suspended; setting gain alone does not restart a suspended context. [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

Add distinct short cues for upgrade installed, extra-leg departure, cargo launch, hazard warning and final shift completion. Use triangle/square oscillator sweeps and filtered noise through the existing envelope and voice limiter. Give beam lifting a small pitch change as charge rises, and soften its background level while delivery or upgrade cues play. Warn once when a falling hazard is spawned, not every frame while its warning field is positive. The Web Audio guide demonstrates synthesis using oscillators, noise buffers, filters and gain envelopes; the proposed sound character and timings are artistic choices. [MDN advanced audio techniques](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques)

Continue explicitly pausing on visibility loss. Browsers often stop requestAnimationFrame callbacks in background tabs and throttle timers; elapsed-time behavior should be owned by the game rather than inferred from callback availability. Hidden tabs and upgrade docks should silence all transient voices and the beam. [MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

Retain pointer capture and clear motion on pointer-up, cancellation, and lost capture. Restrict `touch-action: none` to the playfield and held directional buttons so normal page scrolling/zoom remains available outside them. Pointer capture retains delivery outside the target; touch-action declares whether the browser may handle pan/zoom. The canvas currently handles cancellation but can additionally clear its target on lost capture. [MDN Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

Use native buttons for upgrade and finish actions. Enter and Space activate buttons; make the whole visible choice one button with its name and effect in the accessible label. Use ordinary Tab order and a strong focus indicator. At the dock, focus the heading or first choice; after selection, return focus to the canvas. Do not make focus itself select an upgrade. [W3C button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/), [W3C focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)

Keep upgrade and touch controls at least 44px high as a practical project target. WCAG 2.2 AA's target-size minimum is 24 × 24 CSS pixels with exceptions and spacing alternatives; 44px is the proposed more comfortable size, not that criterion's minimum. [W3C target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

The upgrade decision should have no time limit. Retain the untimed cleanup alternative and full reward access. Do not describe one optional 60-second extension as automatically satisfying WCAG's timing criterion: its extension pathway calls for warning time and repeated extensions, while the essential-timing exception needs its own justification. [W3C timing adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)

## Focused verification

- Engine: one checkpoint at the first minute; no score/time changes while docked; upgrade applied once; capacity respected in targeting, collection, bank bonus and HUD; extension does not rewind level; cargo credited exactly once at final finish; restart resets upgrades; early shield loss still finishes normally.
- Runtime: blur/tab switch clears every held input; returning requires deliberate resume; input does not accumulate while docked; changing controls does not accidentally pause and strand a chosen upgrade; hiding the tab silences sound.
- UI: each choice announces its concrete effect and extra duration; keyboard can choose or finish; focus returns to a meaningful target; narrow screens wrap choices without clipping; touch controls remain reachable with browser bars visible.
- Experience: compare all three upgrade branches with identical seeds, test a full three-minute run, and confirm depth effects preserve warning/collision readability. Verify mute, reduced motion, untimed mode and reward access throughout.
