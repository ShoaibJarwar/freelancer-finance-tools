import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseComparisonUrlState,
  serializeComparisonUrlState,
  DEFAULT_COMPARISON_STATE,
  type ComparisonUrlState,
} from "./comparisonUrlState.ts";
import { validateAmountInput, validatePercentageInput } from "./validation.ts";
import { upworkFeeScenarios } from "../../data/providers/upwork.ts";

const marketplaceRange = upworkFeeScenarios.find(
  (s) => s.id === "upwork-marketplace-standard"
)!.percentageRange!;

function paramsFrom(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

test("parses a full valid Marketplace state", () => {
  const state = parseComparisonUrlState(
    paramsFrom("amount=1000&contract=marketplace&fee=10&reference=pk")
  );
  assert.deepEqual(state, {
    amount: "1000",
    contract: "marketplace",
    fee: "10",
    plus: false,
    reference: true,
  });
});

test("parses a Direct Contract state without Freelancer Plus", () => {
  const state = parseComparisonUrlState(paramsFrom("amount=500&contract=direct"));
  assert.equal(state.contract, "direct");
  assert.equal(state.plus, false);
  assert.equal(state.fee, "");
});

test("parses a Direct Contract state with Freelancer Plus", () => {
  const state = parseComparisonUrlState(paramsFrom("amount=500&contract=direct&plus=1"));
  assert.equal(state.contract, "direct");
  assert.equal(state.plus, true);
});

test("plus=1 is ignored when contract is marketplace (not applicable)", () => {
  const state = parseComparisonUrlState(paramsFrom("amount=500&contract=marketplace&plus=1"));
  assert.equal(state.plus, false);
});

test("invalid amount strings pass through as raw strings, and are rejected by the same validator used for typed input", () => {
  const invalidAmounts = ["-100", "abc", "NaN", "Infinity", "0", "1000.999", ""];
  for (const raw of invalidAmounts) {
    const state = parseComparisonUrlState(paramsFrom(`amount=${encodeURIComponent(raw)}`));
    assert.equal(state.amount, raw);
    const result = validateAmountInput(state.amount);
    assert.equal(result.valid, false, `expected "${raw}" to be rejected by validateAmountInput`);
  }
});

test("invalid fee strings pass through as raw strings, and are rejected by the same validator used for typed input", () => {
  const invalidFees = ["999", "-1", "NaN", "Infinity", "16", "-0.01"];
  for (const raw of invalidFees) {
    const state = parseComparisonUrlState(
      paramsFrom(`amount=1000&contract=marketplace&fee=${encodeURIComponent(raw)}`)
    );
    assert.equal(state.fee, raw);
    const result = validatePercentageInput(state.fee, marketplaceRange);
    assert.equal(result.valid, false, `expected fee "${raw}" to be rejected by validatePercentageInput`);
  }
});

test("a valid fee at the verified boundaries is accepted by the downstream validator", () => {
  for (const raw of ["0", "15"]) {
    const state = parseComparisonUrlState(
      paramsFrom(`amount=1000&contract=marketplace&fee=${raw}`)
    );
    const result = validatePercentageInput(state.fee, marketplaceRange);
    assert.equal(result.valid, true, `expected fee "${raw}" to be accepted`);
  }
});

test("an unknown contract value falls back to marketplace, never an invalid scenario", () => {
  const state = parseComparisonUrlState(paramsFrom("amount=1000&contract=whatever"));
  assert.equal(state.contract, "marketplace");
});

test("a missing contract value falls back to marketplace", () => {
  const state = parseComparisonUrlState(paramsFrom("amount=1000"));
  assert.equal(state.contract, "marketplace");
});

test("an empty query string parses to the documented defaults", () => {
  const state = parseComparisonUrlState(paramsFrom(""));
  assert.deepEqual(state, DEFAULT_COMPARISON_STATE);
});

test("unrecognized query parameters are ignored and don't affect the parsed state", () => {
  const state = parseComparisonUrlState(
    paramsFrom("amount=1000&contract=marketplace&fee=10&utm_source=twitter&foo=bar")
  );
  assert.deepEqual(state, {
    amount: "1000",
    contract: "marketplace",
    fee: "10",
    plus: false,
    reference: false,
  });
});

test("reference values other than the exact supported one are treated as disabled", () => {
  for (const raw of ["true", "1", "yes", "USD", ""]) {
    const state = parseComparisonUrlState(paramsFrom(`amount=1000&reference=${raw}`));
    assert.equal(state.reference, false, `expected reference="${raw}" to be treated as off`);
  }
});

test("round trip: serialize(parse(x)) reproduces the same meaningful state for a Marketplace URL", () => {
  const original = paramsFrom("amount=1000&contract=marketplace&fee=10&reference=pk");
  const parsed = parseComparisonUrlState(original);
  const reserialized = parseComparisonUrlState(serializeComparisonUrlState(parsed));
  assert.deepEqual(reserialized, parsed);
});

test("round trip: serialize(parse(x)) reproduces the same meaningful state for a Direct Contract + Plus URL", () => {
  const original = paramsFrom("amount=750.50&contract=direct&plus=1&reference=pk");
  const parsed = parseComparisonUrlState(original);
  const reserialized = parseComparisonUrlState(serializeComparisonUrlState(parsed));
  assert.deepEqual(reserialized, parsed);
});

test("round trip: an empty/default state serializes and reparses back to the same defaults", () => {
  const reserialized = parseComparisonUrlState(serializeComparisonUrlState(DEFAULT_COMPARISON_STATE));
  assert.deepEqual(reserialized, DEFAULT_COMPARISON_STATE);
});

test("serialization never includes a calculated amount, fee, exchange rate, or timestamp — only the four input keys", () => {
  const state: ComparisonUrlState = {
    amount: "1000",
    contract: "marketplace",
    fee: "10",
    plus: false,
    reference: true,
  };
  const params = serializeComparisonUrlState(state);
  const keys = Array.from(params.keys()).sort();
  assert.deepEqual(keys, ["amount", "contract", "fee", "reference"]);

  for (const forbidden of ["result", "net", "pkr", "payout", "rate", "timestamp", "fee_amount"]) {
    assert.equal(params.has(forbidden), false);
  }
});

test("serialization omits fee/plus/reference when they don't apply or are at their default", () => {
  const params = serializeComparisonUrlState(DEFAULT_COMPARISON_STATE);
  assert.equal(params.has("amount"), false);
  assert.equal(params.has("fee"), false);
  assert.equal(params.has("plus"), false);
  assert.equal(params.has("reference"), false);
  assert.equal(params.get("contract"), "marketplace");
});

test("serialization omits fee for Direct Contracts even if a stale fee value is present in state", () => {
  const state: ComparisonUrlState = {
    amount: "500",
    contract: "direct",
    fee: "10",
    plus: true,
    reference: false,
  };
  const params = serializeComparisonUrlState(state);
  assert.equal(params.has("fee"), false);
  assert.equal(params.get("plus"), "1");
});
