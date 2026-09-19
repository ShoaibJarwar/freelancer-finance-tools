import type { EligibilityRecord, FeeScenario, SourceInfo } from "../../types/financial.ts";

const MARKETPLACE_PARTNER_SOURCE: SourceInfo = {
  name: "Payoneer — Payment Solution for Freelancers",
  url: "https://www.payoneer.com/freelancer/",
  verifiedAt: "2026-09-16",
  notes:
    'States: "Payoneer is recommended by Upwork, Fiverr, Toptal, and many other freelance marketplaces." This establishes the Upwork/Fiverr marketplace-partnership fact specifically — it does not itself confirm Pakistan availability; see the Meezan source for that.',
};

const MEEZAN_PARTNERSHIP_SOURCE: SourceInfo = {
  name: "Payoneer — Payoneer and Meezan Bank Transform International Payment Withdrawals in Pakistan",
  url: "https://www.payoneer.com/resources/payoneer-and-meezan-bank-transform-international-payment-withdrawals-in-pakistan-with-new-partnership/",
  verifiedAt: "2026-09-16",
  notes:
    "Confirms Payoneer supports multi-currency receiving accounts for Pakistan-based freelancers/businesses and direct withdrawal to Pakistani bank accounts (naming Meezan Bank specifically as a partner). This establishes Pakistan availability specifically — it does not itself confirm the Upwork/Fiverr marketplace partnership; see the freelancer-page source for that.",
};

const PRICING_SOURCE: SourceInfo = {
  name: "Payoneer — Pricing",
  url: "https://www.payoneer.com/about/pricing/",
  verifiedAt: "2026-09-16",
  notes:
    "Payoneer's current official pricing page. States that the figures shown are an estimation for the most common account types/regions, and that the exact fee for a given account/territory is shown inside a logged-in account. Directly lists three parallel same-currency fixed fees: \"1.50 USD / USD to USD withdrawal\", \"1.50 EUR / EUR to EUR withdrawal\", \"1.50 GBP / GBP to GBP withdrawal\" — each an amount in its own currency, not one USD figure applied across all three. Also directly states the >50,000/month tier switches to \"0.5% of total withdrawal amount\" for each of USD, EUR, and GBP, and states the annual account fee (29.95 USD, waived above ~2,000 USD received per 12 months).",
};

const WITHDRAWAL_MECHANICS_SOURCE: SourceInfo = {
  name: "Payoneer — How Payoneer Calculates Withdrawal Fees",
  url: "https://www.payoneer.com/resources/how-to-use-payoneer/how-payoneer-calculates-withdrawal-fees/",
  verifiedAt: "2026-09-16",
  notes:
    "Official Payoneer resource article explaining withdrawal-fee mechanics using a worked example (a freelancer in the Philippines withdrawing USD to a local PHP bank account) that is structurally the same case as a Pakistan-based freelancer withdrawing USD to a PKR bank account.",
};

/**
 * Phase H.1 correction: each claim below is backed only by the specific
 * source(s) that actually establish it — the Upwork/Fiverr partnership
 * fact and the Pakistan-availability fact came from two different official
 * pages and are no longer conflated under a single citation.
 */
export const payoneerEligibility: EligibilityRecord[] = [
  {
    provider: "Payoneer",
    country: "Pakistan",
    capability: "receiveMarketplacePayouts",
    status: "available",
    statusDetail:
      "Payoneer is an official payout partner for Upwork and Fiverr (per Payoneer's own freelancer page, which names both platforms directly) and is separately confirmed as usable by Pakistan-based freelancers, including local bank withdrawal (per the Meezan Bank partnership announcement, which is Pakistan-specific).",
    sources: [MARKETPLACE_PARTNER_SOURCE, MEEZAN_PARTNERSHIP_SOURCE],
  },
  {
    provider: "Payoneer",
    country: "Pakistan",
    capability: "withdrawToLocalBank",
    status: "available",
    statusDetail:
      "Payoneer supports withdrawal directly to Pakistani bank accounts in PKR, including a named partnership with Meezan Bank; other major Pakistani banks (HBL, UBL, MCB, Bank Alfalah) are also referenced in this same Payoneer resource as supported.",
    sources: [MEEZAN_PARTNERSHIP_SOURCE],
  },
];

export const payoneerFeeScenarios: FeeScenario[] = [
  {
    id: "payoneer-withdrawal-usd-same-currency",
    provider: "Payoneer",
    name: "Withdrawal: USD balance to a USD bank account (standard volume)",
    description:
      "Withdrawing a USD balance to a bank account in USD, where the bank is in a country where USD is the official currency and matches the account holder's registered country.",
    feeType: "fixed",
    fixedAmountMinorUnits: 150,
    currency: "USD",
    status: "verified",
    source: PRICING_SOURCE,
    conditions: [
      "This record models only the verified fixed-fee tier (monthly withdrawal+payment volume up to 50,000 USD). Above that threshold, Payoneer's official pricing page states the fee switches to 0.5% of the total instead — that higher-volume tier is documented here but is NOT currently calculable by this data layer (no scenario models it).",
      "NOT applicable to a Pakistan-based freelancer withdrawing to a PKR bank account — Pakistan's official currency is PKR, not USD. Included for completeness of Payoneer's fee structure, not because it applies to this project's primary use case.",
      "Also requires the receiving bank's country to match the account holder's own registered country.",
    ],
  },
  {
    id: "payoneer-withdrawal-eur-same-currency",
    provider: "Payoneer",
    name: "Withdrawal: EUR balance to a EUR bank account (standard volume)",
    description:
      "Withdrawing a EUR balance to a bank account in EUR, where the bank is in a Eurozone country and matches the account holder's registered country.",
    feeType: "fixed",
    fixedAmountMinorUnits: 150,
    currency: "EUR",
    status: "verified",
    source: PRICING_SOURCE,
    conditions: [
      "This record models only the verified fixed-fee tier (monthly withdrawal+payment volume up to 50,000 EUR). Above that threshold, the fee switches to 0.5% of the total — documented but not currently calculable by this data layer.",
      "NOT applicable to a Pakistan-based freelancer withdrawing to a PKR bank account. Included for completeness of Payoneer's fee structure.",
      "Also requires the receiving bank's country to match the account holder's own registered country.",
    ],
  },
  {
    id: "payoneer-withdrawal-gbp-same-currency",
    provider: "Payoneer",
    name: "Withdrawal: GBP balance to a GBP bank account (standard volume)",
    description:
      "Withdrawing a GBP balance to a bank account in GBP, where the bank is in the UK and matches the account holder's registered country.",
    feeType: "fixed",
    fixedAmountMinorUnits: 150,
    currency: "GBP",
    status: "verified",
    source: PRICING_SOURCE,
    conditions: [
      "This record models only the verified fixed-fee tier (monthly withdrawal+payment volume up to 50,000 GBP). Above that threshold, the fee switches to 0.5% of the total — documented but not currently calculable by this data layer.",
      "NOT applicable to a Pakistan-based freelancer withdrawing to a PKR bank account. Included for completeness of Payoneer's fee structure.",
      "Also requires the receiving bank's country to match the account holder's own registered country.",
    ],
  },
  {
    id: "payoneer-withdrawal-cross-currency-variable",
    provider: "Payoneer",
    name: "Withdrawal to a bank account in a different currency (e.g. USD balance to a PKR bank account)",
    description:
      "Withdrawing a balance to a local bank account in a different currency — the applicable scenario for a Pakistan-based freelancer withdrawing USD marketplace earnings to a PKR bank account.",
    feeType: "variable",
    maxPercentage: 0.02,
    currency: "USD",
    status: "verified",
    source: WITHDRAWAL_MECHANICS_SOURCE,
    conditions: [
      'Payoneer\'s official resource article states this fee is "up to 2%", built into the conversion rate given rather than itemized as a separate line item.',
      "The exact rate applied is account- and territory-specific and is shown inside a logged-in Payoneer account before confirming a withdrawal — Payoneer's current public pricing page does not publish one static percentage for this specific route, only the general mechanics article does, with the up-to-2% ceiling.",
      "This is Payoneer's own currency conversion, separate from and not to be confused with any reference exchange rate this project publishes elsewhere (e.g. the SBP USD/PKR reference rate).",
    ],
  },
];

/**
 * Explicitly NOT modeled as a FeeScenario, and recorded here as a plain
 * comment rather than fabricated data: Payoneer's fee for receiving a
 * marketplace payout itself (as opposed to withdrawing it to a bank) is
 * commonly cited as "1%" by third-party sites, but this project could not
 * independently confirm that figure on an official payoneer.com page in
 * this research pass. Per the project's verification standard, it is left
 * unresolved rather than added on the strength of third-party agreement.
 * See PHASE_H_RESEARCH.md.
 *
 * Also not modeled: Payoneer's $29.95 annual account fee (waived once
 * ~$2,000 is received in a 12-month period) — this IS verified directly
 * from the official pricing page, but it's a periodic/inactivity-based
 * charge, not a per-transaction fee, so it doesn't fit this file's
 * FeeScenario shape (which the calculation layer applies to a single
 * transaction amount). Recorded in PHASE_H_RESEARCH.md instead of being
 * forced into a structure that would misrepresent how it actually works.
 */
