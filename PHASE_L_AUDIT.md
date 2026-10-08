# Phase L — SEO & Content Audit

Written before any Phase L implementation, from direct inspection of the repository as it currently exists — not from what earlier phase briefs assumed exists.

## 1. Current routes (verified against the actual `app/` tree)

| Route | Title | H1 |
|---|---|---|
| `/` | Freelancer Finance Tools | "See how much you'll actually receive, before you invoice." |
| `/tools/freelancer-fee-calculator` | Freelancer Fee Calculator | "Freelancer Fee Calculator" |
| `/tools/payment-comparison` | Freelancer Payment Comparison | "Compare freelancer payment costs" |
| `/guides/upwork-fees` | How Upwork Freelancer Fees Work | "How Upwork Freelancer Fees Work" |

**Correction to the Phase L brief's premise:** the brief describes the current site as including About, Contact, Privacy, Terms, and Affiliate Disclosure pages. None of these exist. The `Footer` component shows those five labels as plain, non-clickable text, explicitly commented as planned pages that don't exist yet. There is also no `app/sitemap.ts` or `app/robots.ts` prior to this phase — no sitemap mechanism existed yet.

## 2. Titles and descriptions

All four existing pages have unique titles/descriptions. None promise an exact/guaranteed amount — a pattern worth continuing in Phase L's new pages.

## 3. Heading structure

- Homepage: H1 → H2 (Tools) → H2/H3 (tool cards).
- Calculator: H1 → H3 (`CardTitle`) → H2. Has a real heading skip (H1 straight to H3) — the same issue Phase J found and fixed on its own new page, left untouched here per Phase J's explicit decision not to retrofit the existing calculator page. Flagged, not fixed, in this phase.
- Payment comparison: H1 → H2 → H3 → H3 → H2 → H2 → H2 → H2. Correct, no skips.
- Upwork guide: H1 → eight H2 sections, no skips.

## 4. Existing internal link graph

A tight, fully-connected 4-node graph: homepage, Upwork guide, calculator, and comparison tool each link to every other node within one click.

## 5. Existing source attribution

Every financial claim traces to a `SourceInfo` record in `types/financial.ts`/`data/providers/*`/`data/fx/reference-rates.ts`, rendered via `SourceNote`. Eight official sources currently back all site content (Upwork ×2, Payoneer ×4, Wise ×3 eligibility records sharing 3 source documents, SBP ×1).

## 6. Duplicate/overlapping content risk

- A new general platform-fees page must stay conceptual and defer Upwork specifics to the existing guide.
- A new payment-fees-categories page must cover broader ground than the comparison page's own "Understanding this comparison" section, not re-litigate the same Payoneer specifics.
- A new USD→PKR page can go deeper on the reference-vs-provider-rate concept but must not re-describe the SBP source block beyond what's needed.

## 7. Pages that should NOT be created

- Country/currency/provider matrix pages — nothing in the verified data layer supports more than one country or two providers.
- A "best payment provider" ranking page — there's exactly one calculable provider and one unresolved one; nothing to rank.
- A standalone "Freelancer taxes" page — no tax data exists anywhere in the project.

## 8. Opportunities for improvement

- A conceptual "how platform fees work" page — genuine gap (only Upwork-specific content exists).
- A page enumerating all five cost categories together with the project's status vocabulary — genuine gap.
- A page explaining "reference rate vs. provider rate" from scratch — genuine gap.
- A "how to calculate take-home pay" page — **likely redundant** with existing content; decision deferred to `PHASE_L_DESIGN.md`.
