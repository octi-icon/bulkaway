# Bulk Away

A responsive atomic-era website using the supplied Bulk Away logos, Brookvale and TaldoseScript, with Geograph body text. Built with React 19, React Router 8 Framework Mode with server-rendered HTML, strict TypeScript 7, Vite 8, and Node 24 on Render. Zod 4 validates the shared pickup contract. Base UI and Lucide remain the interface foundations; CSS Modules contain the team gallery and comparison controls, while shared design tokens and global site/arcade styles preserve the existing brand.

Use `npm run check:release` for the complete release gate (lint, TypeScript, domain tests, Vitest/Testing Library, build, production HTTP checks, and Playwright/axe browser journeys). Deployment steps and launch-only checks are in [../RELEASE.md](../RELEASE.md).

## Arcade

Clearing all three hero items reveals an embedded version of Space Reclaimed. Its cabinet loads on interaction and its game runtime loads on Start. `/arcade` also remains directly accessible. Original pixel sprites, locally synthesized optional audio, pause, keyboard/touch controls, and untimed cleanup are included. Both modes offer SPACE5, a crew-applied 5% discount. The embedded reward updates the existing pickup form without navigating away or losing a draft. The shared leaderboard, secure coupon redemption, and portal integration are not implemented.

## Run locally

From `website`: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`. Email remains unavailable until a real Google app password is configured. No secret is committed.

`npm test` checks request validation and email addressing. `npm run lint` checks application source and the adopted button component (the untouched generated component catalog is outside that check). `npm run typecheck` generates route types and checks strict TypeScript. `npm run build` produces `dist/client` browser assets and `dist/server` SSR modules; `npm start` serves it. The Express server in `server.mjs` honors `PORT` and `HOST`. For production-style local testing with local credentials, run `node --env-file-if-exists=.env.local server.mjs`; automated checks deliberately clear credentials.

## Render deployment

The repository-root `render.yaml` defines a Node Web Service with root directory `website`. If deploying only the contents of `website` as the repository, remove the `rootDir` entry. Build command: `npm ci --include=dev && npm run build`. Start command: `npm start`. Health check: `/api/health`.

The blueprint selects Render's Starter plan because its Free web services block outbound SMTP ports 25, 465 and 587. Creating a service on this plan incurs Render charges; no Render service has been created by this build. See https://render.com/docs/free and https://render.com/docs/blueprint-spec.

Set `SMTP_PASS` in Render to the Google app password for `mailer@wsitrashvalet.com`. The adapter uses implicit TLS on port 465. Both branded emails use `Bulk Away <mailer@wsitrashvalet.com>`. The crew notification goes to `service@bulkaway.com` with the customer's validated address as Reply-To. After SMTP accepts that message, a separate acknowledgment goes to the customer with `service@bulkaway.com` as Reply-To. It confirms receipt, not a booking. Photos and a separate contact-permission.txt consent record stay with the crew; the email body shows only the contact preferences. Both messages have HTML and plain-text versions; submitted content is escaped.

If the customer copy fails or times out after the crew message is accepted, the API still returns the request reference with `confirmation: unconfirmed`. The form tells the customer to save the reference rather than resubmit, and the server logs only a generic warning plus reference. The existing idempotency cache retains the combined result; there are no automatic retries. Crew delivery retains its 25-second limit; the acknowledgment has an 8-second limit. The client allows 45 seconds for photo processing and both deliveries. SMTP acceptance does not prove inbox delivery.

Run `npm run preview:email` to generate synthetic crew/customer HTML, text and `.eml` previews under ignored `work/email-preview/`. This uses Nodemailer's stream transport and never sends mail. See [email research and decisions](docs/transactional-email-research.md). No new Render variables or dependencies are needed. Verify the deployed sender's SPF/DKIM/DMARC configuration and inspect a received test request in Gmail/Outlook/Apple Mail before claiming live deliverability; local previews cannot verify inbox placement.

The actual Bulk Away logo and Brookvale headlines are embedded PNGs with alt text, not remote web fonts. `node scripts/build-email-artwork.mjs` regenerates `lib/pickup-email-artwork.generated.ts` from the supplied vector logo and font. Those bytes are bundled server-side, so Render needs no asset path or external image host. Inline artwork is excluded from the submitted photo count; customer emails contain only the two brand images, never crew photos or consent records.

By default, the Render-provided `RENDER_EXTERNAL_URL` is used for request origin checking. When adding the custom domain, set `SITE_URL=https://bulkaway.com` (or the exact chosen primary domain) and redirect alternate domains to it. Keep `PUBLIC_LAUNCH=false` while reviewing. Set it to `true` for indexing at launch. Metadata defaults to the supplied brand domain, bulkaway.com.

Before launch, public pages remain crawlable so search engines can read their `noindex` instructions; the sitemap remains empty. The API is excluded from crawling in either mode. These indexing controls do not restrict access to the preview.

## Google address autocomplete

In Render → this Web Service → Environment, add **`GOOGLE_MAPS_BROWSER_KEY`** with the Google Maps browser API key, then save and restart/redeploy. The server reads it at runtime; it does not need a `VITE_` or `NEXT_PUBLIC_` prefix. Enable **Maps JavaScript API** and **Places API (New)** on the key's billing-enabled Google Cloud project. This is intentionally a browser-visible key, separate from `SMTP_PASS`; protect it with **Website (HTTP referrer)** restrictions and API restrictions to those APIs. Allow the actual Render hostname and production domain (including `www` only if used). For local live testing, separately allow `http://127.0.0.1:8788/*` or use a dedicated development key. Configure Google quotas and billing alerts.

Also enable **Geocoding API**, create a **separate server key**, and add it to Render as **`GOOGLE_MAPS_SERVER_KEY`**. Restrict that key to Geocoding API and the outbound IP ranges shown for this Render service. Do not apply website restrictions to the server key or expose it in browser configuration. The final submission requires this key: missing credentials, provider failures and unverifiable addresses stop the request before any email is attempted. Configure both keys before deploying this change.

Without the browser key, the form retains manual address entry. With it, the browser loads Google's library only after a visitor types at least three characters in address-search mode. Searches are debounced and use session tokens. Suggestions request only street addresses, premises and subpremises, with a US restriction and a Wasatch Front bounding rectangle; Google cannot restrict predictions to a union of county boundaries, so neighboring-county suggestions can still appear. Selection requests `formattedAddress` and `addressComponents` and rejects counties outside Salt Lake, Utah, Davis and Weber, with Utah/US checks. Selections also require street number, route and postal code components. The pickup step requires a street-number address ending in Utah/UT and a ZIP before review; state/city names and out-of-state addresses cannot advance. This format check is separate from county verification. The server independently geocodes the actual submitted address (including manual edits) before email delivery. Ambiguous, partial and city-only results are rejected. This verifies Google's county classification, not postal deliverability or service availability. Unit/building details remain separate and are included in the review, receipt and request email. No predictions or addresses are saved in browser storage by this feature.

Customers can choose manual entry before typing to avoid Google autocomplete searches; their completed address is still sent to Google for the final coverage check. Autocomplete outages, empty results and lookup timeouts leave manual entry available. If final verification fails, the form retains the request and offers correction/retry or direct crew contact. The dropdown opens below the field, supports arrow keys/Enter/Escape, and identifies Google Maps as its source. Address-search terms and privacy are at `/privacy#address-search`.

After configuring Render, verify a real suggestion can be selected on the deployed hostname, then verify manual fallback and complete-address/unit delivery with an authorized test request. Check an out-of-area address too. Local development tests use simulated Google-shaped results and do **not** establish that your keys, referrer/IP restrictions or billing work. `scripts/preview-form-states.mjs` supports `QA_ADDRESS=true` for isolated fixture testing; it is never the production start command. Official references: [Autocomplete request restrictions](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data), [Geocoding results and partial matches](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding), [key restrictions](https://developers.google.com/maps/api-security-best-practices).

## Routing and forms

`app/routes.ts` lists every page and resource endpoint. `app/root.tsx` provides the shared header, accessibility preferences, metadata fallback, and scroll restoration. Page route modules set their own canonical and social metadata. The site uses conventional SSR rather than experimental React Server Components. Existing artwork is served as pre-sized local images, without an image service.

The interactive homepage request flow retains its steps, quantities, photos, address lookup, errors, and receipts. `/request` also submits an ordinary multipart HTML form with JavaScript disabled; both adapters use the same admission limit, Zod validation, county verification, sanitized photos, and email delivery. No personal data is added to browser storage.

Install the browser once with `npx playwright install chromium` (on Linux CI: `npx playwright install --with-deps chromium`). `npm run test:components` runs Vitest and Testing Library; `npm run test:browser` runs Chromium journeys and axe checks against an isolated production server on port 8793.

## Requests and the Helm intake hand-off

`lib/pickup-schema.ts` owns the Zod schema and inferred request contract; `lib/pickup.ts` preserves the shared validation helpers. `lib/pickup-mail.ts` builds the branded messages. `lib/mail.ts` owns delivery; `/api/pickup` coordinates both. The form still requests a quote and preferred date; nothing here confirms an appointment until Helm actually confirms it.

`lib/helm-intake.ts` is the reference implementation of the shared WSI website contract `wsi_web_intake_v1` (documented in Helm at `docs/contracts/wsi-web-intake-v1.md`). After the crew email is accepted, the server signs the already-validated pickup (HMAC-SHA256 over `timestamp.body`, WebCrypto) and POSTs it to `HELM_INTAKE_URL/api/web-intake` with the visitor's existing idempotency key, so a retry never duplicates. Helm records it as a website request in the Bulk Away queue (`BA-R-…`). The hand-off is best effort: a Helm outage yields `helm: "unrecorded"` in the API result and a server warning, the crew email has already delivered, and nothing changes for the visitor. Set `HELM_INTAKE_URL` and `HELM_INTAKE_SECRET` in Render (the secret equals Helm's `WSI_INTAKE_SECRET_BULK_AWAY`); leave both unset to disable. Other WSI sites adopt the same file by changing the site id, form kind and `fields`.

The current endpoint uses same-origin checks, a honeypot, payload bounds, five attempts per client per 15-minute process window, and an hour of process-local idempotency. These controls reset on process restarts and are not shared across instances. Before scaling horizontally, move rate limits and request receipts to durable shared storage. Do not enable automatic retries on uncertain SMTP delivery; the form directs customers to the crew instead.

## Content sources

Services and contact details: page 5 of the supplied 2026 service quote. Contract-specific pricing is intentionally quote-based on the website. The WSI family relationships and links come from the provided sister project. Power washing is explicitly future service. No valet-brand awards, coverage guarantees, or testimonials were borrowed.

With the production server running, `npm run test:http` verifies routes, asset availability, origin protection, validation, and request-size rejection. Set `BASE_URL` to test a different server; the script never submits a valid pickup request.

## Privacy, cookie preferences, and future SMS

`/privacy` describes current request processing, browser storage, and mobile privacy. `/sms` describes Bulk Away Quote & Pickup Updates. Both explicitly distinguish today's emailed preference record from future Twilio enrollment. The client portal is not live; no sign-in URL has been invented.

The optional SMS checkbox starts unchecked, separate from the required phone/email inquiry permission. `lib/pickup.ts` normalizes absent SMS consent to false and rejects non-booleans or a stale disclosure version. An opt-in adds its exact disclosure, version, form source, and server timestamp to the service email. A declined choice is marked NOT GIVEN. No Twilio call, subscription, SMS, or portal sync occurs. If email delivery fails, the site does not claim the choice was durably saved. Consent is not a purchase requirement and does not authorize promotional messages or another WSI brand.

Before enabling Twilio, configure the actual sender and applicable registration, persist consent and revocation records in the portal's durable store, connect STOP/HELP handling and suppression across all sending paths, and test delivery and opt-outs. Verify that previously recorded consent remains appropriate at launch; request renewed consent if needed. Replace the coming-soon language only when those features work. The website pages alone do not perform this integration or establish carrier approval. Reference: [Twilio Messaging Policy](https://www.twilio.com/en-us/legal/messaging-policy).

The cookie dialog installs no analytics or advertising. Necessary-only dismissal stores `bulk-away-privacy-v1=necessary` in session storage. The optional remember setting adds only `{version, expires}` to local storage for 180 days; choosing necessary only removes it. Storage failures do not block dismissal or use of the site. Settings can be reopened on every page. Direct visits to policy pages do not auto-open the modal. No choice authorizes future tracking; adding trackers requires corresponding controls and an updated notice.

## Production asset delivery

Deploy the complete `dist` output alongside `server.mjs` and production dependencies. Express negotiates gzip/Brotli compression; hashed assets receive immutable one-year caching. Public assets keep their existing URLs. `npm run test:http` checks negotiated compression and decoded-content integrity on a running production preview. `node scripts/measure-delivery.mjs` reports local HTTP payload sizes; it does not measure browser Core Web Vitals.

Tailwind's explicit `@source` list in `app/globals.css` covers shipped surfaces and the button/select/popover primitives. When introducing another nested UI component, add its source file to that list before building so its utilities are generated.

## Optional pickup photos

The form accepts up to five JPEG, PNG, or WebP files, up to 5 MiB each and 10 MiB combined. It shows local previews, supports removal, and submits multipart data. Existing JSON requests without photos remain supported. Image decoding and re-encoding use Sharp on the server with a 40-million-pixel input limit, a 2000px output bound, sequential processing within each request, and rejection of animated or mismatched files. Metadata is stripped; normalized JPEGs use generated filenames and are attached to the service email. Photos are never published. The privacy notice covers this processing and mailbox retention.

Multipart body reads are bounded before parsing; textual JSON within the form retains the 20,000-byte limit. Idempotency fingerprints include normalized photos and retain a SHA-256 digest instead of image bodies. No remote file URLs or client-supplied attachment paths are accepted. Preview object URLs are revoked on removal/unmount. HEIC is not accepted; the form asks for JPG, PNG, or WebP.

Verification covers behavior tests, TypeScript, lint, production build, HTTP multipart/invalid-image rejection, and desktop/mobile photo preview and removal. The HTTP suite also checks the current vector logos, crew/process illustrations, social image, and branded 404 status and recovery links. See `EXPERIENCE-CLOSING-REVIEW.md` for dated acceptance evidence and its limits. Real email attachment delivery still needs confirmation after SMTP is configured on Render.
