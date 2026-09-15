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

export type FeeType = "percentage" | "fixed" | "tiered" | "unknown";

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
  /** Set only when feeType is "fixed". Amount in the currency's minor unit (e.g. cents). */
  fixedAmountMinorUnits?: number;
  currency?: CurrencyCode;
  status: DataStatus;
  source: SourceInfo;
  /** Plain-language conditions/caveats that must stay visible next to this scenario. */
  conditions?: string[];
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
