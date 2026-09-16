import { subtractMinorUnits } from './money'

export interface BudgetSummary {
  monthlyBudgetMinorUnits: number
  totalExpensesMinorUnits: number
  totalIncomeMinorUnits: number
  remainingBudgetMinorUnits: number
  savingsMinorUnits: number
}

export function calculateBudgetSummary(
  monthlyBudgetMinorUnits: number,
  totalIncomeMinorUnits: number,
  totalExpensesMinorUnits: number,
): BudgetSummary {
  return {
    monthlyBudgetMinorUnits,
    totalExpensesMinorUnits,
    totalIncomeMinorUnits,
    remainingBudgetMinorUnits: subtractMinorUnits(monthlyBudgetMinorUnits, totalExpensesMinorUnits),
    savingsMinorUnits: subtractMinorUnits(totalIncomeMinorUnits, totalExpensesMinorUnits),
  }
}

export interface BudgetWarning {
  category: string | null
  usagePercent: number
  messageKey: 'budget.warning.over' | 'budget.warning.near'
}

export function detectBudgetWarnings(
  categoryUsage: Array<{
    category: string
    spentMinorUnits: number
    budgetMinorUnits: number | null
    usagePercent: number | null
  }>,
  overallRemainingMinorUnits: number,
  overallBudgetMinorUnits: number | null,
): BudgetWarning[] {
  const warnings: BudgetWarning[] = []

  // Overall budget warning
  if (overallBudgetMinorUnits !== null && overallBudgetMinorUnits > 0) {
    const overallPercent =
      ((overallBudgetMinorUnits - overallRemainingMinorUnits) / overallBudgetMinorUnits) * 100
    if (overallPercent >= 100) {
      warnings.push({
        category: null,
        usagePercent: overallPercent,
        messageKey: 'budget.warning.over',
      })
    } else if (overallPercent >= 80) {
      warnings.push({
        category: null,
        usagePercent: overallPercent,
        messageKey: 'budget.warning.near',
      })
    }
  }

  // Category warnings
  for (const usage of categoryUsage) {
    if (usage.usagePercent === null) continue
    if (usage.usagePercent >= 100) {
      warnings.push({
        category: usage.category,
        usagePercent: usage.usagePercent,
        messageKey: 'budget.warning.over',
      })
    } else if (usage.usagePercent >= 80) {
      warnings.push({
        category: usage.category,
        usagePercent: usage.usagePercent,
        messageKey: 'budget.warning.near',
      })
    }
  }

  return warnings
}
