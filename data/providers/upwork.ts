import type { FeeScenario, SourceInfo } from "../../types/financial.ts";

const FREELANCER_SERVICE_FEE_SOURCE: SourceInfo = {
  name: "Upwork Help Center — Freelancer Service Fee",
  url: "https://support.upwork.com/hc/en-us/articles/211062538-Freelancer-Service-Fee",
  verifiedAt: "2026-09-14",
  notes:
    "Confirmed directly on support.upwork.com. Replaces Upwork's older fixed 10%/tiered lifetime-billing model, which this project does not use.",
};

const DIRECT_CONTRACTS_SOURCE: SourceInfo = {
  name: "Upwork Help Center — Direct Contracts (bring a client to Upwork)",
  url: "https://support.upwork.com/hc/en-us/articles/360025040794-Direct-Contracts-bring-a-client-to-Upwork",
  verifiedAt: "2026-09-14",
};

/**
 * Verified, MVP-scoped Upwork freelancer service fee scenarios.
 *
 * Deliberately NOT exhaustive — Upwork Payroll, Any Hire, Enterprise, and
 * Freelancer Plus's own discount rules are noted as conditions where they
 * affect a scenario below, but are not modeled as separate scenarios here.
 * There is no single "Upwork takes X%" figure; each scenario below is the
 * only kind of value this project will calculate with.
 */
export const upworkFeeScenarios: FeeScenario[] = [
  {
    id: "upwork-marketplace-standard",
    provider: "Upwork",
    name: "Marketplace contract (standard)",
    description:
      "A standard hourly, fixed-price, or Project Catalog contract (including consultations) found through the Upwork marketplace.",
    feeType: "percentage",
    percentageRange: { min: 0, max: 0.15 },
    currency: "USD",
    status: "verified",
    source: FREELANCER_SERVICE_FEE_SOURCE,
    conditions: [
      "The exact rate within this 0%–15% range is set per contract, based on factors like supply and demand, and is shown before you submit a proposal or accept an offer.",
      "Once the contract begins, the rate is fixed for its lifetime.",
      "This project cannot know your specific contract's rate — it must be entered by the person using the calculator, not assumed.",
      "Upwork Payroll, Any Hire, and Enterprise contracts use different fee structures not covered by this scenario.",
    ],
  },
  {
    id: "upwork-direct-contracts",
    provider: "Upwork",
    name: "Direct Contracts",
    description:
      "A contract started through Upwork's Direct Contracts flow, for a client the freelancer brings to the platform themselves.",
    feeType: "percentage",
    percentage: 0.05,
    currency: "USD",
    status: "verified",
    source: DIRECT_CONTRACTS_SOURCE,
    conditions: [
      "Flat 5% freelancer service fee on the contract's earnings.",
      "Does not apply if the freelancer has an active Freelancer Plus subscription — see the separate Direct Contracts (Freelancer Plus) scenario.",
    ],
  },
  {
    id: "upwork-direct-contracts-freelancer-plus",
    provider: "Upwork",
    name: "Direct Contracts (Freelancer Plus)",
    description:
      "A Direct Contracts contract for a freelancer with an active Freelancer Plus subscription.",
    feeType: "percentage",
    percentage: 0,
    currency: "USD",
    status: "verified",
    source: DIRECT_CONTRACTS_SOURCE,
    conditions: [
      "0% freelancer service fee, in place of the standard 5% Direct Contracts rate, for the duration the Freelancer Plus subscription is active.",
    ],
  },
];
