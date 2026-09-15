/**
 * Money is handled in integer minor units (e.g. cents) everywhere in the
 * calculation layer. Percentages/fees are applied to integers and rounded
 * once per operation, rather than chaining floating-point decimal math —
 * this avoids the classic 0.1 + 0.2 style rounding drift in monetary
 * calculations. The only place a fractional decimal amount should exist
 * is at the UI boundary (what the person typed, and what's displayed),
 * via toMinorUnits/fromMinorUnits.
 */

/** Converts a decimal amount (e.g. 500.5) to integer minor units (e.g. 50050), rounding to the nearest minor unit. */
export function toMinorUnits(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a finite number");
  }
  return Math.round(amount * 100);
}

/** Converts integer minor units (e.g. 50050) back to a decimal amount (e.g. 500.5). */
export function fromMinorUnits(minorUnits: number): number {
  return minorUnits / 100;
}

/**
 * Applies a percentage (decimal fraction, e.g. 0.1 for 10%) to an integer
 * minor-unit amount, rounding to the nearest whole minor unit.
 */
export function applyPercentage(minorUnits: number, percentage: number): number {
  if (percentage < 0) {
    throw new Error("Percentage cannot be negative");
  }
  return Math.round(minorUnits * percentage);
}
