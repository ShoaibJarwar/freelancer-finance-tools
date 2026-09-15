import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAmountInput, validatePercentageInput } from "./validation.ts";

test("validateAmountInput rejects empty input", () => {
  const result = validateAmountInput("");
  assert.equal(result.valid, false);
});

test("validateAmountInput rejects whitespace-only input", () => {
  const result = validateAmountInput("   ");
  assert.equal(result.valid, false);
});

test("validateAmountInput rejects non-numeric characters", () => {
  assert.equal(validateAmountInput("abc").valid, false);
  assert.equal(validateAmountInput("$500").valid, false);
  assert.equal(validateAmountInput("500,00").valid, false);
});

test("validateAmountInput rejects a negative amount", () => {
  assert.equal(validateAmountInput("-100").valid, false);
});

test("validateAmountInput rejects zero", () => {
  assert.equal(validateAmountInput("0").valid, false);
});

test("validateAmountInput accepts a whole number", () => {
  const result = validateAmountInput("500");
  assert.deepEqual(result, { valid: true, value: 500 });
});

test("validateAmountInput accepts a decimal amount", () => {
  const result = validateAmountInput("499.99");
  assert.deepEqual(result, { valid: true, value: 499.99 });
});

test("validateAmountInput rejects more than two decimal places", () => {
  assert.equal(validateAmountInput("500.123").valid, false);
});

test("validatePercentageInput rejects empty input", () => {
  const result = validatePercentageInput("", { min: 0, max: 0.15 });
  assert.equal(result.valid, false);
});

test("validatePercentageInput rejects a value below the range", () => {
  const result = validatePercentageInput("-1", { min: 0, max: 0.15 });
  assert.equal(result.valid, false);
});

test("validatePercentageInput rejects a value above the range", () => {
  const result = validatePercentageInput("20", { min: 0, max: 0.15 });
  assert.equal(result.valid, false);
});

test("validatePercentageInput accepts the lower boundary", () => {
  const result = validatePercentageInput("0", { min: 0, max: 0.15 });
  assert.deepEqual(result, { valid: true, value: 0 });
});

test("validatePercentageInput accepts the upper boundary", () => {
  const result = validatePercentageInput("15", { min: 0, max: 0.15 });
  assert.deepEqual(result, { valid: true, value: 0.15 });
});

test("validatePercentageInput accepts a mid-range decimal percentage", () => {
  const result = validatePercentageInput("9.5", { min: 0, max: 0.15 });
  assert.deepEqual(result, { valid: true, value: 0.095 });
});
