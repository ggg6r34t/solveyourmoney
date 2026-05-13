// features/savings/savingsCalculations.ts

export type SavingsGoalInput = {
  target: number;
  current: number;
};

export type GoalEta = {
  monthsRemaining: number; // -1 means unknown (no contribution)
  etaDate: string;
  pctComplete: number;
  remaining: number;
};

export function goalEta(
  goal: SavingsGoalInput,
  monthlyContribution: number,
): GoalEta {
  const remaining = Math.max(0, goal.target - goal.current);
  const pctComplete =
    goal.target > 0
      ? Math.min(100, Math.round((goal.current / goal.target) * 100))
      : 0;

  if (remaining === 0) {
    return { monthsRemaining: 0, etaDate: "Reached", pctComplete: 100, remaining: 0 };
  }

  if (monthlyContribution <= 0) {
    return { monthsRemaining: -1, etaDate: "—", pctComplete, remaining };
  }

  const months = Math.ceil(remaining / monthlyContribution);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  const etaDate = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return { monthsRemaining: months, etaDate, pctComplete, remaining };
}
