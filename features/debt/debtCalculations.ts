// features/debt/debtCalculations.ts

export type DebtCalcInput = {
  id: string;
  principal: number;
  interestRate: number; // decimal, e.g. 0.194 for 19.4% APR
  minPayment: number;
};

export type AvalancheResult = {
  totalInterest: number;
  monthsToPayoff: number;
  debtFreeDate: string;
  order: string[]; // ids sorted highest-rate first
};

export function avalanchePayoff(
  debts: DebtCalcInput[],
  extraPayment: number,
): AvalancheResult {
  if (debts.length === 0) {
    return { totalInterest: 0, monthsToPayoff: 0, debtFreeDate: "—", order: [] };
  }

  const sorted = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  const balances = sorted.map((d) => d.principal);
  let totalInterest = 0;
  let month = 0;
  let freedMinPayments = 0; // accumulates freed minimums as debts pay off
  const MAX_MONTHS = 600;

  while (balances.some((b) => b > 0.01) && month < MAX_MONTHS) {
    month++;

    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] <= 0.01) continue;
      const interest = balances[i] * (sorted[i].interestRate / 12);
      totalInterest += interest;
      balances[i] += interest;
      const payment = Math.min(sorted[i].minPayment, balances[i]);
      balances[i] -= payment;
      if (balances[i] < 0.01) {
        freedMinPayments += sorted[i].minPayment; // free this minimum going forward
        balances[i] = 0;
      }
    }

    let extra = extraPayment + freedMinPayments;
    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] <= 0 || extra <= 0) continue;
      const applied = Math.min(extra, balances[i]);
      balances[i] -= applied;
      extra -= applied;
      if (balances[i] < 0.01) balances[i] = 0;
    }
  }

  const debtFreeDate =
    month < MAX_MONTHS ? payoffMonthLabel(month) : "50+ years";

  return {
    totalInterest: Math.round(totalInterest),
    monthsToPayoff: month,
    debtFreeDate,
    order: sorted.map((d) => d.id),
  };
}

function payoffMonthLabel(monthsFromNow: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
