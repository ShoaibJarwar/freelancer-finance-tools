import type { EligibilityRecord, FeeScenario, SourceInfo } from "../../types/financial.ts";

const HOLD_BALANCE_SOURCE: SourceInfo = {
  name: "Wise Help Centre — Where do I need to live to hold money with Wise?",
  url: "https://wise.com/help/articles/2813542/where-do-i-need-to-live-to-hold-money-with-wise",
  verifiedAt: "2026-09-16",
  notes:
    "Lists the countries/territories where a resident can hold a Wise balance. Pakistan does not appear in this list.",
};

const USD_ACCOUNT_DETAILS_SOURCE: SourceInfo = {
  name: "Wise Help Centre — Can I get USD account details?",
  url: "https://wise.com/help/articles/2810318/can-i-get-usd-account-details",
  verifiedAt: "2026-09-16",
  notes: "Explicitly lists Pakistan among the countries where USD account details are unavailable.",
};

const SUPPORTED_COUNTRIES_SOURCE: SourceInfo = {
  name: "Wise Help Centre — Where can I use Wise?",
  url: "https://wise.com/uk/help/articles/2978049/which-countries-can-i-use-wise-in",
  verifiedAt: "2026-09-16",
  notes:
    "Lists the countries where Wise is fully unsupported (no registration, login, sending, or receiving at all). Pakistan is not on this fully-blocked list.",
};

/**
 * Wise eligibility for Pakistan.
 *
 * IMPORTANT distinction (Phase H.1 correction): the first two records
 * below are DIRECTLY stated by Wise's own Help Centre. The third record
 * (`receiveMarketplacePayouts`) is NOT something Wise's documentation
 * states directly — Wise has no page saying "Upwork/Fiverr payouts are
 * unavailable in Pakistan." It is this project's own conclusion, drawn
 * by combining the two directly-verified facts. It's marked "unresolved"
 * rather than "unavailable" for exactly this reason: the project is
 * confident it cannot currently model this flow, but is not claiming
 * Wise itself has ruled it out.
 */
export const wiseEligibility: EligibilityRecord[] = [
  {
    provider: "Wise",
    country: "Pakistan",
    capability: "holdBalance",
    status: "unavailable",
    statusDetail:
      "Directly stated by Wise: Pakistan is not among the countries/territories listed as places a Wise account can hold a balance.",
    sources: [HOLD_BALANCE_SOURCE],
  },
  {
    provider: "Wise",
    country: "Pakistan",
    capability: "receiveAccountDetails",
    status: "unavailable",
    statusDetail:
      "Directly stated by Wise: its Help Centre explicitly lists Pakistan among the countries where USD account details (the local-style bank details needed to receive money directly) cannot be obtained.",
    sources: [USD_ACCOUNT_DETAILS_SOURCE],
  },
  {
    provider: "Wise",
    country: "Pakistan",
    capability: "receiveMarketplacePayouts",
    status: "unresolved",
    statusDetail:
      "Project-level conclusion, not a direct Wise statement: Wise does not publish anything specifically about Upwork/Fiverr marketplace payout compatibility. Given that a Pakistan resident cannot hold a balance or obtain receiving account details (the two directly-verified facts above), this project cannot see how a Wise account could be set up as a marketplace payout destination — but this is this project's inference, not a claim Wise itself makes, so it is marked unresolved rather than a sourced 'unavailable'.",
    sources: [HOLD_BALANCE_SOURCE, USD_ACCOUNT_DETAILS_SOURCE],
  },
  {
    provider: "Wise",
    country: "Pakistan",
    capability: "registerAndSend",
    status: "available",
    statusDetail:
      "Directly stated by Wise: Pakistan is not on Wise's list of fully-unsupported countries/regions (where registration, login, and all use is blocked). A Wise account can be registered from Pakistan, and Wise can send money directly to a Pakistani bank account on someone else's behalf — a different product from a freelancer-controlled receiving account.",
    sources: [SUPPORTED_COUNTRIES_SOURCE],
  },
];

/**
 * Deliberately empty. Because Wise cannot serve as a freelancer-controlled
 * receiving/withdrawal method for a Pakistan-based freelancer (see
 * eligibility above), no fee scenario is populated for that use case —
 * there's nothing to price. Wise's separate "send money to Pakistan"
 * product (a sender-initiated transfer, not a freelancer's own receiving
 * account) is a different transaction type, out of scope for a
 * platform-withdrawal comparison tool, and is not modeled here. See
 * PHASE_H_RESEARCH.md for the full reasoning.
 */
export const wiseFeeScenarios: FeeScenario[] = [];
