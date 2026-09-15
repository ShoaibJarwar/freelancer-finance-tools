"use client";

import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { HelperText } from "@/components/ui/HelperText";
import { SourceNote } from "@/components/ui/SourceNote";
import { upworkFeeScenarios } from "@/data/providers/upwork";
import { fxReferenceRates } from "@/data/fx/reference-rates";
import { calculateCalculatorResult } from "@/lib/calculations/calculator";
import { validateAmountInput, validatePercentageInput } from "@/lib/calculations/validation";
import { fromMinorUnits } from "@/lib/calculations/money";
import type { CurrencyCode } from "@/types/financial";

const MARKETPLACE_SCENARIO_ID = "upwork-marketplace-standard";
const DIRECT_SCENARIO_ID = "upwork-direct-contracts";
const DIRECT_PLUS_SCENARIO_ID = "upwork-direct-contracts-freelancer-plus";

const marketplaceScenario = upworkFeeScenarios.find((s) => s.id === MARKETPLACE_SCENARIO_ID)!;
const directScenario = upworkFeeScenarios.find((s) => s.id === DIRECT_SCENARIO_ID)!;
const directPlusScenario = upworkFeeScenarios.find((s) => s.id === DIRECT_PLUS_SCENARIO_ID)!;

// Reference currencies are derived from the data, not hardcoded here — add
// a new entry to fxReferenceRates and it becomes selectable automatically.
const availableReferenceCurrencies = Array.from(
  new Set(fxReferenceRates.map((r) => r.quote))
);

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

type ContractType = "marketplace" | "direct";

export function FeeCalculatorForm() {
  const [amountRaw, setAmountRaw] = useState("");
  const [contractType, setContractType] = useState<ContractType>("marketplace");
  const [percentageRaw, setPercentageRaw] = useState("");
  const [freelancerPlus, setFreelancerPlus] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [referenceCurrency, setReferenceCurrency] = useState<CurrencyCode | "">(
    availableReferenceCurrencies[0] ?? ""
  );

  const amountResult = useMemo(() => validateAmountInput(amountRaw), [amountRaw]);

  const scenario =
    contractType === "marketplace"
      ? marketplaceScenario
      : freelancerPlus
        ? directPlusScenario
        : directScenario;

  const percentageResult = useMemo(() => {
    if (contractType !== "marketplace") return undefined;
    if (!marketplaceScenario.percentageRange) return undefined;
    return validatePercentageInput(percentageRaw, marketplaceScenario.percentageRange);
  }, [contractType, percentageRaw]);

  const referenceRate = useMemo(() => {
    if (!showReference || !referenceCurrency) return undefined;
    return fxReferenceRates.find((r) => r.quote === referenceCurrency);
  }, [showReference, referenceCurrency]);

  const canCalculate =
    amountResult.valid && (contractType === "direct" || percentageResult?.valid === true);

  const result = useMemo(() => {
    if (!canCalculate || !amountResult.valid) return undefined;

    return calculateCalculatorResult({
      grossAmount: amountResult.value,
      scenario,
      selectedPercentage:
        contractType === "marketplace" && percentageResult?.valid
          ? percentageResult.value
          : undefined,
      referenceRate,
    });
  }, [canCalculate, amountResult, scenario, contractType, percentageResult, referenceRate]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Calculate your amount after Upwork&apos;s fee</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="amount">Client payment (USD)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="e.g. 500"
              value={amountRaw}
              onChange={(e) => setAmountRaw(e.target.value)}
              invalid={!amountResult.valid && amountRaw.trim() !== ""}
              aria-describedby="amount-help"
            />
            {!amountResult.valid && amountRaw.trim() !== "" && (
              <HelperText id="amount-help" error>
                {amountResult.error}
              </HelperText>
            )}
          </div>

          <div>
            <Label htmlFor="contract-type">Upwork contract type</Label>
            <Select
              id="contract-type"
              value={contractType}
              onChange={(e) => setContractType(e.target.value as ContractType)}
            >
              <option value="marketplace">Marketplace contract</option>
              <option value="direct">Direct Contracts</option>
            </Select>
          </div>
        </div>

        {contractType === "marketplace" && (
          <div>
            <Label htmlFor="marketplace-fee">
              Freelancer service fee shown on your contract
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="marketplace-fee"
                inputMode="decimal"
                placeholder="e.g. 10"
                value={percentageRaw}
                onChange={(e) => setPercentageRaw(e.target.value)}
                invalid={!percentageResult?.valid && percentageRaw.trim() !== ""}
                aria-describedby="marketplace-fee-help"
                className="max-w-[140px]"
              />
              <span className="text-[0.9375rem] text-muted-foreground">%</span>
            </div>
            <HelperText id="marketplace-fee-help" error={!percentageResult?.valid && percentageRaw.trim() !== ""}>
              {!percentageResult?.valid && percentageRaw.trim() !== ""
                ? percentageResult?.error
                : `Upwork's freelancer service fee varies by contract, from ${
                    marketplaceScenario.percentageRange!.min * 100
                  }% to ${
                    marketplaceScenario.percentageRange!.max * 100
                  }%. Enter the exact percentage shown for your contract — it isn't the same for everyone.`}
            </HelperText>
          </div>
        )}

        {contractType === "direct" && (
          <div className="flex items-start gap-2">
            <input
              id="freelancer-plus"
              type="checkbox"
              checked={freelancerPlus}
              onChange={(e) => setFreelancerPlus(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <Label htmlFor="freelancer-plus" className="mb-0 font-normal">
              I have an active Freelancer Plus subscription (
              {formatPercentage(directPlusScenario.percentage!)} fee on
              Direct Contracts instead of{" "}
              {formatPercentage(directScenario.percentage!)})
            </Label>
          </div>
        )}

        {availableReferenceCurrencies.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="flex items-start gap-2">
              <input
                id="show-reference"
                type="checkbox"
                checked={showReference}
                onChange={(e) => setShowReference(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Label htmlFor="show-reference" className="mb-0 font-normal">
                Also show a reference conversion in another currency
              </Label>
            </div>

            {showReference && (
              <div className="mt-3 max-w-[200px]">
                <Label htmlFor="reference-currency">Reference currency</Label>
                <Select
                  id="reference-currency"
                  value={referenceCurrency}
                  onChange={(e) => setReferenceCurrency(e.target.value as CurrencyCode)}
                >
                  {availableReferenceCurrencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        )}

        <div aria-live="polite">
          {result ? (
            <ResultBreakdown
              grossMinorUnits={result.fee.grossMinorUnits}
              feeMinorUnits={result.fee.feeMinorUnits}
              netMinorUnits={result.fee.netMinorUnits}
              appliedPercentage={result.fee.appliedPercentage}
              scenarioName={scenario.name}
              scenarioSource={scenario.source}
              conversion={result.conversion}
              referenceCurrency={referenceCurrency || undefined}
            />
          ) : (
            <p className="text-[0.8125rem] text-muted-foreground">
              Enter a client payment{contractType === "marketplace" ? " and your contract's fee percentage " : " "}
              to see the amount after Upwork&apos;s fee.
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function ResultBreakdown({
  grossMinorUnits,
  feeMinorUnits,
  netMinorUnits,
  appliedPercentage,
  scenarioName,
  scenarioSource,
  conversion,
  referenceCurrency,
}: {
  grossMinorUnits: number;
  feeMinorUnits: number;
  netMinorUnits: number;
  appliedPercentage: number;
  scenarioName: string;
  scenarioSource: { name: string; url: string; verifiedAt: string };
  conversion?: { outputMinorUnits: number };
  referenceCurrency?: CurrencyCode;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] bg-surface-muted p-4">
        <p className="text-[0.8125rem] text-muted-foreground">
          Amount after platform fee ({scenarioName})
        </p>
        <p className="font-figures mt-1 text-3xl font-semibold text-foreground">
          {formatMoney(netMinorUnits, "USD")}
        </p>
      </div>

      <dl className="divide-y divide-border text-[0.9375rem]">
        <div className="flex items-center justify-between py-2">
          <dt className="text-muted-foreground">Client payment</dt>
          <dd className="font-figures text-foreground">
            {formatMoney(grossMinorUnits, "USD")}
          </dd>
        </div>
        <div className="flex items-center justify-between py-2">
          <dt className="text-muted-foreground">
            Upwork service fee ({formatPercentage(appliedPercentage)})
          </dt>
          <dd className="font-figures text-foreground">
            −{formatMoney(feeMinorUnits, "USD")}
          </dd>
        </div>
        <div className="flex items-center justify-between py-2 font-medium">
          <dt className="text-foreground">Amount after platform fee</dt>
          <dd className="font-figures text-foreground">
            {formatMoney(netMinorUnits, "USD")}
          </dd>
        </div>
      </dl>

      <SourceNote
        source={scenarioSource.name}
        sourceUrl={scenarioSource.url}
        lastVerified={scenarioSource.verifiedAt}
      />

      {conversion && referenceCurrency && (
        <div className="rounded-[var(--radius-card)] border border-border p-4">
          <p className="text-[0.8125rem] text-muted-foreground">
            Reference {referenceCurrency} equivalent
          </p>
          <p className="font-figures mt-1 text-xl font-semibold text-foreground">
            {formatMoney(conversion.outputMinorUnits, referenceCurrency)}
          </p>
          <p className="mt-2 text-[0.8125rem] text-muted-foreground">
            Reference exchange rate only — not a guaranteed bank,
            payment-provider, or settlement rate. Actual amounts will vary.
          </p>
          {fxReferenceRates
            .filter((r) => r.quote === referenceCurrency)
            .map((r) => (
              <SourceNote
                key={r.id}
                className="mt-2"
                source={r.source.name}
                sourceUrl={r.source.url}
                lastVerified={`${r.source.verifiedAt} (rate as of ${r.asOf})`}
              />
            ))}
        </div>
      )}
    </div>
  );
}
