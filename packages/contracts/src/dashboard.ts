import { z } from 'zod'
import { EXPENSE_CATEGORIES } from '@kakeivault/config'
import { AmountSchema, MonthStringSchema } from './common'
import { TransactionSchema } from './transactions'

export const CategoryUsageSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  spentMinorUnits: AmountSchema,
  budgetMinorUnits: AmountSchema.nullable(),
  usagePercent: z.number().nullable(),
})
export type CategoryUsage = z.infer<typeof CategoryUsageSchema>

export const DashboardSchema = z.object({
  month: MonthStringSchema,
  totalIncomeMinorUnits: AmountSchema,
  totalExpensesMinorUnits: AmountSchema,
  savingsMinorUnits: AmountSchema,
  remainingBudgetMinorUnits: AmountSchema.nullable(),
  budgetMinorUnits: AmountSchema.nullable(),
  categoryUsage: z.array(CategoryUsageSchema),
  recentTransactions: z.array(TransactionSchema),
  previousMonth: z
    .object({
      totalIncomeMinorUnits: AmountSchema,
      totalExpensesMinorUnits: AmountSchema,
    })
    .nullable(),
  budgetWarnings: z.array(
    z.object({
      category: z.enum(EXPENSE_CATEGORIES).nullable(),
      message: z.string(),
      usagePercent: z.number(),
    }),
  ),
})
export type Dashboard = z.infer<typeof DashboardSchema>
