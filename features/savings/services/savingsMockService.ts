import { SavingsResponseSchema, SavingsResponse } from "./savingsSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { goalEta } from "../savingsCalculations";

export function getSavingsData({ userId }: { userId: string }): SavingsResponse {
  assertMockDataAllowed("savings");
  const now = new Date().toISOString();
  const rawGoals = [
    { id: "g-1", label: "Emergency Fund", target: 6000, current: 3500, monthlyContribution: 180 },
    { id: "g-2", label: "Holiday", target: 1500, current: 300, monthlyContribution: 60 },
  ];
  const goals = rawGoals.map((g) => {
    const eta = goalEta(g, g.monthlyContribution);
    // monthsRemaining omitted — etaDate is the consumer-facing string
    return { ...g, pctComplete: eta.pctComplete, remaining: eta.remaining, etaDate: eta.etaDate };
  });
  const computed = {
    totalSaved: goals.reduce((s, g) => s + g.current, 0),
    totalTarget: goals.reduce((s, g) => s + g.target, 0),
    totalRemaining: goals.reduce((s, g) => s + g.remaining, 0),
    monthlyTotal: goals.reduce((s, g) => s + g.monthlyContribution, 0),
  };
  return SavingsResponseSchema.parse({ userId, timestamp: now, goals, computed });
}
