# Cursor accessibility options

Implemented September 7, 2026. The original 32 × 32 atomic cursor SVGs and 3,3 hotspots are unchanged.

The hero and every page's footer now expose native, keyboard-operable **Cursor options** disclosures. **Use my device cursor** removes the site's custom pointer so the browser/system supplies the pointer. **Turn off click sparkles** independently disables click bursts and hides any burst still finishing. Neither control changes the default artwork. Existing global motion pause and system reduced-motion support remain in place. Forced-colors mode uses contextual system pointers and suppresses click bursts; touch/coarse-pointer devices receive no custom cursor.

Choices are held in shared page state and saved under `bulk-away-cursor-v1` in sessionStorage for the current tab, including reloads. Invalid saved shapes are ignored. Storage access is guarded; controls remain usable if storage is blocked and a failed save is explained. The privacy notice and storage popup now describe these preferences. No personal data or new tracker is stored.

## Verification

- Opened the disclosure with Enter and changed both checkboxes with Space.
- Device mode computed `auto` on body, `pointer` on a link, and `text` in the notes field. With click sparkles off, the layer computed `display: none`.
- Reloaded, then followed the privacy link. Both preferences survived and were checked in the footer controls.
- Re-enabled the custom cursor separately while leaving sparkles off; computed cursor still pointed to the unchanged SVG with the original hotspot.
- Returned both controls to defaults. Disabled haul-list link computed `not-allowed`, and text entry retained its text pointer.
- Inspected the controls at desktop 1440 × 1000 and mobile widths 522 and 390. At 390 × 844, summary and both checkbox labels measured at least 44 px high; the page had no horizontal overflow. Keyboard focus outlines were visibly present.
- Lint, TypeScript checking and the precompressed production build passed. Production HTTP verification passed, including compressed-asset integrity.
- Cursor asset SHA256 values stayed unchanged: `D865304AC7ADEED93F95FE624376B7750D998BF63CEF85DBE6F4E7EA5BA3077B` and `108ECDE9DB2F6AF0CB979DAD892AD62C239F51385F0BCC81E34CD2DC54B7EBD1`.

Forced-color and reduced-motion behavior were checked in source; operating-system preference changes and a screen-reader session were not performed. This feature is not an accessibility certification.

## Primary guidance

- [MDN cursor reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/cursor): contextual fallback pointers and accurate hotspots.
- [W3C reduced-motion technique](https://www.w3.org/WAI/WCAG21/Techniques/css/C39): respect the user's motion preference for interaction effects.
- [MDN forced-colors reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors): accommodate user-selected forced colors.
