# Services, rates, and illustrated comparisons

## Owner clarification after review

Pricing is presented as service pricing rather than community-only pricing. The owner clarified that commercial and other customers may already use Pet Waste Pals or another Waste Solution Innovators company. The page now explains bundled versus standalone Bulk Away service and retains crew confirmation of the applicable rate and final quote. Numerical prices and conditions are unchanged. The original PDF remains as supplied; its community wording is historical source wording, superseded for website audience framing by this clarification. The owner also requested removal of the repetitive illustration disclaimer; comparison captions now contain only the usage instruction.

## Confirmed scope

The owner requested detailed explanations and new branded illustrations for all five current services, public pricing from `Bulk Removal Rates - 2026 (1).pdf`, and a before/after slider. Content lives at `/services` to keep the home page compact. Links in navigation, each home-page service panel, the pricing FAQ, and the footer make it discoverable. Each service's request link preselects the corresponding supported service in the existing form.

The one-page PDF was both text-extracted and visually inspected. Its two community categories must stay distinct. Bundle / standard: trash outs $200 / $400 minimum (quote required); on-demand one item starting $75 / $150; once-weekly bulk subscription $500 / $750 per month; chute rooms $20 / $40 per room including haul-off; donations/recyclables estimated $25–$50 fuel surcharge / $100 minimum. Include the 24–72-hour on-demand turnaround, subject to scheduling confirmation, weekly chute pickup discount note, subscription inclusions, and all extra-charge conditions. No universal homeowner price, hazardous-material acceptance promise, or invented per-item special fee.

## Visual and interaction direction

Read/Persuade mode in the existing Bulk Away world: Brookvale headings, restrained Taldose emphasis, Geograph body, ink/lime/gold/cream. A compact intro pairs with a matched apartment comparison. Five illustrated editorial sections explain scope, inclusions, request preparation, and price links. A contrasting pricing area holds both columns plus the downloadable original PDF. No new home-page gallery.

Images use the built-in image-generation tool. Every service has its own before/after comparison, showing substantial buildup and the crew removing it or the cleared apartment. The user corrected chute-room equipment to a four-wheel flatbed cart and clarified that its setting must be a separate enclosed upper-floor intake room, accessed through a full-height door from the interior hall. The rejected ground-floor and hallway-alcove versions are not shipped. See `chute-room-references.md` for primary-source architectural research. Dumpster-enclosure cleanup has no dolly or cart; crew members carry material and sweep. The truck uses a naturally proportioned rounded cab-over, open haul bed, and plum/lime livery. Prompt history and selected source files are in `services-assets.json`; generated files are exported as 640px and 1280px WebP assets. Comparison artwork is explicitly illustrative, not claimed as job photography. Each pair is derived from the same scene to preserve its architecture and perspective.

## Implementation evidence

- [W3C slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/): use a named native range input, keyboard adjustment, and meaningful value text. W3C identifies touch assistive-technology limitations for custom slider interactions; separate Before / Compare / After buttons provide a non-dragging option. No autoplay or forced animation.
- [web.dev responsive images](https://web.dev/learn/design/responsive-images): prebuilt responsive WebP sources, fixed intrinsic dimensions, appropriately sized downloads, eager comparison imagery and lazy below-the-fold illustrations. Detailed copy is server rendered; the home page imports only a small route map rather than the full catalog.

The source PDF remains unchanged and is copied to `public/downloads/bulk-away-rates-2026.pdf` for visitors.

## Final verification

Production build, scoped lint, TypeScript, and diff whitespace checks passed. The services route and downloadable PDF returned HTTP 200. Browser checks covered independent comparison state, Home/End/arrow-key adjustment, non-dragging buttons, 44px mobile button targets, loaded image pairs, service-link preselection in the pickup form, and no horizontal overflow at 1440, 640, 390, and 320 pixels. No browser error logs were recorded. Related pickup/service tests passed earlier in implementation.

The independent finish reviewer returned **ship** after reviewing continuous desktop/mobile viewport captures and targeted artwork/rate captures. The original full-page screenshot output had stitching defects and was replaced by overlapping viewport screenshots; these were capture defects rather than page defects. No physical-device or screen-reader testing was performed. The ordinary-extension documentation check preserved the incumbent design files. Image prompt provenance is retained in the asset manifest and adjacent WebP sidecars.
