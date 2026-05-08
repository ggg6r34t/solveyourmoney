import { BudgetResponseSchema, BudgetResponse } from "./budgetSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";

export function getBudgetData({ userId }: { userId: string }): BudgetResponse {
  assertMockDataAllowed("budget");
  const now = new Date().toISOString();
  const data: BudgetResponse = {
    userId,
    timestamp: now,
    categories: [
      { id: "b-1", label: "Housing", allocated: 1200, spent: 1100 },
      { id: "b-2", label: "Groceries", allocated: 400, spent: 220 },
    ],
  };
  return BudgetResponseSchema.parse(data);
}
