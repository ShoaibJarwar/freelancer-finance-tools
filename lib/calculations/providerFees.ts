import type { FeeScenario } from "../../types/financial.ts";
import { applyPercentage } from "./money.ts";

/**
 * A provider fee that could be resolved to an exact minor-unit amount.
 */
export interface CalculableFeeResult {
  calculable: true;
  scenarioId: string;
  grossMinorUnits: number;
  feeMinorUnits: number;
  netMinorUnits: number;
  /** Decimal fraction, when the fee was percentage-based. */
  appliedPercentage?: number;
}

/**
 * A provider fee that is genuinely quote-dependent/variable and cannot be
 * resolved to one static number from this project's data. This is a
 * first-class result, not an error — callers (a future comparison UI)
 * must handle it explicitly rather than something silently coercing it
 * into a fake precise figure.
 */
export interface NotCalculableFeeResult {
  calculable: false;
  scenarioId: string;
  reason: string;
  /** The published ceiling, if the source states one (decimal fraction). Not a computed value. */
  maxPercentage?: number;
}

export type ProviderFeeResult = CalculableFeeResult | NotCalculableFeeResult;

export interface EvaluateProviderFeeOptions {
  /** Required for a "percentage" scenario that has no single exact `percentage` set. */
  selectedPercentage?: number;
  /**
   * A scenario with status "estimated" is refused by default — estimated
   * financial values must never be used in an active calculation without
   * this explicit, separately-considered opt-in. There is no equivalent
   * flag for "deprecated": those are always refused, with no override.
   */
  allowEstimated?: boolean;
}

/**
 * Evaluates a provider fee scenario against a gross amount. Unlike
 * calculateFeeAmount (which only ever handles Upwork's exact-or-ranged
 * percentage scenarios and throws on anything else), this function is
 * built to handle the messier shapes real payment-provider fees take —
 * including fees this project knows are real but cannot pin to one
 * number. It never invents a number to fill a gap: a "variable" scenario
 * always returns `calculable: false`, with the published ceiling if one
 * exists, rather than guessing or averaging.
 */
export function evaluateProviderFee(
  grossMinorUnits: number,
  scenario: FeeScenario,
  options: EvaluateProviderFeeOptions = {}
): ProviderFeeResult {
  if (!Number.isFinite(grossMinorUnits) || grossMinorUnits < 0) {
    throw new Error("Gross amount must be a non-negative finite number of minor units");
  }

  switch (scenario.feeType) {
    case "percentage": {
      assertScenarioUsable(scenario, options);

      let percentage: number;

      if (scenario.percentage !== undefined) {
        percentage = scenario.percentage;
      } else if (scenario.percentageRange) {
        const { min, max } = scenario.percentageRange;
        const selected = options.selectedPercentage;

        if (selected === undefined) {
          throw new Error(
            `Scenario "${scenario.id}" only defines a fee range (${min * 100}%–${max * 100}%), not one exact rate. ` +
              `Pass "selectedPercentage" — the exact rate depends on the specific contract/quote and cannot be assumed.`
          );
        }
        if (!Number.isFinite(selected)) {
          throw new Error(`Scenario "${scenario.id}": selectedPercentage must be a finite number.`);
        }
        if (selected < 0) {
          throw new Error(`Scenario "${scenario.id}": selectedPercentage cannot be negative.`);
        }
        if (selected < min || selected > max) {
          throw new Error(
            `Scenario "${scenario.id}": selectedPercentage (${selected}) is outside the documented range (${min}–${max}). ` +
              `This is enforced here, not left to the caller.`
          );
        }
        percentage = selected;
      } else {
        throw new Error(`Scenario "${scenario.id}" has neither "percentage" nor "percentageRange" set.`);
      }

      const feeMinorUnits = applyPercentage(grossMinorUnits, percentage);
      return {
        calculable: true,
        scenarioId: scenario.id,
        grossMinorUnits,
        feeMinorUnits,
        netMinorUnits: grossMinorUnits - feeMinorUnits,
        appliedPercentage: percentage,
      };
    }

    case "fixed": {
      assertScenarioUsable(scenario, options);

      if (scenario.fixedAmountMinorUnits === undefined) {
        throw new Error(`Scenario "${scenario.id}" is "fixed" but has no fixedAmountMinorUnits set.`);
      }
      if (scenario.fixedAmountMinorUnits < 0) {
        throw new Error(`Scenario "${scenario.id}" has a negative fixedAmountMinorUnits.`);
      }
      const feeMinorUnits = scenario.fixedAmountMinorUnits;
      if (feeMinorUnits > grossMinorUnits) {
        throw new Error(
          `Scenario "${scenario.id}"'s fixed fee (${feeMinorUnits}) exceeds the gross amount (${grossMinorUnits}).`
        );
      }
      return {
        calculable: true,
        scenarioId: scenario.id,
        grossMinorUnits,
        feeMinorUnits,
        netMinorUnits: grossMinorUnits - feeMinorUnits,
      };
    }

    case "variable":
      return {
        calculable: false,
        scenarioId: scenario.id,
        reason:
          "This fee depends on the specific quote (currency pair, amount, and account/territory terms) and is not published as one static figure — it cannot be safely calculated from static data.",
        maxPercentage: scenario.maxPercentage,
      };

    case "tiered":
    case "unknown":
      return {
        calculable: false,
        scenarioId: scenario.id,
        reason: `This scenario's fee type ("${scenario.feeType}") is not yet modeled by this calculation layer.`,
      };

    default: {
      // Exhaustiveness guard: if FeeType ever gains a member without a
      // matching case above, this fails to compile rather than silently
      // falling through.
      const exhaustive: never = scenario.feeType;
      throw new Error(`Unhandled fee type: ${exhaustive}`);
    }
  }
}

/**
 * Guards the two branches that would otherwise produce a calculable
 * result ("percentage", "fixed") against being fed unverified data
 * silently. "variable"/"tiered"/"unknown" don't need this guard — they
 * already always return `calculable: false` regardless of status.
 */
function assertScenarioUsable(scenario: FeeScenario, options: EvaluateProviderFeeOptions): void {
  if (scenario.status === "deprecated") {
    throw new Error(
      `Scenario "${scenario.id}" is deprecated and must not be used in an active calculation.`
    );
  }
  if (scenario.status === "estimated" && !options.allowEstimated) {
    throw new Error(
      `Scenario "${scenario.id}" is only an estimate, not verified/reference data. ` +
        `Pass { allowEstimated: true } to use it explicitly, or use a verified/reference-status scenario instead.`
    );
  }
}
