import { describe, expect, it } from 'vitest'
import {
  addMinorUnits,
  approxEqual,
  categoryUsagePercent,
  minorUnitsToYen,
  multiplyMinorUnits,
  subtractMinorUnits,
  sumMinorUnits,
  yenToMinorUnits,
} from '../money'

describe('yenToMinorUnits', () => {
  it('converts whole yen to minor units', () => {
    expect(yenToMinorUnits(4280)).toBe(428000)
    expect(yenToMinorUnits(0)).toBe(0)
    expect(yenToMinorUnits(1)).toBe(100)
  })
})

describe('minorUnitsToYen', () => {
  it('converts minor units to yen', () => {
    expect(minorUnitsToYen(428000)).toBe(4280)
    expect(minorUnitsToYen(0)).toBe(0)
  })
})

describe('addMinorUnits', () => {
  it('adds two amounts correctly', () => {
    expect(addMinorUnits(100000, 50000)).toBe(150000)
    expect(addMinorUnits(0, 0)).toBe(0)
  })
})

describe('subtractMinorUnits', () => {
  it('subtracts correctly', () => {
    expect(subtractMinorUnits(100000, 30000)).toBe(70000)
    expect(subtractMinorUnits(5000, 10000)).toBe(-5000)
  })
})

describe('multiplyMinorUnits', () => {
  it('multiplies and rounds', () => {
    expect(multiplyMinorUnits(100000, 1.1)).toBe(110000)
    expect(multiplyMinorUnits(333, 3)).toBe(999)
  })
})

describe('approxEqual', () => {
  it('returns true when within tolerance', () => {
    expect(approxEqual(100000, 100050)).toBe(true) // ¥0.50 diff
    expect(approxEqual(100000, 100101)).toBe(false) // ¥1.01 diff
  })
})

describe('sumMinorUnits', () => {
  it('sums an array of amounts', () => {
    expect(sumMinorUnits([100, 200, 300])).toBe(600)
    expect(sumMinorUnits([])).toBe(0)
  })
})

describe('categoryUsagePercent', () => {
  it('calculates usage percentage', () => {
    expect(categoryUsagePercent(50000, 100000)).toBe(50)
    expect(categoryUsagePercent(110000, 100000)).toBe(110)
    expect(categoryUsagePercent(0, 0)).toBe(0)
  })
})
