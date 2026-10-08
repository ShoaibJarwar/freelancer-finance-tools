# Phase I — Calculation & Comparison Engine Design

Status: calculation infrastructure only. No comparison UI, no new routes, no new providers.

## 1. Purpose

Phases E–H.1 built verified financial *data* and per-scenario *calculation primitives* (`calculateFeeAmount`, `evaluateProviderFee`, `convertUsingReferenceRate`). Phase I adds the layer that chains several of those together into one transaction while tracking how certain the combined result actually is.

## 2. Transaction-stage model

A transaction is a sequence of `CalculationStage` objects (`platformFee`, `providerFee`, `referenceConversion`) built by `buildPlatformFeeStage`, `buildProviderFeeStage`, `buildReferenceConversionStage` — each a thin wrapper around an existing primitive.

## 3. Calculation statuses

```ts
type CalculationStatus = "exact" | "reference" | "ceiling" | "not_calculable" | "unresolved";
```

- **exact** — precise figure, no remaining uncertainty.
- **reference** — real computed figure, explicitly non-final.
- **ceiling** — only a published upper bound exists. Stage-level only.
- **not_calculable** — known to exist but can't be resolved to a number or bound.
- **unresolved** — whether the step applies is itself undetermined.

## 4. Status propagation

`combineStatus(a, b)` takes the more severe of two statuses by severity order (exact < reference < ceiling < not_calculable < unresolved), except a composed result is never `"ceiling"` — composing a ceiling-status stage with anything else collapses to `"not_calculable"`, since bounding a multi-stage total would need range arithmetic this engine doesn't implement.

`composeTransaction` sets `finalAmountMinorUnits` only when the folded status is `"exact"` or `"reference"`.

## 5. Platform-fee handling (Upwork)

`buildPlatformFeeStage` calls `calculateFeeAmount` unchanged. One bugfix found during inspection: the range check didn't reject non-finite (`NaN`/`Infinity`) `selectedPercentage` values — fixed with the same `Number.isFinite` guard `providerFees.ts` already had.

## 6. Provider-fee handling (Payoneer)

For the Pakistan cross-currency scenario (`maxPercentage: 0.02`), the stage comes back `status: "ceiling"` with no `feeMinorUnits`/`resultAmountMinorUnits` — the engine never computes `gross × 2%` as an actual fee.

## 7. Wise handling

`gateOnEligibility`, called before any fee stage, returns `proceed: false` and `blockedResult.status: "unresolved"` for Wise's Pakistan marketplace-payout record — never downgraded to `"unavailable"` or upgraded to a fake payout.

## 8. Reference FX handling

`buildReferenceConversionStage` has no code path returning `"exact"` — always `"reference"`.

## 9. What this engine intentionally does not calculate

- An exact Payoneer cross-currency fee.
- Anything for Wise in Pakistan.
- A compound ceiling/bound across multiple stages.
- Taxes, bank charges, or any unverified cost.
- A "final bank payout" figure.

## 10. Known limitations

- No range/interval arithmetic.
- `composeTransaction` trusts the caller to chain amounts correctly.
- Only USD/EUR/GBP (Payoneer) and USD→PKR (reference) are populated.
