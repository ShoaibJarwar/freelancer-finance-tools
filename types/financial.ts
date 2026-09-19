/**
 * Core types for the financial data layer.
 *
 * Nothing in this file contains actual financial values — it only
 * defines the shape that verified data (in /data) must conform to.
 */

export type CurrencyCode = "USD" | "PKR" | "EUR" | "GBP" | "AED";

/**
 * How much a piece of financial data can be trusted:
 * - "verified": confirmed against an official, current source.
 * - "reference": a real value from an official source, but explicitly
 *   illustrative/point-in-time rather than a live or guaranteed figure
 *   (e.g. an FX reference rate).
 * - "estimated": a best-effort figure used only when no official source
 *   exists — must say so explicitly wherever it's shown.
 * - "deprecated": previously verified, since superseded; kept for
 *   historical/debugging reference, must not be used in new calculations.
 */
export type DataStatus = "verified" | "reference" | "estimated" | "deprecated";

export interface SourceInfo {
  /** Human-readable source name, e.g. "Upwork Help Center — Freelancer Service Fee". */
  name: string;
  url: string;
  /** ISO date this project last confirmed the value against the source, e.g. "2026-09-14". */
  verifiedAt: string;
  notes?: string;
}

export type FeeType = "percentage" | "fixed" | "tiered" | "variable" | "unknown";

export interface PercentageRange {
  /** Decimal fraction, e.g. 0 for 0%. */
  min: number;
  /** Decimal fraction, e.g. 0.15 for 15%. */
  max: number;
}

/**
 * A single fee rule for a specific provider and scenario. Deliberately
 * scenario-based rather than "the fee for Upwork" — the same provider can
 * have several scenarios with different rules (see /data/providers/upwork.ts).
 */
export interface FeeScenario {
  id: string;
  provider: string;
  /** Short human-readable name, e.g. "Marketplace contract (standard)". */
  name: string;
  description: string;
  feeType: FeeType;
  /** Set only when feeType is "percentage" and the rate is exact (not a range). Decimal fraction. */
  percentage?: number;
  /** Set only when feeType is "percentage" and the exact rate varies by contract. */
  percentageRange?: PercentageRange;
  /**
   * Set only when feeType is "variable": a published upper bound on a
   * market-rate-based fee (e.g. Payoneer's "up to 2%" cross-currency
   * withdrawal fee). This is NOT an exact or computed value — the actual
   * fee is quote-dependent and can only be lower than or equal to this.
   * Distinct from percentageRange, which represents an exact-but-
   * contract-specific rate someone can look up and enter.
   */
  maxPercentage?: number;
  /** Set only when feeType is "fixed". Amount in the currency's minor unit (e.g. cents). */
  fixedAmountMinorUnits?: number;
  currency?: CurrencyCode;
  status: DataStatus;
  source: SourceInfo;
  /** Plain-language conditions/caveats that must stay visible next to this scenario. */
  conditions?: string[];
}

/**
 * A specific capability a payment provider may or may not support for
 * someone in a given country. Deliberately granular — "available in
 * Pakistan" is not one fact, it's several (see Phase H research):
 * holding a balance, getting receiving account details, receiving
 * marketplace payouts, and withdrawing to a local bank are not the same
 * thing and can each have a different answer.
 */
export type ProviderCapability =
  | "holdBalance"
  | "receiveAccountDetails"
  | "receiveMarketplacePayouts"
  | "withdrawToLocalBank"
  | "registerAndSend";

export type EligibilityStatus = "available" | "unavailable" | "restricted" | "unresolved";

export interface EligibilityRecord {
  provider: string;
  /** Country name as stated in the source, e.g. "Pakistan". */
  country: string;
  capability: ProviderCapability;
  status: EligibilityStatus;
  /**
   * Plain-language explanation of the status. When this combines facts
   * from more than one source, phrase each part precisely enough that a
   * reader can tell which `sources` entry backs which sentence — never
   * let one source's citation imply it supports a broader claim than it
   * actually states.
   */
  statusDetail: string;
  /**
   * One or more sources. Plural because a single eligibility conclusion
   * sometimes rests on facts from different documents (e.g. "Payoneer
   * supports Upwork/Fiverr payouts" and "Payoneer supports Pakistan
   * withdrawal" are two separate official pages, not one).
   */
  sources: SourceInfo[];
}

/**
 * A reference exchange rate — explicitly NOT a live rate. See Phase A/E
 * decision: no live FX API in the MVP.
 */
export interface FxReferenceRate {
  id: string;
  base: CurrencyCode;
  quote: CurrencyCode;
  /** Units of `quote` per 1 unit of `base`. */
  rate: number;
  /** Always false in this phase — no live source is wired up. Kept explicit
   *  (rather than omitted) so a future live integration is a deliberate,
   *  visible change, not a silent one. */
  isLive: false;
  /** The date this rate applied to, per the source (may differ from verifiedAt). */
  asOf: string;
  status: DataStatus;
  source: SourceInfo;
  notes?: string;
}
