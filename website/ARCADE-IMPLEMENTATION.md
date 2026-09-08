# Space Reclaimed arcade

Implemented September 8, 2026 following the approved arcade concept. User selected a 5% discount and deferred a persistent leaderboard.

## Delivered

- `/arcade`: brand-colored retro cabinet, original geometric UFO/truck/junk sprites, 75-second timed game, automatic tractor beam, five-item capacity, truck unloading with full-load bonus, traffic and rival UFO hazards, three shields, brief collision protection, end-of-round cargo credit, restart and pause/resume.
- Keyboard arrows/WASD, pointer dragging and holdable direction controls. P/Escape, canvas/window blur and document hiding pause a timed run. Sound is optional, starts off, uses short synthesized tones and has no external assets. Ambient beam particles respect reduced motion and the site motion setting.
- Separate untimed text/button cleanup: twelve items, no reflex requirement, no moving hazards, same reward. It does not overwrite the competitive local score. This alternative is not a claim that the visual timed game is fully accessible to every player.
- Local personal best only, clearable under the cabinet, with a storage-blocked fallback. Privacy notice explains its storage key and removal. No public score board, account, or analytics.
- The approved `SPACE5` offer appears after either completed mode. Its pickup link includes `offer=SPACE5`; the form shows and submits the offer, validation recognizes only that exact code, and the crew email and frozen receipt include 5% off the next removal. No payment or booking is made by playing.
- Homepage teaser and footer links use draft-safe navigation and disable prefetch. The canvas runtime is dynamically imported only after Start; no game engine dependency was added. Site click sparkles are excluded inside the cabinet to keep controls/playfield clear.

## Offer boundary

SPACE5 is a staff-applied promotional code, not a server-verified completion certificate or a unique redemption token. It is visible client-side and can be shared. No single-use enforcement, redemption database, minimum job value, expiration, or stacking policy has been invented. The crew applies 5% when quoting the next removal. Persistent issuance/redemption controls can be added with the future backend/Helm integration.

## Verification

- 35 behavior tests pass, including collection alignment and capacity, deposit-once/full-load scoring, collision immunity, final-score freezing, deterministic movement, stored-score validation, exact offer recognition, safe email formatting and frozen receipt offer.
- TypeScript, lint and production build pass. Existing HTTP suite passes for public pages, indexing, compressed assets, validation and invalid photo rejection before mail delivery.
- Browser, desktop 1440 × 1000: Start focuses the canvas, timed play collects junk, Pause stays paused, Resume returns to play, collisions end the run, result receives focus, and the score persists after navigating away and back.
- Browser, mobile 390 × 844: inspected playfield/control deck and reward; direction control moves the UFO; Pause remains usable; no horizontal overflow. Completed all twelve untimed choices and verified identical SPACE5 reward without changing the timed record. Reward link opens the pickup form with the offer included. No live request was sent.
- Review caught startup focus targeting a still-hidden canvas and a potential Pause pointerdown/blur race. Focus now occurs after the playing render; Pause preserves pointer intent. Final visual fix gives the marquee script dark ink on lime; spawn placement reduces overlapping junk, and singular result copy is corrected.

No live email, discount redemption, field performance measurement, or full assistive-technology certification is claimed. Google/SMTP/production launch configuration remains separate from this game.
