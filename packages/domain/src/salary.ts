import { approxEqual, sumMinorUnits } from './money'

export interface SalaryValidationResult {
  isValid: boolean
  warnings: string[]
}

export interface SalaryAmounts {
  basicSalaryMinorUnits: number | null
  overtimeMinorUnits: number | null
  allowancesMinorUnits: number | null
  grossSalaryMinorUnits: number | null
  incomeTaxMinorUnits: number | null
  residentTaxMinorUnits: number | null
  pensionMinorUnits: number | null
  healthInsuranceMinorUnits: number | null
  employmentInsuranceMinorUnits: number | null
  otherDeductionsMinorUnits: number | null
  totalDeductionsMinorUnits: number | null
  netSalaryMinorUnits: number | null
}

export function validateSalaryAmounts(amounts: SalaryAmounts): SalaryValidationResult {
  const warnings: string[] = []

  const {
    basicSalaryMinorUnits,
    overtimeMinorUnits,
    allowancesMinorUnits,
    grossSalaryMinorUnits,
    incomeTaxMinorUnits,
    residentTaxMinorUnits,
    pensionMinorUnits,
    healthInsuranceMinorUnits,
    employmentInsuranceMinorUnits,
    otherDeductionsMinorUnits,
    totalDeductionsMinorUnits,
    netSalaryMinorUnits,
  } = amounts

  // Gross = basic + overtime + allowances
  const knownComponents = [basicSalaryMinorUnits, overtimeMinorUnits, allowancesMinorUnits].filter(
    (v): v is number => v !== null,
  )

  if (knownComponents.length === 3 && grossSalaryMinorUnits !== null) {
    const computed = sumMinorUnits(knownComponents)
    if (!approxEqual(computed, grossSalaryMinorUnits)) {
      warnings.push('salary.validation.grossMismatch')
    }
  }

  // Total deductions = sum of individual deductions
  const deductions = [
    incomeTaxMinorUnits,
    residentTaxMinorUnits,
    pensionMinorUnits,
    healthInsuranceMinorUnits,
    employmentInsuranceMinorUnits,
    otherDeductionsMinorUnits,
  ].filter((v): v is number => v !== null)

  if (deductions.length > 0 && totalDeductionsMinorUnits !== null) {
    const computedDeductions = sumMinorUnits(deductions)
    if (!approxEqual(computedDeductions, totalDeductionsMinorUnits)) {
      warnings.push('salary.validation.deductionsMismatch')
    }
  }

  // Net = gross - total deductions
  if (
    grossSalaryMinorUnits !== null &&
    totalDeductionsMinorUnits !== null &&
    netSalaryMinorUnits !== null
  ) {
    const computedNet = grossSalaryMinorUnits - totalDeductionsMinorUnits
    if (!approxEqual(computedNet, netSalaryMinorUnits)) {
      warnings.push('salary.validation.netMismatch')
    }
  }

  // Net must be non-negative
  if (netSalaryMinorUnits !== null && netSalaryMinorUnits < 0) {
    warnings.push('salary.validation.negativeNet')
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}
