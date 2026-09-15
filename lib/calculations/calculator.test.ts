import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateCalculatorResult } from "./calculator.ts";
import { upworkFeeScenarios } from "../../data/providers/upwork.ts";
import { fxReferenceRates } from "../../data/fx/reference-rates.ts";

const marketplace = upworkFeeScenarios.find((s) => s.id === "upwork-marketplace-standard")!;
const direct = upworkFeeScenarios.find((s) => s.id === "upwork-direct-contracts")!;
const directPlus = upworkFeeScenarios.find(
  (s) => s.id === "upwork-direct-contracts-freelancer-plus"
)!;
const usdToPkr = fxReferenceRates.find((r) => r.id === "usd-pkr-sbp-reference")!;

test("Marketplace at 0% keeps the full amount", () => {
  const result = calculateCalculatorResult({
    grossAmount: 500,
    scenario: marketplace,
    selectedPercentage: 0,
  });
  assert.equal(result.fee.feeMinorUnits, 0);
  assert.equal(result.fee.netMinorUnits, 50000);
});

test("Marketplace at 15% (the verified maximum) applies the full range ceiling", () => {
  const result = calculateCalculatorResult({
    grossAmount: 500,
    scenario: marketplace,
    selectedPercentage: 0.15,
  });
  assert.equal(result.fee.feeMinorUnits, 7500);
  assert.equal(result.fee.netMinorUnits, 42500);
});

test("Marketplace at a middle percentage (10%) calculates correctly", () => {
  const result = calculateCalculatorResult({
    grossAmount: 500,
    scenario: marketplace,
    selectedPercentage: 0.1,
  });
  assert.equal(result.fee.feeMinorUnits, 5000);
  assert.equal(result.fee.netMinorUnits, 45000);
});

test("Marketplace without a selectedPercentage is rejected rather than assumed", () => {
  assert.throws(() => calculateCalculatorResult({ grossAmount: 500, scenario: marketplace }));
});

test("Direct Contracts applies the standard flat 5%", () => {
  const result = calculateCalculatorResult({ grossAmount: 500, scenario: direct });
  assert.equal(result.fee.appliedPercentage, 0.05);
  assert.equal(result.fee.feeMinorUnits, 2500);
  assert.equal(result.fee.netMinorUnits, 47500);
});

test("Direct Contracts (Freelancer Plus) applies the flat 0%", () => {
  const result = calculateCalculatorResult({ grossAmount: 500, scenario: directPlus });
  assert.equal(result.fee.appliedPercentage, 0);
  assert.equal(result.fee.feeMinorUnits, 0);
  assert.equal(result.fee.netMinorUnits, 50000);
});

test("A zero gross amount produces a zero result", () => {
  const result = calculateCalculatorResult({ grossAmount: 0, scenario: direct });
  assert.equal(result.fee.feeMinorUnits, 0);
  assert.equal(result.fee.netMinorUnits, 0);
});

test("A decimal gross amount is handled without floating-point drift", () => {
  const result = calculateCalculatorResult({ grossAmount: 499.99, scenario: direct });
  // 5% of $499.99 (49999 cents) = 2499.95 -> rounds to 2500
  assert.equal(result.fee.feeMinorUnits, 2500);
  assert.equal(result.fee.netMinorUnits, 47499);
});

test("A negative gross amount is rejected", () => {
  assert.throws(() => calculateCalculatorResult({ grossAmount: -500, scenario: direct }));
});

test("No conversion is returned when no reference rate is supplied", () => {
  const result = calculateCalculatorResult({ grossAmount: 500, scenario: direct });
  assert.equal(result.conversion, undefined);
});

test("A reference rate converts the post-fee amount, in the USD -> PKR direction, marked reference-only", () => {
  const result = calculateCalculatorResult({
    grossAmount: 500,
    scenario: direct,
    referenceRate: usdToPkr,
  });
  assert.ok(result.conversion);
  assert.equal(result.conversion!.isReferenceOnly, true);
  // Converts the NET (post-fee) amount, not the gross amount.
  assert.equal(result.conversion!.inputMinorUnits, result.fee.netMinorUnits);
  assert.equal(
    result.conversion!.outputMinorUnits,
    Math.round(result.fee.netMinorUnits * usdToPkr.rate)
  );
});
