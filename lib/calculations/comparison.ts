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

export type CalculationStatus = "exact" | "reference" | "ceiling" | "not_calculable" | "unresolved";

const STATUS_SEVERITY: Record<CalculationStatus, number> = {
  exact: 0,
  reference: 1,
  ceiling: 2,
  not_calculable: 3,
  unresolved: 4,
};

/**
 * Combines two statuses into the status of their composition. Deliberately
 * conservative: the result is never more certain than either input, and a
 * "ceiling" involved in a composition becomes "not_calculable" for the
 * composed result, because bounding a multi-step total from one step's
 * bound would require range arithmetic this engine doesn't implement —
 * see PHASE_I_DESIGN.md.
 */
export function combineStatus(a: CalculationStatus, b: CalculationStatus): CalculationStatus {
  const worse = STATUS_SEVERITY[a] >= STATUS_SEVERITY[b] ? a : b;
  return worse === "ceiling" ? "not_calculable" : worse;
}

export type TransactionStageKind = "platformFee" | "providerFee" | "referenceConversion";

export interface CalculationStage {
  kind: TransactionStageKind;
  label: string;
  status: CalculationStatus;
  inputAmountMinorUnits: number;
  inputCurrency: CurrencyCode;
  feeMinorUnits?: number;
  appliedPercentage?: number;
  maxPercentage?: number;
  referenceRateApplied?: number;
  resultAmountMinorUnits?: number;
  resultCurrency?: CurrencyCode;
  explanation: string;
  sources: SourceInfo[];
}

export interface TransactionCalculation {
  status: CalculationStatus;
  inputAmountMinorUnits: number;
  inputCurrency: CurrencyCode;
  stages: CalculationStage[];
  finalAmountMinorUnits?: number;
  finalCurrency?: CurrencyCode;
  limitations: string[];
}

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
    explanation: result.reason,
    sources: [scenario.source],
  };
}

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

export interface EligibilityGate {
  proceed: boolean;
  blockedResult?: TransactionCalculation;
}

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
