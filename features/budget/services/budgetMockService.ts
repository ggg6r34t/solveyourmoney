import { BudgetResponseSchema, BudgetResponse } from "./budgetSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { computeBudget } from "../budgetCalculations";

export function getBudgetData({ userId }: { userId: string }): BudgetResponse {
  assertMockDataAllowed("budget");
  const now = new Date().toISOString();
  const income = 4250;
  const categories = [
    { id: "b-1", label: "Housing", allocated: 1200, spent: 1100 },
    { id: "b-2", label: "Groceries", allocated: 400, spent: 220 },
  ];
  const computed = computeBudget(categories, income);
  return BudgetResponseSchema.parse({ userId, timestamp: now, income, categories, computed });
}
