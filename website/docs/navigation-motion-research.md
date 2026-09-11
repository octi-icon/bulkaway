# Navigation motion research

Researched September 11, 2026. Scope: restrained atomic-era page entry and mobile navigation motion for the existing site.

## Recommendation

Use a brief entry animation on newly committed page content and a small dropdown reveal on mobile. Keep navigation immediate. Express the theme through a short orbital accent or starburst settling into place, not large page movement, bouncing, a screen-covering transition, or a loading performance. Suggested timing below is design judgment for this site's fast, tactile character, not an accessibility standard.

| Element | Proposed treatment | Duration |
| --- | --- | --- |
| New page's introductory content | Fade from roughly 0.75 to 1 with at most 6–10px of translation; settle without overshoot | 220–280ms |
| Small decorative orbital line/star | One short transform/opacity reveal, contained within the heading area | 240–320ms |
| Mobile dropdown | Translate from about -6px and fade; keep text scale stable | 160–200ms |
| Dropdown close | Immediate semantic close; optional very short visual exit if hidden links are removed from interaction immediately | 100–140ms |
| Reduced motion / site's pause control | Final state immediately, no displacement or decorative animation | 0ms |

Use an ease-out curve such as `cubic-bezier(.2,.7,.2,1)`. Avoid stagger delays on actionable navigation links. These choices extend the existing [visual direction](../../DESIGN.md), which specifies orbital geometry, tactile selectors, transform-based motion, and reduced-motion support.

## Why entry animation fits this installation

The project pins React/React DOM 19.2.8 and Vinext 1.0.0-beta.9 in [package.json](../package.json). The installed framework explicitly classifies React `ViewTransition` support as partial and describes its fallback as nonanimating in [Vinext's compatibility check](../node_modules/vinext/dist/check.js) (around line 942). Its public `router.push()` schedules navigation without returning the completion promise in [the installed navigation shim](../node_modules/vinext/dist/shims/navigation.js) (around line 1503).

Consequently, wrapping `router.push()` in `document.startViewTransition()` would not reliably wait for the new route's DOM commit. The native API expects the update callback's promise to resolve after its DOM update; the next snapshot is then taken. This is an integration concern, not simply a browser-support check. [MDN: startViewTransition](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition)

The current English React reference identifies React 19.3 and documents built-in View Transitions. Older indexed/localized material still calls it Canary, so do not describe all current React support as experimental. React coordinates DOM updates and navigation inside its own transition mechanism; its router guidance also discusses special handling for Back navigation and scroll restoration. Upgrading React/framework support solely for this decoration is unnecessary. [React ViewTransition reference](https://react.dev/reference/react/ViewTransition)

Implementation recommendation: animate a scoped, already-rendered page introduction through CSS or the Web Animations API after a pathname change commits. Avoid remounting the whole application with a pathname key. Keep server-rendered content visible by default and avoid waiting for animation before rendering or activating links. Do not transform an ancestor containing sticky or fixed interface elements. Animate a local wrapper or selected heading elements instead.

## Preserve existing behavior

[SiteExperience](../components/site-experience.tsx) already coordinates the pathname, focus, anchor destinations, Back/Forward restoration, and the site's pause preference. Integrate with that ownership rather than adding a second scrolling controller. Skip decorative page entry on history restoration and same-page hash navigation. Preserve the existing immediate scroll/focus behavior; do not animate scroll position.

[DraftSafeLink](../components/draft-safe-link.tsx) intentionally opens reading detours in another tab when a pickup request is in progress. Never prevent its native link behavior to run motion. Preserve modified clicks, target attributes, anchors, and native history behavior. These are implementation recommendations based on the local source.

## Dropdown accessibility

Keep the existing native button and named `nav` landmark. Use `aria-expanded` and a matching `aria-controls` target. Normal Tab/Shift+Tab traversal is appropriate; Enter/Space activate the button, Escape closes and returns focus to the trigger, and leaving the navigation can close it. Navigation links do not need `role="menu"` or `menuitem`; arrow-key support is optional. [W3C disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/), [W3C disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)

Implementation recommendation: ensure collapsed or exiting links cannot receive focus or pointer input. Opacity alone does not represent a closed menu. Prefer an opening-only animation with immediate close if supporting an exit animation would complicate hidden/focus states. Keep Escape focus restoration scoped to the open disclosure and preserve the existing close-on-outside-pointer and desktop-resize behavior in [SiteHeader](../components/site-header.tsx).

## Motion preferences and performance

Disable these nonessential effects for both `prefers-reduced-motion: reduce` and the site's `data-motion="paused"` setting. WCAG's Animation from Interactions criterion is Level AAA and allows interaction-triggered motion to be disabled unless essential; its explanation specifically addresses vestibular discomfort and unnecessary scroll motion. [W3C SC 2.3.3 explanation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

Prefer transform and opacity; avoid animating height, layout offsets, blur, or large shadows. Do not add blanket `will-change`: browser layer promotion has its own cost and should follow observed need. Inspect rendering work and dropped frames in browser performance tools. [Chrome team's animation performance guide](https://web.dev/articles/animations-guide)

## Focused verification

- Navigate between Home, Services, and Team; check content arrives immediately and effects remain local.
- Check Back/Forward retains prior scroll position; same-page and cross-page anchors land correctly.
- Start a pickup draft and confirm reading links still preserve it in the original tab.
- Open and close the mobile disclosure rapidly; verify Escape, Tab, outside click, route activation, and resize.
- Confirm closed links are absent from keyboard traversal and accessibility exposure.
- Test the device's reduced-motion preference and the site's pause setting independently; no delayed or permanently translucent content should remain.
- Check narrow mobile widths, zoom, and short landscape viewports for clipping and horizontal overflow.

These are recommended acceptance checks, not a claim that an implementation has already passed them.

## Implemented outcome

The shipped approach uses a 480ms gold star and lime speed-line accent in a noninteractive 24px strip at the viewport edge. New route headings settle over 280ms with a 6px movement; the long page and embedded game are never transformed or faded. These timings are brand decisions. Navigation is never delayed. Mobile dropdowns reveal over 260ms and retract over 180ms, with a bounded 100ms maximum link stagger; links become actionable immediately, and closing links become inert immediately. There is no added animation dependency.

Both the device reduced-motion query and the existing Pause motion preference suppress these effects. Native links, draft-preserving new tabs, downloads, modified clicks, and history retain their existing behavior.

Validation: production build, lint, typecheck, and HTTP checks passed. Browser checks at 390px and 1440px covered Home/Services/Team navigation, mobile open/close, Escape with trigger focus restoration, closed-link inertness, section anchors, and the site's paused preference. A follow-up tablet run was interrupted by the browser automation connection; device reduced-motion emulation was not available in that session. Reduced-motion overrides were checked in source, including specificity against the expanded dropdown styles.
