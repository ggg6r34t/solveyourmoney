import { DebtResponseSchema, DebtResponse } from "./debtSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";

export function getDebtData({ userId }: { userId: string }): DebtResponse {
  assertMockDataAllowed("debt");
  const now = new Date().toISOString();
  const data: DebtResponse = {
    userId,
    timestamp: now,
    items: [
      {
        id: "d-1",
        principal: 12000,
        interestRate: 0.05,
        label: "Student Loan",
      },
      { id: "d-2", principal: 3000, interestRate: 0.18, label: "Credit Card" },
    ],
  };
  return DebtResponseSchema.parse(data);
}
