# Phase H / H.1 — Payment Provider Research & Corrections

Status: data layer only. No comparison UI exists yet. This document is the reference for the phase that builds it.

**Phase H.1 note:** this document was revised after a correctness review. Every claim below is now labeled as one of four kinds, and the labeling itself is the main change from the original Phase H version:

- **Directly verified** — the source says this, in words, on the page.
- **Project-level conclusion** — this project's own inference from directly-verified facts; not something the provider states.
- **Unresolved** — actively looked for, not found on an official page; not guessed.
- **Deliberately not modeled** — a real, known fact that doesn't fit this project's current data shapes, recorded here instead of being forced into one.

---

## 1. Wise — Pakistan

### Directly verified (Wise Help Centre)
- A Pakistan-resident **cannot hold a Wise balance** — Pakistan is not on Wise's list of countries where a balance can be held. ([source](https://wise.com/help/articles/2813542/where-do-i-need-to-live-to-hold-money-with-wise), verified 2026-09-16)
- A Pakistan-resident **cannot get USD account details** — Pakistan is explicitly named in Wise's list of unavailable countries for this. ([source](https://wise.com/help/articles/2810318/can-i-get-usd-account-details), verified 2026-09-16)
- Pakistan is **not** on Wise's list of fully-unsupported countries (the ones where registration, login, and all use are blocked, e.g. Afghanistan, Iran, North Korea). A Wise account can be registered from Pakistan, and Wise can send money directly to a Pakistani bank account **on someone else's behalf**. ([source](https://wise.com/uk/help/articles/2978049/which-countries-can-i-use-wise-in), verified 2026-09-16)

### Project-level conclusion
- Wise cannot serve as a freelancer-controlled receiving/withdrawal method for a Pakistan-based freelancer. **This is this project's own inference** from the two directly-verified facts above — Wise has no page stating "Upwork/Fiverr payouts unavailable in Pakistan." In the data layer (`data/providers/wise.ts`), this is modeled with `status: "unresolved"`, not `"unavailable"`, specifically to keep that distinction visible in the code, not just in this document. **No Wise fee data is populated**, because the service this project would need to price isn't actually confirmed available.

### Not investigated (out of scope)
- Wise's "send money to Pakistan" product (a client-initiated remittance direct to a Pakistani bank account) is a genuinely different transaction — the freelancer doesn't control it, and it isn't how Upwork/Fiverr payouts work. Left uninvestigated rather than folded into provider data that would misrepresent it as a withdrawal method.

---

## 2. Payoneer — Pakistan

### Directly verified (payoneer.com)
- Payoneer is recommended by Upwork, Fiverr, and Toptal as a payout method. ([source](https://www.payoneer.com/freelancer/), verified 2026-09-16) — this establishes the marketplace-partnership fact specifically; it says nothing about Pakistan.
- Payoneer supports multi-currency receiving accounts for Pakistan-based freelancers/businesses and direct withdrawal to Pakistani bank accounts, naming Meezan Bank as a partner (and referencing HBL, UBL, MCB, Bank Alfalah as also supported). ([source](https://www.payoneer.com/resources/payoneer-and-meezan-bank-transform-international-payment-withdrawals-in-pakistan-with-new-partnership/), verified 2026-09-16) — this establishes Pakistan availability specifically; it does not itself mention Upwork or Fiverr.
- **Same-currency withdrawal fees**, each stated in its own currency, not one figure applied across all three: USD→USD = 1.50 USD, EUR→EUR = 1.50 EUR, GBP→GBP = 1.50 GBP, for monthly volume up to 50,000 in that currency; 0.5% of the total above that threshold. ([source](https://www.payoneer.com/about/pricing/), verified 2026-09-16)
- Annual account fee: $29.95, charged only if less than $2,000 (or equivalent) is received in a 12-month period. Same source.
- **Cross-currency withdrawal** (e.g. USD balance → PKR bank account — the actual Pakistan scenario): Payoneer's own resource article states this fee is **"up to 2%"**, built into the conversion rate rather than itemized separately. ([source](https://www.payoneer.com/resources/how-to-use-payoneer/how-payoneer-calculates-withdrawal-fees/), verified 2026-09-16) The live pricing page does not publish one static percentage for this route — only the general mechanics article states the ceiling.

### Project-level conclusion
- Because the two directly-verified facts above come from different pages (one general/marketplace, one Pakistan-specific), the eligibility record for "Payoneer supports receiving marketplace payouts in Pakistan" cites **both** sources, each covering the part it actually supports — see `data/providers/payoneer.ts`, `MARKETPLACE_PARTNER_SOURCE` and `MEEZAN_PARTNERSHIP_SOURCE`.

### Unresolved (looked for, not found)
- Payoneer's fee for *receiving* a marketplace payout itself (before any withdrawal) is commonly cited as "1%" by multiple third-party sites. Not independently confirmed on an official payoneer.com page in this research pass. **Not populated.**
- The exact (as opposed to ceiling) cross-currency withdrawal rate for any specific transaction — genuinely quote-dependent, not just under-researched.

### Deliberately not modeled
- The >50,000/month 0.5% tier for same-currency withdrawal: real, verified, but not represented as an active calculable scenario — see the `conditions` field on `payoneer-withdrawal-{usd,eur,gbp}-same-currency` in `data/providers/payoneer.ts`. Each scenario explicitly states it models only the lower tier.
- The $29.95 annual account fee: verified, but it's a periodic/inactivity charge, not a per-transaction fee, so it doesn't fit `FeeScenario`'s per-transaction shape. Recorded here in prose instead.

---

## 3. Direct Pakistani bank wire route

**Recommendation: exclude for now.** No single authoritative source (SBP or an official Pakistani bank fee schedule) establishes a general, typical SWIFT/wire receiving fee — fees vary bank-to-bank, and SBP's own published data (already in this project) covers the USD/PKR reference rate, not wire-receiving fees. Not included in this phase's data.

---

## 4. Exact official sources used

| Claim | Source | URL | Verified |
|---|---|---|---|
| Pakistan cannot hold a Wise balance | Wise Help Centre | https://wise.com/help/articles/2813542/where-do-i-need-to-live-to-hold-money-with-wise | 2026-09-16 |
| Pakistan cannot get USD account details | Wise Help Centre | https://wise.com/help/articles/2810318/can-i-get-usd-account-details | 2026-09-16 |
| Pakistan is not fully blocked from Wise | Wise Help Centre | https://wise.com/uk/help/articles/2978049/which-countries-can-i-use-wise-in | 2026-09-16 |
| Payoneer recommended by Upwork/Fiverr/Toptal | Payoneer | https://www.payoneer.com/freelancer/ | 2026-09-16 |
| Payoneer ↔ Pakistan/Meezan Bank withdrawal | Payoneer | https://www.payoneer.com/resources/payoneer-and-meezan-bank-transform-international-payment-withdrawals-in-pakistan-with-new-partnership/ | 2026-09-16 |
| Payoneer same-currency withdrawal fees, annual account fee | Payoneer Pricing | https://www.payoneer.com/about/pricing/ | 2026-09-16 |
| Payoneer cross-currency withdrawal "up to 2%" | Payoneer | https://www.payoneer.com/resources/how-to-use-payoneer/how-payoneer-calculates-withdrawal-fees/ | 2026-09-16 |

No blog, affiliate site, Reddit, Quora, YouTube, or generic fee-calculator site was used as evidence for any figure above.

## 5. Data model changes (Phase H + H.1 combined)

- `types/financial.ts`: `"variable"` FeeType; `maxPercentage` on `FeeScenario` (only valid when `feeType === "variable"`, enforced by a data-integrity test); `ProviderCapability`/`EligibilityStatus`/`EligibilityRecord`; **H.1**: `EligibilityRecord.source` (singular) → `EligibilityRecord.sources` (array), so a claim can cite exactly the sources that support each part of it.
- `data/providers/wise.ts`: **H.1** — `receiveMarketplacePayouts` changed from `unavailable` to `unresolved`, reworded to read as a project-level conclusion rather than a Wise statement; every record now cites `sources` precisely.
- `data/providers/payoneer.ts`: **H.1** — one ambiguous USD-labeled fixed fee split into three currency-specific scenarios (`payoneer-withdrawal-{usd,eur,gbp}-same-currency`); high-volume tier explicitly flagged as documented-but-not-calculable in `conditions`; eligibility claims split across two sources instead of one over-cited source.
- `lib/calculations/providerFees.ts`: **H.1** — percentage-range validation now enforced inside the function itself (previously a caller could pass an out-of-range `selectedPercentage` and get a computed result); added `allowEstimated` option plus a guard that refuses `"estimated"` scenarios by default and always refuses `"deprecated"` ones, for the `percentage`/`fixed` branches (the branches that can actually produce a number).
- `lib/calculations/dataIntegrity.test.ts`: **H.1** — new invariants: `maxPercentage` only valid on `"variable"`; `"variable"` scenarios can't also carry `percentage`/`percentageRange`/`fixedAmountMinorUnits`; `"fixed"` scenarios can't carry percentage fields; `"percentage"` scenarios must have exactly one of `percentage`/`percentageRange`; `EligibilityRecord.sources` non-empty with valid URLs.

**Untouched throughout both phases:** `lib/calculations/fees.ts`, `lib/calculations/fx.ts`, `lib/calculations/money.ts`, `data/providers/upwork.ts`, `data/fx/reference-rates.ts`, and every UI file.

## 6. What the future comparison tool can safely calculate

- Payoneer's fixed same-currency withdrawal fee, correctly in each of USD/EUR/GBP (though not relevant to a PKR payout).
- The *ceiling* on Payoneer's cross-currency (e.g. USD→PKR) withdrawal fee — "your fee will be at most 2%," never an exact figure — and this is now enforced at the type/data level (`maxPercentage` cannot appear on a non-`"variable"` scenario), not just by convention.
- Clear eligibility messaging that distinguishes what Wise/Payoneer directly state from what this project has concluded.

## 7. What it cannot safely calculate (and must not pretend to)

- An exact Payoneer cross-currency withdrawal fee for a specific transaction.
- Payoneer's marketplace-receiving fee (unresolved).
- Payoneer's >50,000/month 0.5% tier (documented, not modeled as calculable).
- Any Wise-based receiving/withdrawal flow for Pakistan.
- A full "amount that lands in your bank account" figure.
- Anything about direct Pakistani bank wires.
