import { test } from "node:test";
import assert from "node:assert/strict";
import {
  combineStatus,
  buildPlatformFeeStage,
  buildProviderFeeStage,
  buildReferenceConversionStage,
  gateOnEligibility,
  composeTransaction,
  type CalculationStatus,
} from "./comparison.ts";
import { toMinorUnits } from "./money.ts";
import { upworkFeeScenarios } from "../../data/providers/upwork.ts";
import { payoneerFeeScenarios, payoneerEligibility } from "../../data/providers/payoneer.ts";
import { wiseEligibility } from "../../data/providers/wise.ts";
import { fxReferenceRates } from "../../data/fx/reference-rates.ts";
import type { FeeScenario } from "../../types/financial.ts";

const marketplace = upworkFeeScenarios.find((s) => s.id === "upwork-marketplace-standard")!;
const direct = upworkFeeScenarios.find((s) => s.id === "upwork-direct-contracts")!;
const usdSameCurrency = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-usd-same-currency"
)!;
const eurSameCurrency = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-eur-same-currency"
)!;
const gbpSameCurrency = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-gbp-same-currency"
)!;
const crossCurrencyVariable = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-cross-currency-variable"
)!;
const usdToPkr = fxReferenceRates.find((r) => r.id === "usd-pkr-sbp-reference")!;
const wiseMarketplaceUnresolved = wiseEligibility.find(
  (r) => r.capability === "receiveMarketplacePayouts"
)!;
const payoneerMarketplaceAvailable = payoneerEligibility.find(
  (r) => r.capability === "receiveMarketplacePayouts"
)!;

test("combineStatus: exact + exact = exact", () => {
  assert.equal(combineStatus("exact", "exact"), "exact");
});

test("combineStatus: exact + reference = reference", () => {
  assert.equal(combineStatus("exact", "reference"), "reference");
  assert.equal(combineStatus("reference", "exact"), "reference");
});

test("combineStatus: exact + unresolved = unresolved", () => {
  assert.equal(combineStatus("exact", "unresolved"), "unresolved");
});

test("combineStatus: exact + ceiling (variable fee) = not_calculable", () => {
  assert.equal(combineStatus("exact", "ceiling"), "not_calculable");
});

test("combineStatus: reference + ceiling = not_calculable", () => {
  assert.equal(combineStatus("reference", "ceiling"), "not_calculable");
});

test("combineStatus: not_calculable + anything less severe stays not_calculable", () => {
  assert.equal(combineStatus("not_calculable", "exact"), "not_calculable");
  assert.equal(combineStatus("not_calculable", "reference"), "not_calculable");
});

test("combineStatus: unresolved is the most severe — wins against everything", () => {
  const others: CalculationStatus[] = ["exact", "reference", "ceiling", "not_calculable"];
  for (const other of others) {
    assert.equal(combineStatus("unresolved", other), "unresolved");
    assert.equal(combineStatus(other, "unresolved"), "unresolved");
  }
});

test("A: buildPlatformFeeStage produces an exact result for Direct Contracts (5%)", () => {
  const stage = buildPlatformFeeStage(toMinorUnits(1000), "USD", direct);
  assert.equal(stage.status, "exact");
  assert.equal(stage.feeMinorUnits, 5000);
  assert.equal(stage.resultAmountMinorUnits, 95000);
  assert.equal(stage.appliedPercentage, 0.05);
});

test("A: buildProviderFeeStage produces an exact result for Payoneer's USD fixed fee", () => {
  const stage = buildProviderFeeStage(toMinorUnits(1000), "USD", usdSameCurrency);
  assert.equal(stage.status, "exact");
  assert.equal(stage.feeMinorUnits, 150);
  assert.equal(stage.resultAmountMinorUnits, toMinorUnits(1000) - 150);
});

test("B: Marketplace fee at the minimum boundary (0%) succeeds", () => {
  const stage = buildPlatformFeeStage(toMinorUnits(500), "USD", marketplace, {
    selectedPercentage: 0,
  });
  assert.equal(stage.status, "exact");
  assert.equal(stage.feeMinorUnits, 0);
});

test("B: Marketplace fee at the maximum boundary (15%) succeeds", () => {
  const stage = buildPlatformFeeStage(toMinorUnits(500), "USD", marketplace, {
    selectedPercentage: 0.15,
  });
  assert.equal(stage.status, "exact");
  assert.equal(stage.feeMinorUnits, 7500);
});

test("B: Marketplace fee below the minimum (-0.01) is rejected", () => {
  assert.throws(() =>
    buildPlatformFeeStage(toMinorUnits(500), "USD", marketplace, { selectedPercentage: -0.01 })
  );
});

test("B: Marketplace fee above the maximum (0.20) is rejected", () => {
  assert.throws(() =>
    buildPlatformFeeStage(toMinorUnits(500), "USD", marketplace, { selectedPercentage: 0.2 })
  );
});

test("B: Marketplace fee with a negative selection well outside range is rejected", () => {
  assert.throws(() =>
    buildPlatformFeeStage(toMinorUnits(500), "USD", marketplace, { selectedPercentage: -1 })
  );
});

test("B: Marketplace fee with a non-finite selection (NaN) is rejected", () => {
  assert.throws(() =>
    buildPlatformFeeStage(toMinorUnits(500), "USD", marketplace, { selectedPercentage: NaN })
  );
  assert.throws(() =>
    buildPlatformFeeStage(toMinorUnits(500), "USD", marketplace, { selectedPercentage: Infinity })
  );
});

test('C: Payoneer\'s Pakistan cross-currency "up to 2%" fee never becomes an exact fee', () => {
  const stage = buildProviderFeeStage(toMinorUnits(1000), "USD", crossCurrencyVariable);
  assert.equal(stage.status, "ceiling");
  assert.equal(stage.maxPercentage, 0.02);
  assert.equal(stage.feeMinorUnits, undefined);
  assert.equal(stage.resultAmountMinorUnits, undefined);
});

test("D: gating on Wise's unresolved marketplace-payout capability blocks the transaction as unresolved", () => {
  const gate = gateOnEligibility(wiseMarketplaceUnresolved, toMinorUnits(1000), "USD");
  assert.equal(gate.proceed, false);
  assert.ok(gate.blockedResult);
  assert.equal(gate.blockedResult!.status, "unresolved");
  assert.equal(gate.blockedResult!.finalAmountMinorUnits, undefined);
  assert.equal(gate.blockedResult!.stages.length, 0);
});

test("D: gating on Payoneer's available marketplace-payout capability allows proceeding", () => {
  const gate = gateOnEligibility(payoneerMarketplaceAvailable, toMinorUnits(1000), "USD");
  assert.equal(gate.proceed, true);
  assert.equal(gate.blockedResult, undefined);
});

test("E: buildReferenceConversionStage is always \"reference\", never \"exact\"", () => {
  const stage = buildReferenceConversionStage(toMinorUnits(900), "USD", usdToPkr);
  assert.equal(stage.status, "reference");
  assert.notEqual(stage.status, "exact");
});

test("E: a composed transaction including a reference conversion is never overall \"exact\"", () => {
  const platformStage = buildPlatformFeeStage(toMinorUnits(1000), "USD", direct);
  const fxStage = buildReferenceConversionStage(
    platformStage.resultAmountMinorUnits!,
    "USD",
    usdToPkr
  );
  const composed = composeTransaction(toMinorUnits(1000), "USD", [platformStage, fxStage]);
  assert.equal(composed.status, "reference");
  assert.notEqual(composed.status, "exact");
});

test("F: USD, EUR, and GBP same-currency Payoneer scenarios each keep their own currency", () => {
  const usdStage = buildProviderFeeStage(toMinorUnits(1000), "USD", usdSameCurrency);
  const eurStage = buildProviderFeeStage(toMinorUnits(1000), "EUR", eurSameCurrency);
  const gbpStage = buildProviderFeeStage(toMinorUnits(1000), "GBP", gbpSameCurrency);

  assert.equal(usdStage.resultCurrency, "USD");
  assert.equal(eurStage.resultCurrency, "EUR");
  assert.equal(gbpStage.resultCurrency, "GBP");
  assert.equal(usdStage.feeMinorUnits, 150);
  assert.equal(eurStage.feeMinorUnits, 150);
  assert.equal(gbpStage.feeMinorUnits, 150);
});

test("G/H: a fixed fee larger than the gross amount is rejected, not silently clamped to zero/negative", () => {
  assert.throws(() => buildProviderFeeStage(100, "USD", usdSameCurrency));
});

test("I: a zero gross amount produces a zero fee, not an error, for an exact percentage scenario", () => {
  const stage = buildPlatformFeeStage(0, "USD", direct);
  assert.equal(stage.status, "exact");
  assert.equal(stage.feeMinorUnits, 0);
  assert.equal(stage.resultAmountMinorUnits, 0);
});

test("I: a negative gross amount is rejected", () => {
  assert.throws(() => buildPlatformFeeStage(-500, "USD", direct));
  assert.throws(() => buildProviderFeeStage(-500, "USD", usdSameCurrency));
});

test("J: a provider stage built on a platform stage's result deducts from the reduced amount, not the original gross", () => {
  const gross = toMinorUnits(1000);
  const platformStage = buildPlatformFeeStage(gross, "USD", direct);
  assert.equal(platformStage.resultAmountMinorUnits, 95000);

  const providerStage = buildProviderFeeStage(
    platformStage.resultAmountMinorUnits!,
    "USD",
    usdSameCurrency
  );

  assert.equal(providerStage.inputAmountMinorUnits, 95000);
  assert.notEqual(providerStage.inputAmountMinorUnits, gross);
  assert.equal(providerStage.feeMinorUnits, 150);
  assert.equal(providerStage.resultAmountMinorUnits, 95000 - 150);

  const composed = composeTransaction(gross, "USD", [platformStage, providerStage]);
  assert.equal(composed.status, "exact");
  assert.equal(composed.finalAmountMinorUnits, gross - 5000 - 150);
});

test("composeTransaction: an empty stage list is exact and returns the input amount unchanged", () => {
  const composed = composeTransaction(toMinorUnits(500), "USD", []);
  assert.equal(composed.status, "exact");
  assert.equal(composed.finalAmountMinorUnits, toMinorUnits(500));
  assert.equal(composed.finalCurrency, "USD");
});

test("composeTransaction: including a ceiling-status stage makes the overall result not_calculable with no final amount", () => {
  const platformStage = buildPlatformFeeStage(toMinorUnits(1000), "USD", direct);
  const providerStage = buildProviderFeeStage(
    platformStage.resultAmountMinorUnits!,
    "USD",
    crossCurrencyVariable
  );
  const composed = composeTransaction(toMinorUnits(1000), "USD", [platformStage, providerStage]);
  assert.equal(composed.status, "not_calculable");
  assert.equal(composed.finalAmountMinorUnits, undefined);
  assert.ok(composed.limitations.length > 0);
});

test("composeTransaction: limitations list cites the non-exact stage's own explanation", () => {
  const providerStage = buildProviderFeeStage(toMinorUnits(1000), "USD", crossCurrencyVariable);
  const composed = composeTransaction(toMinorUnits(1000), "USD", [providerStage]);
  assert.ok(composed.limitations.some((l) => l.includes(providerStage.explanation)));
});

test("applies multiple exact fee stages sequentially (testing the generic composition primitive — not a real provider's combined fee rule)", () => {
  const gross = toMinorUnits(1000);

  const firstFeeScenario: FeeScenario = {
    id: "test-sequential-first",
    provider: "Test",
    name: "Test first-stage fee",
    description: "Fixture only — does not represent a real provider.",
    feeType: "percentage",
    percentage: 0.1,
    status: "verified",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-19" },
  };
  const secondFeeScenario: FeeScenario = {
    id: "test-sequential-second",
    provider: "Test",
    name: "Test second-stage fee",
    description: "Fixture only — does not represent a real provider.",
    feeType: "fixed",
    fixedAmountMinorUnits: 200,
    status: "verified",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-19" },
  };

  const firstStage = buildPlatformFeeStage(gross, "USD", firstFeeScenario);
  const secondStage = buildProviderFeeStage(
    firstStage.resultAmountMinorUnits!,
    "USD",
    secondFeeScenario
  );
  const composed = composeTransaction(gross, "USD", [firstStage, secondStage]);

  assert.equal(composed.status, "exact");
  assert.equal(composed.finalAmountMinorUnits, gross - 10000 - 200);
  assert.equal(composed.finalAmountMinorUnits, 89800);
});
