import type { FxReferenceRate } from "../../types/financial.ts";

export interface FxConversionResult {
  rateId: string;
  inputMinorUnits: number;
  outputMinorUnits: number;
  rate: number;
  /** Always true here — see FxReferenceRate.isLive. Carried through so the
   *  UI can never accidentally present this as a live conversion. */
  isReferenceOnly: true;
}

/**
 * Converts an amount using a stored reference rate. This is explicitly
 * NOT a live conversion — see /data/fx/reference-rates.ts. The result
 * should always be displayed alongside the rate's `asOf` date and source.
 */
export function convertUsingReferenceRate(
  inputMinorUnits: number,
  referenceRate: FxReferenceRate
): FxConversionResult {
  if (!Number.isFinite(inputMinorUnits) || inputMinorUnits < 0) {
    throw new Error("Input amount must be a non-negative finite number of minor units");
  }

  if (!Number.isFinite(referenceRate.rate) || referenceRate.rate <= 0) {
    throw new Error(`Reference rate "${referenceRate.id}" has an invalid rate`);
  }

  return {
    rateId: referenceRate.id,
    inputMinorUnits,
    outputMinorUnits: Math.round(inputMinorUnits * referenceRate.rate),
    rate: referenceRate.rate,
    isReferenceOnly: true,
  };
}
