import { test } from "node:test";
import assert from "node:assert/strict";
import type { FeeScenario, EligibilityRecord } from "../../types/financial.ts";
import { upworkFeeScenarios } from "../../data/providers/upwork.ts";
import { wiseFeeScenarios, wiseEligibility } from "../../data/providers/wise.ts";
import { payoneerFeeScenarios, payoneerEligibility } from "../../data/providers/payoneer.ts";
import { fxReferenceRates } from "../../data/fx/reference-rates.ts";

const VALID_CURRENCIES = new Set(["USD", "PKR", "EUR", "GBP", "AED"]);

const allFeeScenarios: FeeScenario[] = [
  ...upworkFeeScenarios,
  ...wiseFeeScenarios,
  ...payoneerFeeScenarios,
];

const allEligibilityRecords: EligibilityRecord[] = [...wiseEligibility, ...payoneerEligibility];

test("every FeeScenario has a non-empty id, provider, and name", () => {
  for (const scenario of allFeeScenarios) {
    assert.ok(scenario.id.trim().length > 0, `scenario missing id: ${JSON.stringify(scenario)}`);
    assert.ok(scenario.provider.trim().length > 0, `scenario "${scenario.id}" missing provider`);
    assert.ok(scenario.name.trim().length > 0, `scenario "${scenario.id}" missing name`);
  }
});

test("every FeeScenario id is unique across all providers", () => {
  const ids = allFeeScenarios.map((s) => s.id);
  const unique = new Set(ids);
  assert.equal(unique.size, ids.length, "duplicate scenario id found");
});

test("no FeeScenario has a negative exact percentage", () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.percentage !== undefined) {
      assert.ok(scenario.percentage >= 0, `scenario "${scenario.id}" has a negative percentage`);
    }
  }
});

test("no FeeScenario has a negative fixedAmountMinorUnits", () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.fixedAmountMinorUnits !== undefined) {
      assert.ok(
        scenario.fixedAmountMinorUnits >= 0,
        `scenario "${scenario.id}" has a negative fixedAmountMinorUnits`
      );
    }
  }
});

test("every percentageRange has min <= max and both within [0, 1]", () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.percentageRange) {
      const { min, max } = scenario.percentageRange;
      assert.ok(min >= 0, `scenario "${scenario.id}" percentageRange.min is negative`);
      assert.ok(max >= 0, `scenario "${scenario.id}" percentageRange.max is negative`);
      assert.ok(
        min <= max,
        `scenario "${scenario.id}" percentageRange.min (${min}) exceeds max (${max})`
      );
      assert.ok(max <= 1, `scenario "${scenario.id}" percentageRange.max exceeds 100%`);
    }
  }
});

test("every maxPercentage (variable-fee ceiling) is non-negative and at most 1", () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.maxPercentage !== undefined) {
      assert.ok(scenario.maxPercentage >= 0, `scenario "${scenario.id}" has a negative maxPercentage`);
      assert.ok(scenario.maxPercentage <= 1, `scenario "${scenario.id}" maxPercentage exceeds 100%`);
    }
  }
});

// --- Phase H.1: fee-type/field-combination invariants ---

test('maxPercentage may only be set on a "variable" scenario (semantically ambiguous on fixed/percentage otherwise)', () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.maxPercentage !== undefined) {
      assert.equal(
        scenario.feeType,
        "variable",
        `scenario "${scenario.id}" has maxPercentage set but feeType is "${scenario.feeType}", not "variable"`
      );
    }
  }
});

test('a "variable" scenario never carries percentage, percentageRange, or fixedAmountMinorUnits — only maxPercentage represents it', () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.feeType === "variable") {
      assert.equal(
        scenario.percentage,
        undefined,
        `scenario "${scenario.id}" is "variable" but also has an exact percentage set`
      );
      assert.equal(
        scenario.percentageRange,
        undefined,
        `scenario "${scenario.id}" is "variable" but also has a percentageRange set`
      );
      assert.equal(
        scenario.fixedAmountMinorUnits,
        undefined,
        `scenario "${scenario.id}" is "variable" but also has a fixedAmountMinorUnits set`
      );
    }
  }
});

test('a "fixed" scenario has fixedAmountMinorUnits set, and no percentage/percentageRange/maxPercentage', () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.feeType === "fixed") {
      assert.notEqual(
        scenario.fixedAmountMinorUnits,
        undefined,
        `scenario "${scenario.id}" is "fixed" but has no fixedAmountMinorUnits`
      );
      assert.equal(
        scenario.percentage,
        undefined,
        `scenario "${scenario.id}" is "fixed" but also has an exact percentage set`
      );
      assert.equal(
        scenario.percentageRange,
        undefined,
        `scenario "${scenario.id}" is "fixed" but also has a percentageRange set`
      );
      assert.equal(
        scenario.maxPercentage,
        undefined,
        `scenario "${scenario.id}" is "fixed" but also has a maxPercentage set`
      );
    }
  }
});

test('a "percentage" scenario has exactly one of percentage or percentageRange set, and no fixedAmountMinorUnits/maxPercentage', () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.feeType === "percentage") {
      const hasExact = scenario.percentage !== undefined;
      const hasRange = scenario.percentageRange !== undefined;
      assert.ok(
        hasExact || hasRange,
        `scenario "${scenario.id}" is "percentage" but has neither percentage nor percentageRange`
      );
      assert.ok(
        !(hasExact && hasRange),
        `scenario "${scenario.id}" is "percentage" but has BOTH an exact percentage and a percentageRange — ambiguous`
      );
      assert.equal(
        scenario.fixedAmountMinorUnits,
        undefined,
        `scenario "${scenario.id}" is "percentage" but also has a fixedAmountMinorUnits set`
      );
      assert.equal(
        scenario.maxPercentage,
        undefined,
        `scenario "${scenario.id}" is "percentage" but also has a maxPercentage set`
      );
    }
  }
});

test("every scenario's currency, when set, is one this project recognizes", () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.currency !== undefined) {
      assert.ok(
        VALID_CURRENCIES.has(scenario.currency),
        `scenario "${scenario.id}" has an unrecognized currency: ${scenario.currency}`
      );
    }
  }
});

test('every "verified" or "reference" FeeScenario has a source with a non-empty https URL and verifiedAt date', () => {
  for (const scenario of allFeeScenarios) {
    if (scenario.status === "verified" || scenario.status === "reference") {
      assert.ok(scenario.source, `scenario "${scenario.id}" is ${scenario.status} but has no source`);
      assert.ok(
        /^https:\/\//.test(scenario.source.url),
        `scenario "${scenario.id}" source URL is not a valid https URL: ${scenario.source.url}`
      );
      assert.ok(
        scenario.source.verifiedAt.trim().length > 0,
        `scenario "${scenario.id}" source has no verifiedAt date`
      );
    }
  }
});

test('no FeeScenario in the current data set has status "deprecated" (would need explicit exclusion from active use if one is ever added)', () => {
  for (const scenario of allFeeScenarios) {
    assert.notEqual(
      scenario.status,
      "deprecated",
      `scenario "${scenario.id}" is deprecated — deprecated scenarios must not be included in allFeeScenarios/active data without being explicitly filtered out by callers`
    );
  }
});

test("every EligibilityRecord has a non-empty provider, country, and statusDetail", () => {
  for (const record of allEligibilityRecords) {
    assert.ok(record.provider.trim().length > 0, "eligibility record missing provider");
    assert.ok(record.country.trim().length > 0, `${record.provider} record missing country`);
    assert.ok(record.statusDetail.trim().length > 0, `${record.provider} record missing statusDetail`);
  }
});

test("every EligibilityRecord has at least one source, each with a valid https URL", () => {
  for (const record of allEligibilityRecords) {
    assert.ok(
      record.sources.length > 0,
      `${record.provider}/${record.country}/${record.capability} has no sources`
    );
    for (const source of record.sources) {
      assert.ok(
        /^https:\/\//.test(source.url),
        `${record.provider}/${record.country}/${record.capability} source URL is invalid: ${source.url}`
      );
    }
  }
});

test('an "unresolved" EligibilityRecord (a project-level conclusion) still cites the sources its inference is drawn from', () => {
  for (const record of allEligibilityRecords) {
    if (record.status === "unresolved") {
      assert.ok(
        record.sources.length > 0,
        `${record.provider}/${record.country}/${record.capability} is unresolved but cites no underlying sources`
      );
    }
  }
});

test("FxReferenceRate entries remain valid (existing Phase E invariant, re-checked here)", () => {
  for (const rate of fxReferenceRates) {
    assert.ok(rate.rate > 0, `rate "${rate.id}" is not positive`);
    assert.equal(rate.isLive, false, `rate "${rate.id}" must not be marked live`);
    assert.ok(/^https:\/\//.test(rate.source.url), `rate "${rate.id}" source URL is invalid`);
  }
});
