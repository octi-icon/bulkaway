# Release edge research

Reviewed September 7, 2026. Scope: indexing controls, canonical URLs, social metadata/image delivery, and missing-page metadata. This was a bounded independent source and read-only HTTP review of the existing local production preview at `http://127.0.0.1:8788`. No application code, launch settings, deployment, or messages were changed.

## Findings

### 1. Prelaunch crawl blocking prevents the noindex instruction from being read

**Priority: P2.** With `PUBLIC_LAUNCH` disabled, [robots.ts](app/robots.ts) returns `Disallow: /`, while [layout.tsx](app/layout.tsx) emits `noindex, nofollow`. Fresh HTTP requests confirmed that exact combination on `/`, `/privacy`, and `/sms`; `/sitemap.xml` contains an empty `urlset`.

This combination does not reliably implement the documented intent to keep a publicly reachable preview out of search results. Google states that crawlers must be allowed to access a page to read its `noindex` instruction; a robots-blocked URL can still appear in results when another page links to it. This is a real configuration contradiction, though this review does **not** establish that any preview URL has actually been indexed. [Google: Block Search indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

**Recommended correction:** keep `PUBLIC_LAUNCH=false`, the HTML `noindex, nofollow`, and the empty prelaunch sitemap; allow crawlers to retrieve the public pages so that `noindex` can take effect, retaining the `/api/` restriction. Revise the prelaunch description in `QUALITY-NOTES.md` accordingly. If the intended requirement is access restriction rather than search exclusion, authenticated hosting is a separate operational decision. Do not enable public indexing as a remedy.

**Acceptance evidence needed after correction:** preview pages still emit `noindex`; robots permits their retrieval; the preview sitemap remains empty. Separately verify the launch configuration in an isolated local check or at authorized launch: indexable pages, matching canonical URLs, three sitemap entries, and no blanket robots disallow. No launch flag was changed for this research.

### 2. The missing-page document title describes the homepage

**Priority: P3.** A fresh `GET /release-review-missing` returned HTTP 404 and the branded recovery content, but its document title was `Bulk Away | Utah Junk Removal & Trash Outs`, identical to `/`. [not-found.tsx](app/not-found.tsx) provides no page metadata, so the title is inherited from the layout.

The title does not identify the page's recovery purpose, making it harder to distinguish the missing page from the homepage in browser tabs and assistive navigation. W3C's Page Titled guidance explains that titles should describe topic or purpose and help users identify their location without reading the body. [W3C: Understanding Page Titled](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html).

**Recommended correction:** give the missing-page boundary a descriptive title such as `Page not found | Bulk Away`, and verify the actual delivered HTML has exactly one matching title while retaining HTTP 404 and the existing recovery links. This is an orientation improvement; it is not an indexing failure. Google ignores content returned with a real 404 status. [Google: HTTP status codes](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes).

## Checks that established no further defect

| Surface | Fresh evidence |
| --- | --- |
| Homepage | HTTP 200; one canonical pointing to `https://bulkaway.com`; matching `og:url`; existing descriptive title. |
| Privacy | HTTP 200; canonical and `og:url` both `https://bulkaway.com/privacy`; distinct title and social description. |
| SMS terms | HTTP 200; canonical and `og:url` both `https://bulkaway.com/sms`; distinct title and social description. |
| Social image | All three pages emit an absolute HTTPS URL, `1200` by `630` metadata, alt text, and a large-image Twitter card. The local image response is HTTP 200, `image/png`, 148,629 bytes; PNG header dimensions are exactly 1200 by 630. |
| Missing route | Actual HTTP 404; no canonical link; framework-provided `noindex` plus inherited preview `noindex, nofollow`; branded H1 and recovery links. No soft-404 defect established. |
| Public-launch source branch | `PUBLIC_LAUNCH === 'true'` controls both layout robots and sitemap/robots generation. The sitemap declares only `/`, `/privacy`, `/sms`, all based on the same configured origin used for structured data. Runtime behavior under a changed launch flag was not exercised. |

Google recommends consistent absolute canonical URLs and avoiding disagreement between canonical methods; the inspected public-page output and sitemap source satisfy that relationship for the default brand origin. The normalized home URL with no trailing slash is not a separate defect. [Google: Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

The Open Graph protocol specifies title, type, image, and canonical object URL, with image dimensions and alt text as structured properties. Those fields exist in the inspected public-page HTML and agree with the locally delivered image. This does not establish what an external platform will cache or display before the final domain serves the same assets. [Open Graph protocol](https://ogp.me/).

## Existing review context and limitations

Read the relevant metadata/launch evidence in `QUALITY-NOTES.md`, `README.md`, `REFINEMENT-RESEARCH.md`, `SERVICE-CONTENT-RESEARCH.md`, `EXPERIENCE-CLOSING-REVIEW.md`, and `COPY-CONSISTENCY-REVIEW.md`. The previously fixed missing social image, missing recovery page, and service-content rendering gaps were not reported again. The two findings above address behavior not resolved by those fixes.

No public domain, DNS/TLS redirect, Google Search Console, external social crawler, actual production indexing, Render deployment, or email delivery was tested. Default-domain metadata is already documented as a launch configuration dependency, so a hypothetical unconfigured custom domain is not a new source defect. The main task is reviewing live interaction separately; this report does not claim a new complete browser, device, assistive-technology, legal, or security audit. Only this report file was written.

## Implementation and acceptance — September 7, 2026

Both findings above were implemented:

- `app/robots.ts` permits retrieval of public pages in both modes, retaining `/api/` exclusion. Prelaunch page metadata still emits `noindex`; the sitemap is still empty and unadvertised. PUBLIC_LAUNCH was not enabled. README now explains that indexing controls do not restrict preview access.
- `app/not-found.tsx` exports the descriptive title `Page not found | Bulk Away`, a recovery description, and noindex metadata. The actual 404 status and recovery actions remain intact.
- `scripts/verify-http.mjs` now checks crawlable indexing directives, launch-aware sitemap behavior, and the actual delivered missing-page title. The new crawlability assertion failed against the previous build (`Disallow: /`) and passed after the fix.

Fresh validation: production build, lint, TypeScript, all 26 behavior tests, and full HTTP verification passed. The HTTP suite checks compression, cache headers, fonts, logo/illustration delivery, public routes, 404 recovery and invalid request/photo handling without delivering email. No new dependency or animation was added.

Browser acceptance used the current production build. Inspected the desktop hero at 1440 × 1000. At 320 × 812, inspected privacy, SMS terms and the missing page: each had one H1, a descriptive title and no horizontal overflow. Internal page fragments resolved. The missing-page pickup link landed at the request section. Homepage controls had no buttons lacking text or an accessible naming attribute in the checked DOM. The eager hero image and lazy illustrations loaded; family logos subsequently loaded when that section entered view. Browser error log was empty for these checks. Viewport restored afterward.

The prior component inventory, form recovery tests, keyboard/disclosure acceptance, cursor comfort controls and delivery measurements remain supporting evidence; this pass does not claim to repeat every earlier state or test every browser/assistive technology. Policy text was reviewed for consistency, not legally certified. Public-domain delivery, real Render email, search-engine processing and launch-mode runtime behavior were not tested. Twilio and client-portal work remain intentionally pending.
