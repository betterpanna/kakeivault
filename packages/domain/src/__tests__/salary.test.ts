import { describe, expect, it } from 'vitest'
import { validateSalaryAmounts } from '../salary'

describe('validateSalaryAmounts', () => {
  it('passes consistent salary', () => {
    const result = validateSalaryAmounts({
      basicSalaryMinorUnits: 30000000,
      overtimeMinorUnits: 5000000,
      allowancesMinorUnits: 2000000,
      grossSalaryMinorUnits: 37000000,
      incomeTaxMinorUnits: 3000000,
      residentTaxMinorUnits: 1000000,
      pensionMinorUnits: 2000000,
      healthInsuranceMinorUnits: 1500000,
      employmentInsuranceMinorUnits: 300000,
      otherDeductionsMinorUnits: 0,
      totalDeductionsMinorUnits: 7800000,
      netSalaryMinorUnits: 29200000,
    })
    expect(result.isValid).toBe(true)
  })

  it('flags gross mismatch', () => {
    const result = validateSalaryAmounts({
      basicSalaryMinorUnits: 30000000,
      overtimeMinorUnits: 5000000,
      allowancesMinorUnits: 2000000,
      grossSalaryMinorUnits: 40000000, // should be 37000000
      incomeTaxMinorUnits: null,
      residentTaxMinorUnits: null,
      pensionMinorUnits: null,
      healthInsuranceMinorUnits: null,
      employmentInsuranceMinorUnits: null,
      otherDeductionsMinorUnits: null,
      totalDeductionsMinorUnits: null,
      netSalaryMinorUnits: null,
    })
    expect(result.warnings).toContain('salary.validation.grossMismatch')
  })

  it('flags negative net', () => {
    const result = validateSalaryAmounts({
      basicSalaryMinorUnits: null,
      overtimeMinorUnits: null,
      allowancesMinorUnits: null,
      grossSalaryMinorUnits: null,
      incomeTaxMinorUnits: null,
      residentTaxMinorUnits: null,
      pensionMinorUnits: null,
      healthInsuranceMinorUnits: null,
      employmentInsuranceMinorUnits: null,
      otherDeductionsMinorUnits: null,
      totalDeductionsMinorUnits: null,
      netSalaryMinorUnits: -100,
    })
    expect(result.warnings).toContain('salary.validation.negativeNet')
  })
})
