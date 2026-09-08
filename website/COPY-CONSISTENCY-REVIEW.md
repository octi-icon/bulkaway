# Customer-facing copy consistency review

Reviewed September 7, 2026. **No actionable contradictions or misleading states found in the scoped copy.** No production files changed.

## Scope and evidence

Reviewed the homepage, privacy notice, SMS terms, 404 page, and customer-facing top-level components shipped by the homepage and layout. Followed text imported from pickup, service-guide, receipt, and site-data modules. Source code and the business facts supplied for this review are the primary evidence; no external research was needed because this was a consistency review, not a legal-compliance assessment or verification of business operations.

- **Ownership and coverage agree.** The homepage says women-majority owned and family owned and operated, and identifies Salt Lake, Utah, Weber, and Davis counties. The county interaction and structured site data use the same four counties. Sources: [homepage](app/page.tsx#L87), [ownership paragraph](app/page.tsx#L261), [county explorer](components/engagement.tsx#L72), [site data](lib/site-data.ts#L4).
- **The request is consistently a quote and scheduling inquiry.** The haul list says it is not a quote; the calendar requests an optional preferred date; the success receipt explicitly says the pickup is not booked; and the privacy notice says submission does not confirm booking. Sources: [haul list guidance](components/engagement.tsx#L28), [date selector](components/pickup-selectors.tsx#L90), [success receipt](components/pickup-form.tsx#L281), [privacy notice](app/privacy/page.tsx#L58).
- **SMS and portal messaging stay in the future.** The form discloses that recording the optional choice does not activate automated messages. The SMS page and privacy notice explain the pending Twilio service and portal. The mailed record separately preserves the optional choice and states that it does not activate Twilio or send a text. The homepage's “Call or text” contact line does not itself contradict the narrower claim that automated website messaging is not connected. Sources: [form disclosure](components/pickup-form.tsx#L658), [SMS launch note](app/sms/page.tsx#L31), [privacy SMS section](app/privacy/page.tsx#L88), [mail record](lib/pickup.ts#L174).
- **AEPOC's role is consistent.** Both the brand card and family finder identify business strategy and design and its design role for the family of brands. Sources: [brand card](app/page.tsx#L476), [family finder](components/engagement.tsx#L218).
- **Storage and photo statements match their local implementations.** The cookie controls and privacy notice distinguish session preferences from optional 180-day persistence. The photo notice describes re-encoding and metadata removal, which the photo-preparation path performs before attachment. Sources: [cookie preferences](components/cookie-preferences.tsx), [privacy storage section](app/privacy/page.tsx#L126), [photo preparation](lib/photos.ts#L47).

No new reviews, prices, response-time guarantees, or cosmetic synonym changes are recommended. Browser interaction and delivery testing remain with the parent review; this report makes no claim that live email delivery or future SMS works.

## Main-task follow-through

The main task subsequently changed the telephone link caption from “Call or text the Bulk Away crew” to “Call the Bulk Away crew” to match its actual `tel:` action. This is action clarity, not a claim that manual SMS availability was disproven. No service promises, pricing, policy terms, SEO keywords or visual effects changed.

At 390 × 844, browser testing selected an invalid Furniture quantity, closed its disclosure, and tried to continue. Validation reopened the section, focused the quantity input, and associated it with the correction message. Entering a valid quantity then advanced to the pickup step. No horizontal overflow was observed in that state and no request was submitted.

Research consulted [W3C error suggestions](https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion.html), [Google people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), and [Google animation performance guidance](https://web.dev/articles/animations-guide). These supported retaining helpful error messages, factual copy, and the existing restrained motion. No new concrete animation or SEO defect was established. The preceding service-content review and full component inventory remain applicable; they are not represented as entirely new browser tests here.

The updated production build and lint passed. Fresh read-only HTTP checks confirmed the new caption, all five service panels, eight image sources, one H1 per public page, working home/privacy/SMS routes and a real 404 response. Behavior tests were not rerun for this isolated caption edit; their preceding passing result is recorded separately. Production email delivery, public indexing and future messaging integrations remain launch work.

## Additional navigation and disclosure acceptance pass

September 7, 2026. No new production defect was established; this pass preserves the reviewed build rather than adding effects without a demonstrated benefit.

- At 390 × 320, opened the mobile navigation. The final pickup link extended below the initial viewport but remained reachable through normal document scrolling and successfully opened the request section. The header is relatively positioned; it does not trap the menu beneath a fixed viewport edge.
- At 390 × 844, Escape closed the mobile navigation and returned focus to the Open menu button, with aria-expanded=false.
- At 390 × 844, opened both the optional photo section and its nested guidance. Both expanded inline, the upload control and next-step button remained visible/reachable, and the page had no horizontal overflow. Screenshot inspected. No files uploaded or request submitted.
- At 1440 × 1000, exercised service tabs with End, Home and ArrowDown. The settled selection was Trash outs, exactly one panel was displayed, and its accessible label matched the selected tab. No horizontal overflow or browser errors were observed in these tested states.
- Reviewed the existing route-change focus and popstate exception in source. Browser Back/Forward restoration was not directly tested in this pass, so no new runtime claim is made about it.

Research consulted the [W3C disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), the [W3C disclosure navigation example](https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/examples/disclosure/disclosure-navigation.html), and [web.dev's back/forward cache explanation](https://web.dev/articles/bfcache). These support the simple disclosure navigation already used and treating history restoration as a distinct test concern; they do not establish a defect in this site.

The complete earlier page/component review, service-content SEO fix, build/lint/unit/HTTP checks, and delivery-size measurements remain recorded in the companion reports. They were not all rerun for this documentation-only pass. No production code changed and no additional build was necessary. Restored the browser viewport and left the current production preview at /?preview=review-verified#main. Live Render email verification and public indexing remain launch tasks; Twilio and the client portal remain intentionally pending.
