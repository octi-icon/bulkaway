# Ship Bulk Away to Render

The repository root is this folder. The application is in `website/` and the Render Blueprint is `render.yaml`. Publish this repository to your chosen Git provider, then create a **Blueprint** in Render using that repository. If using Render's manual Web Service setup instead, use the settings below.

## Service settings

| Setting | Value |
| --- | --- |
| Service type | Node Web Service |
| Root directory | `website` |
| Node | `24.19.0` |
| Build | `npm ci --include=dev && npm run build` |
| Start | `npm start` |
| Health check | `/api/health` |
| Instance | Starter (one instance) |

The service binds to Render's `PORT` on `0.0.0.0`. The Blueprint selects a paid Starter instance: [Render blocks outbound SMTP on its free web services](https://render.com/docs/free). Creating the service incurs Render charges. No service is created by the local preparation process.

## Environment variables

| Variable | Set in Render |
| --- | --- |
| `SMTP_PASS` | Google app password for `mailer@wsitrashvalet.com`; never put it in Git |
| `GOOGLE_MAPS_SERVER_KEY` | Separate Geocoding API key restricted to the Render service’s outbound IP ranges; required before requests can be accepted |
| `GOOGLE_MAPS_BROWSER_KEY` | Your website-restricted Google Maps/Places browser key; manual entry works without it |
| `SITE_URL` | Leave unset for the Render preview; set to the exact primary HTTPS domain when connecting it |
| `PUBLIC_LAUNCH` | `false` while reviewing; change to `true` when ready for indexing |
| `HELM_INTAKE_URL` | Helm origin (e.g. `https://helm.example.com`); with the secret, pickups are recorded in Helm |
| `HELM_INTAKE_SECRET` | Shared HMAC secret from the Helm owner (equals Helm `WSI_INTAKE_SECRET_BULK_AWAY`); never in Git |

The Blueprint already sets `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=mailer@wsitrashvalet.com`, `NODE_VERSION`, `NODE_ENV`, and `HOST`. Do not override `PORT`. The crew receives requests at `service@bulkaway.com`, with the customer as Reply-To. After that message is accepted, the customer receives a separate branded acknowledgment with the service mailbox as Reply-To. Both use the existing authenticated sender; no additional email environment variables are required. Customer-copy failures preserve the successful request reference and do not resend the crew message.

Authorize the Render hostname and final domain in your Google key's HTTP referrer restrictions. Enable Maps JavaScript API and Places API (New), with billing enabled. The key is browser-visible by design; the SMTP password is server-only.

## Check the deployed site before launch

1. Verify `/api/health` returns `{"status":"ok"}` and the home, `/privacy`, `/sms`, and `/arcade` pages load over HTTPS.
2. Select an actual Google address and verify manual address entry still works. Test on the real deployed hostname.
3. Send one deliberately identified pickup test using an address you control and an optional photo. Confirm it arrives at `service@bulkaway.com` with the attachment, item quantities, correct Reply-To, and selected consent details. This live-delivery check is still required; automated checks do not send mail.
4. Clear the three hero items, play the embedded arcade, and check SPACE5 appears in the pickup form. Test keyboard/touch controls, mute, pause, and the untimed alternative.
5. Connect the primary domain, set `SITE_URL`, and redirect alternate domains. Verify the form works on that domain before enabling `PUBLIC_LAUNCH=true`. Confirm the sitemap is then populated and pages no longer carry `noindex`.

## Current boundaries

- The form requests a quote and preferred date; it does not confirm appointments. When `HELM_INTAKE_URL` + `HELM_INTAKE_SECRET` are set, each accepted pickup is also recorded in Helm's Bulk Away queue through the shared `wsi_web_intake_v1` hand-off (see website/README.md); unset = email only.
- SMS consent language is present. Twilio delivery and the client portal are not connected.
- SPACE5 is a crew-applied 5% discount, not a unique redemption token. Scores stay on the player's device; there is no shared leaderboard or redemption database.
- Rate limits and idempotency are process-local. Keep one service instance until those stores become shared and durable.
- Privacy/cookie controls do not enable advertising or analytics.

## Repeatable checks and rollback

From `website/`, run `npm ci --include=dev`, `npx playwright install chromium`, and `npm run check:release`. The release command runs lint, generated route types, domain tests, Vitest/Testing Library, a React Router production build, production HTTP checks on port 8791, and Playwright/axe browser journeys on port 8793. That check clears email credentials, rejects invalid requests, and stops its server afterward. GitHub Actions installs Chromium and runs the same release command on pushes and pull requests. The Render Blueprint sets `autoDeployTrigger: checksPass`; for an existing manually configured service, select “After CI Checks Pass” in its auto-deploy settings.

Run `npm audit --omit=dev` when preparing a release. Keep `package-lock.json` committed and use `npm ci` in Render; do not replace it with an unpinned install.

If a deploy regresses, use Render's rollback to the last successful deploy, then revert the source change and run the checks before redeploying. Environment-variable changes may need to be reverted separately. The [health check](https://render.com/docs/health-checks) establishes that the web server responds; it does not authenticate Google SMTP.

## Historical preparation verification — September 8, 2026

Verified from an isolated export of the staged files with a fresh locked dependency install on Node 24.19.0 (Windows): lint, TypeScript, all 38 tests, the standalone production build, and production HTTP checks passed. Those checks include the home/privacy/SMS/arcade pages, deferred homepage game, artwork/fonts/sprites, compression and cache behavior, branded 404s, and invalid form/photo requests. The production dependency audit reported zero known vulnerabilities. The GitHub Actions workflow is prepared for Linux; it has not run remotely yet.

SMTP delivery and Google address selection still require the deployed-environment checks above. No email was sent, remote repository created, or Render service deployed during preparation.

## Commit scope

The Git ignore rules exclude credentials, caches, build output, local tooling metadata, and the owner's raw artwork/fonts/private reference folder. All optimized assets required by the site are included under `website/public/`. Source and verification documentation remain included. Nothing in the private reference folder is edited or uploaded by this preparation.

After reviewing and committing the changes, push to the existing GitHub repository. This migration does not create another Render service or automatically change the existing service settings.
