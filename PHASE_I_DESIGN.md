# Phase I — Calculation & Comparison Engine Design

Status: calculation infrastructure only. No comparison UI, no new routes, no new providers. This document explains `lib/calculations/comparison.ts` and how it fits the existing calculation layer.

Throughout this document: **verified source-backed fact** = something an official source states, unchanged from Phase E/H/H.1. **Calculation-engine behavior** = something this project's code does with that data. **Future architecture** = not built yet, noted only as a pointer for later phases.

---

## 1. Purpose

Phases E–H.1 built verified financial *data* (Upwork fees, Payoneer fees, Wise eligibility, an SBP reference rate) and per-scenario *calculation primitives* (`calculateFeeAmount`, `evaluateProviderFee`, `convertUsingReferenceRate`). Each of those answers one question in isolation ("what's the fee for this one scenario?"). Phase I adds the layer that **chains several of those questions together** into one transaction (client payment → platform fee → provider fee → reference conversion) while keeping track of how certain the *combined* result actually is.

This is calculation-engine behavior, built entirely on top of already-verified facts — it introduces no new financial claims.

## 2. Transaction-stage model

A transaction is a sequence of `CalculationStage` objects (`platformFee`, `providerFee`, `referenceConversion`). Each stage:
- knows its own input amount/currency,
- knows what it deducted or converted (only when it actually could),
- knows its own `CalculationStatus`,
- carries the source(s) that back it,
- explains itself in plain language.

Stages are built by three functions, each a thin wrapper around an existing Phase E/H primitive:

| Builder | Wraps | Calculation-engine behavior |
|---|---|---|
| `buildPlatformFeeStage` | `calculateFeeAmount` (Phase E) | Reshapes the Upwork result into a stage. No new fee math. |
| `buildProviderFeeStage` | `evaluateProviderFee` (Phase H) | Reshapes the provider result into a stage; maps a not-calculable result with a published ceiling to status `"ceiling"`, and one without to `"not_calculable"`. |
| `buildReferenceConversionStage` | `convertUsingReferenceRate` (Phase E) | Always status `"reference"` — there is no code path in this function that returns `"exact"`, by construction. |

None of these duplicate Upwork/provider/FX math — they call the existing function and translate its result.

## 3. Calculation statuses (calculation-engine behavior)

```ts
type CalculationStatus = "exact" | "reference" | "ceiling" | "not_calculable" | "unresolved";
```

- **exact** — a precise figure, no remaining uncertainty at this stage.
- **reference** — a real, computed figure, explicitly non-final (built on reference-status data).
- **ceiling** — no exact figure; only a published upper bound exists (Payoneer's "up to 2%"). Stage-level only — see below.
- **not_calculable** — the step is real but this project's data can't resolve it to any number or bound.
- **unresolved** — whether the step even applies is itself undetermined (an eligibility question, not a math one).

## 4. Status propagation (calculation-engine behavior)

`combineStatus(a, b)` folds two statuses into one, using a severity order (exact < reference < ceiling < not_calculable < unresolved) and taking the more severe of the two — **except** that a composed result is never `"ceiling"`: composing a ceiling-status stage with anything else collapses to `"not_calculable"`, because turning one stage's bound into a bound on the *whole transaction's total* would require range arithmetic (adding/propagating intervals through subsequent stages), which this engine deliberately does not implement. A single stage can still report `"ceiling"` on its own — only the multi-stage composition avoids claiming it.

```
exact       + exact       = exact
exact       + reference   = reference
exact       + ceiling     = not_calculable   (ceiling never survives composition)
exact       + not_calculable = not_calculable
exact       + unresolved  = unresolved       (most severe — always wins)
```

`composeTransaction(inputAmount, inputCurrency, stages)` folds every stage's status via `combineStatus`, and sets `finalAmountMinorUnits`/`finalCurrency` **only** when the folded status is `"exact"` or `"reference"` — for every other status, those fields are `undefined`. This is the main safeguard against a future UI presenting a partial calculation as a finished payout: the field simply doesn't exist to display.

## 5. Platform-fee handling (Upwork)

Unchanged from Phase E/F. `buildPlatformFeeStage` calls `calculateFeeAmount`, which already: requires an explicit `selectedPercentage` within the verified 0–15% range for Marketplace contracts (never assumes a rate), and applies the flat 5%/0% Direct Contracts scenarios as-is. **Verified source-backed fact:** unchanged — see `data/providers/upwork.ts`. One bugfix found during inspection: `calculateFeeAmount`'s range check didn't reject non-finite (`NaN`/`Infinity`) `selectedPercentage` values (only `<`/`>` comparisons, which `NaN` silently passes). Fixed with the same `Number.isFinite` guard `providerFees.ts` already had. This is a calculation-engine correctness fix, not a change to any verified fact.

## 6. Provider-fee handling (Payoneer)

`buildProviderFeeStage` calls `evaluateProviderFee` as-is. For Payoneer's Pakistan cross-currency scenario (`feeType: "variable"`, `maxPercentage: 0.02`), the stage comes back `status: "ceiling"`, `maxPercentage: 0.02`, and **no** `feeMinorUnits`/`resultAmountMinorUnits` — the engine never computes `gross × 2%` and presents it as the fee. The USD/EUR/GBP same-currency fixed fees each produce an `"exact"` stage in their own currency (never a shared USD figure — this was the exact ambiguity Phase H.1 corrected in the data layer; Phase I just consumes it correctly).

## 7. Wise handling

Wise has no fee scenarios to evaluate (`wiseFeeScenarios` is empty — see Phase H.1). The engine handles this via `gateOnEligibility`, called *before* attempting any fee stage: given Wise's `receiveMarketplacePayouts` eligibility record (`status: "unresolved"`, a project-level conclusion per Phase H.1 — not a direct Wise statement), it returns `proceed: false` and a `blockedResult` with `status: "unresolved"`, zero stages, and no final amount. The engine never invents a Wise fee or silently reinterprets "unresolved" as "unavailable" — the status is carried through unchanged.

`gateOnEligibility`'s general mapping (calculation-engine behavior, not a new fact): `"available"` → proceed; `"unavailable"` → blocked with `"not_calculable"` (certain the service doesn't apply, so no number *or* bound is possible); `"restricted"`/`"unresolved"` → blocked with `"unresolved"`.

## 8. Reference FX handling

`buildReferenceConversionStage` always returns `status: "reference"` — there is no branch that produces `"exact"`. Its `explanation` field always states the reference-only caveat and cites the rate's `asOf` date. Composing a reference-conversion stage with otherwise-exact stages yields an overall `"reference"` result (never `"exact"`) — verified by a dedicated test (`combineStatus`'s table plus an end-to-end composed-transaction test).

## 9. What this engine intentionally does not calculate

- An exact Payoneer cross-currency (PKR) withdrawal fee — only its published ceiling.
- Anything for Wise in Pakistan — blocked at the eligibility gate.
- A compound ceiling/bound across multiple stages (e.g. "your total fees are at most X%") — composing a ceiling always yields `not_calculable`, not a computed bound, because that would require range arithmetic this engine doesn't implement.
- Taxes, bank charges, or any cost this project hasn't independently verified — unchanged from every prior phase.
- A "final bank payout" figure — the engine's vocabulary deliberately avoids "net income"/"amount received"; see `finalAmountMinorUnits`'s doc comment and its gating on status.

## 10. Examples (using only existing verified data)

**All-exact chain:** Direct Contracts (5%) → Payoneer USD same-currency ($1.50) on a $1,000 gross → `platformFee` stage exact ($950 after fee) → `providerFee` stage exact ($948.50 after fee) → `composeTransaction` status `"exact"`, `finalAmountMinorUnits` = 94850.

**Exact + reference:** the same platform stage, then a `referenceConversion` stage using the SBP USD→PKR rate on the $950 remainder → composed status `"reference"` (not `"exact"`), `finalAmountMinorUnits` set (this is the *reference* PKR equivalent, correctly labeled), sourced to SBP with its `asOf` date.

**Exact + ceiling → not_calculable:** the same platform stage, then a `providerFee` stage using Payoneer's Pakistan cross-currency scenario → composed status `"not_calculable"`, `finalAmountMinorUnits` **undefined**, `limitations` includes the provider stage's own explanation and the 2% ceiling (available on the stage object, not presented as the final figure).

**Unresolved:** `gateOnEligibility` on Wise's Pakistan marketplace-payout record → `proceed: false`, `blockedResult.status === "unresolved"`.

## 11. Future UI expectations (future architecture — not built)

A future comparison UI should: never render `finalAmountMinorUnits` unless it's defined; always render `limitations` when present; render a stage's `maxPercentage` explicitly labeled "up to," never as "the fee"; and route a `blockedResult` (from `gateOnEligibility`) to a message explaining *why* a provider can't be compared for this transaction, not a blank/zero result.

## 12. Known limitations

- No range/interval arithmetic — a ceiling on one stage cannot become a bound on a multi-stage total.
- `composeTransaction` trusts the caller to chain `inputAmountMinorUnits` from the previous stage's `resultAmountMinorUnits` correctly; it does not re-derive or validate that chain itself (tested via the "no double counting" test, not enforced by the type system).
- Only USD/EUR/GBP (Payoneer) and USD→PKR (reference) are populated; other currencies/providers remain out of scope per Phase H.1.
- Payoneer's marketplace-receiving fee and >50,000/month tier remain unpopulated (Phase H.1) and are therefore simply absent from any pipeline — not represented as zero.
