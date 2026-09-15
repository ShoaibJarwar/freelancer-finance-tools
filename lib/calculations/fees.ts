import type { FeeScenario } from "../../types/financial.ts";
import { applyPercentage } from "./money.ts";

export interface FeeCalculationResult {
  scenarioId: string;
  grossMinorUnits: number;
  feeMinorUnits: number;
  netMinorUnits: number;
  /** The exact percentage actually applied (decimal fraction), for display/audit. */
  appliedPercentage: number;
}

export interface CalculateFeeOptions {
  /**
   * Required when the scenario only defines a `percentageRange` (e.g.
   * Upwork's 0%–15% marketplace fee) rather than one exact `percentage`.
   * Upwork sets the real rate per contract — this project cannot assume
   * one, so the caller (eventually the calculator UI, using the value the
   * person enters from their own contract) must supply it explicitly.
   */
  selectedPercentage?: number;
}

/**
 * Calculates the fee and net amount for a given gross amount under a
 * specific, verified fee scenario. Deterministic and side-effect free.
 *
 * Currently only supports feeType "percentage" — "fixed", "tiered", and
 * "unknown" scenarios will throw, since no verified data of those types
 * exists yet to validate the logic against (see Phase E report).
 */
export function calculateFeeAmount(
  grossMinorUnits: number,
  scenario: FeeScenario,
  options: CalculateFeeOptions = {}
): FeeCalculationResult {
  if (!Number.isFinite(grossMinorUnits) || grossMinorUnits < 0) {
    throw new Error("Gross amount must be a non-negative finite number of minor units");
  }

  if (scenario.feeType !== "percentage") {
    throw new Error(
      `calculateFeeAmount only supports "percentage" fee scenarios so far (scenario "${scenario.id}" is "${scenario.feeType}")`
    );
  }

  const appliedPercentage = resolvePercentage(scenario, options.selectedPercentage);
  const feeMinorUnits = applyPercentage(grossMinorUnits, appliedPercentage);
  const netMinorUnits = grossMinorUnits - feeMinorUnits;

  return {
    scenarioId: scenario.id,
    grossMinorUnits,
    feeMinorUnits,
    netMinorUnits,
    appliedPercentage,
  };
}

function resolvePercentage(scenario: FeeScenario, selected: number | undefined): number {
  if (scenario.percentage !== undefined) {
    return scenario.percentage;
  }

  if (scenario.percentageRange) {
    const { min, max } = scenario.percentageRange;

    if (selected === undefined) {
      throw new Error(
        `Scenario "${scenario.id}" only defines a fee range (${min * 100}%–${max * 100}%), not one exact rate. ` +
          `Pass "selectedPercentage" — the exact rate depends on the specific contract and cannot be assumed.`
      );
    }

    if (selected < min || selected > max) {
      throw new Error(
        `selectedPercentage (${selected}) is outside scenario "${scenario.id}"'s valid range (${min}–${max}).`
      );
    }

    return selected;
  }

  throw new Error(`Scenario "${scenario.id}" has neither "percentage" nor "percentageRange" set.`);
}
