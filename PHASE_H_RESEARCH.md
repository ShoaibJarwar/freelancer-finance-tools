# Phase H — Payment Provider Research

Status: data layer only. No comparison UI exists yet. This document is the reference for the phase that builds it.

## 1. Providers researched

### Wise — Pakistan

**Verified, official (wise.com Help Centre):**
- A Pakistan-resident **cannot hold a Wise balance** — Pakistan is not on Wise's list of countries where a balance can be held. ([source](https://wise.com/help/articles/2813542/where-do-i-need-to-live-to-hold-money-with-wise), verified 2026-09-16)
- A Pakistan-resident **cannot get USD account details** — Pakistan is explicitly named in Wise's list of unavailable countries for this. ([source](https://wise.com/help/articles/2810318/can-i-get-usd-account-details), verified 2026-09-16)
- Pakistan is **not** on Wise's list of fully-unsupported countries (the ones where registration, login, and all use are blocked, e.g. Afghanistan, Iran, North Korea). A Wise account can be registered from Pakistan, and Wise can send money directly to a Pakistani bank account **on someone else's behalf**. ([source](https://wise.com/uk/help/articles/2978049/which-countries-can-i-use-wise-in), verified 2026-09-16)

**Conclusion:** Wise cannot serve as a freelancer-controlled receiving/withdrawal method for a Pakistan-based freelancer — there's no account/receiving-detail combination to hand to Upwork or Fiverr as a payout destination. This is a precise, sourced *exclusion*, not a gap. **No Wise fee data is populated**, because the service this project would need to price isn't actually available.

**Not investigated further (out of scope for this phase):** Wise's "send money to Pakistan" product (a client-initiated remittance direct to a Pakistani bank account) is a genuinely different transaction — the freelancer doesn't control it, and it isn't how Upwork/Fiverr payouts work.

### Payoneer — Pakistan

**Verified, official (payoneer.com):**
- Payoneer is an official payout partner for Upwork and Fiverr, and is confirmed usable by Pakistan-based freelancers, including a named partnership with Meezan Bank for local withdrawal.
- **Same-currency withdrawal** (USD/EUR/GBP balance → bank account in that same currency, in a matching country): fixed fee of 1.50 in that currency, for monthly volume up to 50,000; 0.5% above that. **Not applicable to Pakistan** — PKR isn't USD/EUR/GBP.
- **Cross-currency withdrawal** (e.g. USD balance → PKR bank account — the actual Pakistan scenario): Payoneer's own resource article states this fee is **"up to 2%"**, built into the conversion rate rather than itemized separately.
- Payoneer's live pricing page does **not** publish one static percentage for this route.
- Annual account fee: **$29.95**, charged if less than $2,000 (or equivalent) is received in a 12-month period. **Not modeled as a `FeeScenario`** — it's periodic, not per-transaction.

**Unresolved:** Payoneer's fee for *receiving* a marketplace payout itself is commonly cited as "1%" by third-party sites, but this project could not independently confirm that figure on an official payoneer.com page. **Left unpopulated.**

### Direct Pakistani bank wire route

**Recommendation: exclude for now.** No authoritative source establishes a general, typical SWIFT/wire receiving fee.

## 2. Exact official sources used

| Claim | Source | URL | Verified |
|---|---|---|---|
| Pakistan cannot hold a Wise balance | Wise Help Centre | https://wise.com/help/articles/2813542/where-do-i-need-to-live-to-hold-money-with-wise | 2026-09-16 |
| Pakistan cannot get USD account details | Wise Help Centre | https://wise.com/help/articles/2810318/can-i-get-usd-account-details | 2026-09-16 |
| Pakistan is not fully blocked from Wise | Wise Help Centre | https://wise.com/uk/help/articles/2978049/which-countries-can-i-use-wise-in | 2026-09-16 |
| Payoneer ↔ Pakistan/Meezan Bank withdrawal | Payoneer | https://www.payoneer.com/resources/payoneer-and-meezan-bank-transform-international-payment-withdrawals-in-pakistan-with-new-partnership/ | 2026-09-16 |
| Payoneer same-currency withdrawal fees, annual account fee | Payoneer Pricing | https://www.payoneer.com/about/pricing/ | 2026-09-16 |
| Payoneer cross-currency withdrawal "up to 2%" | Payoneer | https://www.payoneer.com/resources/how-to-use-payoneer/how-payoneer-calculates-withdrawal-fees/ | 2026-09-16 |

No blog, affiliate site, Reddit, Quora, YouTube, or generic fee-calculator site was used as evidence for any figure above.

## 3. Data model changes

- `types/financial.ts`: added `"variable"` to `FeeType`; added `maxPercentage` to `FeeScenario`; added `ProviderCapability`, `EligibilityStatus`, and `EligibilityRecord`.
- `data/providers/wise.ts` (new): eligibility records only, empty fee-scenario array.
- `data/providers/payoneer.ts` (new): eligibility + fee scenario records.
- `lib/calculations/providerFees.ts` (new): `evaluateProviderFee`, separate from the existing `calculateFeeAmount`.

**Untouched:** `lib/calculations/fees.ts`, `lib/calculations/fx.ts`, `lib/calculations/money.ts`, `data/providers/upwork.ts`, `data/fx/reference-rates.ts`, and every UI file.

## 4. What the future comparison tool can safely calculate

- Payoneer's fixed same-currency withdrawal fee.
- The *ceiling* on Payoneer's cross-currency (e.g. USD→PKR) withdrawal fee.
- Clear eligibility messaging distinguishing Wise (unresolved) from Payoneer (available).

## 5. What it cannot safely calculate

- An exact Payoneer cross-currency withdrawal fee.
- Payoneer's marketplace-receiving fee (unresolved).
- Any Wise-based receiving/withdrawal flow for Pakistan.
- A full "amount that lands in your bank account" figure.
- Anything about direct Pakistani bank wires.

---

**Note (post-Phase H.1 correction):** this document was later revised during a Phase H.1 correctness pass — see `PHASE_H_RESEARCH.md`'s eventual successor content embedded in the data layer's own comments (`data/providers/wise.ts`, `data/providers/payoneer.ts`), which now separate directly-verified facts from project-level conclusions more precisely than the original Phase H version did (e.g. Wise's marketplace-payout status is `"unresolved"`, not `"unavailable"`, and Payoneer's eligibility claims cite two separate sources rather than one over-cited source). Treat the data files themselves as the most current source of truth; this document reflects the original Phase H research pass.
