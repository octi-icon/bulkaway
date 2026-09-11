# Pickup question and hint hierarchy

Research date: September 11, 2026.

## Recommendation

Give the pickup textarea a clear three-part reading order: prominent question, supporting hint, answer field. Keep “Give us the scoop” as the visible label and apply the same hierarchy when its text changes to “Extra details (optional).” The reported screenshot issue is that the question and longer guidance compete visually. Increasing the question’s size and weight addresses that problem without hiding useful instructions.

Suggested starting values, to judge in the actual desktop and mobile form:

| Element | Suggested treatment |
| --- | --- |
| Question label | 1.2–1.25rem, weight 700, line-height 1.25–1.3; existing bright cream text |
| Hint | 0.9rem, weight 400, line-height 1.5; existing muted text if its contrast passes |
| Label to hint | 4–6px |
| Hint to textarea | 10–12px |
| Group separation | More space before the question group than between its label and hint |

These exact sizes and gaps are design recommendations, not values mandated by WCAG or validated conversion improvements. Use size, weight, and proximity together so the hierarchy does not depend only on a color difference.

## Evidence and application

W3C recommends visible labels that describe each control’s purpose, explicitly associated through matching `for` and `id` attributes. It recommends labels above text fields and a close, distinct relationship between label and control, with particular benefits for mobile and low-vision users. Keep the native `<label htmlFor="pickup-details">` and textarea `id="pickup-details"`. Increasing the label’s visual emphasis does not require changing its semantic role. [W3C WAI: Labeling Controls](https://www.w3.org/WAI/tutorials/forms/labels/)

GOV.UK’s textarea guidance places a short, direct, sentence-case label above the textarea; its examples separate the label, hint, and control inside one form group. It explicitly warns against treating the label as a page heading when there are multiple questions on the page. For this existing form, retain a label rather than introducing another page heading. The larger label here applies that separation to Bulk Away’s visual style; GOV.UK does not prescribe the proposed dimensions. [GOV.UK Design System: Textarea](https://design-system.service.gov.uk/components/textarea/)

W3C explains that `aria-describedby` associates additional instructions with the field, allowing the description to follow the accessible label. It also explains why placeholders cannot replace labels: they disappear during entry and make checking an answer harder. Preserve the persistent hint and its `service-notes-hint` ID, and keep both hint and error IDs in `aria-describedby` when an error is present. If placeholder wording is shortened later, all necessary instructions should remain visible outside the textarea. [W3C WAI: Form Instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)

WCAG 2.2 criterion 1.4.3 requires at least 4.5:1 contrast for ordinary text, with a 3:1 exception for qualifying large text. For this change, target at least 4.5:1 for both the question and hint against their actual rendered background. Reducing the hint’s emphasis must not make it hard to read. Contrast should be calculated using the foreground and background colors, rather than sampling antialiased letter edges in a screenshot. A hierarchy complaint alone does not establish a WCAG contrast failure. [W3C: Understanding Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## Current implementation and verification

### Implemented refinement

The final design uses a cream panel (`#f5efd9`) to clearly distinguish the question-and-answer group from the dark form. The label is a bold, direct question: “What needs clearing?” or, when items are selected, “Anything else our crew should know?” A separate Required/Optional marker states the requirement. Service-specific guidance stays visible at 16px, and the textarea has its own dark border and keyboard focus outline.

Measured color contrast against the panel is 15.19:1 for the question, 7.54:1 for the hint, and 7.96:1 for validation errors. Desktop and 390px/320px mobile layouts were checked for wrapping and horizontal overflow. Clicking the label focuses the textarea; hint/error IDs remain associated. Selecting items now clears a previous missing-description error when the description requirement is satisfied.

At inspection, `components/pickup-form.tsx` already provides the correct explicit label association, a persistent service-specific hint, and `aria-describedby` that includes the hint plus a conditional error ID. `app/engagement-round2.css` styles `.field .service-notes-hint` at `0.85rem`, normal weight, and `#d3ccd7`. The adjustment can focus on a scoped question style and spacing while preserving these existing relationships.

Verify the default and selected-item label variants, multiple service hints, and the validation-error state at desktop and narrow mobile widths. Confirm that longer hints wrap naturally, the label remains visually dominant, clicking it focuses the textarea, and the hint/error references still resolve. Measure final text contrast after the complete stylesheet cascade is applied.
