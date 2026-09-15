import type { FeeScenario, FxReferenceRate } from "../../types/financial.ts";
import { calculateFeeAmount, type FeeCalculationResult } from "./fees.ts";
import { convertUsingReferenceRate, type FxConversionResult } from "./fx.ts";
import { toMinorUnits } from "./money.ts";

export interface CalculatorInput {
  /** Gross client payment as a decimal amount, e.g. 500 for $500.00. Always USD — see Phase F report. */
  grossAmount: number;
  scenario: FeeScenario;
  /** Required only when `scenario.percentageRange` is set (not one exact `percentage`). Decimal fraction. */
  selectedPercentage?: number;
  /** When provided, the amount after the platform fee is also converted using this reference rate. */
  referenceRate?: FxReferenceRate;
}

export interface CalculatorResult {
  fee: FeeCalculationResult;
  conversion?: FxConversionResult;
}

/**
 * The single entry point the calculator UI calls. Converts the user's
 * decimal input into minor units, applies the selected verified fee
 * scenario, and optionally layers a reference-rate conversion on top of
 * the resulting amount. Throws on invalid input/scenario combinations —
 * the UI is expected to validate (see validation.ts) before calling this.
 */
export function calculateCalculatorResult(input: CalculatorInput): CalculatorResult {
  const grossMinorUnits = toMinorUnits(input.grossAmount);

  const fee = calculateFeeAmount(grossMinorUnits, input.scenario, {
    selectedPercentage: input.selectedPercentage,
  });

  if (!input.referenceRate) {
    return { fee };
  }

  const conversion = convertUsingReferenceRate(fee.netMinorUnits, input.referenceRate);

  return { fee, conversion };
}
