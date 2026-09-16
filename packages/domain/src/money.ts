/**
 * Decimal-safe money operations.
 *
 * All amounts are stored as integer minor units (JPY × 100 for uniformity
 * with potential multi-currency support). All arithmetic is performed on
 * integers to avoid binary floating-point rounding errors.
 *
 * Rule: NEVER pass a JS `number` that represents a float into these functions.
 * Always convert user input (e.g. "¥1,280") → minor units first via
 * `yenToMinorUnits()`.
 */

/** Convert whole yen (e.g. 1280) to minor units (128000) */
export function yenToMinorUnits(yen: number): number {
  return Math.round(yen * 100)
}

/** Convert minor units (128000) to whole yen display value (1280.00) */
export function minorUnitsToYen(minorUnits: number): number {
  return minorUnits / 100
}

/** Add two minor-unit amounts (integer safe) */
export function addMinorUnits(a: number, b: number): number {
  return (a + b) | 0
}

/** Subtract two minor-unit amounts (integer safe) */
export function subtractMinorUnits(a: number, b: number): number {
  return (a - b) | 0
}

/** Multiply minor-unit amount by a factor, rounding to nearest integer */
export function multiplyMinorUnits(amount: number, factor: number): number {
  return Math.round(amount * factor)
}

/** Returns true if the two amounts are within `toleranceMinorUnits` of each other */
export function approxEqual(
  a: number,
  b: number,
  toleranceMinorUnits = 100, // ¥1 tolerance
): boolean {
  return Math.abs(a - b) <= toleranceMinorUnits
}

/** Calculate category usage percentage (0–100+) */
export function categoryUsagePercent(spentMinorUnits: number, budgetMinorUnits: number): number {
  if (budgetMinorUnits <= 0) return 0
  return Math.round((spentMinorUnits / budgetMinorUnits) * 10000) / 100
}

/** Safe sum of an array of minor unit values */
export function sumMinorUnits(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0)
}
