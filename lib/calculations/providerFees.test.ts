import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateProviderFee } from "./providerFees.ts";
import { toMinorUnits } from "./money.ts";
import { payoneerFeeScenarios } from "../../data/providers/payoneer.ts";
import type { FeeScenario } from "../../types/financial.ts";

const usdSameCurrencyFixed = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-usd-same-currency"
)!;
const eurSameCurrencyFixed = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-eur-same-currency"
)!;
const gbpSameCurrencyFixed = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-gbp-same-currency"
)!;
const crossCurrencyVariable = payoneerFeeScenarios.find(
  (s) => s.id === "payoneer-withdrawal-cross-currency-variable"
)!;

test("verified percentage fee: calculates correctly", () => {
  const scenario: FeeScenario = {
    id: "test-percentage",
    provider: "Test",
    name: "Test percentage fee",
    description: "Fixture only.",
    feeType: "percentage",
    percentage: 0.05,
    status: "verified",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
  };
  const result = evaluateProviderFee(toMinorUnits(1000), scenario);
  assert.equal(result.calculable, true);
  if (result.calculable) {
    assert.equal(result.feeMinorUnits, 5000); // 5% of $1000
    assert.equal(result.netMinorUnits, 95000);
    assert.equal(result.appliedPercentage, 0.05);
  }
});

test("fixed fee: correct deduction, using the real Payoneer USD same-currency scenario", () => {
  const result = evaluateProviderFee(toMinorUnits(1000), usdSameCurrencyFixed);
  assert.equal(result.calculable, true);
  if (result.calculable) {
    assert.equal(result.feeMinorUnits, 150); // $1.50
    assert.equal(result.netMinorUnits, toMinorUnits(1000) - 150);
  }
});

test("fixed fee: the EUR and GBP same-currency scenarios use their own currency's 1.50, not a shared USD figure", () => {
  assert.equal(eurSameCurrencyFixed.currency, "EUR");
  assert.equal(gbpSameCurrencyFixed.currency, "GBP");
  assert.equal(eurSameCurrencyFixed.fixedAmountMinorUnits, 150);
  assert.equal(gbpSameCurrencyFixed.fixedAmountMinorUnits, 150);

  const eurResult = evaluateProviderFee(toMinorUnits(1000), eurSameCurrencyFixed);
  const gbpResult = evaluateProviderFee(toMinorUnits(1000), gbpSameCurrencyFixed);
  assert.equal(eurResult.calculable, true);
  assert.equal(gbpResult.calculable, true);
  if (eurResult.calculable) assert.equal(eurResult.feeMinorUnits, 150);
  if (gbpResult.calculable) assert.equal(gbpResult.feeMinorUnits, 150);
});

test("fixed fee: rejects a fee that exceeds the gross amount", () => {
  assert.throws(() => evaluateProviderFee(100, usdSameCurrencyFixed)); // $1.00 gross, $1.50 fee
});

test("composes two independently defined fee scenarios in sequence (testing the generic primitive — not a real provider's combined fixed+percentage rule)", () => {
  const gross = toMinorUnits(1000);
  const fixedResult = evaluateProviderFee(gross, usdSameCurrencyFixed);
  assert.equal(fixedResult.calculable, true);
  if (!fixedResult.calculable) return;

  const percentageScenario: FeeScenario = {
    id: "test-percentage-after-fixed",
    provider: "Test",
    name: "Test percentage fee applied after a fixed fee",
    description: "Fixture only — this scenario does not represent a real provider rule.",
    feeType: "percentage",
    percentage: 0.02,
    status: "verified",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
  };
  const combined = evaluateProviderFee(fixedResult.netMinorUnits, percentageScenario);
  assert.equal(combined.calculable, true);
  if (combined.calculable) {
    // (1000 - 1.50) * 2% applied on the remainder, composed via two calls
    assert.equal(combined.grossMinorUnits, gross - 150);
    assert.equal(combined.netMinorUnits, gross - 150 - combined.feeMinorUnits);
  }
});

const rangeScenario: FeeScenario = {
  id: "test-range",
  provider: "Test",
  name: "Test range fee",
  description: "Fixture only.",
  feeType: "percentage",
  percentageRange: { min: 0, max: 0.1 },
  status: "verified",
  source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
};

test("percentage fee range: rejects a missing selectedPercentage", () => {
  assert.throws(() => evaluateProviderFee(toMinorUnits(500), rangeScenario));
});

test("percentage fee range: accepts the lower boundary (min)", () => {
  const result = evaluateProviderFee(toMinorUnits(500), rangeScenario, { selectedPercentage: 0 });
  assert.equal(result.calculable, true);
  if (result.calculable) assert.equal(result.feeMinorUnits, 0);
});

test("percentage fee range: accepts the upper boundary (max)", () => {
  const result = evaluateProviderFee(toMinorUnits(500), rangeScenario, { selectedPercentage: 0.1 });
  assert.equal(result.calculable, true);
  if (result.calculable) assert.equal(result.feeMinorUnits, 5000); // 10% of $500
});

test("percentage fee range: rejects a selectedPercentage below the minimum", () => {
  assert.throws(() =>
    evaluateProviderFee(toMinorUnits(500), rangeScenario, { selectedPercentage: -0.01 })
  );
});

test("percentage fee range: rejects a selectedPercentage above the maximum — this is the Phase H.1 safety fix (previously allowed a 50% selection against a 0-10% range)", () => {
  assert.throws(() =>
    evaluateProviderFee(toMinorUnits(500), rangeScenario, { selectedPercentage: 0.5 })
  );
});

test("percentage fee range: rejects a negative selectedPercentage even though it would also fail the min check", () => {
  assert.throws(() =>
    evaluateProviderFee(toMinorUnits(500), rangeScenario, { selectedPercentage: -0.5 })
  );
});

test("variable fee: does not produce a falsely precise calculated result, using the real Payoneer cross-currency scenario", () => {
  const result = evaluateProviderFee(toMinorUnits(1000), crossCurrencyVariable);
  assert.equal(result.calculable, false);
  if (!result.calculable) {
    assert.equal(result.maxPercentage, 0.02);
    assert.match(result.reason, /quote/i);
  }
});

test('"unknown" fee type: reported as not calculable rather than silently producing $0', () => {
  const scenario: FeeScenario = {
    id: "test-unknown",
    provider: "Test",
    name: "Test unknown fee",
    description: "Fixture only.",
    feeType: "unknown",
    status: "estimated",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
  };
  const result = evaluateProviderFee(toMinorUnits(500), scenario);
  assert.equal(result.calculable, false);
});

test("rejects a negative gross amount", () => {
  assert.throws(() => evaluateProviderFee(-500, usdSameCurrencyFixed));
});

test("handles a zero gross amount for a percentage fee", () => {
  const scenario: FeeScenario = {
    id: "test-zero",
    provider: "Test",
    name: "Test zero",
    description: "Fixture only.",
    feeType: "percentage",
    percentage: 0.05,
    status: "verified",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
  };
  const result = evaluateProviderFee(0, scenario);
  assert.equal(result.calculable, true);
  if (result.calculable) {
    assert.equal(result.feeMinorUnits, 0);
    assert.equal(result.netMinorUnits, 0);
  }
});

test("rounding follows the project's existing minor-unit rounding policy (verified via a decimal amount)", () => {
  const scenario: FeeScenario = {
    id: "test-rounding",
    provider: "Test",
    name: "Test rounding",
    description: "Fixture only.",
    feeType: "percentage",
    percentage: 0.15,
    status: "verified",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
  };
  // 15% of $19.99 (1999 cents) = 299.85 -> rounds to 300, matching money.ts's existing behavior
  const result = evaluateProviderFee(1999, scenario);
  assert.equal(result.calculable, true);
  if (result.calculable) {
    assert.equal(result.feeMinorUnits, 300);
  }
});

test('an "estimated" percentage scenario is refused by default (Phase H.1 safety guard)', () => {
  const scenario: FeeScenario = {
    id: "test-estimated",
    provider: "Test",
    name: "Test estimated fee",
    description: "Fixture only.",
    feeType: "percentage",
    percentage: 0.03,
    status: "estimated",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
  };
  assert.throws(() => evaluateProviderFee(toMinorUnits(500), scenario));
});

test('an "estimated" scenario calculates only when allowEstimated is explicitly passed', () => {
  const scenario: FeeScenario = {
    id: "test-estimated-2",
    provider: "Test",
    name: "Test estimated fee",
    description: "Fixture only.",
    feeType: "percentage",
    percentage: 0.03,
    status: "estimated",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
  };
  const result = evaluateProviderFee(toMinorUnits(500), scenario, { allowEstimated: true });
  assert.equal(result.calculable, true);
});

test('a "deprecated" scenario is always refused, even with allowEstimated: true', () => {
  const scenario: FeeScenario = {
    id: "test-deprecated",
    provider: "Test",
    name: "Test deprecated fee",
    description: "Fixture only.",
    feeType: "percentage",
    percentage: 0.03,
    status: "deprecated",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
  };
  assert.throws(() => evaluateProviderFee(toMinorUnits(500), scenario, { allowEstimated: true }));
});

test('a "deprecated" fixed-fee scenario is also refused', () => {
  const scenario: FeeScenario = {
    id: "test-deprecated-fixed",
    provider: "Test",
    name: "Test deprecated fixed fee",
    description: "Fixture only.",
    feeType: "fixed",
    fixedAmountMinorUnits: 100,
    status: "deprecated",
    source: { name: "Test", url: "https://example.com", verifiedAt: "2026-09-16" },
  };
  assert.throws(() => evaluateProviderFee(toMinorUnits(500), scenario));
});
