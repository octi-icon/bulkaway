# Bulk Away interaction details

Researched and implemented September 6, 2026.

## Direction

Make the controls feel like the illuminated switches and confident mechanical responses of an atomic-era service station. Keep the existing hero reveal as the main decorative moment; concentrate additional movement on things the visitor operates.

NN/g recommends brief, unobtrusive animation to acknowledge actions, explain changes, and connect navigation states. Its discussion of distraction argues against unrelated motion beside reading or form entry. [The Role of Animation and Motion in UX](https://www.nngroup.com/articles/animation-purpose-ux/)

The system's reduced-motion preference should have a deliberate alternative. Here, the selected indicator, open FAQ, and current form step remain legible when movement is removed. [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)

## Implemented

- **Service selector:** a small illuminated indicator marks the selected option. A 220 ms panel transition and a single 480 ms line sweep acknowledge each service change. The existing tab semantics and arrow-key navigation remain.
- **Action arrows:** a short directional movement on hover or keyboard focus makes the next action feel responsive. Down arrows move down; outward arrows move diagonally. Touch does not depend on hover.
- **FAQ toggles:** the plus turns into a close symbol and the answer enters over 200 ms. Native details/summary behavior remains intact.
- **Pickup progress:** completed/current segments fill in; the newly visible step settles over 180 ms. Inputs remain mounted, retaining answers and photo previews.

All added animations have reduced-motion and site-pause alternatives. They do not delay clicks, submission, or content availability, introduce autoplay sound, or add dependencies.

## Considered but omitted

Cursor trails, magnetic buttons, scroll hijacking, and repeated section entrances would compete with the existing stars, sign, and ticker. Confetti would overstate routine interactions. The current form still sends a request, so it should not celebrate a confirmed booking.

These are design choices informed by the sources, not measured claims about Bulk Away's conversion rate or search ranking.
