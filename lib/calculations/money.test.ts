import { test } from "node:test";
import assert from "node:assert/strict";
import { toMinorUnits, fromMinorUnits, applyPercentage } from "./money.ts";

test("toMinorUnits converts a whole dollar amount", () => {
  assert.equal(toMinorUnits(500), 50000);
});

test("toMinorUnits rounds fractional cents to the nearest cent", () => {
  assert.equal(toMinorUnits(19.999), 2000); // rounds up
  assert.equal(toMinorUnits(19.994), 1999); // rounds down
});

test("toMinorUnits handles zero", () => {
  assert.equal(toMinorUnits(0), 0);
});

test("toMinorUnits rejects non-finite input", () => {
  assert.throws(() => toMinorUnits(NaN));
  assert.throws(() => toMinorUnits(Infinity));
});

test("fromMinorUnits converts back to a decimal amount", () => {
  assert.equal(fromMinorUnits(50000), 500);
  assert.equal(fromMinorUnits(1999), 19.99);
});

test("applyPercentage computes a percentage of an integer amount", () => {
  assert.equal(applyPercentage(50000, 0.1), 5000);
});

test("applyPercentage handles 0%", () => {
  assert.equal(applyPercentage(50000, 0), 0);
});

test("applyPercentage rounds to the nearest minor unit", () => {
  assert.equal(applyPercentage(1999, 0.15), 300);
});

test("applyPercentage rejects a negative percentage", () => {
  assert.throws(() => applyPercentage(1000, -0.1));
});
