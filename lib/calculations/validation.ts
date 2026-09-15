/**
 * Pure validation for raw calculator form input. Nothing here touches
 * React or the DOM — it takes strings, returns a typed result, and never
 * throws. Malformed input is rejected here, before it ever reaches the
 * calculation engine in fees.ts/fx.ts.
 */

export type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; error: string };

const DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;

/** Validates a user-entered client payment amount (a plain decimal string, e.g. "500" or "500.50"). */
export function validateAmountInput(raw: string): ValidationResult<number> {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return { valid: false, error: "Enter the client payment amount." };
  }

  if (!DECIMAL_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: "Enter a valid amount using digits only (e.g. 500 or 500.50).",
    };
  }

  const value = Number(trimmed);

  if (!Number.isFinite(value)) {
    return { valid: false, error: "Enter a valid amount." };
  }

  if (value <= 0) {
    return { valid: false, error: "Enter an amount greater than zero." };
  }

  return { valid: true, value };
}

export interface PercentageBounds {
  /** Decimal fraction, e.g. 0 for 0%. */
  min: number;
  /** Decimal fraction, e.g. 0.15 for 15%. */
  max: number;
}

/**
 * Validates a user-entered fee percentage (e.g. "10" for 10%) against a
 * scenario's verified min/max range. Returns the value as a decimal
 * fraction (e.g. 0.1), matching the unit `calculateFeeAmount` expects.
 */
export function validatePercentageInput(
  raw: string,
  bounds: PercentageBounds
): ValidationResult<number> {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return {
      valid: false,
      error: "Enter the freelancer service fee percentage shown on your contract.",
    };
  }

  if (!DECIMAL_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: "Enter a percentage using digits only (e.g. 10 or 12.5).",
    };
  }

  const percent = Number(trimmed);
  const decimal = percent / 100;
  const minPercent = bounds.min * 100;
  const maxPercent = bounds.max * 100;

  if (decimal < bounds.min || decimal > bounds.max) {
    return {
      valid: false,
      error: `Enter a percentage between ${minPercent}% and ${maxPercent}%, matching what Upwork showed for your contract.`,
    };
  }

  return { valid: true, value: decimal };
}
