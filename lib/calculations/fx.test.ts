import { test } from "node:test";
import assert from "node:assert/strict";
import { convertUsingReferenceRate } from "./fx.ts";
import { toMinorUnits } from "./money.ts";
import { fxReferenceRates } from "../../data/fx/reference-rates.ts";

const usdToPkr = fxReferenceRates.find((r) => r.id === "usd-pkr-sbp-reference")!;

test("fixture reference rate exists", () => {
  assert.ok(usdToPkr, "usd-pkr-sbp-reference should exist in the dataset");
  assert.equal(usdToPkr.isLive, false);
});

test("convertUsingReferenceRate converts a zero amount", () => {
  const result = convertUsingReferenceRate(0, usdToPkr);
  assert.equal(result.outputMinorUnits, 0);
});

test("convertUsingReferenceRate converts a normal amount and flags it as reference-only", () => {
  const input = toMinorUnits(100); // $100.00
  const result = convertUsingReferenceRate(input, usdToPkr);
  assert.equal(result.isReferenceOnly, true);
  assert.equal(result.rate, usdToPkr.rate);
  // 100 * 277.3228 = 27732.28 -> minor units, rounded
  assert.equal(result.outputMinorUnits, Math.round(input * usdToPkr.rate));
});

test("convertUsingReferenceRate rejects a negative input amount", () => {
  assert.throws(() => convertUsingReferenceRate(-100, usdToPkr));
});

test("convertUsingReferenceRate rejects a reference rate with an invalid rate value", () => {
  const badRate = { ...usdToPkr, rate: 0 };
  assert.throws(() => convertUsingReferenceRate(1000, badRate));
});
