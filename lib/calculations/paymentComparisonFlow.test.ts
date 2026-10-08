import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPlatformFeeStage,
  buildProviderFeeStage,
  buildReferenceConversionStage,
  gateOnEligibility,
  composeTransaction,
} from "./comparison.ts";
import { validateAmountInput, validatePercentageInput } from "./validation.ts";
import { toMinorUnits } from "./money.ts";
import { upworkFeeScenarios } from "../../data/providers/upwork.ts";
import { payoneerFeeScenarios, payoneerEligibility } from "../../data/providers/payoneer.ts";
import { wiseEligibility } from "../../data/providers/wise.ts";
import { fxReferenceRates } from "../../data/fx/reference-rates.ts";

const marketplace = upworkFeeScenarios.find((s) => s.id === "upwork-marketplace-standard")!;
const direct = upworkFeeScenarios.find((s) => s.id === "upwork-direct-contracts")!;
const directPlus = upworkFeeScenarios.find(
  (s) => s.id === "upwork-direct-contracts-freelancer-plus"
)!;
const payoneerCrossCurrency = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-cross-currency-variable"
)!;
const payoneerPakistanEligibility = payoneerEligibility.find(
  (r) => r.capability === "receiveMarketplacePayouts" && r.country === "Pakistan"
)!;
const wiseMarketplaceUnresolved = wiseEligibility.find(
  (r) => r.capability === "receiveMarketplacePayouts"
)!;
const usdToPkr = fxReferenceRates.find((r) => r.base === "USD" && r.quote === "PKR")!;

function runMarketplaceFlow(amountRaw: string, percentageRaw: string) {
  const amountResult = validateAmountInput(amountRaw);
  if (!amountResult.valid) return { rejected: "amount" as const, error: amountResult.error };

  const percentageResult = validatePercentageInput(percentageRaw, marketplace.percentageRange!);
  if (!percentageResult.valid) return { rejected: "percentage" as const, error: percentageResult.error };

  const grossMinorUnits = toMinorUnits(amountResult.value);
  const platform = buildPlatformFeeStage(grossMinorUnits, "USD", marketplace, {
    selectedPercentage: percentageResult.value,
  });
  const gate = gateOnEligibility(payoneerPakistanEligibility, grossMinorUnits, "USD");
  const provider = gate.proceed
    ? buildProviderFeeStage(platform.resultAmountMinorUnits!, "USD", payoneerCrossCurrency)
    : undefined;
  const chain = gate.proceed
    ? composeTransaction(grossMinorUnits, "USD", provider ? [platform, provider] : [platform])
    : gate.blockedResult!;

  return { rejected: undefined, platform, provider, chain };
}

test("Scenario A: $1,000 Marketplace at 10% produces an exact platform stage and a ceiling-only provider stage", () => {
  const result = runMarketplaceFlow("1000", "10");
  assert.equal(result.rejected, undefined);
  if (result.rejected) return;

  assert.equal(result.platform.status, "exact");
  assert.equal(result.platform.feeMinorUnits, 10000);
  assert.equal(result.platform.resultAmountMinorUnits, 90000);

  assert.ok(result.provider);
  assert.equal(result.provider!.status, "ceiling");
  assert.equal(result.provider!.maxPercentage, 0.02);
  assert.equal(result.provider!.feeMinorUnits, undefined);
  assert.equal(result.provider!.resultAmountMinorUnits, undefined);

  assert.equal(result.chain.status, "not_calculable");
  assert.equal(result.chain.finalAmountMinorUnits, undefined);
});

test("Scenario A: the reference PKR conversion is built from the amount after Upwork's fee, and is status \"reference\", never \"exact\"", () => {
  const result = runMarketplaceFlow("1000", "10");
  assert.equal(result.rejected, undefined);
  if (result.rejected) return;

  const referenceStage = buildReferenceConversionStage(
    result.platform.resultAmountMinorUnits!,
    "USD",
    usdToPkr
  );
  const referenceChain = composeTransaction(result.platform.inputAmountMinorUnits, "USD", [
    result.platform,
    referenceStage,
  ]);

  assert.equal(referenceStage.status, "reference");
  assert.equal(referenceChain.status, "reference");
  assert.notEqual(referenceChain.status, "exact");
  assert.ok(referenceChain.finalAmountMinorUnits !== undefined);
  assert.equal(referenceStage.inputAmountMinorUnits, 90000);
});

test("Scenario A: no numeric \"2%\" fee value ever appears in the provider stage's calculable output", () => {
  const result = runMarketplaceFlow("1000", "10");
  assert.equal(result.rejected, undefined);
  if (result.rejected) return;

  assert.equal(result.provider!.maxPercentage, 0.02);
  assert.equal(result.provider!.feeMinorUnits, undefined);
});

test("Scenario B: Direct Contracts without Freelancer Plus uses the verified flat 5% scenario", () => {
  const amountResult = validateAmountInput("1000");
  assert.equal(amountResult.valid, true);
  if (!amountResult.valid) return;

  const grossMinorUnits = toMinorUnits(amountResult.value);
  const platform = buildPlatformFeeStage(grossMinorUnits, "USD", direct);

  assert.equal(platform.status, "exact");
  assert.equal(platform.appliedPercentage, 0.05);
  assert.equal(platform.feeMinorUnits, 5000);
  assert.equal(platform.resultAmountMinorUnits, 95000);
});

test("Scenario C: Direct Contracts with Freelancer Plus uses the verified 0% scenario, not the 5% one", () => {
  const amountResult = validateAmountInput("1000");
  assert.equal(amountResult.valid, true);
  if (!amountResult.valid) return;

  const grossMinorUnits = toMinorUnits(amountResult.value);
  const platform = buildPlatformFeeStage(grossMinorUnits, "USD", directPlus);

  assert.equal(platform.status, "exact");
  assert.equal(platform.appliedPercentage, 0);
  assert.equal(platform.feeMinorUnits, 0);
  assert.equal(platform.resultAmountMinorUnits, grossMinorUnits);
});

test("Scenario D: NaN-like, empty, and negative amount strings are rejected before any stage is built", () => {
  for (const bad of ["", "abc", "NaN", "-100", "Infinity", "1000.999"]) {
    const result = runMarketplaceFlow(bad, "10");
    assert.equal(result.rejected, "amount", `expected "${bad}" to be rejected as an invalid amount`);
  }
});

test("Scenario D: a non-finite selectedPercentage cannot reach buildPlatformFeeStage even if validation were somehow bypassed", () => {
  assert.throws(() =>
    buildPlatformFeeStage(toMinorUnits(500), "USD", marketplace, { selectedPercentage: NaN })
  );
});

test("Scenario E: a Marketplace fee of 20% (outside the verified 0-15% range) is rejected before calculation", () => {
  const result = runMarketplaceFlow("1000", "20");
  assert.equal(result.rejected, "percentage");
});

test("Scenario E: a Marketplace fee of -5% is rejected before calculation", () => {
  const result = runMarketplaceFlow("1000", "-5");
  assert.equal(result.rejected, "percentage");
});

test("Scenario F: Payoneer's Pakistan cross-currency scenario is ceiling-status regardless of amount", () => {
  for (const amount of ["1", "1000", "50000"]) {
    const result = runMarketplaceFlow(amount, "10");
    assert.equal(result.rejected, undefined);
    if (result.rejected) return;
    assert.equal(result.provider!.status, "ceiling");
    assert.equal(result.provider!.feeMinorUnits, undefined);
  }
});

test("Wise's Pakistan marketplace-payout eligibility gates to an unresolved blockedResult, never a fee", () => {
  const gate = gateOnEligibility(wiseMarketplaceUnresolved, toMinorUnits(1000), "USD");
  assert.equal(gate.proceed, false);
  assert.equal(gate.blockedResult!.status, "unresolved");
  assert.equal(gate.blockedResult!.finalAmountMinorUnits, undefined);
  assert.ok(gate.blockedResult!.limitations[0].length > 0);
});

test("Status propagation: exact (platform) + exact (Payoneer same-currency, hypothetical) = exact", () => {
  const usdSameCurrency = payoneerFeeScenarios.find(
    (s) => s.id === "payoneer-withdrawal-usd-same-currency"
  )!;
  const amountResult = validateAmountInput("1000");
  assert.equal(amountResult.valid, true);
  if (!amountResult.valid) return;
  const grossMinorUnits = toMinorUnits(amountResult.value);

  const platform = buildPlatformFeeStage(grossMinorUnits, "USD", direct);
  const provider = buildProviderFeeStage(platform.resultAmountMinorUnits!, "USD", usdSameCurrency);
  const chain = composeTransaction(grossMinorUnits, "USD", [platform, provider]);

  assert.equal(chain.status, "exact");
  assert.ok(chain.finalAmountMinorUnits !== undefined);
});

test("Status propagation: exact (platform) + reference (FX) = reference, not exact", () => {
  const amountResult = validateAmountInput("1000");
  assert.equal(amountResult.valid, true);
  if (!amountResult.valid) return;
  const grossMinorUnits = toMinorUnits(amountResult.value);

  const platform = buildPlatformFeeStage(grossMinorUnits, "USD", direct);
  const referenceStage = buildReferenceConversionStage(
    platform.resultAmountMinorUnits!,
    "USD",
    usdToPkr
  );
  const chain = composeTransaction(grossMinorUnits, "USD", [platform, referenceStage]);

  assert.equal(chain.status, "reference");
});

test("Status propagation: exact (platform) + unresolved (Wise gate) = unresolved", () => {
  const amountResult = validateAmountInput("1000");
  assert.equal(amountResult.valid, true);
  if (!amountResult.valid) return;
  const grossMinorUnits = toMinorUnits(amountResult.value);

  const gate = gateOnEligibility(wiseMarketplaceUnresolved, grossMinorUnits, "USD");
  assert.equal(gate.proceed, false);
  assert.equal(gate.blockedResult!.status, "unresolved");
});

test("UI semantics: the Payoneer ceiling stage's explanation never states an exact fee was applied", () => {
  const result = runMarketplaceFlow("1000", "10");
  assert.equal(result.rejected, undefined);
  if (result.rejected) return;
  assert.doesNotMatch(result.provider!.explanation, /applied.*fee/i);
});

test("UI semantics: Wise's blocked-result explanation is non-empty and does not claim a fee was applied", () => {
  const gate = gateOnEligibility(wiseMarketplaceUnresolved, toMinorUnits(1000), "USD");
  const message = gate.blockedResult!.limitations[0];
  assert.ok(message.length > 0);
  assert.doesNotMatch(message, /applied.*fee/i);
});
