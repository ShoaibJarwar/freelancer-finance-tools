import type { FxReferenceRate } from "../../types/financial.ts";

/**
 * Reference exchange rates only — NOT live rates. Per the Phase A/E
 * decision, this project does not integrate a live FX API in the MVP.
 * Every entry here is a specific, dated snapshot from an official source,
 * and must always be displayed with its `asOf` date and a "reference,
 * not guaranteed" caveat — never as a current/live rate.
 *
 * Only USD → PKR is populated for this phase, since it's the only pair
 * this project has verified against an official source so far. EUR, GBP,
 * and AED reference rates are intentionally left unpopulated rather than
 * estimated — add them here, sourced the same way, when needed.
 */
export const fxReferenceRates: FxReferenceRate[] = [
  {
    id: "usd-pkr-sbp-reference",
    base: "USD",
    quote: "PKR",
    rate: 277.3228,
    isLive: false,
    asOf: "2026-09-11",
    status: "reference",
    source: {
      name: "State Bank of Pakistan — USD/PKR Rates (M2M Revaluation Rate)",
      url: "https://www.sbp.org.pk/ecodata/rates/m2m/m2m-current.asp",
      verifiedAt: "2026-09-14",
      notes:
        "SBP also publishes a weighted-average bid/offer pair (277.0427 / 277.4678 as of the same date) that may be more relevant for a specific transaction. This entry uses the single M2M revaluation rate as the reference point. Actual bank, exchange-company, and payment-provider rates will differ from all of these — this is a reference/illustrative value only, not a live or guaranteed settlement rate.",
    },
  },
];
