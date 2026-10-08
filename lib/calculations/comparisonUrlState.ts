/**
 * Encodes/decodes the payment comparison page's form inputs to and from a
 * URL query string. This module knows nothing about fees, percentages, or
 * currencies as financial concepts — it only moves strings/booleans in
 * and out of a URLSearchParams object. All the actual validation of those
 * strings (is "amount" a valid decimal? is "fee" within the verified
 * range?) still happens exactly where it already did — in
 * validateAmountInput/validatePercentageInput and the calculation layer.
 * A URL parameter is treated as nothing more than "as if the user had
 * typed this string into the field" — it gets no special trust and no
 * separate validation path.
 *
 * Only user INPUTS are represented here. No calculated amount, fee,
 * exchange rate, or provider result is ever encoded — see
 * PHASE_K_DESIGN.md for why.
 */

export type ComparisonContractType = "marketplace" | "direct";

export interface ComparisonUrlState {
  /** Raw amount string, exactly as it would appear in the amount input. "" if absent. */
  amount: string;
  contract: ComparisonContractType;
  /** Raw Marketplace fee percentage string. Only meaningful when contract is "marketplace". "" if absent. */
  fee: string;
  /** Freelancer Plus checkbox. Only meaningful when contract is "direct". */
  plus: boolean;
  /** Whether the PKR reference conversion is enabled. */
  reference: boolean;
}

export const DEFAULT_COMPARISON_STATE: ComparisonUrlState = {
  amount: "",
  contract: "marketplace",
  fee: "",
  plus: false,
  reference: false,
};

/**
 * Parses a URLSearchParams into a ComparisonUrlState. Unknown/malformed
 * values never throw and never produce a state that could reach the
 * calculation layer unvalidated — they just fall back to a safe default
 * for that one field:
 * - `contract` must be exactly "direct" to count; anything else (missing,
 *   "whatever", etc.) becomes "marketplace".
 * - `plus`/`reference` must be exactly "1"/"pk" respectively to count as
 *   true; anything else (including "true", "yes", garbage) is false.
 * - `amount`/`fee` are passed through as raw strings, unvalidated —
 *   downstream, the exact same validateAmountInput/validatePercentageInput
 *   calls the form already uses for typed input will reject "NaN",
 *   "Infinity", "-100", "999", excess decimals, etc. There is no separate,
 *   weaker validation path for URL-sourced values.
 */
export function parseComparisonUrlState(params: URLSearchParams): ComparisonUrlState {
  const contract: ComparisonContractType = params.get("contract") === "direct" ? "direct" : "marketplace";

  return {
    amount: params.get("amount") ?? "",
    contract,
    fee: contract === "marketplace" ? (params.get("fee") ?? "") : "",
    plus: contract === "direct" && params.get("plus") === "1",
    reference: params.get("reference") === "pk",
  };
}

/**
 * Serializes a ComparisonUrlState into a URLSearchParams. Omits fields
 * that don't apply to the current contract type or are at their default
 * (empty amount, no fee, plus/reference off) — keeps shared URLs short
 * and avoids encoding a param that would just be ignored on parse anyway.
 */
export function serializeComparisonUrlState(state: ComparisonUrlState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.amount.trim() !== "") {
    params.set("amount", state.amount.trim());
  }

  params.set("contract", state.contract);

  if (state.contract === "marketplace" && state.fee.trim() !== "") {
    params.set("fee", state.fee.trim());
  }

  if (state.contract === "direct" && state.plus) {
    params.set("plus", "1");
  }

  if (state.reference) {
    params.set("reference", "pk");
  }

  return params;
}
