# Bulk Away final refinement pass

Research completed September 7, 2026. This is a bounded follow-up to `REFINEMENT-RESEARCH.md`, not a repeat proposal for work already completed. Eight relevant primary sources were read. Current source inspected: the homepage, service explorer/finder, pickup form and endpoint, privacy/SMS pages, and structured business data. This document records research and source observations; rendered verification belongs in a later implementation record.

## Does it look finished, and does the brand stand out?

The prior six-company comparison remains useful evidence of category messaging; those competitors were not re-operated in this pass. The atomic truck, Googie sign, lime/gold/ink palette, supplied typography, and clearing interactions form a distinctive visual system within that limited comparison. There is no evidence here of industry-wide uniqueness or measured conversion superiority.

The site has already addressed the large content gaps: service geography, audience, quote factors, recurring multifamily scope, direct contact, family relationships, social previews, and missing-page recovery. More decoration would not resolve a remaining buyer question. The final opportunities lie at the end of the request journey and in error recovery, where a memorable brand should also feel dependable.

Real crew and job photographs remain the most useful future credibility evidence, and the owner has explicitly said they will add these later. Do not invent customer reviews, insurance/certification badges, job counts, years in business, response guarantees, or environmental metrics. The crew illustration remains brand art rather than documentary proof. Stanford's original credibility guidance connects appropriate design, real organizations/people, contact information, usefulness, and freedom from errors. It is older general research, not a contemporary hauling conversion benchmark. [Stanford Web Credibility Guidelines](https://credibility.stanford.edu/guidelines/index.html).

## Evidence and precise recommendations

### 1. Give successful requests a usable receipt

**Source observation:** The existing success state displays the reference and says the crew will confirm quote, availability, and next steps. Its only action is starting another request. The entered details disappear from view, and phone/email help is elsewhere in the page. There is no claim that the customer receives a confirmation email; preserve that accuracy.

**External evidence:** GOV.UK recommends confirmation outcomes with reference, next steps, contact information, and a way to retain the transaction. USWDS separately treats reviewing and keeping submitted answers as part of completing a complex form. These are design-system recommendations, not legal requirements for Bulk Away. [GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/), [USWDS complex forms](https://designsystem.digital.gov/patterns/complete-a-complex-form/).

**Implementation inference:** Keep the existing celebratory sparkle and add a compact request recap: selected service, items/quantities or notes, pickup address, and preferred date explicitly labeled as a preference. State that the request is sent and the pickup is not booked until the crew confirms it. Put the existing phone/email routes next to the reference; email may include the reference in its subject. A local print/save record is useful if implemented without an account, new server storage, public URL containing private details, or auto-email promise. Capture a snapshot at submission so changing the shared haul builder cannot alter what a successful receipt says was submitted. Do not expose the address in the URL.

### 2. Make delivery problems understandable and recoverable

**Source observation:** Server responses already explain validation and mail delivery problems in normal language, and the form retains entries after failure. However, the client's catch block displays any non-timeout `Error.message`, which can expose browser/network text such as “Failed to fetch” or a JSON parsing message. A timeout already correctly avoids claiming definite failure when delivery is uncertain.

**External evidence:** GOV.UK's service-problem pattern explains the problem and the next available action without treating a system problem as an input mistake. Predictable access to human help supports users who cannot complete the task alone; WAI's consistent-help criterion concerns relative placement of repeated help mechanisms, and does not require a help widget on every page. [GOV.UK service problem pages](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/), [WAI consistent help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html).

**Implementation inference:** Distinguish a known server-provided, user-safe response from an unclassified transport/parsing failure. For the latter use clear uncertainty wording, retain the full draft/photos, and offer the existing call/email actions. Do not silently retry an email, clear the form, or assert that nothing was sent when delivery is unknown. The API already uses an idempotency key; preserve it while resolving an uncertain request.

### 3. Summarize validation corrections when a step fails

**Source observation:** Errors appear beside fields, hidden disclosures are opened, and focus moves to the first invalid field. That is useful existing behavior. There is no overview of the corrections, particularly when the final contact stage has several errors.

**External evidence:** GOV.UK recommends a focused error summary with links to the corresponding fields and the same messages as the inline errors. WAI's tutorial describes a prominent summary with clear corrections and field links; it also recognizes focusing the first invalid field as useful. Thus this recommendation improves overview, and is not a claim that the present focus behavior itself violates WCAG. [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/), [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).

**Implementation inference:** Add a compact, focusable summary only after failed validation. Link each entry to its real field; a link must reveal the correct step/disclosure before focusing the control. Use the existing error text consistently. Keep the short initial form unchanged. For server errors spanning stages, ensure the summary does not strand links in hidden content. Test the item quantity, photo, custom service/date selector, contact, and consent targets. Do not add a permanent warning box or validate angrily while the visitor is still typing.

## Scope restraint and launch dependencies

Two additional implementation findings were independently reported by the main review. The consent's privacy link opens in the same tab and can leave the form, losing the in-memory draft; the SMS terms already use another tab. Use the same announced new-tab behavior for the privacy link to preserve this short-lived draft. This is a project-specific continuity recommendation, not a general instruction to open every link in a new tab.

The form also omits an explicit method and depends on a hydrated JavaScript submit handler. HTML's default method is GET, which appends submitted data to the URL. Use an explicit POST method, prevent submission until the interactive handler is ready, and offer a plain phone/email alternative when JavaScript is unavailable. This does not mean implementing another mail-delivery endpoint or pretending the JSON/multipart API accepts a native HTML form. [MDN form element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form).

The selected final scope can therefore be the compact immutable receipt, readable delivery recovery, and these two draft/privacy continuity fixes. The validation-summary proposal is an optional later improvement if adding it would re-lengthen or destabilize the just-shortened form. Inline errors and existing first-invalid focus are already useful.

No new illustration, second service picker, quiz, pricing simulation, testimonial carousel, automatic popup, motion loop, or fabricated proof is recommended. Confirmed weekly bulk, enclosure sweeping, recyclables, and chute-room services are already specific; new service claims require actual business information.

The Google app password on Render, real email and attachment delivery, deployed domain/HTTPS, and deliberately disabled launch indexing remain deployment checks. Twilio and the client portal remain forthcoming. These dependencies are not visual defects and do not justify adding fake working controls. The requested final pass can be completed locally without sending a real message or publishing the site.

## Verification required after implementation

- Validate a blank contact stage; confirm a correction overview and each field link work with keyboard and pointer, including disclosures and earlier stages.
- Exercise controlled successful, server-error, transport-error, malformed-response, and timeout outcomes without real email. Confirm drafts survive, uncertain outcomes remain honest, and the success recap matches submitted data.
- Inspect the receipt and errors at 320/390px mobile and desktop, including long notes, addresses, and item lists. Check readable contrast, focus visibility, and no horizontal overflow.
- If record saving is added, inspect the actual exported/printed record and confirm it contains the request reference and clear pending-confirmation status.
- Run focused tests, lint, type checks, and production build. Record actual observed results separately; research does not establish these checks passed.

This report does not establish full WCAG conformance, launch readiness, search ranking gains, or a measured conversion lift.

## Implementation and verification — September 7, 2026

Implemented the selected bounded scope:
- Success now shows a frozen snapshot of submitted service, quantities, notes, address, preferred date, and photo count, alongside the confirmed reference. Copy explicitly says the pickup is not booked yet and provides reference-aware email and phone contact.
- A successful HTTP status alone cannot trigger success: the response must contain a valid Bulk Away reference. Malformed JSON, missing references, timeouts, and unclassified browser errors use understandable uncertain-delivery wording. Known server corrections remain intact. Existing draft retention and idempotency behavior are preserved; no automatic retries were introduced.
- The privacy notice uses an announced new-tab anchor, separate from the checkbox label so reading terms does not select consent.
- Server-rendered controls are disabled until hydration; the form explicitly uses POST. A no-JavaScript message offers phone and email access instead of a nonworking form.
- No new visual effects, fabricated proof, or extra default form fields were added. The optional validation summary was deferred to preserve the recently shortened form; existing inline errors and first-invalid focus remain.

Verification: all 25 tests passed, including controlled success, malformed response, server corrections, masked network/timeout errors, and immutable receipt data. Lint, TypeScript, and the final production build passed. HTTP inspection confirmed status 200, explicit POST, server-rendered disabled controls, and the no-JavaScript contact fallback. The hydrated browser enabled the form normally and completed the three-step navigation without submission. At 390px the form had no horizontal overflow; keyboard activation of the privacy link left the draft intact and consent unchecked. The in-app browser did not expose a newly opened privacy tab, so new-tab opening itself is not claimed as observed; its native target and announced text were inspected. No console errors were observed in the first browser check.

The success receipt's data and response transitions were unit-tested; an actual emailed submission and rendered post-delivery receipt were not exercised. No customer messages were sent. Real transport/attachment delivery remains a Render launch check. Public indexing, Twilio, and the portal remain in their previously agreed states.
