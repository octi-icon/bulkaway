# Bulk Away

A responsive atomic-era website using the supplied Bulk Away logos, Brookvale and TaldoseScript, with Geograph body text. Built with React, TypeScript, Vinext/Vite, and a native Node server for Render.

Use `npm run check:release` for the complete release gate (lint, TypeScript, unit tests, build, and isolated production HTTP verification). Deployment steps and launch-only checks are in [../RELEASE.md](../RELEASE.md).

## Arcade

Clearing all three hero items reveals an embedded version of Space Reclaimed. Its cabinet loads on interaction and its game runtime loads on Start. `/arcade` also remains directly accessible. Original pixel sprites, locally synthesized optional audio, pause, keyboard/touch controls, and untimed cleanup are included. Both modes offer SPACE5, a crew-applied 5% discount. The embedded reward updates the existing pickup form without navigating away or losing a draft. The shared leaderboard, secure coupon redemption, and portal integration are not implemented.

## Run locally

From `website`: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`. Email remains unavailable until a real Google app password is configured. No secret is committed.

`npm test` checks request validation and email addressing. `npm run lint` checks application source and the adopted button component (the untouched generated component catalog is outside that check). `npx tsc --noEmit` checks types. `npm run build` produces the standalone production bundle; `npm start` serves it. The server honors `PORT` and `HOST`.

## Render deployment

The repository-root `render.yaml` defines a Node Web Service with root directory `website`. If deploying only the contents of `website` as the repository, remove the `rootDir` entry. Build command: `npm ci --include=dev && npm run build`. Start command: `npm start`. Health check: `/api/health`.

The blueprint selects Render's Starter plan because its Free web services block outbound SMTP ports 25, 465 and 587. Creating a service on this plan incurs Render charges; no Render service has been created by this build. See https://render.com/docs/free and https://render.com/docs/blueprint-spec.

Set `SMTP_PASS` in Render to the Google app password for `mailer@wsitrashvalet.com`. The adapter uses implicit TLS on port 465. Sender and recipient are fixed in server code: `Bulk Away <mailer@wsitrashvalet.com>` to `service@bulkaway.com`; Reply-To is the customer's validated address. No copy is sent to customers automatically. Request content is escaped in HTML email. Live email delivery must be verified after the secret is configured; no real email was sent during development.

By default, the Render-provided `RENDER_EXTERNAL_URL` is used for request origin checking. When adding the custom domain, set `SITE_URL=https://bulkaway.com` (or the exact chosen primary domain) and redirect alternate domains to it. Keep `PUBLIC_LAUNCH=false` while reviewing. Set it to `true` for indexing at launch. Metadata defaults to the supplied brand domain, bulkaway.com.

Before launch, public pages remain crawlable so search engines can read their `noindex` instructions; the sitemap remains empty. The API is excluded from crawling in either mode. These indexing controls do not restrict access to the preview.

## Google address autocomplete

In Render → this Web Service → Environment, add **`GOOGLE_MAPS_BROWSER_KEY`** with the Google Maps browser API key, then save and restart/redeploy. The server reads it at runtime; it does not need a `VITE_` or `NEXT_PUBLIC_` prefix. Enable **Maps JavaScript API** and **Places API (New)** on the key's billing-enabled Google Cloud project. This is intentionally a browser-visible key, separate from `SMTP_PASS`; protect it with **Website (HTTP referrer)** restrictions and API restrictions to those APIs. Allow the actual Render hostname and production domain (including `www` only if used). For local live testing, separately allow `http://127.0.0.1:8788/*` or use a dedicated development key. Configure Google quotas and billing alerts.

Without the key, the form retains manual address entry. With it, the browser loads Google's library only after a visitor types at least three characters in address-search mode. Searches are debounced and use session tokens. Suggestions are restricted to US results and biased toward the Wasatch Front; this is not a service-coverage check or postal-address validation. A selection requests only `formattedAddress`. Unit/building details remain separate and are included in the review, receipt and request email. No predictions or addresses are saved in browser storage by this feature.

Customers can choose manual entry before typing to avoid Google address searches. Outages, empty results and lookup timeouts leave manual entry available. The dropdown opens below the field, supports arrow keys/Enter/Escape, and identifies Google Maps as its source. Address-search terms and privacy are at `/privacy#address-search`.

After configuring Render, verify a real suggestion can be selected on the deployed hostname, then verify manual fallback and complete-address/unit delivery. Local development tests use simulated Google-shaped results and do **not** establish that your key, referrer restrictions or billing work. `scripts/preview-form-states.mjs` supports `QA_ADDRESS=true` for isolated fixture testing; it is never the production start command.

## Requests and future Helm integration

`lib/pickup.ts` owns validation and the request contract. `lib/mail.ts` owns delivery; `/api/pickup` coordinates both. Replace that delivery boundary with Helm scheduling once available, preserving explicit quote/date confirmation. Do not claim confirmed appointments until Helm actually confirms them.

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

`npm run build` includes Vinext's `--precompress` flag. Deploy its complete standalone output so hashed CSS/JavaScript retain their gzip/Brotli variants. `npm run test:http` checks negotiated compression and decoded-content integrity on a running production preview. `node scripts/measure-delivery.mjs` reports local HTTP payload sizes; it does not measure browser Core Web Vitals.

Tailwind's explicit `@source` list in `app/globals.css` covers shipped surfaces and the button/select/popover primitives. When introducing another nested UI component, add its source file to that list before building so its utilities are generated.

## Optional pickup photos

The form accepts up to five JPEG, PNG, or WebP files, up to 5 MiB each and 10 MiB combined. It shows local previews, supports removal, and submits multipart data. Existing JSON requests without photos remain supported. Image decoding and re-encoding use Sharp on the server with a 40-million-pixel input limit, a 2000px output bound, sequential processing within each request, and rejection of animated or mismatched files. Metadata is stripped; normalized JPEGs use generated filenames and are attached to the service email. Photos are never published. The privacy notice covers this processing and mailbox retention.

Multipart body reads are bounded before parsing; textual JSON within the form retains the 20,000-byte limit. Idempotency fingerprints include normalized photos and retain a SHA-256 digest instead of image bodies. No remote file URLs or client-supplied attachment paths are accepted. Preview object URLs are revoked on removal/unmount. HEIC is not accepted; the form asks for JPG, PNG, or WebP.

Verification covers behavior tests, TypeScript, lint, production build, HTTP multipart/invalid-image rejection, and desktop/mobile photo preview and removal. The HTTP suite also checks the current vector logos, crew/process illustrations, social image, and branded 404 status and recovery links. See `EXPERIENCE-CLOSING-REVIEW.md` for dated acceptance evidence and its limits. Real email attachment delivery still needs confirmation after SMTP is configured on Render. The `sharp-types` alias uses the installed Sharp declarations because Vinext's optional-dependency stub types its default export as unknown.
