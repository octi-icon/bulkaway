# Arcade expansion

## September 13, 2026 — optional extended shifts

### Chassis and weighted pickups

The timed game now offers three starting chassis: Scout (280 speed, 4 slots), Lifter (225 speed, 5 slots, 20% less lifting time), and Hauler (205 speed, 7 slots). Lifter is preselected. Each uses its own cached pixel silhouette, shared with the compact radio selector's SVG previews. The chassis stays fixed throughout the run. Cargo Bay adds three slots; Twin Beam and Ion Dash remain separate upgrades.

Boxes take 0.45 seconds for 100 points, tires 0.6/125, televisions 0.85/175, mattresses 1.1/225, sofas 1.4/300, and refrigerators 1.65/350 before the Lifter multiplier. Every item occupies one slot. Progress bars and point labels show the commitment; delivered score uses the actual mixed cargo value. Truck unloading and Cargo Launch retain the 100-point full-load bonus. Finishing credits cargo still aboard exactly once. New v4 personal bests keep this scoring edition separate from older saved scores without deleting them.

See [research and scope limits](docs/arcade-chassis-research.md). These starting balance values are provisional design choices, not externally validated optima. Further work should prioritize observed usability or performance problems and the pickup-request journey before new game systems.

The current edition starts with one 60-second shift. At the dock, the simulation and audio stop until the player finishes for the existing SPACE5 reward or chooses an upgrade for another minute. Two optional extensions cap active play at three minutes. Elapsed time is independent of the current shift timer, so extensions never rewind progression. Nine 20-second areas reuse three distinct pixel environments, with later routes adding paired traffic, wider UFO patrols, and warned debris aimed at the pilot's last position.

The permanent choices are Twin Beam (two targets, or three with a B capsule), Cargo Bay (three extra slots), and Ion Dash (Shift/button burst with protection and a six-second recharge). Each extension repairs one shield, capped at three, and preserves cargo and score. Choices cannot be repeated; final cargo is credited once. One-minute and extended bests use separate storage keys. Previous records remain untouched.

Both the homepage embed and standalone cabinet use a viewport-aware width, compact marquee, controls, and collapsed instructions. Starting a new run aligns the cabinet once only when it is outside the viewport; level changes, upgrades, and resume never scroll the document. Upgrade choices pause play and have no decision timer. The dock sizes to all choices and the finish action without an internal scrollbar, hiding the in-game power bar and status to reclaim space. The 320 × 320 backing canvas and square world remain unchanged.

Enemy rosters now mix cars with slower, wider haulers, and rival UFOs with patrol drones that weave downward after an entry warning. Haulers have a wider collision footprint; drones follow a distinct vertical route. Both use cached original pixel sprites and work with the existing Repulsor power-up.

Locally synthesized effects now distinguish cargo launch, dash, debris warning, upgrade installation, and completion. Sound remains opt-in, bounded to 24 transient voices, and is silenced on pause and lost visibility. Decorative lifting, unloading particles, and dash exhaust respect reduced motion. Three static backdrops and pixel sprites are cached; no audio downloads or new dependencies are needed.

The unload cue pairs soft cargo impacts with a rising C-major chime. Launch and Repulsor end on bright, steady notes; warning pips repeat at one pitch. A rough downward double buzz is reserved for shield damage. Pickup tones are shorter, the tractor-beam harmonic is softer, and dash uses a filtered rising whoosh. Audio tests cover the unload/damage distinction as well as opt-in, cleanup, and the voice limit.

Research and primary sources: [browser arcade expansion research](docs/arcade-expansion-research.md). Automated coverage includes checkpoint freezing, explicit extension, duplicate rejection, capacity, dash recharge/protection, all nine levels, three-minute limits, and audio cleanup. The original untimed cleanup and reward flow remain available.

## September 9, 2026 — previous edition

The 75-second run now progresses through three 25-second levels: Neighborhood Sweep (cars), Commercial Chaos (cars plus swooping UFOs), and Orbital Rush (faster traffic plus falling debris). Debris lanes have a static 1.25-second warning before movement or damage. Level changes clear traffic and provide two seconds of protection.

Fly directly over lettered capsules to collect them. B grants Split Beam for ten seconds, allowing two targets to charge and lift together within a wider range, still respecting the five-item cargo limit. R grants eight seconds of Repulsor: collisions remove the hazard and award 75 points instead of damage. H stores one Cargo Launch, spent with Space or the on-screen button to bank cargo remotely with the existing full-load bonus. Empty holds do not consume the charge. Capsules expire after fourteen seconds; at most two are present. Timers advance only with the simulation, so pause, blur, and hidden-tab handling also stop power-up expiry.

The gameplay display has a compact level label, B/R/H status cells with countdowns, and a clearly enabled/disabled launch control. Level changes highlight the existing level label; no announcement overlays the playfield. Explanations live in How to play, and status regions reserve consistent space to prevent wrapping from moving the canvas. The embedded mode selector expands to fit both buttons. Pickups use matching B/R/H pixel glyphs; split beams are gold and the repulsor has a larger field. All sound remains opt-in, with new pickup, level, and repulsion cues. Static scenery stays cached and sprite assets remain local. Motion preferences suppress decorative bobbing; warning markers never flash.

The crew-applied SPACE5 offer is unchanged. The expanded game uses a separate v2 local best-score key so scores with new bonus mechanics are not mixed with the original edition. The original key is not deleted.

## Taller playfield

The timed playfield now uses an 800 × 800 world rendered at 320 × 320 pixels, giving 33% more vertical play space at the same width. Junk, capsules, traffic, debris warnings, and the truck's unloading bounds use the taller world. Sprites keep their original proportions. The embedded control deck keeps the direction pad and a vertical pair of pause/sound buttons side by side, preserving 44px touch targets.

## Untimed route

The former twelve-button list is now a turn-based pixel cleanup across The Courtyard, The Loading Dock, and The Moonlight Lot. Each stop has four items in fixed positions. Select an item to collect it into a three-item hold, then unload into the Bulk Away truck. Only delivered items score. Clear each stop before choosing Next stop; the reward appears after the final delivery. Empty unloading, duplicate pickup, overfilling, early advancement, and actions after completion are rejected by the pure cleanup model. There is no clock, collision, reflex requirement, or separate leaderboard.

Buttons remain in place after pickup, keyboard focus stays stable, status updates are announced, and the next location's heading receives focus on advancement. Sound remains opt-in; the UFO movement respects motion preferences. Restart cleanup creates a fresh route. Choose mode restores the timed arcade entry screen. Inactive flight controls are omitted from untimed play.

Untimed verification completed the full route in the production preview, including keyboard pickup, full-hold blocking, unloading, all three stops, the 1,200-point finish and SPACE5 reward, replay, restarting a partial route, and returning to mode selection. Desktop and 390px mobile layouts were inspected; mobile had no horizontal overflow. The release checks pass with 46 tests, type checking, lint, a production build, and HTTP checks including the truck sprite.

Verification includes engine tests for boundaries, pickup expiry, simultaneous collection at capacity, one-charge remote delivery, collision conversion, meteor warnings, and bounded complete runs. Desktop and 390px mobile checks used a loopback-only fixture with the real runtime and controls: observed dual collection, repulsion points, level transition, keyboard and button launches, and paused timers. The fixture is excluded from Git and the production build.

Verification for the September 13 edition: 58 automated tests, lint, type checks, production build, and standalone HTTP/navigation/asset checks pass. Browser QA reached the real 60-second dock, selected Ion Dash, verified its six-second cooldown and restored canvas focus, kept a paused timer unchanged, and finished for the existing reward. The homepage unlock and embedded game were checked on a 375 × 667 viewport with no horizontal overflow and all six 44px controls inside the cabinet. At 1366 × 768, the final standalone cabinet measures about 398 × 716px and aligns fully inside the viewport after Start. Broader physical-device and email-client testing are separate from this game pass.
