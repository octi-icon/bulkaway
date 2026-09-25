# Space Reclaimed level pacing

The previous implementation treated every 20-second pressure increase as a new level: it changed the scene, deleted traffic, reset spawn timers and protection, and played a level announcement. This interrupted a continuous one-minute shift without a player decision.

Levels now correspond to the three optional one-minute shifts: Neighborhood Sweep, Commercial Circuit and Orbital Yard. Only accepting a checkpoint upgrade moves to the next location. Existing traffic and collection state stay intact during each shift. Internal pressure stages still introduce UFOs and debris, but new spawn speed and interval interpolate over ten seconds; existing hazards retain their motion.

A compact, reserved line provides a five-second heads-up before new hazard types and before a shift ends. It uses a semantic status output and does not cover or move the playfield. The final shift notice does not offer an unavailable upgrade. Checkpoint copy names the next location. Initial hazard entry warnings, pause behavior, reduced motion, cargo state, recycling rewards and the optional finish reward remain available.

Regression coverage includes uninterrupted traffic/pickups/protection, stable level identity, continuous spawn-speed ramps, advance notices and three explicit shift choices. Browser coverage checks the notice and stable canvas geometry across the former 20-second transition at mobile and desktop widths.
