# Phase L — Design: SEO Content Architecture

Written after `PHASE_L_AUDIT.md`, before implementation.

## 1. Selected pages

Three guides are built. The optional fourth is **not** built — see §6.

| Route | Title | Search intent |
|---|---|---|
| `/guides/how-freelancer-platform-fees-work` | How Freelancer Platform Fees Work | Informational, cross-platform, calculator transition |
| `/guides/freelancer-payment-fees-explained` | Freelancer Payment Fees Explained | Informational / problem-solving |
| `/guides/usd-to-pkr-for-freelancers` | USD to PKR for Freelancers | Informational, calculator transition |

## 2. Page purpose and why each is non-duplicative

- **Platform fees guide**: answers the more general question someone-hasn't-yet-picked-a-platform would search, citing Upwork's verified range as one illustration, then linking to the dedicated guide.
- **Payment fees explained**: lays out all five potential cost categories and teaches the project's exact/reference/ceiling/unresolved/not-calculable vocabulary from scratch, then sends the reader to the comparison page for the live version.
- **USD to PKR guide**: teaches "reference rate vs. provider rate" as a standalone concept without duplicating the SBP source block already on the comparison page.

## 3. Source dependencies

| Page | Sources used |
|---|---|
| Platform fees guide | Upwork Marketplace scenario (illustrative range only) |
| Payment fees explained | Upwork (both scenarios), Payoneer (eligibility + cross-currency ceiling), Wise (unresolved eligibility) |
| USD to PKR guide | SBP reference rate record, Payoneer cross-currency ceiling record |

No new source is introduced anywhere.

## 4. Internal-link relationships

```
Homepage → new "Guides" section → all four guides
Platform fees guide → Freelancer Fee Calculator, Upwork Fees guide, Payment Fees Explained
Payment fees explained → Payment Comparison, Freelancer Fee Calculator, Upwork Fees guide, USD-to-PKR guide
USD-to-PKR guide → Payment Comparison, Payment Fees Explained
Upwork Fees guide → existing links preserved + one new link each to Platform Fees guide and Payment Fees Explained
Payment Comparison page → "Related tools and guides" gains the two new relevant guides
```

## 5. Shared component

`components/content/GuideLayout.tsx` — a thin wrapper providing breadcrumb + H1 + intro + content container, copied from the existing identical pattern. Used only by the three new guides; the existing `/guides/upwork-fees` page is deliberately not retrofitted.

## 6. Optional fourth page: not built

`/guides/how-to-calculate-freelancer-take-home-pay` is **not created**. The calculator's and comparison page's own "How this calculation works" sections, plus the new Payment Fees Explained guide, already jointly cover this ground.

## 7. Metadata strategy

Each page gets a unique title/description. No `metadataBase` (no production domain chosen yet, consistent with every prior phase). No description promises an exact/guaranteed figure.

## 8. Indexing strategy

- `app/sitemap.ts` created (none existed before). Lists exactly the seven real routes — no query-string variant possible since the list is hand-maintained, not derived from dynamic state.
- Base URL from `process.env.NEXT_PUBLIC_SITE_URL`, falling back to `http://localhost:3000`. No domain invented.
- No `robots.ts` created — none existed before, and its absence isn't blocking.
- No canonical tags added anywhere.

## 9. Financial-language discipline

Every new page uses only the project's approved vocabulary ("amount after platform fee," "reference conversion," "published fee ceiling," "illustrative example," etc.) — verified by direct grep.

## 10. Calculation-engine changes

None. No file under `lib/calculations/` or `data/` is touched in this phase.
