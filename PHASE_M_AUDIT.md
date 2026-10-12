# Phase M — Trust, Legal & Launch-Readiness Audit

Written from direct inspection of the repository before any Phase M change.

## 1. Current routes (9 static)
`/`, `/tools/freelancer-fee-calculator`, `/tools/payment-comparison`, `/guides/upwork-fees`, `/guides/how-freelancer-platform-fees-work`, `/guides/freelancer-payment-fees-explained`, `/guides/usd-to-pkr-for-freelancers`, `/sitemap.xml`, `/_not-found`.
No `/about`, `/contact`, `/privacy`, `/terms`, `/affiliate-disclosure`.

## 2. Footer
`components/layout/Footer.tsx` renders Tools, Guides, About, Contact, Privacy, Terms, Affiliate Disclosure as **plain unlinked text**. "Tools" and "Guides" are not legal placeholders but there are also no `/tools` or `/guides` index pages, so they cannot be linked as-is. Copyright line reads "Working title — not a final brand."

## 3. Header
`nav-items.ts` contains only `Home`. Neither tool is reachable from the primary nav.

## 4. Metadata
- Root layout title template is `"%s | Freelancer Finance Tools (working title)"`; default description is **"Placeholder metadata — to be replaced…"**.
- **Defect:** `app/page.tsx` has no `metadata` export (lost in the post-reset reconstruction; the Phase D version had one). The homepage therefore serves the placeholder description and the default title.
- All other pages have unique titles/descriptions.

## 3a. Sitemap / robots
`app/sitemap.ts` lists 7 routes, no query strings, base URL from `NEXT_PUBLIC_SITE_URL` with localhost fallback. No `app/robots.ts` exists; absence means crawlers are not blocked, but also means the sitemap is not advertised.

## 5. What the application actually does with data
Verified by grep over `app/ components/ lib/ data/ types/`:
- no `localStorage`, `sessionStorage`, `document.cookie`, or any cookie handling
- no analytics, tag manager, ad scripts, or `<script>` tags
- no `fetch`, XHR, beacons, API routes, or server actions — all calculation runs in the browser
- no forms, no email addresses, no `mailto:`
- fonts are system fonts (no third-party font requests)
- URL query parameters (`amount`, `contract`, `fee`, `plus`, `reference`) mirror calculator inputs on the comparison page via `router.replace`
- Clipboard API is used only on the Share button, to copy the URL locally
- `app/layout.tsx` carries a Google Search Console `verification` meta tag (no script, no tracking)
- external links: outbound `<a href>` to official source documents only
- dependencies: next, react, react-dom only

## 6. Existing disclaimers
Each tool page has a "What this does not include" Alert; guides carry the same. No site-wide statement and no pointer to a Terms page.

## 7. Missing trust/legal pages
About, Contact, Privacy, Terms, Affiliate Disclosure.

## 8. Contact infrastructure
**Classification C — none exists.** No address, form, backend, or service is present anywhere. This is a launch blocker for a credible Contact page and is recorded as `CONTACT_INFRASTRUCTURE_REQUIRED`.

## 9. Misleading / overpromising copy found (documented, not all fixed)
- Homepage calculator card: "See what you'll actually receive from a client payment" — the calculator only subtracts Upwork's platform fee. **Fix in Phase M.**
- Homepage CTAs: "Calculate your net amount" — contradicts the project's own rule against implying a net/final figure. **Fix in Phase M.**
- Homepage H1 "See how much you'll actually receive…", sub-headline "see the real number", final Alert, and the preview row "Estimated amount received": approved Phase D positioning, but stronger than the tools can support. **Not changed — a positioning decision for the owner; flagged.**

## 10. Other launch-readiness issues
- "(working title)" appears in every `<title>` and the footer; brand/domain are undecided.
- Calculator page still has the H1→H3 heading skip (known since Phase J; out of scope).
- No `/guides` or `/tools` index pages.
- No `robots.ts`; no production domain.
- No analytics (intentionally), so no traffic measurement.
