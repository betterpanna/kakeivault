import { approxEqual, sumMinorUnits } from './money'

export interface ReceiptValidationResult {
  isValid: boolean
  warnings: string[]
}

export interface ReceiptAmounts {
  subtotalMinorUnits: number | null
  taxMinorUnits: number | null
  totalMinorUnits: number | null
  lineItemTotals: number[]
}

/**
 * Validates extracted receipt amounts for internal consistency.
 * Returns localisation message keys, not English strings.
 */
export function validateReceiptAmounts(amounts: ReceiptAmounts): ReceiptValidationResult {
  const warnings: string[] = []

  const { subtotalMinorUnits, taxMinorUnits, totalMinorUnits, lineItemTotals } = amounts

  // subtotal + tax ≈ total
  if (subtotalMinorUnits !== null && taxMinorUnits !== null && totalMinorUnits !== null) {
    const computed = subtotalMinorUnits + taxMinorUnits
    if (!approxEqual(computed, totalMinorUnits)) {
      warnings.push('receipt.validation.subtotalPlusTaxMismatch')
    }
  }

  // sum(lineItems) ≈ total
  if (lineItemTotals.length > 0 && totalMinorUnits !== null) {
    const lineSum = sumMinorUnits(lineItemTotals)
    if (!approxEqual(lineSum, totalMinorUnits)) {
      warnings.push('receipt.validation.lineItemSumMismatch')
    }
  }

  // total must be non-negative
  if (totalMinorUnits !== null && totalMinorUnits < 0) {
    warnings.push('receipt.validation.negativeTotal')
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}

export function isReasonableTransactionDate(dateString: string): boolean {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return false
  const now = new Date()
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  return date >= fiveYearsAgo && date <= tomorrow
}
