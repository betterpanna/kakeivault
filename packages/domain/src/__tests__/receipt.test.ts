import { describe, expect, it } from 'vitest'
import { isReasonableTransactionDate, validateReceiptAmounts } from '../receipt'

describe('validateReceiptAmounts', () => {
  it('passes valid amounts', () => {
    const result = validateReceiptAmounts({
      subtotalMinorUnits: 389100,
      taxMinorUnits: 38910,
      totalMinorUnits: 428010,
      lineItemTotals: [100000, 289100, 38910],
    })
    expect(result.isValid).toBe(true)
    expect(result.warnings).toHaveLength(0)
  })

  it('flags subtotal + tax mismatch', () => {
    const result = validateReceiptAmounts({
      subtotalMinorUnits: 300000,
      taxMinorUnits: 30000,
      totalMinorUnits: 400000, // wrong
      lineItemTotals: [],
    })
    expect(result.warnings).toContain('receipt.validation.subtotalPlusTaxMismatch')
  })

  it('flags line item sum mismatch', () => {
    const result = validateReceiptAmounts({
      subtotalMinorUnits: null,
      taxMinorUnits: null,
      totalMinorUnits: 428000,
      lineItemTotals: [100000, 200000], // sums to 300000
    })
    expect(result.warnings).toContain('receipt.validation.lineItemSumMismatch')
  })

  it('flags negative total', () => {
    const result = validateReceiptAmounts({
      subtotalMinorUnits: null,
      taxMinorUnits: null,
      totalMinorUnits: -100,
      lineItemTotals: [],
    })
    expect(result.warnings).toContain('receipt.validation.negativeTotal')
  })
})

describe('isReasonableTransactionDate', () => {
  it('accepts today', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(isReasonableTransactionDate(today)).toBe(true)
  })

  it('rejects far future dates', () => {
    expect(isReasonableTransactionDate('2035-01-01')).toBe(false)
  })

  it('rejects very old dates', () => {
    expect(isReasonableTransactionDate('2010-01-01')).toBe(false)
  })

  it('rejects invalid strings', () => {
    expect(isReasonableTransactionDate('not-a-date')).toBe(false)
  })
})
