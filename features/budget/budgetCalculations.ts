// features/budget/budgetCalculations.ts

export type BudgetCategoryInput = {
  allocated: number;
  spent: number;
};

export type BudgetComputed = {
  totalAllocated: number;
  totalSpent: number;
  surplusDeficit: number;
  percentSpent: number;
  savingsRate: number;
};

export function computeBudget(
  categories: BudgetCategoryInput[],
  income: number,
): BudgetComputed {
  const totalAllocated = categories.reduce((s, c) => s + c.allocated, 0);
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const surplusDeficit = income - totalSpent;
  const percentSpent =
    income > 0 ? Math.round((totalSpent / income) * 100) : 0;
  const savingsRate =
    income > 0 ? Math.round((Math.max(0, surplusDeficit) / income) * 100) : 0;
  return { totalAllocated, totalSpent, surplusDeficit, percentSpent, savingsRate };
}
