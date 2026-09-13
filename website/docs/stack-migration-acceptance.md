# Stack migration acceptance — September 13, 2026

## Delivered

- React Router 8.3.1 Framework Mode with conventional server-rendered HTML and React 19.2.8. The six public pages, resource endpoints, 404, canonical/social metadata and existing anchors are preserved. A shared root owns navigation, privacy/accessibility preferences and scroll restoration.
- Strict TypeScript 7.0.2, Vite 8.2.2, Node 24.19, and a dependency lockfile matching package.json. Removed Vinext, Next-specific imports/config and the experimental RSC plugin/runtime.
- Zod 4.6.4 schema with inferred normalized pickup data, shared browser/server validation and preserved customer-facing errors. Email presentation is separated from validation.
- Native multipart /request route with server-rendered errors and receipts, available without JavaScript. Both form paths retain origin checks, a shared pre-body rate limit, payload bounds, county verification, sanitized photos, consent semantics, duplicate prevention and separate customer-copy outcomes.
- CSS Modules for the team portraits/directory and before/after controls. Existing shared tokens, global page layout, arcade drawing/CSS, Base UI controls, custom SVGs, fonts and motion settings are retained intentionally.
- Express production entry with compression, immutable hashed-asset caching, Render PORT/HOST, graceful shutdown and health route. Render Blueprint waits for CI checks. Existing manual Render services must select that deployment setting themselves.
- Vitest/Testing Library and Playwright/axe integrated into the release command and GitHub Actions; browser installation is included in CI.

## Verification

npm run check:release passed locally on Windows with Node 24.19:

- Lint and generated route types/strict TypeScript.
- 82 domain/API tests covering arcade mechanics/audio, address and county rejection, upload processing, validation, mail sequencing and idempotency.
- 8 Vitest component/integration tests covering comparison controls, metadata, native admission, and successful/unconfirmed native receipts. Google responses and SMTP transport are mocked; the processing and rendered receipts are real.
- Production client/SSR build and production HTTP checks: every route and navigation destination, assets, gzip/Brotli integrity, immutable cache headers, indexing directives, branded 404, POST-only submission, invalid request/photo rejection, and unavailable-provider rejection.
- 12 Chromium browser journeys: all seven page surfaces render and hydrate without uncaught errors, axe WCAG A/AA checks after dismissing privacy, mobile navigation and Escape focus, team filters, comparison buttons/keyboard, JavaScript-disabled form errors/value retention, mobile arcade start/pause, and enhanced three-step quantities/disclosures/address correction/provider failure.
- Inspected mobile services, mobile arcade and desktop pickup screenshots. Checked lockfile consistency, git diff whitespace, and absence of SMTP/server-key modules from browser assets.

## Operating notes and limits

The local migrated preview is http://127.0.0.1:8794/. No .env.local exists, so this preview has no configured live Google or SMTP credentials; requests fail safely until providers are configured. Existing Render environment variables retain the same names. No real email was sent and no deployment or Git push occurred.

Live Google billing/key restrictions and inbox delivery still require a deployed check with authorized test data. Browser coverage here is Chromium desktop/mobile viewport emulation, not every browser or physical device. GitHub Actions and Render have not run remotely for this change. The build warns that the arcade component has both static and dynamic imports in the SSR graph; the browser arcade runtime remains a separate deferred chunk, and the homepage renders no canvas before unlock. No database, persistent leaderboard, CMS or production metrics service was introduced.
