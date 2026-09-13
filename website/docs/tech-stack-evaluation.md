# Bulk Away technology stack evaluation

**Recommendation: retain React, Vite, Node.js, Render, the existing visual system, and the custom arcade. Use React Router 8 Framework Mode with conventional server rendering as the preferred architecture for a planned framework migration. Add browser acceptance tests and reliable form fallback before making that migration a production release.**

The proposed stack is broadly appropriate, but much of it already exists in Bulk Away. The consequential change is replacing Vinext's Next.js compatibility layer. Changing every library at the same time would increase regression risk without a corresponding business benefit. TypeScript 7 and CSS Modules are useful, separable improvements; neither is a prerequisite for fixing customer journeys. **Add Zod 4 to the recommended validation layer**, adopting it independently of the framework migration and preserving the existing business rules.

This recommendation prioritizes dependable pickup requests, maintainability on Render, preservation of the site's distinctive design, and reasonable operating complexity. It is an architectural judgment based on the repository and primary documentation, not a measured claim that one framework produces faster Bulk Away pages. There is no side-by-side migrated application or production traffic dataset establishing a speed or conversion advantage.

## Existing implementation and proposed changes

The repository contains six public pages: home, services and rates, team, arcade, privacy, and SMS terms. It also contains pickup and health endpoints, a not-found page, and search-engine metadata routes. The application already has a shared header and layout, a shared haul list, interactive service comparisons, Google address integration, branded transactional emails, and a substantial browser game.

The framework is **Vinext 1.0.0-beta.9**, rather than the official Next.js runtime. Its source uses Next.js conventions and imports, but the development and production commands invoke Vinext through Vite. The production output is a standalone Node server. This distinction matters when choosing documentation, assessing compatibility, and planning upgrades.

| Layer | Current repository | Recommended direction |
|---|---|---|
| Framework | Vinext 1.0.0-beta.9; Next-style App Router conventions | React Router 8 Framework Mode for a staged migration; conventional SSR, without unstable RSC mode |
| Interface | React and React DOM 19.2.8 | Retain React 19, with compatible maintained patches |
| Language | TypeScript 5.9.3, `strict: true` | Preserve strict checking; evaluate TypeScript 7 as an independent tooling upgrade |
| Build | Vite 8.2.2 and npm lockfile | Retain Vite 8 and npm; change the framework plugin and production entry |
| Rendering | Server-rendered pages plus hydrated React interactions | Preserve HTML-first rendering; consider selective prerendering only after checking runtime configuration |
| Styling | Tailwind 4.2.1, shared tokens, extensive custom CSS | Keep the existing appearance; introduce CSS Modules for component ownership gradually |
| Controls | Base UI 1.7.0, shadcn-style wrappers, custom components | Retain Base UI and Bulk Away-owned components |
| Icons and graphics | Lucide, custom SVG wordmark, illustrations, optimized assets | Retain; preserve responsive image dimensions and asset loading behavior |
| Animation | CSS, Web Animations API, custom navigation effects | Retain; integrate route view transitions selectively and honor motion preferences |
| Forms | React-controlled steps, fetch submission, shared validation, Node endpoint | Establish a working HTML submission path, then enhance it with React Router actions and pending states |
| Runtime validation | Handwritten shared validators and separately declared request types | Zod 4 schemas with inferred output types; keep server coverage and delivery checks separate |
| Backend | Node 24, standalone server, pickup and health routes | Keep one Node 24 LTS service with a supported React Router Node integration |
| Email | Nodemailer, Workspace SMTP, team notification and customer confirmation | Retain transport and branding; preserve partial-delivery handling and validate operational delivery |
| State/content | Local TypeScript content, React state/context; no application database | Retain for current scope; introduce durable delivery state if reliability or scale requires it |
| Arcade | Custom TypeScript engine, Canvas 2D, Web Audio, React shell | Retain and isolate from framework routing; load only when needed |
| Tests | Node test runner, type checks, lint, production HTTP checks | Keep existing tests; add Playwright and axe first, then targeted Vitest/React Testing Library coverage |
| Delivery | GitHub Actions plus paid Render configuration | Keep; explicitly verify deployment waits for CI and establish staging/rollback acceptance |

These are repository observations from `website/package.json`, the lockfile, configuration, route files, components, tests, and deployment files. Package presence does not establish that every dependency is sent to visitors. Unused scaffold dependencies should be checked against imports and production bundles before removal.

The proposal's references to ÆPOC, assessment scopes, and calculators do not describe this application. Bulk Away's requirements are service discovery, accurate multifamily pricing context, pickup requests, address coverage, team credibility, and an optional arcade. Its brand assets and interaction patterns should be preserved explicitly in any migration specification.

## Framework choice

### Why React Router Framework Mode is the preferred target

React Router Framework Mode integrates route modules, data handling, type generation, and code splitting through Vite. It offers a direct fit for a React site with public pages and a small number of server operations. A root layout can own the navigation, haul-list provider, accessibility preferences, and request dock, while page routes own their content. [1](https://reactrouter.com/start/modes)

The architectural benefit for Bulk Away is a shorter path between its actual requirements and the framework APIs it uses. The site needs reliable routes, HTML responses, forms, and a Node backend. It does not currently need advanced React Server Component streaming, distributed cache orchestration, or a separate application API service. Conventional Framework Mode provides an appropriate boundary without retaining an implementation of another framework's API surface.

React Router 8 is a released version, not a hypothetical future dependency. The current documentation identifies 8.3.1, and its upgrade guide requires Node 22.22 or later and React/React DOM 19.2.7 or later; Framework Mode requires Vite 7 or later. Bulk Away's declared Node 24, React 19.2.8, and Vite 8 satisfy those baseline requirements. That does not replace integration testing of the complete dependency graph. [2](https://reactrouter.com/changelog), [3](https://reactrouter.com/upgrading/v7)

Use the conventional server-rendered path. React Router's documentation still distinguishes its unstable RSC interfaces from normal Framework Mode. Migrating away from a compatibility layer and immediately adopting an unstable rendering mode would undermine the main reason for the change. [4](https://reactrouter.com/start/framework/rendering)

### Keeping Vinext

Remaining on the current stack has the lowest immediate implementation cost. The application already builds around it, and existing tests encode useful behavior. A framework label alone is not evidence that the current pickup or menu issues originate in that framework.

However, Vinext's maintainers identify Cloudflare Workers as its primary target and deepest integration. They document compatibility gaps and differing support across deployment platforms, while also documenting standalone Node output. Bulk Away is deployed on Render's Node runtime, so its most important platform is not Vinext's primary integration. This is a support and maintenance tradeoff, not proof that Node deployment is unusable. [5](https://github.com/cloudflare/vinext)

The repository includes a small type adapter for Sharp because Vinext's optional Sharp declaration is `unknown`. That is manageable today, but illustrates the compatibility boundary. Keeping Vinext is reasonable while preparing regression coverage; expanding reliance on its framework-specific behavior is less attractive as a long-term direction for this particular deployment.

### Official Next.js

Official Next.js is the strongest alternative if minimizing migration edits is the dominant objective. Much of the source already uses its route and metadata conventions. Next.js supports self-hosting on Node, so choosing it would not require moving from Render to Vercel. Its self-hosting documentation also explains runtime versus build-time environment handling and operational concerns. [6](https://nextjs.org/docs/app/guides/self-hosting)

It would likely require fewer route/component changes than React Router, but it is still a migration: the build pipeline, production server, image handling, and compatibility assumptions must be validated. The current Vite build would also cease to be the application's framework build. There is no local proof yet that changing the package and scripts is sufficient.

**Decision rule:** if a representative React Router migration reveals substantial unanticipated breakage in forms, navigation state, or assets, test official Next.js before committing to the larger conversion. React Router remains the preferred target for the desired Vite-based architecture; official Next.js is a credible lower-change fallback.

### Astro and a plain Vite SPA

Astro is well suited to mostly static content with separately hydrated interactive islands. Its architecture could serve the marketing pages efficiently while retaining React for selected interactions. [7](https://docs.astro.build/en/concepts/islands/) It deserves consideration for a new brochure site, rather than dismissal because this application uses React.

The existing shared haul list, request dock, navigation state, preferences, and embedded arcade make this migration more involved. Astro documents that React context wrappers cannot provide shared context across independently hydrated islands; cross-island state needs another arrangement. [8](https://docs.astro.build/en/recipes/sharing-state-islands/) A large shared React island would preserve more code but reduce the architectural benefit. For Bulk Away as it exists, this is a larger restructuring than the problem warrants.

A plain client-rendered Vite SPA would preserve familiar tooling, but require assembling server rendering and form infrastructure separately to match existing behavior. That offers little advantage over Framework Mode. A static-only deployment would also need a separate home for the mail and address-validation endpoint.

| Option | Main benefit | Main cost or limitation | Assessment for Bulk Away |
|---|---|---|---|
| Keep Vinext | Smallest immediate change | Compatibility-layer maintenance and secondary platform emphasis | Acceptable bridge while tests are strengthened |
| React Router 8 Framework Mode | Vite-native React routes, actions, and SSR matched to the application | Route, metadata, server, and form migration | Preferred planned target |
| Official Next.js | Strongest reuse of existing Next-style conventions | Different framework build and self-hosting behavior to validate | Best alternative when migration scope dominates |
| Astro with React islands | HTML-first content and selective hydration | Shared-state and application-boundary restructuring | Better greenfield fit than current migration fit |
| Vite SPA plus custom server | Familiar client tooling | Rebuilds capabilities already supplied by a framework | Not recommended |

These are qualitative engineering judgments, not benchmark scores. No framework-specific performance advantage has been measured for this site.

## Forms and delivery deserve the first investment

The existing form has a `method` and `action`, but its working submission depends on JavaScript. It prevents native submission, assembles a JSON request envelope inside multipart data, and supplies an idempotency header. The endpoint accepts JSON or that multipart format and returns JSON. The multi-step interface also depends on React state. Consequently, the current form is not a complete progressively enhanced HTML form.

React Router's forms and actions support starting with an HTML submission and enhancing it with client navigation and pending states. [9](https://reactrouter.com/explanation/progressive-enhancement) Applying that principle to Bulk Away requires implementation work, not simply replacing the `<form>` tag.

The target should accept ordinary named fields and photo uploads on the server, preserve entered values when validation fails, and return an accessible HTML error or receipt page. A submission token usable without custom browser headers is needed. The enhanced three-step experience should submit to the same validation and delivery logic. A no-JavaScript presentation must expose the required fields and allow manual address entry while preserving server-side coverage enforcement.

Important invariants already exist and must survive: item quantities, service-specific scope, photo limits and sanitization, contact consent, the arcade offer, full-address validation, county coverage, duplicate-submission handling, and distinct crew/customer email outcomes. Google autocomplete is an input convenience; a suggestions filter is not a replacement for authoritative validation before accepting a request.

Nodemailer and Workspace remain a reasonable choice at the current scope. The provider supports OAuth2 and app passwords, subject to account configuration. Keep credentials server-side, retain the authenticated sender, and confirm actual sender authorization rather than assuming the displayed From address guarantees delivery. [10](https://nodemailer.com/guides/using-gmail) Changing framework or typography cannot establish inbox placement; team and customer templates still require real email-client checks.

The current rate-limit and duplicate-delivery records are in-memory maps. They disappear on restart and are not shared across server instances. That is a documented architectural limit of this implementation: it cannot promise durable exactly-once delivery. A database is unnecessary for service content, but durable submission records and a retry queue become justified if lost requests are unacceptable, instances scale horizontally, or a CRM becomes the operational source of truth. Even then, delivery design must account for ambiguous SMTP outcomes rather than promising perfect exactly-once semantics.

The recent address-validation code also depends on configured Google credentials and provider behavior. A passing mock test cannot establish that the deployed browser key, server key, restrictions, billing, and enabled APIs all work together. This remains a deployment acceptance task regardless of framework choice.

## Zod as the shared validation layer

**Include standard Zod 4 in the target stack.** It fits the pickup request's nested item quantities, service choices, optional fields, consent, and conditional requirements. It also works independently of the routing framework: adoption does not require React Router, React Hook Form, tRPC, or a TypeScript 7 upgrade. Zod documents stable version 4, TypeScript 5.5-and-later support, and strict-mode requirements; the current TypeScript 5.9 configuration meets those stated requirements. Exact dependency compatibility still needs the application's checks. [25](https://zod.dev/)

The existing `validatePickup` function is already shared by browser and server. Zod would not introduce sharing where none exists. Its stronger benefit is making the accepted runtime shape and the resulting TypeScript type derive from the same schema, reducing drift between the separately maintained `Pickup` type and validation code. `safeParse` supplies a success/error result, and schema inference can distinguish raw inputs from normalized outputs. [26](https://zod.dev/basics)

Start with one shared, browser-safe pickup schema and small reusable field/item schemas. Keep the current validation result interface initially so the form and endpoint do not need to change together. Preserve the current friendly messages and step-to-field mapping. Zod's issue paths can feed a field-error adapter, including nested item errors and a form-level summary; a raw developer-oriented error dump is unsuitable for the pickup interface. [27](https://zod.dev/error-formatting)

Preserve cross-field behavior explicitly: the first step accepts selected items or sufficient written detail; dates follow the service area's calendar; SMS opt-in requires the current disclosure version; only supported services and offers are accepted. Derive step schemas from shared definitions and test partially completed steps. A whole-form refinement must not prevent a relevant step error from appearing merely because another step has missing fields. Compute date-sensitive limits when validating, rather than freezing today's date when the server starts.

Use a small transport adapter for ordinary HTML form fields versus JSON. Checkbox values and numeric inputs arrive differently in those formats. Do not indiscriminately use `z.coerce.boolean()` for consent: it follows JavaScript Boolean conversion, so the nonempty string `"false"` becomes true. Decode supported checkbox values explicitly, validate quantities as bounded integers, preserve repeated fields, and make empty-value handling deliberate. Zod's default email rule also differs from the current custom checks; regression cases should establish any intentional policy change. [28](https://zod.dev/api)

The schema should validate input structure and local business rules. **It cannot establish that an address exists or lies in a serviced county.** Keep authoritative Google/server coverage verification as a subsequent server-only operation with its own timeouts and provider-error handling. Likewise, retain request byte limits before parsing, actual file decoding and sanitization, rate limiting, duplicate-delivery handling, and SMTP outcome logic. A schema-valid request is not yet an approved or delivered pickup request.

Keep shared schemas separate from mail-template code. Currently, `pickup.ts` contains both validation and email-building functions; separating those responsibilities makes imports and ownership clearer. This observation alone does not prove email code is included in the browser bundle. Avoid validating the arcade's simulation state through Zod on every frame; use it only at appropriate external-data boundaries if needed.

Standard Zod is preferable initially for readability and straightforward maintenance. Zod Mini offers a more tree-shakable functional API, but the publisher recommends measuring the actual bundle before choosing it. [29](https://zod.dev/packages/mini) Compare the compiled pickup-form bundle with and without the schema; published miniature examples are not Bulk Away measurements. Choose Mini only if the measured savings justify its API tradeoff, and avoid maintaining duplicate server and client schemas in two different validation libraries.

Retaining the handwritten validator remains reasonable if minimizing immediate change is the overriding priority. It has existing regression coverage and no new dependency cost. Zod becomes the better target as the form evolves because its schemas make the contract easier to extend and inspect. Adoption should be a focused refactor, validated against existing accepted/rejected inputs, normalization, consent behavior, partial steps, and server tests before release. No Zod dependency or application changes were made as part of this evaluation.

## Styling, interaction, and the arcade

The current layout imports fifteen global stylesheets; eighteen CSS files exist across the audited application paths. This is not evidence that all CSS is unnecessary, but it makes ownership and override order important. Several files reflect successive refinements of the same surfaces. Component-scoped styles can make later changes more predictable.

Adopt CSS Modules gradually for navigation, pickup sections, comparison sliders, team cards, and the arcade cabinet. Keep shared tokens, resets, fonts, and deliberate global accessibility rules in a small global layer. Preserve Tailwind where it is already useful. Rewriting every class simultaneously would make it harder to distinguish styling regressions from framework regressions. Modules provide scoping; they do not inherently make a page faster.

Base UI already supplies behavior for complex controls and allows custom presentation. [11](https://base-ui.com/react/overview/quick-start) Continue using owned wrappers, but verify real keyboard navigation, labels, focus management, popup placement, and mobile interactions. A library's presence is not evidence that every composition is accessible. Simple controls should remain ordinary buttons, links, inputs, and disclosures when they meet the need.

The brand's value resides in its custom wordmark, lime/gold/ink/cream palette, fonts, illustrations, voice, and playful interactions. None requires a framework replacement. CSS and Web Animations are sufficient for the existing motion system. React Router can opt navigation into view transitions; this should replace overlapping route effects where appropriate, rather than add another layer of animation. [12](https://reactrouter.com/how-to/view-transitions) Preserve immediate navigation, reduced-motion preferences, keyboard focus, back-button behavior, and anchor positioning.

Keep the arcade's Canvas 2D and Web Audio implementation. Its simulation, collection timing, upgrades, enemies, chassis, sprites, and sounds are already separate enough to preserve as game code beneath a React shell. A routing framework does not improve those algorithms or automatically raise frame rate.

Game acceptance should include starting and ending runs, touch and keyboard controls, sound activation after a gesture, muting, pausing on hidden pages, cleanup after navigation, and the reward handoff to the pickup form. The homepage should not initialize a running game or audio system before the player chooses to engage. Keep simulation work outside React's frequent state updates. A separate game engine or WebGL library is not justified merely to make the marketing site more maintainable.

## Versions and tooling

TypeScript 7 was released on July 8, 2026. Its native compiler offers development-time performance improvements; those are not browser speed improvements. The release also states that 7.0 does not ship the previous compiler API and documents a TypeScript 6 compatibility path for tools that need it. [13](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

Bulk Away currently uses TypeScript 5.9.3 with strict checking. Therefore, the proposal's instruction to preserve an already completed TypeScript 7 migration does not apply. Evaluate compiler diagnostics, framework type generation, editor support, lint integration, and build behavior in a separate upgrade. Keep a supported compatible compiler temporarily if a required tool is blocked; do not weaken strict checking to force a version number.

Vite 8 is already installed. Its Node requirements are compatible with the site's Node 24 family. [14](https://v8.vite.dev/blog/announcing-vite8) Node 24 remains an LTS line in the current release table. [15](https://nodejs.org/en/about/previous-releases) Retain a maintained patch within that line and align local, CI, and Render runtimes. The repository's `@types/node` 22 version should also be reviewed when touching tooling; runtime and type declarations currently target different major versions.

Keep npm and the committed lockfile. There is no demonstrated reason to change package managers. Likewise, keep Oxlint and Oxfmt unless a required checking rule cannot be supplied. A framework migration should remove obsolete Vinext-specific declarations and configuration after their replacements pass, rather than leave two routing/build systems interleaved.

## Testing and performance

The current release command runs lint, type checking, Node tests, a production build, and production HTTP checks. That is a useful foundation. It does not provide automated evidence that the mobile menu stays visible, a disclosure expands in the correct place, a selector is keyboard-accessible, or an upgrade menu fits in the game screen.

Add Playwright journeys against the built application before migrating the framework. Prioritize all six pages and the complete pickup path. Include desktop and narrow mobile viewports, keyboard navigation, route changes, browser back/forward, anchors, reduced motion, form failures, photo limits, repeated submissions, and mocked Google/SMTP failure modes. Test mobile Safari behavior on a real device as well as browser automation where it affects touch or audio.

Use axe within browser tests for detectable accessibility failures. Automated checks must be complemented by manual keyboard and assistive-technology assessment; Playwright's own guidance makes that limitation explicit. [16](https://playwright.dev/docs/accessibility-testing) Screenshot assertions should focus on known failure-prone layouts rather than every decorative element.

Vitest is a good target for Vite-aligned unit and component testing, and its documented runtime requirements fit this stack. [17](https://vitest.dev/guide/) React Testing Library is useful for testing rendered components through their public interface. [18](https://testing-library.com/docs/react-testing-library/intro/) Neither requires immediately translating the existing Node tests. Preserve those tests while adding missing browser coverage; consolidate runners later only if it improves maintenance.

Server rendering is already present and should remain. Google recommends server or prerendered content because users and crawlers can receive meaningful HTML without depending on JavaScript execution. [19](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) A different SSR framework does not itself improve rankings. Preserve titles, descriptions, canonical URLs, structured data, sitemap entries, HTTP status codes, and crawlable links. Verify `PUBLIC_LAUNCH` deliberately: its repository default is false, so deployment configuration can matter more to discoverability than a routing decision.

Measure performance rather than predicting it from framework marketing. Use the same pages, assets, viewport, device/network conditions, and cache state when comparing builds. Track initial transferred JavaScript, unused route code, image sizing, font loading, layout movement, server response behavior, and interaction responsiveness. A reasonable outcome target is the standard good Core Web Vitals thresholds: LCP at most 2.5 seconds, INP at most 200 milliseconds, and CLS at most 0.1 at the 75th percentile, separated by device class. [20](https://web.dev/articles/vitals?hl=en) These are targets, not measured results for Bulk Away.

## Render delivery and operating simplicity

Keep the paid Render Node service. The repository already specifies a paid Starter plan, the website root directory, a reproducible build, and a health endpoint. Render's free web services block outbound SMTP ports including 465 and 587, making the free tier unsuitable for the current SMTP transport. [21](https://render.com/docs/free)

GitHub Actions already runs release checks. However, the inspected Render YAML does not declare a CI-gated auto-deploy trigger; dashboard settings were not verified. Render supports deployment after CI checks pass, including the Blueprint `autoDeployTrigger: checksPass` setting. Confirm this explicitly, ensure the important workflow actually runs rather than being skipped, and retain a manual rollback path. [22](https://render.com/docs/deploys), [23](https://render.com/docs/blueprint-spec)

A React Router migration needs a new verified production start entry. The existing `dist/standalone/server.js` path belongs to the Vinext output and should not be assumed valid afterward. Use the supported Node adapter/server arrangement, honor Render's port, preserve health checks, and verify static asset caching, compression, request size limits, proxy handling, and graceful shutdown. React Router documents full-stack Node deployment options. [24](https://reactrouter.com/start/framework/deploying)

Keep one application service rather than introducing microservices for two server endpoints. Do not add a CMS, Redux, a query library, or a content database without a demonstrated content-editing or application-state need. Monitoring should expose failed requests and delivery failures without logging sensitive message contents or uploaded photos unnecessarily.

## Recommended implementation sequence

1. **Establish the baseline.** Preserve the current work, inventory every public URL and form outcome, and add browser tests around the known menu, selector, and arcade failure points. Record representative visual and loading baselines.
2. **Prove a representative route.** In an isolated migration branch, implement the shared layout and pickup journey under React Router Framework Mode. Include one content page, runtime configuration, SSR metadata, file handling, and the arcade mount/unmount boundary. Do not begin with a blank redesign.
3. **Make a continuation decision.** Confirm the representative slice preserves behavior and has a reasonable change surface. If it exposes substantial extra work, compare an official Next.js conversion before proceeding.
4. **Move the remaining routes.** Preserve URLs, headings, service/rate meaning, asset paths, navigation state, form semantics, and accessibility preferences. Replace Next-specific APIs intentionally. The audited application paths contain nineteen files importing `next/*`, in addition to root metadata types and configuration; this is a bounded migration, but more than a dependency swap.
5. **Separate secondary upgrades.** Validate TypeScript 7 independently. Adopt Zod through a focused validation refactor, preserving existing contracts and regression cases; this can also precede the framework migration. Introduce CSS Modules component by component after visual parity. Avoid combining a rendering migration, CSS rewrite, game expansion, email redesign, and dependency cleanup in one release.
6. **Validate the built deployment.** Run automated checks and test the Render staging service with actual configured providers. Exercise valid in-area addresses, invalid or incomplete addresses, mail delivery outcomes, attachments, and non-JavaScript submission. Verify all six pages, metadata, mobile navigation, touch controls, and performance against the baseline.
7. **Release with rollback.** Gate deployment on passing checks, retain the previous known-good release, and watch request failures, response times, and email outcomes after cutover.

No production migration, dependency installation, or deployment is part of this evaluation. The recommendation is a direction with explicit acceptance criteria. Its confidence is strongest on the retained stack layers, the identified form/testing gaps, and the mismatch between the proposal and the actual installed compiler. Confidence in the relative migration effort of React Router versus official Next.js remains conditional on the representative implementation.

## Sources and evidence

External documentation was checked on September 13, 2026. Rolling documentation describes its current published state; exact versions should be rechecked when implementation begins. Local observations describe the working repository, including uncommitted changes, and do not establish which changes are deployed.

Local evidence: `website/package.json`, `website/package-lock.json`, `website/tsconfig.json`, `website/vite.config.ts`, `website/next.config.ts`, `website/app/layout.tsx`, public route files, `website/components/pickup-form.tsx`, `website/components/navigation-motion.tsx`, `website/lib/image-processor.ts`, address and mail modules, arcade modules, `website/app/api/pickup/route.ts`, `website/scripts/verify-production.mjs`, `.github/workflows/ci.yml`, and `render.yaml`.

1. React Router. [Picking a Mode](https://reactrouter.com/start/modes). Framework architecture and capabilities; rolling documentation.
2. React Router. [Changelog](https://reactrouter.com/changelog). Published version status and release history; rolling documentation.
3. React Router. [Updating from v7](https://reactrouter.com/upgrading/v7). React Router 8 baseline requirements; rolling documentation.
4. React Router. [Rendering Strategies](https://reactrouter.com/start/framework/rendering). SSR, prerendering, and separate unstable RSC documentation; rolling documentation.
5. Cloudflare. [Vinext README](https://github.com/cloudflare/vinext). Platform emphasis, compatibility status, and standalone Node support; current repository documentation.
6. Vercel. [Next.js Self-Hosting](https://nextjs.org/docs/app/guides/self-hosting). Node deployment, environment variables, and operating considerations; rolling documentation.
7. Astro. [Islands Architecture](https://docs.astro.build/en/concepts/islands/). Selective hydration and island boundaries; rolling documentation.
8. Astro. [Share State Between Islands](https://docs.astro.build/en/recipes/sharing-state-islands/). Limits of context across independently hydrated islands; rolling documentation.
9. React Router. [Progressive Enhancement](https://reactrouter.com/explanation/progressive-enhancement). HTML-first forms and enhanced submission; rolling documentation.
10. Nodemailer. [Using Gmail](https://nodemailer.com/guides/using-gmail). Workspace/Gmail authentication and sender considerations; rolling documentation.
11. Base UI. [Quick Start](https://base-ui.com/react/overview/quick-start). Composable controls and styling approach; rolling documentation.
12. React Router. [View Transitions](https://reactrouter.com/how-to/view-transitions). Optional navigation transition integration; rolling documentation.
13. Microsoft, Daniel Rosenwasser. [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/). July 8, 2026. Native compiler, development performance, and compiler API compatibility.
14. Vite. [Vite 8.0 Is Out](https://v8.vite.dev/blog/announcing-vite8). Vite 8 runtime requirements; 2026 release announcement.
15. Node.js. [Node.js Releases](https://nodejs.org/en/about/previous-releases). Node 24 LTS status; current release table.
16. Microsoft Playwright. [Accessibility Testing](https://playwright.dev/docs/accessibility-testing). Axe integration and limits of automated accessibility testing; rolling documentation.
17. Vitest. [Getting Started](https://vitest.dev/guide/). Vite integration and runtime requirements; rolling documentation.
18. Testing Library. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). Component testing approach; rolling documentation.
19. Google Search Central. [JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics). Rendering and crawlability; rolling documentation.
20. Google web.dev. [Web Vitals](https://web.dev/articles/vitals?hl=en). Performance metrics and field thresholds; maintained article.
21. Render. [Deploy for Free](https://render.com/docs/free). Outbound SMTP restrictions on free web services; rolling documentation.
22. Render. [Deploying on Render](https://render.com/docs/deploys). CI-gated deployment behavior and check conclusions; rolling documentation.
23. Render. [Blueprint YAML Reference](https://render.com/docs/blueprint-spec). `autoDeployTrigger` configuration; rolling documentation.
24. React Router. [Deploying](https://reactrouter.com/start/framework/deploying). Full-stack hosting and Node deployment options; rolling documentation.
25. Zod. [Introduction and Requirements](https://zod.dev/). Stable version status and supported TypeScript configuration; rolling documentation, checked September 13, 2026.
26. Zod. [Basic Usage](https://zod.dev/basics). Parsing results and schema-derived input/output types; rolling documentation.
27. Zod. [Formatting Errors](https://zod.dev/error-formatting). Field, nested, and form-level error representation; rolling documentation.
28. Zod. [Defining Schemas](https://zod.dev/api). Coercion semantics and email validation behavior; rolling documentation.
29. Zod. [Zod Mini](https://zod.dev/packages/mini). Functional API, tree-shaking, and selection tradeoffs; rolling documentation.
