import type {
  CurrencyCode,
  EligibilityRecord,
  FeeScenario,
  FxReferenceRate,
  SourceInfo,
} from "../../types/financial.ts";
import { calculateFeeAmount, type CalculateFeeOptions } from "./fees.ts";
import { evaluateProviderFee, type EvaluateProviderFeeOptions } from "./providerFees.ts";
import { convertUsingReferenceRate } from "./fx.ts";

/**
 * How certain a calculated (or not-calculated) value is. This is the
 * central vocabulary of the orchestration layer — every stage and every
 * composed transaction carries one of these instead of a vague boolean
 * like `isAccurate`.
 *
 * - "exact": a precise figure from verified/reference-status data with no
 *   remaining uncertainty at this stage.
 * - "reference": a real, computed figure, but explicitly non-final — e.g.
 *   built on a reference FX rate rather than a live/guaranteed one.
 * - "ceiling": no exact figure exists; the source publishes only an upper
 *   bound (e.g. Payoneer's "up to 2%"). Never an applied/computed value.
 * - "not_calculable": the fee/step is known to exist but this project's
 *   data cannot resolve it to any number or bound.
 * - "unresolved": whether this step even applies is itself undetermined
 *   (an eligibility/capability question, not a math question).
 *
 * "ceiling" is a STAGE-level status only. Composed across multiple
 * stages, it collapses into "not_calculable" — see combineStatus below —
 * because this engine does not do range/interval arithmetic to produce a
 * compound bound across steps.
 */
export type CalculationStatus = "exact" | "reference" | "ceiling" | "not_calculable" | "unresolved";

const STATUS_SEVERITY: Record<CalculationStatus, number> = {
  exact: 0,
  reference: 1,
  ceiling: 2,
  not_calculable: 3,
  unresolved: 4,
};

/**
 * Combines two statuses into the status of their composition (e.g. "this
 * stage's status" + "the next stage's status" -> "the status so far").
 * Deliberately conservative: the result is never more certain than either
 * input, and a "ceiling" involved in a composition becomes
 * "not_calculable" for the composed result, because bounding a multi-step
 * total from one step's bound would require range arithmetic this engine
 * doesn't implement — see PHASE_I_DESIGN.md.
 */
export function combineStatus(a: CalculationStatus, b: CalculationStatus): CalculationStatus {
  const worse = STATUS_SEVERITY[a] >= STATUS_SEVERITY[b] ? a : b;
  return worse === "ceiling" ? "not_calculable" : worse;
}

export type TransactionStageKind = "platformFee" | "providerFee" | "referenceConversion";

/**
 * One step in a transaction pipeline. Every field that could imply an
 * actual monetary result (`feeMinorUnits`, `appliedPercentage`,
 * `resultAmountMinorUnits`) is only populated when `status` is "exact" or
 * "reference" — never for "ceiling"/"not_calculable"/"unresolved". This
 * is enforced by the builder functions below, not by the type system
 * alone, and re-checked by tests.
 */
export interface CalculationStage {
  kind: TransactionStageKind;
  /** Human-readable name of the rule applied, e.g. a FeeScenario's `name`. */
  label: string;
  status: CalculationStatus;
  inputAmountMinorUnits: number;
  inputCurrency: CurrencyCode;
  /** The fee actually deducted at this stage. Only set when status is "exact". */
  feeMinorUnits?: number;
  /** The percentage actually applied (decimal fraction). Only set when status is "exact" and the fee was percentage-based. */
  appliedPercentage?: number;
  /** A published ceiling on the fee (decimal fraction). Only set when status is "ceiling" — never an applied value. */
  maxPercentage?: number;
  /** The reference rate used, for a referenceConversion stage. */
  referenceRateApplied?: number;
  /** The amount after this stage. Only set when status is "exact" or "reference". */
  resultAmountMinorUnits?: number;
  resultCurrency?: CurrencyCode;
  /** Plain-language description of what this stage did, or why it couldn't produce a number. */
  explanation: string;
  sources: SourceInfo[];
}

/**
 * The composed result of a full (or partial) transaction pipeline.
 * `finalAmountMinorUnits` is only ever populated when `status` is "exact"
 * or "reference" — this is the main guardrail against a future UI
 * accidentally presenting a partial/uncertain calculation as a final
 * payout figure.
 */
export interface TransactionCalculation {
  status: CalculationStatus;
  inputAmountMinorUnits: number;
  inputCurrency: CurrencyCode;
  stages: CalculationStage[];
  /** Only set when status is "exact" or "reference". Never set for ceiling/not_calculable/unresolved. */
  finalAmountMinorUnits?: number;
  finalCurrency?: CurrencyCode;
  /** Plain-language notes on what wasn't included or couldn't be resolved, one per non-exact stage (or per blocking eligibility issue). */
  limitations: string[];
}

/**
 * Builds the platform-fee stage, reusing calculateFeeAmount (Upwork)
 * as-is. Upwork scenarios in this project are always percentage-based and
 * either exact or a validated contract-specific rate, so this stage's
 * status is always "exact" once calculateFeeAmount succeeds — it throws
 * (does not return a stage) for genuinely invalid input, exactly as
 * calculateFeeAmount already does. This function adds no new financial
 * rules; it only reshapes calculateFeeAmount's result into the pipeline's
 * stage format.
 */
export function buildPlatformFeeStage(
  inputAmountMinorUnits: number,
  inputCurrency: CurrencyCode,
  scenario: FeeScenario,
  options: CalculateFeeOptions = {}
): CalculationStage {
  const result = calculateFeeAmount(inputAmountMinorUnits, scenario, options);

  return {
    kind: "platformFee",
    label: `${scenario.provider} — ${scenario.name}`,
    status: "exact",
    inputAmountMinorUnits,
    inputCurrency,
    feeMinorUnits: result.feeMinorUnits,
    appliedPercentage: result.appliedPercentage,
    resultAmountMinorUnits: result.netMinorUnits,
    resultCurrency: inputCurrency,
    explanation: `Applied ${scenario.provider}'s "${scenario.name}" service fee to the input amount.`,
    sources: [scenario.source],
  };
}

/**
 * Builds the provider-fee stage, reusing evaluateProviderFee as-is. Unlike
 * the platform-fee stage, this one can legitimately come back
 * "ceiling" (a variable fee with a published upper bound, e.g. Payoneer's
 * Pakistan cross-currency withdrawal) or "not_calculable" (no bound
 * published either). In both cases, no fee/result amount is set — the
 * caller gets an explanation and, for "ceiling", the bound, never a
 * number presented as the actual fee.
 */
export function buildProviderFeeStage(
  inputAmountMinorUnits: number,
  inputCurrency: CurrencyCode,
  scenario: FeeScenario,
  options: EvaluateProviderFeeOptions = {}
): CalculationStage {
  const result = evaluateProviderFee(inputAmountMinorUnits, scenario, options);
  const label = `${scenario.provider} — ${scenario.name}`;

  if (result.calculable) {
    return {
      kind: "providerFee",
      label,
      status: "exact",
      inputAmountMinorUnits,
      inputCurrency,
      feeMinorUnits: result.feeMinorUnits,
      appliedPercentage: result.appliedPercentage,
      resultAmountMinorUnits: result.netMinorUnits,
      resultCurrency: inputCurrency,
      explanation: `Applied ${scenario.provider}'s "${scenario.name}" fee to the input amount.`,
      sources: [scenario.source],
    };
  }

  const hasCeiling = result.maxPercentage !== undefined;
  return {
    kind: "providerFee",
    label,
    status: hasCeiling ? "ceiling" : "not_calculable",
    inputAmountMinorUnits,
    inputCurrency,
    maxPercentage: result.maxPercentage,
    // Deliberately no resultAmountMinorUnits/feeMinorUnits: this stage did
    // not produce a number, only (optionally) a bound.
    explanation: result.reason,
    sources: [scenario.source],
  };
}

/**
 * Builds a reference-currency-conversion stage, reusing
 * convertUsingReferenceRate as-is. Always "reference" status — a
 * reference-rate conversion can never be "exact", by definition of what a
 * reference rate is (see FxReferenceRate.isLive, always false). This is
 * the specific guardrail for invariant E: this function has no code path
 * that can return "exact".
 */
export function buildReferenceConversionStage(
  inputAmountMinorUnits: number,
  inputCurrency: CurrencyCode,
  referenceRate: FxReferenceRate
): CalculationStage {
  const result = convertUsingReferenceRate(inputAmountMinorUnits, referenceRate);

  return {
    kind: "referenceConversion",
    label: `Reference ${referenceRate.base} → ${referenceRate.quote} conversion`,
    status: "reference",
    inputAmountMinorUnits,
    inputCurrency,
    referenceRateApplied: result.rate,
    resultAmountMinorUnits: result.outputMinorUnits,
    resultCurrency: referenceRate.quote,
    explanation:
      `Converted using ${referenceRate.source.name}'s reference rate as of ${referenceRate.asOf}. ` +
      `Reference conversion only — not a guaranteed bank, payment-provider, or settlement rate; actual amounts will differ.`,
    sources: [referenceRate.source],
  };
}

/**
 * Whether a caller should proceed to build fee stages for a given
 * provider capability, or stop here with an already-final result.
 */
export interface EligibilityGate {
  proceed: boolean;
  /** Set only when proceed is false — the transaction-level result to return as-is, with no fee stages attempted. */
  blockedResult?: TransactionCalculation;
}

/**
 * Gates a transaction attempt on an EligibilityRecord before any fee
 * stage is built. This is how the engine handles Wise: its
 * `receiveMarketplacePayouts` capability for Pakistan is recorded as
 * "unresolved" (a project-level conclusion, not a direct Wise
 * statement — see data/providers/wise.ts and PHASE_H_RESEARCH.md), and
 * there are no Wise fee scenarios to evaluate anyway. Calling this with
 * that record returns `proceed: false` and a `blockedResult` whose status
 * is "unresolved", never "not_calculable" or a fabricated fee — matching
 * the eligibility status precisely rather than downgrading it.
 *
 * Status mapping: "available" -> proceed. "unavailable" -> proceeds no
 * further with status "not_calculable" (the service definitely doesn't
 * apply here, so no number is possible — a more certain negative than
 * "unresolved"). "restricted"/"unresolved" -> "unresolved" (whether/how
 * this could work is itself undetermined).
 */
export function gateOnEligibility(
  record: EligibilityRecord,
  inputAmountMinorUnits: number,
  inputCurrency: CurrencyCode
): EligibilityGate {
  if (record.status === "available") {
    return { proceed: true };
  }

  const status: CalculationStatus = record.status === "unavailable" ? "not_calculable" : "unresolved";

  return {
    proceed: false,
    blockedResult: {
      status,
      inputAmountMinorUnits,
      inputCurrency,
      stages: [],
      limitations: [
        `${record.provider} — ${record.capability} in ${record.country}: ${record.statusDetail}`,
      ],
    },
  };
}

/**
 * Composes a sequence of already-built stages into one
 * TransactionCalculation. This function does not know or care what the
 * stages represent (Upwork, Payoneer, Wise, a synthetic test fixture —
 * anything) or what order they're conceptually meant to reflect; it is
 * the caller's responsibility to pass stages whose `inputAmountMinorUnits`
 * chains correctly from the previous stage's `resultAmountMinorUnits`
 * (see PHASE_I_DESIGN.md and the "no double counting" test for how this
 * is verified). This function only folds their statuses and picks the
 * final amount, never re-derives or re-applies any fee itself.
 */
export function composeTransaction(
  inputAmountMinorUnits: number,
  inputCurrency: CurrencyCode,
  stages: CalculationStage[]
): TransactionCalculation {
  let status: CalculationStatus = "exact";
  for (const stage of stages) {
    status = combineStatus(status, stage.status);
  }

  const limitations: string[] = [];
  for (const stage of stages) {
    if (stage.status !== "exact") {
      limitations.push(`${stage.label}: ${stage.explanation}`);
    }
  }

  const isFinal = status === "exact" || status === "reference";

  let finalAmountMinorUnits: number | undefined;
  let finalCurrency: CurrencyCode | undefined;

  if (isFinal) {
    if (stages.length === 0) {
      finalAmountMinorUnits = inputAmountMinorUnits;
      finalCurrency = inputCurrency;
    } else {
      const last = stages[stages.length - 1];
      finalAmountMinorUnits = last.resultAmountMinorUnits;
      finalCurrency = last.resultCurrency;
    }
  }

  return {
    status,
    inputAmountMinorUnits,
    inputCurrency,
    stages,
    finalAmountMinorUnits,
    finalCurrency,
    limitations,
  };
}
