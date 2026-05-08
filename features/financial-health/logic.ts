import type { MoneyRealityCheckInput } from "@/lib/validation/forms";

export const FINANCIAL_LOGIC_VERSION = "financial-health-v1.0.0";

export type FinancialSnapshotDTO = {
  monthlySurplus: number;
  debtPressureRatio: number;
  runwayMonths: number;
  savingsRate: number;
  riskFlags: string[];
  assumptions: string[];
  logicVersion: string;
};

export function calculateFinancialSnapshot(
  input: MoneyRealityCheckInput,
): FinancialSnapshotDTO {
  const totalExpenses =
    input.monthlyFixedExpenses +
    input.monthlyFlexibleExpenses +
    input.minimumDebtPayments;
  const monthlySurplus = input.monthlyIncome - totalExpenses;
  const runwayMonths =
    totalExpenses > 0 ? round(input.savingsBalance / totalExpenses) : 999;
  const debtPressureRatio =
    input.monthlyIncome > 0
      ? round(input.minimumDebtPayments / input.monthlyIncome)
      : 0;
  const savingsRate =
    input.monthlyIncome > 0 ? round(Math.max(monthlySurplus, 0) / input.monthlyIncome) : 0;

  const riskFlags = [
    monthlySurplus < 0 ? "negative_cashflow" : null,
    debtPressureRatio > 0.18 ? "high_debt_pressure" : null,
    runwayMonths < 1 ? "low_runway" : null,
    input.goalMonthlyTarget > Math.max(monthlySurplus, 0)
      ? "goal_target_above_current_surplus"
      : null,
  ].filter(Boolean) as string[];

  return {
    monthlySurplus,
    debtPressureRatio,
    runwayMonths,
    savingsRate,
    riskFlags,
    assumptions: [
      "Inputs are manually provided by the user and are not bank-verified.",
      "Runway assumes current monthly expenses stay unchanged.",
      "Debt pressure uses minimum monthly debt payments divided by monthly income.",
      "Outputs are deterministic educational insights and planning tools, not financial advice.",
    ],
    logicVersion: FINANCIAL_LOGIC_VERSION,
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
