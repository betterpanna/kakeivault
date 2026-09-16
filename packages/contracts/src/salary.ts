import { z } from 'zod'
import { AmountSchema, DateStringSchema, MonthStringSchema, UuidSchema } from './common'

export const SalarySlipSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  documentId: UuidSchema.nullable(),
  ocrJobId: UuidSchema.nullable(),
  paymentMonth: MonthStringSchema,
  paymentDate: DateStringSchema.nullable(),
  employerName: z.string().max(500).nullable(),
  basicSalaryMinorUnits: AmountSchema.nonnegative().nullable(),
  overtimeMinorUnits: AmountSchema.nonnegative().nullable(),
  allowancesMinorUnits: AmountSchema.nonnegative().nullable(),
  grossSalaryMinorUnits: AmountSchema.nonnegative().nullable(),
  incomeTaxMinorUnits: AmountSchema.nonnegative().nullable(),
  residentTaxMinorUnits: AmountSchema.nonnegative().nullable(),
  pensionMinorUnits: AmountSchema.nonnegative().nullable(),
  healthInsuranceMinorUnits: AmountSchema.nonnegative().nullable(),
  employmentInsuranceMinorUnits: AmountSchema.nonnegative().nullable(),
  otherDeductionsMinorUnits: AmountSchema.nonnegative().nullable(),
  totalDeductionsMinorUnits: AmountSchema.nonnegative().nullable(),
  netSalaryMinorUnits: AmountSchema.nonnegative().nullable(),
  confirmed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type SalarySlip = z.infer<typeof SalarySlipSchema>

export const ConfirmSalarySlipRequestSchema = z.object({
  paymentMonth: MonthStringSchema,
  paymentDate: DateStringSchema.optional(),
  employerName: z.string().max(500).optional(),
  basicSalaryMinorUnits: AmountSchema.nonnegative().optional(),
  overtimeMinorUnits: AmountSchema.nonnegative().optional(),
  allowancesMinorUnits: AmountSchema.nonnegative().optional(),
  grossSalaryMinorUnits: AmountSchema.nonnegative(),
  incomeTaxMinorUnits: AmountSchema.nonnegative().optional(),
  residentTaxMinorUnits: AmountSchema.nonnegative().optional(),
  pensionMinorUnits: AmountSchema.nonnegative().optional(),
  healthInsuranceMinorUnits: AmountSchema.nonnegative().optional(),
  employmentInsuranceMinorUnits: AmountSchema.nonnegative().optional(),
  otherDeductionsMinorUnits: AmountSchema.nonnegative().optional(),
  totalDeductionsMinorUnits: AmountSchema.nonnegative().optional(),
  netSalaryMinorUnits: AmountSchema.nonnegative(),
  idempotencyKey: z.string().max(128).optional(),
})
export type ConfirmSalarySlipRequest = z.infer<typeof ConfirmSalarySlipRequestSchema>
