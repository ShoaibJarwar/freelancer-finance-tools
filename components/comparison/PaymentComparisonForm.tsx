"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { HelperText } from "@/components/ui/HelperText";
import { SourceNote } from "@/components/ui/SourceNote";
import { Button } from "@/components/ui/Button";
import { upworkFeeScenarios } from "@/data/providers/upwork";
import { payoneerFeeScenarios, payoneerEligibility } from "@/data/providers/payoneer";
import { fxReferenceRates } from "@/data/fx/reference-rates";
import {
  buildPlatformFeeStage,
  buildProviderFeeStage,
  buildReferenceConversionStage,
  gateOnEligibility,
  composeTransaction,
  type CalculationStage,
  type CalculationStatus,
} from "@/lib/calculations/comparison";
import { validateAmountInput, validatePercentageInput } from "@/lib/calculations/validation";
import { toMinorUnits, fromMinorUnits } from "@/lib/calculations/money";
import {
  parseComparisonUrlState,
  serializeComparisonUrlState,
  type ComparisonContractType,
} from "@/lib/calculations/comparisonUrlState";
import type { CurrencyCode } from "@/types/financial";

const MARKETPLACE_SCENARIO_ID = "upwork-marketplace-standard";
const DIRECT_SCENARIO_ID = "upwork-direct-contracts";
const DIRECT_PLUS_SCENARIO_ID = "upwork-direct-contracts-freelancer-plus";
const PAYONEER_CROSS_CURRENCY_ID = "payoneer-withdrawal-cross-currency-variable";

const marketplaceScenario = upworkFeeScenarios.find((s) => s.id === MARKETPLACE_SCENARIO_ID)!;
const directScenario = upworkFeeScenarios.find((s) => s.id === DIRECT_SCENARIO_ID)!;
const directPlusScenario = upworkFeeScenarios.find((s) => s.id === DIRECT_PLUS_SCENARIO_ID)!;
const payoneerCrossCurrencyScenario = payoneerFeeScenarios.find(
  (s) => s.id === PAYONEER_CROSS_CURRENCY_ID
)!;
const payoneerPakistanEligibility = payoneerEligibility.find(
  (r) => r.capability === "receiveMarketplacePayouts" && r.country === "Pakistan"
)!;
const usdToPkrRate = fxReferenceRates.find((r) => r.base === "USD" && r.quote === "PKR");

const STATUS_LABELS: Record<CalculationStatus, string> = {
  exact: "Exact",
  reference: "Reference",
  ceiling: "Ceiling only",
  not_calculable: "Not calculable",
  unresolved: "Unresolved",
};

const URL_SYNC_DEBOUNCE_MS = 400;
const SHARE_FEEDBACK_DURATION_MS = 2500;

function formatMoney(minorUnits: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fromMinorUnits(minorUnits));
}

function formatPercentage(decimal: number): string {
  return `${Math.round(decimal * 1000) / 10}%`;
}

function StatusTag({ status }: { status: CalculationStatus }) {
  return (
    <span className="inline-block rounded-[var(--radius-control)] border border-border bg-surface-muted px-2 py-0.5 text-[0.75rem] font-medium text-foreground">
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentComparisonForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [initialState] = useState(() => parseComparisonUrlState(searchParams));

  const [amountRaw, setAmountRaw] = useState(initialState.amount);
  const [contractType, setContractType] = useState<ComparisonContractType>(initialState.contract);
  const [percentageRaw, setPercentageRaw] = useState(initialState.fee);
  const [freelancerPlus, setFreelancerPlus] = useState(initialState.plus);
  const [showReference, setShowReference] = useState(initialState.reference);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    const handle = setTimeout(() => {
      const query = serializeComparisonUrlState({
        amount: amountRaw,
        contract: contractType,
        fee: percentageRaw,
        plus: freelancerPlus,
        reference: showReference,
      }).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, URL_SYNC_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [amountRaw, contractType, percentageRaw, freelancerPlus, showReference, pathname, router]);

  const amountResult = validateAmountInput(amountRaw);

  const scenario =
    contractType === "marketplace"
      ? marketplaceScenario
      : freelancerPlus
        ? directPlusScenario
        : directScenario;

  const percentageResult =
    contractType === "marketplace" && marketplaceScenario.percentageRange
      ? validatePercentageInput(percentageRaw, marketplaceScenario.percentageRange)
      : undefined;

  const canCalculate =
    amountResult.valid && (contractType === "direct" || percentageResult?.valid === true);

  let platformStage: CalculationStage | undefined;
  let providerStage: CalculationStage | undefined;
  let providerBlockedMessage: string | undefined;
  let fullChainStatus: CalculationStatus | undefined;
  let referenceStage: CalculationStage | undefined;
  let referenceFinalAmountMinorUnits: number | undefined;
  let calculationError: string | undefined;

  if (canCalculate && amountResult.valid) {
    try {
      const grossMinorUnits = toMinorUnits(amountResult.value);

      platformStage = buildPlatformFeeStage(grossMinorUnits, "USD", scenario, {
        selectedPercentage:
          contractType === "marketplace" && percentageResult?.valid
            ? percentageResult.value
            : undefined,
      });

      const gate = gateOnEligibility(payoneerPakistanEligibility, grossMinorUnits, "USD");
      providerStage = gate.proceed
        ? buildProviderFeeStage(
            platformStage.resultAmountMinorUnits!,
            "USD",
            payoneerCrossCurrencyScenario
          )
        : undefined;
      providerBlockedMessage = gate.proceed ? undefined : gate.blockedResult!.limitations[0];

      const chainStages: CalculationStage[] = [platformStage, ...(providerStage ? [providerStage] : [])];
      fullChainStatus = gate.proceed
        ? composeTransaction(grossMinorUnits, "USD", chainStages).status
        : gate.blockedResult!.status;

      if (showReference && usdToPkrRate) {
        referenceStage = buildReferenceConversionStage(
          platformStage.resultAmountMinorUnits!,
          "USD",
          usdToPkrRate
        );
        referenceFinalAmountMinorUnits = composeTransaction(
          platformStage.inputAmountMinorUnits,
          "USD",
          [platformStage, referenceStage]
        ).finalAmountMinorUnits;
      }
    } catch (err) {
      platformStage = undefined;
      calculationError =
        err instanceof Error
          ? "This combination couldn't be calculated. Double-check the amount and fee percentage above."
          : "Something went wrong calculating this.";
    }
  }

  async function handleShare() {
    const query = serializeComparisonUrlState({
      amount: amountRaw,
      contract: contractType,
      fee: percentageRaw,
      plus: freelancerPlus,
      reference: showReference,
    }).toString();
    const url = `${window.location.origin}${pathname}${query ? `?${query}` : ""}`;

    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
    } catch {
      setShareStatus("error");
    }
    setTimeout(() => setShareStatus("idle"), SHARE_FEEDBACK_DURATION_MS);
  }

  function handleReset() {
    setAmountRaw("");
    setContractType("marketplace");
    setPercentageRaw("");
    setFreelancerPlus(false);
    setShowReference(false);
    setShareStatus("idle");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your inputs</CardTitle>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cmp-amount">Client payment (USD)</Label>
              <Input
                id="cmp-amount"
                inputMode="decimal"
                placeholder="e.g. 1000"
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value)}
                invalid={!amountResult.valid && amountRaw.trim() !== ""}
                aria-describedby="cmp-amount-help"
              />
              {!amountResult.valid && amountRaw.trim() !== "" && (
                <HelperText id="cmp-amount-help" error>
                  {amountResult.error}
                </HelperText>
              )}
            </div>

            <div>
              <Label htmlFor="cmp-contract-type">Upwork contract type</Label>
              <Select
                id="cmp-contract-type"
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ComparisonContractType)}
              >
                <option value="marketplace">Marketplace contract</option>
                <option value="direct">Direct Contracts</option>
              </Select>
            </div>
          </div>

          {contractType === "marketplace" && (
            <div>
              <Label htmlFor="cmp-marketplace-fee">
                Freelancer service fee shown on your contract
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cmp-marketplace-fee"
                  inputMode="decimal"
                  placeholder="e.g. 10"
                  value={percentageRaw}
                  onChange={(e) => setPercentageRaw(e.target.value)}
                  invalid={!percentageResult?.valid && percentageRaw.trim() !== ""}
                  aria-describedby="cmp-marketplace-fee-help"
                  className="max-w-[140px]"
                />
                <span className="text-[0.9375rem] text-muted-foreground">%</span>
              </div>
              <HelperText
                id="cmp-marketplace-fee-help"
                error={!percentageResult?.valid && percentageRaw.trim() !== ""}
              >
                {!percentageResult?.valid && percentageRaw.trim() !== ""
                  ? percentageResult?.error
                  : `Upwork's freelancer service fee varies by contract, from ${
                      marketplaceScenario.percentageRange!.min * 100
                    }% to ${
                      marketplaceScenario.percentageRange!.max * 100
                    }%. Enter the exact percentage shown for your contract.`}
              </HelperText>
            </div>
          )}

          {contractType === "direct" && (
            <div className="flex items-start gap-2">
              <input
                id="cmp-freelancer-plus"
                type="checkbox"
                checked={freelancerPlus}
                onChange={(e) => setFreelancerPlus(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Label htmlFor="cmp-freelancer-plus" className="mb-0 font-normal">
                I have an active Freelancer Plus subscription (
                {formatPercentage(directPlusScenario.percentage!)} fee instead of{" "}
                {formatPercentage(directScenario.percentage!)})
              </Label>
            </div>
          )}

          {usdToPkrRate && (
            <div className="flex items-start gap-2 border-t border-border pt-4">
              <input
                id="cmp-show-reference"
                type="checkbox"
                checked={showReference}
                onChange={(e) => setShowReference(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Label htmlFor="cmp-show-reference" className="mb-0 font-normal">
                Also show a reference PKR conversion of the amount after
                Upwork&apos;s fee
              </Label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" onClick={handleShare}>
              Share comparison
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <span role="status" aria-live="polite" className="text-[0.8125rem] text-muted-foreground">
              {shareStatus === "copied" && "Link copied to clipboard."}
              {shareStatus === "error" &&
                "Couldn't copy automatically — copy the URL from your browser's address bar."}
            </span>
          </div>
        </CardBody>
      </Card>

      <div aria-live="polite">
        {calculationError && <p className="text-[0.875rem] text-error">{calculationError}</p>}

        {!calculationError && !platformStage && (
          <p className="text-[0.8125rem] text-muted-foreground">
            Enter a client payment
            {contractType === "marketplace" ? " and your contract's fee percentage " : " "}
            to see what can be calculated.
          </p>
        )}

        {platformStage && (
          <ComparisonResult
            platformStage={platformStage}
            providerStage={providerStage}
            providerBlockedMessage={providerBlockedMessage}
            fullChainStatus={fullChainStatus}
            referenceStage={referenceStage}
            referenceFinalAmountMinorUnits={referenceFinalAmountMinorUnits}
          />
        )}
      </div>
    </div>
  );
}

function buildResultSummary({
  platformStage,
  providerStage,
  providerBlockedMessage,
  referenceStage,
  referenceFinalAmountMinorUnits,
}: {
  platformStage: CalculationStage;
  providerStage: CalculationStage | undefined;
  providerBlockedMessage: string | undefined;
  referenceStage: CalculationStage | undefined;
  referenceFinalAmountMinorUnits: number | undefined;
}): string {
  const afterUpwork = formatMoney(platformStage.resultAmountMinorUnits!, "USD");
  let summary = `After Upwork's fee, the calculable amount is ${afterUpwork}.`;

  if (providerStage?.status === "exact") {
    summary += ` Payoneer's fee for this scenario is exact, so the amount after both fees is also calculable.`;
  } else if (providerStage?.status === "ceiling" && providerStage.maxPercentage !== undefined) {
    summary += ` Payoneer's Pakistan withdrawal fee is only published as a ceiling (up to ${formatPercentage(
      providerStage.maxPercentage
    )}), not an exact rate, so no exact final amount is calculated.`;
  } else if (providerBlockedMessage) {
    summary += ` Whether Wise/Payoneer eligibility applies to a further step here is not resolved from official data, so no additional fee is calculated.`;
  }

  if (referenceStage && referenceFinalAmountMinorUnits !== undefined) {
    summary += ` The PKR figure below is a reference conversion of the amount after Upwork's fee only, not a guaranteed payout.`;
  }

  return summary;
}

function ComparisonResult({
  platformStage,
  providerStage,
  providerBlockedMessage,
  fullChainStatus,
  referenceStage,
  referenceFinalAmountMinorUnits,
}: {
  platformStage: CalculationStage;
  providerStage: CalculationStage | undefined;
  providerBlockedMessage: string | undefined;
  fullChainStatus: CalculationStatus | undefined;
  referenceStage: CalculationStage | undefined;
  referenceFinalAmountMinorUnits: number | undefined;
}) {
  const summary = buildResultSummary({
    platformStage,
    providerStage,
    providerBlockedMessage,
    referenceStage,
    referenceFinalAmountMinorUnits,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Calculation</h3>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-foreground">
          <span className="font-medium">What this means: </span>
          {summary}
        </p>
        {fullChainStatus && (
          <p className="mt-2 flex items-center gap-2 text-[0.8125rem] text-muted-foreground">
            Overall status: <StatusTag status={fullChainStatus} />
          </p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <p className="text-[0.8125rem] font-medium text-foreground">
            Amount after Upwork&apos;s fee
          </p>
          <StatusTag status={platformStage.status} />
        </div>
        <div className="rounded-[var(--radius-card)] bg-surface-muted p-4">
          <p className="font-figures text-2xl font-semibold text-foreground">
            {formatMoney(platformStage.resultAmountMinorUnits!, "USD")}
          </p>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            {formatMoney(platformStage.inputAmountMinorUnits, "USD")} client payment −{" "}
            {formatMoney(platformStage.feeMinorUnits!, "USD")} Upwork fee (
            {formatPercentage(platformStage.appliedPercentage!)})
          </p>
        </div>
        <SourceNote
          className="mt-2"
          source={platformStage.sources[0].name}
          sourceUrl={platformStage.sources[0].url}
          lastVerified={platformStage.sources[0].verifiedAt}
        />
      </div>

      {(providerStage || providerBlockedMessage) && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-[0.8125rem] font-medium text-foreground">
              Payoneer withdrawal to a Pakistani bank account
            </p>
            <StatusTag status={providerStage?.status ?? "unresolved"} />
          </div>
          <div className="rounded-[var(--radius-card)] border border-border p-4">
            {providerStage?.status === "ceiling" && providerStage.maxPercentage !== undefined && (
              <p className="text-[0.9375rem] font-medium text-foreground">
                Published ceiling: up to {formatPercentage(providerStage.maxPercentage)} — not an
                exact fee
              </p>
            )}
            <p className="mt-1 text-[0.875rem] text-muted-foreground">
              {providerStage?.explanation ?? providerBlockedMessage}
            </p>
          </div>
          {providerStage?.sources[0] && (
            <SourceNote
              className="mt-2"
              source={providerStage.sources[0].name}
              sourceUrl={providerStage.sources[0].url}
              lastVerified={providerStage.sources[0].verifiedAt}
            />
          )}
        </div>
      )}

      {referenceStage && referenceFinalAmountMinorUnits !== undefined && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-[0.8125rem] font-medium text-foreground">
              Reference PKR equivalent (of the amount after Upwork&apos;s fee)
            </p>
            <StatusTag status="reference" />
          </div>
          <div className="rounded-[var(--radius-card)] border border-border p-4">
            <p className="font-figures text-xl font-semibold text-foreground">
              {formatMoney(referenceFinalAmountMinorUnits, "PKR")}
            </p>
            <p className="mt-2 text-[0.8125rem] text-muted-foreground">
              Reference exchange rate only — not a guaranteed bank,
              payment-provider, or settlement rate. Does not account for
              Payoneer&apos;s withdrawal fee above, which isn&apos;t exactly
              known; the real PKR amount will be lower than this figure.
            </p>
          </div>
          <SourceNote
            className="mt-2"
            source={referenceStage.sources[0].name}
            sourceUrl={referenceStage.sources[0].url}
            lastVerified={referenceStage.sources[0].verifiedAt}
          />
        </div>
      )}
    </div>
  );
}
