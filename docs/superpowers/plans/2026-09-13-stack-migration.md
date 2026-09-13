# Bulk Away Stack Migration Implementation Plan

**Goal:** Migrate the existing site to React Router Framework Mode, Zod validation, strict modern TypeScript, scoped component styling, and automated browser coverage without changing its brand or service behavior.

**Architecture:** Keep the existing React page/component tree and pure TypeScript game engine. Replace Next/Vinext routing and metadata with React Router route modules and a Node server; keep existing pickup processing behind both JSON and HTML form adapters.

**Tech Stack:** React Router 8, React 19, Vite 8, TypeScript 7 subject to installed tool compatibility, Zod 4, CSS Modules and shared CSS/tokens, Base UI, Lucide, Canvas/Web Audio, Node 24, Nodemailer, Vitest/Testing Library, Playwright/axe, Render.

**Spec:** website/docs/tech-stack-evaluation.md

## Constraints

- Preserve all six public URLs, metadata, assets, anchors, shared navigation, mobile behavior, motion/cursor options, and arcade offer handoff.
- Preserve full Utah address and county verification before email, upload limits/sanitization, explicit consent, idempotency, and separate customer confirmation outcomes.
- Work from the current uncommitted site changes; never inspect or stage root output/ private material. No production push or real mail during verification.
- Keep the existing Node tests; introduce meaningful component/browser tests rather than replacing proven coverage mechanically.

## Tasks

- [x] Baseline: run npm test; record 71 tests passing.
- [x] Framework: replace package/config/startup with React Router and Node integration. Create app/root.tsx and app/routes.ts, route wrappers, metadata adapter, SSR entry, resource routes, and ordinary responsive image component. Replace every next/* import with owned React Router components/hooks. Verify all public routes through production HTTP checks.
- [x] Validation: introduce lib/pickup-schema.ts using Zod, infer normalized Pickup, preserve validatePickup/step/result API and existing rule/error tests. Separate shared schema from mail template helpers. Test malformed types, consent coercion, nested quantities and cross-field rules before implementation.
- [x] Forms: add native multipart decoding and server HTML submission/receipt with explicit token and validation errors; keep enhanced fetch path. Expose a usable no-JavaScript form route. Test invalid, unavailable-provider, and mocked successful HTML submissions without sending real mail.
- [x] Styles: migrate owned team and service comparison/gallery styles to CSS Modules while keeping shared tokens and intentional global rules. Preserve classes where code/CSS interactions require them and document deliberate global arcade styles.
- [x] Tooling/tests: validate TypeScript compiler and inference, add Vitest/Testing Library component behavior coverage and Playwright/axe browser journeys. Exercise navigation across every page, mobile menu, form steps, disclosures, reduced motion and arcade shell.
- [x] Render: configure production server output, caching/compression, PORT/HOST, CI checks, browser dependencies and checksPass deployment gating. Update current setup/release docs and remove obsolete framework config.
- [x] Acceptance: lint, typecheck, existing tests, component tests, build, production HTTP and browser checks; inspect representative desktop/mobile screenshots and rectify regressions. Review final patch and record provider/live-delivery limitations.

## Interfaces

- validatePickup(input: unknown): { ok: true; data: Pickup } | { ok: false; errors: Record<string,string> } remains stable.
- API POST /api/pickup retains its JSON contract and idempotency header for enhanced submissions.
- Native /request form uses FormData and server-rendered action errors/receipt; it calls the same server processing and never trusts browser coverage.
- The framework module renders existing default page components; metadata is emitted as SSR head tags using route matches.
- Existing tests in lib/*.test.ts remain runnable with Node; browser and component runners have separate configuration.

## Verification commands

Run npm run check:release from website. That command must include lint, typecheck, Node tests, component tests, production build, HTTP tests, and browser tests. Browser tests use isolated development credentials and mocked external services only. Test actual delivery separately on staging after credentials are configured.
