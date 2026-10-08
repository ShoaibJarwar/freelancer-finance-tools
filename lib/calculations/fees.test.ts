import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateFeeAmount } from "./fees.ts";
import { toMinorUnits } from "./money.ts";
import type { FeeScenario } from "../../types/financial.ts";
import { upworkFeeScenarios } from "../../data/providers/upwork.ts";

const marketplaceScenario = upworkFeeScenarios.find(
  (s) => s.id === "upwork-marketplace-standard"
)!;
const directContractsScenario = upworkFeeScenarios.find(
  (s) => s.id === "upwork-direct-contracts"
)!;
const directContractsPlusScenario = upworkFeeScenarios.find(
  (s) => s.id === "upwork-direct-contracts-freelancer-plus"
)!;

test("fixture scenarios exist in the Upwork dataset", () => {
  assert.ok(marketplaceScenario, "marketplace scenario should exist");
  assert.ok(directContractsScenario, "direct contracts scenario should exist");
  assert.ok(directContractsPlusScenario, "direct contracts (Plus) scenario should exist");
});

test("calculateFeeAmount handles a zero gross amount", () => {
  const result = calculateFeeAmount(0, directContractsScenario);
  assert.equal(result.grossMinorUnits, 0);
  assert.equal(result.feeMinorUnits, 0);
  assert.equal(result.netMinorUnits, 0);
});

test("calculateFeeAmount applies Direct Contracts' flat 5% fee", () => {
  const gross = toMinorUnits(500);
  const result = calculateFeeAmount(gross, directContractsScenario);
  assert.equal(result.appliedPercentage, 0.05);
  assert.equal(result.feeMinorUnits, 2500);
  assert.equal(result.netMinorUnits, 47500);
});

test("calculateFeeAmount applies Direct Contracts (Freelancer Plus)'s 0% fee", () => {
  const gross = toMinorUnits(500);
  const result = calculateFeeAmount(gross, directContractsPlusScenario);
  assert.equal(result.feeMinorUnits, 0);
  assert.equal(result.netMinorUnits, gross);
});

test("calculateFeeAmount requires selectedPercentage for a range scenario (marketplace)", () => {
  const gross = toMinorUnits(500);
  assert.throws(
    () => calculateFeeAmount(gross, marketplaceScenario),
    /selectedPercentage/,
    "should refuse to guess a rate within Upwork's 0%-15% marketplace range"
  );
});

test("calculateFeeAmount rejects a selectedPercentage outside the verified range", () => {
  const gross = toMinorUnits(500);
  assert.throws(() =>
    calculateFeeAmount(gross, marketplaceScenario, { selectedPercentage: 0.2 })
  );
  assert.throws(() =>
    calculateFeeAmount(gross, marketplaceScenario, { selectedPercentage: -0.01 })
  );
});

test("calculateFeeAmount accepts a valid selectedPercentage within the range", () => {
  const gross = toMinorUnits(500);
  const result = calculateFeeAmount(gross, marketplaceScenario, {
    selectedPercentage: 0.1,
  });
  assert.equal(result.feeMinorUnits, 5000);
  assert.equal(result.netMinorUnits, 45000);
});

test("calculateFeeAmount accepts the boundary values of a range", () => {
  const gross = toMinorUnits(500);
  const atZero = calculateFeeAmount(gross, marketplaceScenario, { selectedPercentage: 0 });
  const atMax = calculateFeeAmount(gross, marketplaceScenario, { selectedPercentage: 0.15 });
  assert.equal(atZero.feeMinorUnits, 0);
  assert.equal(atMax.feeMinorUnits, 7500);
});

test("calculateFeeAmount rejects a negative gross amount", () => {
  assert.throws(() => calculateFeeAmount(-100, directContractsScenario));
});

test("calculateFeeAmount rounds fee to the nearest minor unit", () => {
  const result = calculateFeeAmount(1999, directContractsScenario);
  assert.equal(result.feeMinorUnits, 100);
  assert.equal(result.netMinorUnits, 1899);
});

test("calculateFeeAmount throws for an unsupported fee type", () => {
  const fixedScenario: FeeScenario = {
    id: "test-fixed",
    provider: "Test",
    name: "Test fixed fee",
    description: "Fixture only — not real data.",
    feeType: "fixed",
    fixedAmountMinorUnits: 200,
    status: "estimated",
    source: { name: "Test fixture", url: "https://example.com", verifiedAt: "2026-09-14" },
  };
  assert.throws(() => calculateFeeAmount(1000, fixedScenario), /only supports "percentage"/);
});

test("calculateFeeAmount rejects a non-finite selectedPercentage for a range scenario", () => {
  const gross = toMinorUnits(500);
  assert.throws(() =>
    calculateFeeAmount(gross, marketplaceScenario, { selectedPercentage: NaN })
  );
  assert.throws(() =>
    calculateFeeAmount(gross, marketplaceScenario, { selectedPercentage: Infinity })
  );
});
