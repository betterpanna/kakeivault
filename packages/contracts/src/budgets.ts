import { z } from 'zod'
import { EXPENSE_CATEGORIES } from '@kakeivault/config'
import { AmountSchema, MonthStringSchema, UuidSchema } from './common'

export const BudgetSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  month: MonthStringSchema,
  overallMinorUnits: AmountSchema.nonnegative(),
  categoryBudgets: z.record(z.enum(EXPENSE_CATEGORIES), AmountSchema.nonnegative()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Budget = z.infer<typeof BudgetSchema>

export const UpsertBudgetRequestSchema = z.object({
  overallMinorUnits: AmountSchema.nonnegative(),
  categoryBudgets: z.record(z.enum(EXPENSE_CATEGORIES), AmountSchema.nonnegative()).default({}),
})
export type UpsertBudgetRequest = z.infer<typeof UpsertBudgetRequestSchema>
