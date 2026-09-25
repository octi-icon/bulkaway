# Bulk Away team portraits and interaction design

## September 24 art direction update

The owner selected Atomic Poster, then approved revised Heather and Regina examples after requesting closer preservation of original body shapes and less exaggerated hair. All eleven styled portraits now follow that corrected direction: original poses and builds, varied ivory/charcoal/sage/teal/mustard clothing, subtle period styling without raised crown bumps, and printed halftone texture across faces as well as clothing and backdrops. Original-photo controls and the separate Bulk Away crew row remain in place.

This supersedes the photographic duotone direction below. The built-in image-generation tool produced the artwork; Sharp exported the 320/640px WebP delivery variants. Final prompts and source mappings are in `atomic-poster-portraits.json`; current assets are recorded in `team-portrait-assets.json`. Versioned styled-image URLs refresh cached portraits without changing original-photo URLs.

## Placement refinement

After reviewing the full homepage, the owner found the roster made it too long. The complete gallery now lives at /team, reached through a compact introduction in the existing About section. Portrait interactions remain on that dedicated page; the homepage does not load the gallery images. Bill's portrait loads eagerly on the team page, while directory portraits remain lazy-loaded. This placement supersedes the original inline-homepage placement discussed below.

## Recommendation

Extend the established atomic-era identity with photographic duotone portraits, restrained halftone texture, cream paper, lime circles, and gold starbursts. Feature Bill Loftin first as Bulk Away Division Leader. Present the five advisory board members and four WSI business and operations professionals beneath him with clear group filters. Keep every name and role outside the photograph, readable without interaction. Give visitors an explicit button to compare each stylized portrait with its original photograph.

This is an application of the existing brand, rather than a historical reconstruction or a claim that one visual style improves search rankings. The logo, supplied photographs, existing fonts, and confirmed organizational roles are the primary project evidence. The design recommendations below combine that evidence with photography, usability, accessibility, and browser-performance guidance.

## Portrait treatment

Adobe's duotone tutorial describes mapping colors onto tonal values while retaining an original image. It supports a coherent palette without reducing a face to a flat silhouette. For Bulk Away, plum shadows and cream highlights keep facial contours legible, while muted gold ties the photographs to the supplied logo. Lime belongs mainly in the backdrop so skin does not become green. This specific palette assignment is a design judgment, not a measured conversion result. [Adobe, Use Photoshop to create a duotone effect](https://www.adobe.com/creativecloud/photography/discover/duotone-effect.html).

Halftone texture connects the images to printed advertising. Adobe distinguishes fine, subtle dots from coarse dot patterns associated with vintage comics and low-grade print. Fine texture is the better fit here: visitors need to recognize people, including hair, eyewear, expression, and facial details, at small screen sizes. Coarse dots over eyes and mouths would undermine that purpose. [Adobe, Halftone effects](https://www.adobe.com/products/photoshop/halftone-effects.html).

Each source is edited separately with explicit instructions to retain identity, expression, age, clothes, and pose. Bill's completed portrait supplies the visual reference for the rest of the series. Source images remain in the private working directory; optimized original-photo variants support the comparison control. Generated edits are interpretive and require human likeness review before publication. The original toggle makes that distinction transparent to visitors.

Alternatives considered were untouched office photographs inside decorative frames, heavily illustrated characters, and photographic duotones. Untouched photographs preserve maximum fidelity but their cool blue office backgrounds conflict with the established palette. Illustrated characters are more playful but introduce larger likeness changes. Duotones with a photographic original option best balance recognizability, brand consistency, and visitor control.

## Content and hierarchy

Nielsen Norman Group's eye-tracking research distinguishes relevant portraits of actual people from generic decorative imagery. Visitors study images that tell them something about a company, while frequently overlooking filler. Its team-page example also shows that visitors can scan portraits faster than long biographies. That supports using the supplied real team and concise verified roles rather than invented personality traits, quotations, tenure, or achievements. This evidence is qualitative usability guidance, not a prediction of Bulk Away conversion rates. [Jakob Nielsen, Photos as Web Content, originally 2010](https://www.nngroup.com/articles/photos-as-web-content/).

Bill's larger portrait and adjacent title establish the division's leadership. Advisory board members follow: Robert Watson, Kris Watson, Justin Watson, Shauna Loftin, and Andrea Gray. Support members are Eddie Carey, Regina Enman, Heather Rapallo, and Skylar Clemons. The directory explicitly identifies these roles as Waste Solution Innovators roles, avoiding an implication that every person works directly in Bulk Away operations. Acronyms remain as supplied rather than expanding CMRO or CSO without confirmation.

The homepage's existing About section links directly to the new people section. The pickup shortcut remains available, and Bill's feature includes a direct request link. This makes browsing optional for customers who already want service. The section uses logical headings and a labeled region, consistent with WAI page-structure guidance. [W3C WAI, Page Structure Tutorial](https://www.w3.org/WAI/tutorials/page-structure/).

## Interaction choices

Group filtering offers three explicit choices: Everyone, Advisory board, and Business & operations. Native buttons expose their pressed state; a short status message announces the filtered count. Filtering does not move keyboard focus to a new location. It changes which people are shown, without rotating a carousel or imposing a timer.

Each portrait has a visible camera button that toggles between the atomic treatment and the original. Its accessible label identifies the person and changes with the visible action, from showing the original to returning to the atomic portrait. Keyboard users can activate it with standard button keys. Names and titles stay visible in either state. No biography, title, or required action relies on hover. [W3C WAI, Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

When motion is enabled, a small portrait zoom responds to hover or keyboard focus. There is no looping wobble, automatic flipping, mouse-following distortion, or large scroll-linked movement. Both the operating system's reduced-motion preference and Bulk Away's Pause motion setting suppress the zoom. W3C's C39 technique explains why nonessential interaction animation should be suppressible, including for people who experience nausea or distraction. This is a component-level safeguard, not a declaration that the entire site has passed a WCAG audit. [W3C, Technique C39](https://www.w3.org/WAI/WCAG21/Techniques/css/C39).

## Performance and delivery

Portraits are below the hero, so native lazy loading is appropriate. Explicit width, height, and a fixed aspect ratio reserve their space before they arrive. The originals are requested only when a visitor chooses them. Using responsive image candidates avoids sending the full camera-resolution JPEG files to phones. [web.dev, Browser-level image lazy loading](https://web.dev/articles/browser-level-image-lazy-loading), [web.dev, Responsive images](https://web.dev/learn/design/responsive-images).

The supplied headshots are several thousand pixels tall. The site delivers 320- and 640-pixel-wide WebP variants, with larger candidate selection controlled by the browser. Originals and edited images share the same 4:5 display area so switching photographs does not change layout height. Only simple React state and existing Lucide icons are needed; no new animation library or image service is introduced.

The main hero remains the likely initial visual priority, so the team images are not preloaded. web.dev's LCP guidance warns against delaying the actual largest-contentful image with lazy loading; that warning applies to above-the-fold primary imagery, not all below-the-fold photographs. The implementation therefore keeps the existing hero loading behavior intact. [web.dev, Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp).

## Verification and limits

Acceptance checks cover all ten names and supplied titles, functioning group filters, original-photo toggles, keyboard activation, visible focus, mobile wrapping, missing images, image payload sizes, and reduced-motion behavior. Responsive screenshots should show full heads and readable role labels. Production checks must continue to pass after the new component is included in lint coverage.

There is no evidence supporting invented claims about these individuals, a new corporate reporting structure, or a guaranteed commercial benefit from this treatment. The two identical unnamed clipboard images were confirmed by the site owner as Kris Watson; only one is used. The owner remains the authority on individual likeness and corporate titles.

