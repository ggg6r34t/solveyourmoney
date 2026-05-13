// features/debt/services/debtMockService.ts
import { DebtResponseSchema, DebtResponse } from "./debtSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { avalanchePayoff } from "../debtCalculations";

export function getDebtData({ userId }: { userId: string }): DebtResponse {
  assertMockDataAllowed("debt");
  const now = new Date().toISOString();
  const items = [
    { id: "d-1", principal: 12000, interestRate: 0.05, label: "Student Loan", minPayment: 240 },
    { id: "d-2", principal: 3000, interestRate: 0.18, label: "Credit Card", minPayment: 60 },
  ];
  const payoffResult = avalanchePayoff(items, 0);
  return DebtResponseSchema.parse({
    userId,
    timestamp: now,
    items,
    computed: {
      totalBalance: items.reduce((s, d) => s + d.principal, 0),
      totalMinPayment: items.reduce((s, d) => s + d.minPayment, 0),
      totalInterest: payoffResult.totalInterest,
      debtFreeDate: payoffResult.debtFreeDate,
      monthsToPayoff: payoffResult.monthsToPayoff,
      avalancheOrder: payoffResult.order,
    },
  });
}
