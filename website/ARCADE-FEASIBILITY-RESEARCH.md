# Bulk Away arcade feasibility

September 8, 2026. Bounded research for a retro cabinet game: drive a truck or fly a UFO, collect trash, avoid vehicles, retain high scores, and offer a participation discount. Research only; no game implementation, device benchmarking, reward issuance, or deployment was performed.

## Recommendation

A short, single-screen 2D arcade game on a dedicated `/arcade` route is a reasonable fit. Build the cabinet and controls with the existing React/CSS stack and render gameplay with Canvas 2D. Load the game and sound assets only after an explicit Play action. Keep the ordinary service and request flow available without playing. These are implementation judgments, not measured performance or conversion results.

Start with one movement model, one collection action, a bounded round, and truck/UFO visual variants. A full physics engine, 3D runtime, multiplayer, and accounts would add complexity without answering the initial gameplay question. Prove controls and frame stability on real phones before expanding the game.

## Verified facts and their implications

| Area | Primary-source evidence | Application recommendation |
| --- | --- | --- |
| Rendering | MDN recommends `requestAnimationFrame`, pre-rendering repeated artwork, avoiding costly repeated image scaling, and caution with heavy physics libraries. Static backgrounds can be CSS instead of redrawn canvas content. [MDN: optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) | Use a fixed logical playfield, cached sprites, simple collision boxes, and bounded objects/particles. Keep simulation outside React render state; update DOM score/status at meaningful changes. Reserve cabinet dimensions before loading. Cap rendering resolution on high-density phones and measure visual quality versus cost. |
| Audio | Web Audio should be created/resumed from a user gesture. MDN also recommends user controls for sound, including mute and volume. [MDN: Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) | Start audio from Play or a sound toggle; make the game fully understandable while muted. Use a few short effects. Remember the user's preference; handle blocked audio without blocking play. |
| Accessibility | WCAG 2.2 includes keyboard operation/no keyboard trap, visible focus, flash limits, and pointer target sizing. Its AA minimum target is 24 CSS pixels with stated exceptions; AAA enhanced sizing is 44 pixels. Timing and motion criteria have specific exceptions, so applicability must be evaluated rather than assumed. [W3C: WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Use real HTML buttons, clear instructions and text results. Provide keyboard and large touch controls, pause/exit, no strobing, reduced decorative motion, and an equivalent reward path that does not depend on reflexes. Scope movement keys to the active game. Test keyboard-only navigation and screen-reader status messaging. |
| Persistence | Render services use an ephemeral filesystem by default. Only writes under an attached persistent disk's mount path survive deploys/restarts; a disk is accessible to one service instance and prevents multi-instance scaling. [Render: persistent disks](https://render.com/docs/disks) | Do not store public scores or issued coupons in process memory or an ordinary JSON file. Use a durable database for shared records. A personal best stored on the device can be an initial mode, clearly labeled as local and allowed to fail gracefully. |
| Rewards | OWASP says security-relevant values must be derived on the server, workflows must reject replay, and sensitive operations need concurrency controls. It recommends feature-specific rate limits and abuse controls for value-dispensing features. [OWASP: business logic security](https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html) | Determine discount eligibility and value server-side. Use expiring claim sessions, idempotent issuance, and atomic single-use redemption. Never treat a submitted score or browser storage flag as proof of entitlement. |

## High scores and participation rewards

**Recommended separation:** scores provide replay motivation; participation provides a fixed owner-approved benefit. A high score should not increase the financial reward. This reduces the incentive to falsify scores and avoids making the discount depend on physical ability.

For a public leaderboard, accept only bounded display names and show no contact details. Rate-limit submissions, validate score/time bounds, and retain a way to remove abusive entries. These checks catch obvious abuse; a client-submitted score is still not authoritative. If competitive integrity matters, use server-issued seeds plus replay verification or server-authoritative simulation. That is additional backend scope, not a requirement for a casual local-best prototype. These are design inferences from OWASP's server-trust and workflow guidance above.

A unique coupon requires durable issuance and redemption records; a reusable public promo code is simpler but shareable. The owner must choose the actual offer, expiry, eligibility, and stacking policy before public copy promises a discount. Avoid putting a secret coupon or signing key into downloadable game code. Reward availability should remain understandable if the leaderboard or claim service fails.

## Verification before calling it ready

- Compare production homepage transfer and responsiveness with the existing baseline; verify no game runtime or sound download before activation.
- Test real iOS Safari and Android Chrome, keyboard desktop play, touch cancellation, small screens, orientation changes, muted/blocked sound, tab switching, pause/resume, and repeated starts/exits.
- Measure active frame consistency on a modest phone and confirm animations/listeners/audio stop when leaving the game.
- Verify collection/collision fairness and deterministic scoring; test malformed/impossible scores, duplicate claims, simultaneous redemption, expired claims, and persistence across restarts.
- Keep conversion claims unproven until observed: completion, replay, reward claims, and pickup requests are separate outcomes.

Local context: `package.json` confirms React 19.2.8, Vinext 1.0.0-beta.9, Vite 8.2.2, and the existing precompressed build command. Existing project research documents recent performance work; preserve those gains. The task context identifies the current Render deployment and lack of a database; infrastructure was not changed or independently provisioned for this research.
