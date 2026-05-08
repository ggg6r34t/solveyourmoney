import { lessonCatalog } from "./catalog";

type JsonLike = Record<string, unknown> | null | undefined;

export type DashboardChrome = {
  configured: boolean;
  displayName: string;
  level: number;
  xp: number;
  streakDays: number;
  coachCue: string;
};

export type SummaryCardDTO = {
  label: string;
  value: number;
  trendDirection: "up" | "down" | "flat";
  trendValue: string;
  insight: string;
};

export type TimelineItemDTO = {
  id: string;
  kind: string;
  title: string;
  description: string;
  occurredAt: string;
};

export type DebtCardDTO = {
  id: string;
  name: string;
  provider: string | null;
  balance: number;
  limit: number | null;
  apr: number | null;
  monthlyPayment: number;
  payoffMonths: number | null;
  priorityReason: string;
  isFocus: boolean;
};

export type SavingsGoalDTO = {
  id: string;
  name: string;
  savedAmount: number;
  targetAmount: number;
  progressPercent: number;
  monthlyContribution: number;
  projectedCompletionDate: string | null;
  projection: number[];
};

export type DebtScenarioDTO = {
  extraPayment: number;
  totalDebt: number;
  monthlyMinimum: number;
  totalInterestCost: number;
  payoffMonths: number | null;
  interestSaved: number;
  monthsReduced: number;
  focusDebtId: string | null;
  focusReason: string;
  timeline: Array<{ month: number; remainingBalance: number }>;
  cards: DebtCardDTO[];
};

export type BudgetCategoryDTO = {
  id: string;
  name: string;
  planned: number;
  actual: number;
  usedPercent: number;
  bucket: "Needs" | "Wants" | "Savings";
  guidance: string;
};

export type BudgetDashboardDTO = {
  income: number;
  spent: number;
  budgeted: number;
  leftover: number;
  overspendingCategory: BudgetCategoryDTO | null;
  breakdown: Array<{ label: "Needs" | "Wants" | "Savings"; value: number; percent: number }>;
  categories: BudgetCategoryDTO[];
  spendingTrend: Array<{ label: string; value: number }>;
  categoryBreakdown: Array<{ label: string; value: number }>;
};

export type LearnItemDTO = {
  slug: string;
  title: string;
  category: string;
  readingMinutes: number;
  xpReward: number;
  completed: boolean;
  behaviorLink: string;
};

export type LearnDashboardDTO = {
  xp: number;
  level: number;
  streakDays: number;
  progressPercent: number;
  badges: string[];
  mastery: Array<{ category: string; percent: number }>;
  lessons: LearnItemDTO[];
  nextBehaviorLink: string;
};

export function computeLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 200) + 1);
}

export function getCoachCue({
  monthlySurplus,
  totalDebt,
  runwayMonths,
}: {
  monthlySurplus: number;
  totalDebt: number;
  runwayMonths: number;
}) {
  if (monthlySurplus < 0) {
    return "Cash flow is currently tight. One option is to compare how a smaller category adjustment could affect breathing room next month.";
  }

  if (runwayMonths < 1) {
    return "Your current buffer looks light. You could explore how a slower goal pace changes short-term flexibility.";
  }

  if (totalDebt > 0) {
    return "There is active debt in the picture. You could compare how different payment amounts change timeline and total cost.";
  }

  return "Your current picture looks steadier. One option is to compare how different savings paces affect future timing.";
}

export function createSummaryCards(input: {
  totalDebt: number;
  monthlyIncome: number;
  spentThisMonth: number;
  totalSaved: number;
  debtTrend: number;
  spendingTrend: number;
  savingsTrend: number;
}) {
  return [
    createSummaryCard(
      "Total debt",
      input.totalDebt,
      input.debtTrend <= 0 ? "down" : "up",
      deltaLabel(input.debtTrend),
      input.debtTrend < 0
        ? "Debt is lower than last month, which may widen flexibility if the pace continues."
        : "Debt is higher or unchanged, which may keep total borrowing costs elevated.",
    ),
    createSummaryCard(
      "Monthly income",
      input.monthlyIncome,
      "flat",
      "Stable baseline",
      "Income sets the ceiling for every scenario shown on the dashboard.",
    ),
    createSummaryCard(
      "Spent this month",
      input.spentThisMonth,
      input.spendingTrend <= 0 ? "down" : "up",
      deltaLabel(input.spendingTrend),
      input.spendingTrend > 0
        ? "Spending is running above the previous month, which may narrow savings pace if it continues."
        : "Spending eased compared with the previous month, which may create more room for future choices.",
    ),
    createSummaryCard(
      "Total saved",
      input.totalSaved,
      input.savingsTrend >= 0 ? "up" : "down",
      deltaLabel(input.savingsTrend),
      input.savingsTrend >= 0
        ? "Savings moved forward, which may shorten future goal timelines."
        : "Savings moved back, which may lengthen future goal timelines if the pace stays lower.",
    ),
  ];
}

function createSummaryCard(
  label: string,
  value: number,
  trendDirection: "up" | "down" | "flat",
  trendValue: string,
  insight: string,
): SummaryCardDTO {
  return { label, value, trendDirection, trendValue, insight };
}

function deltaLabel(value: number) {
  if (value === 0) {
    return "No change";
  }

  const direction = value > 0 ? "up" : "down";
  return `${direction === "up" ? "+" : "-"}${formatCurrency(Math.abs(value))} this month`;
}

export function buildDebtScenario(
  debts: Array<{
    id: string;
    name: string;
    provider: string | null;
    balance: number;
    limit_amount: number | null;
    apr: number | null;
    monthly_payment: number;
  }>,
  extraPayment: number,
): DebtScenarioDTO {
  const normalized = debts
    .map((debt) => ({
      ...debt,
      balance: roundMoney(debt.balance),
      monthly_payment: roundMoney(Math.max(0, debt.monthly_payment)),
      apr: debt.apr === null ? null : Math.max(0, debt.apr),
    }))
    .filter((debt) => debt.balance > 0);

  const priority = [...normalized].sort(compareDebtPriority);
  const focus = priority[0] ?? null;
  const baseline = simulateAvalanche(priority, 0);
  const accelerated = simulateAvalanche(priority, extraPayment);

  const cards = priority.map((debt) => ({
    id: debt.id,
    name: debt.name,
    provider: debt.provider,
    balance: debt.balance,
    limit: debt.limit_amount,
    apr: debt.apr,
    monthlyPayment: debt.monthly_payment,
    payoffMonths: estimateSingleDebtMonths(
      debt.balance,
      debt.apr ?? 0,
      debt.monthly_payment + (focus?.id === debt.id ? extraPayment : 0),
    ),
    priorityReason: explainDebtPriority(debt, focus?.id === debt.id),
    isFocus: focus?.id === debt.id,
  }));

  return {
    extraPayment,
    totalDebt: sum(priority.map((item) => item.balance)),
    monthlyMinimum: sum(priority.map((item) => item.monthly_payment)),
    totalInterestCost: accelerated.totalInterest,
    payoffMonths: accelerated.months || null,
    interestSaved: Math.max(0, roundMoney(baseline.totalInterest - accelerated.totalInterest)),
    monthsReduced: Math.max(0, baseline.months - accelerated.months),
    focusDebtId: focus?.id ?? null,
    focusReason: focus
      ? explainDebtPriority(focus, true)
      : "Add your debts and APRs so the plan can show a real payoff order.",
    timeline: accelerated.timeline,
    cards,
  };
}

export function buildBudgetDashboard(input: {
  expenses: Array<{
    id: string;
    category: string;
    period_start: string;
    planned_amount: number;
    actual_amount: number;
  }>;
  monthlyIncome: number;
  monthlyAutoSave: number;
}) {
  const categories = collapseCurrentCategories(input.expenses);
  const spent = sum(categories.map((item) => item.actual));
  const budgeted = sum(categories.map((item) => item.planned));
  const leftover = roundMoney(input.monthlyIncome - spent);
  const overspendingCategory =
    [...categories].sort((a, b) => b.actual - b.planned - (a.actual - a.planned))[0] ?? null;
  const wants = categories.filter((item) => item.bucket === "Wants");
  const needs = categories.filter((item) => item.bucket === "Needs");
  const savingsValue = Math.max(0, input.monthlyAutoSave);
  const totalForBreakdown = Math.max(input.monthlyIncome, spent + savingsValue, 1);
  const trend = buildSpendingTrend(input.expenses);

  return {
    income: roundMoney(input.monthlyIncome),
    spent,
    budgeted,
    leftover,
    overspendingCategory:
      overspendingCategory && overspendingCategory.actual > overspendingCategory.planned
        ? overspendingCategory
        : null,
    breakdown: [
      {
        label: "Needs" as const,
        value: sum(needs.map((item) => item.actual)),
        percent: Math.round((sum(needs.map((item) => item.actual)) / totalForBreakdown) * 100),
      },
      {
        label: "Wants" as const,
        value: sum(wants.map((item) => item.actual)),
        percent: Math.round((sum(wants.map((item) => item.actual)) / totalForBreakdown) * 100),
      },
      {
        label: "Savings" as const,
        value: savingsValue,
        percent: Math.round((savingsValue / totalForBreakdown) * 100),
      },
    ],
    categories,
    spendingTrend: trend,
    categoryBreakdown: categories.map((item) => ({
      label: item.name,
      value: item.actual,
    })),
  } satisfies BudgetDashboardDTO;
}

export function buildSavingsGoals(
  goals: Array<{
    id: string;
    name: string;
    saved_amount: number;
    target_amount: number;
    monthly_contribution: number;
    target_date: string | null;
  }>,
) {
  return goals.map((goal) => {
    const progressPercent = Math.min(
      100,
      Math.round((goal.saved_amount / Math.max(goal.target_amount, 1)) * 100),
    );

    return {
      id: goal.id,
      name: goal.name,
      savedAmount: roundMoney(goal.saved_amount),
      targetAmount: roundMoney(goal.target_amount),
      progressPercent,
      monthlyContribution: roundMoney(goal.monthly_contribution),
      projectedCompletionDate: projectCompletionDate(goal),
      projection: buildGoalProjection(goal),
    } satisfies SavingsGoalDTO;
  });
}

export function buildLearnDashboard(input: {
  xp: number;
  streakDays: number;
  learningProgress: Array<{
    slug: string;
    completed_at: string | null;
  }>;
  debtFocusActive: boolean;
}) {
  const completed = new Set(
    input.learningProgress.filter((item) => item.completed_at).map((item) => item.slug),
  );
  const lessons: LearnItemDTO[] = lessonCatalog.map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
    category: lesson.category,
    readingMinutes: lesson.readingMinutes,
    xpReward: lesson.xpReward,
    completed: completed.has(lesson.slug),
    behaviorLink: lesson.behaviorLink,
  }));

  const mastery = Array.from(
    lessons.reduce((map, lesson) => {
      const bucket = map.get(lesson.category) ?? { total: 0, done: 0 };
      bucket.total += 1;
      bucket.done += lesson.completed ? 1 : 0;
      map.set(lesson.category, bucket);
      return map;
    }, new Map<string, { total: number; done: number }>()),
  ).map(([category, totals]) => ({
    category,
    percent: Math.round((totals.done / Math.max(totals.total, 1)) * 100),
  }));

  return {
    xp: input.xp,
    level: computeLevel(input.xp),
    streakDays: input.streakDays,
    progressPercent: Math.round((completed.size / Math.max(lessonCatalog.length, 1)) * 100),
    badges: buildBadges({ completedCount: completed.size, streakDays: input.streakDays }),
    mastery,
    lessons,
    nextBehaviorLink: input.debtFocusActive
      ? "If you are comparing debt scenarios, this lesson explains how interest changes total cost over time."
      : "Choose the lesson that helps explain the scenario you want to understand more clearly this month.",
  } satisfies LearnDashboardDTO;
}

export function buildTimelineItems(
  activityLogs: Array<{
    id: string;
    kind: string;
    title: string;
    description: string | null;
    occurred_at: string;
  }>,
) {
  return activityLogs.slice(0, 6).map((item) => ({
    id: item.id,
    kind: item.kind,
    title: item.title,
    description: item.description ?? "Progress counts most when you can explain why it matters.",
    occurredAt: item.occurred_at,
  }));
}

export function extractLegacyOverview(latestIntake: JsonLike, latestSnapshot: JsonLike) {
  const income = readNestedNumber(latestIntake, ["income", "monthly"]);
  const fixed = readNestedNumber(latestIntake, ["expenses", "fixed_monthly"]);
  const flexible = readNestedNumber(latestIntake, ["expenses", "flexible_monthly"]);
  const totalDebt = readNestedNumber(latestIntake, ["debt", "total"]);
  const minimumDebtPayments = readNestedNumber(latestIntake, ["debt", "minimum_monthly_payments"]);
  const savingsBalance = readNestedNumber(latestIntake, ["savings", "balance"]);
  const goalName = readNestedString(latestIntake, ["goals", "primary_name"]);
  const goalMonthlyTarget = readNestedNumber(latestIntake, ["goals", "monthly_target"]);

  return {
    income,
    fixed,
    flexible,
    totalDebt,
    minimumDebtPayments,
    savingsBalance,
    goalName,
    goalMonthlyTarget,
    monthlySurplus: readNumber(latestSnapshot?.monthly_surplus),
    runwayMonths: readNumber(latestSnapshot?.runway_months),
  };
}

function collapseCurrentCategories(
  expenses: Array<{
    id: string;
    category: string;
    period_start: string;
    planned_amount: number;
    actual_amount: number;
  }>,
) {
  const latestPeriod = [...new Set(expenses.map((item) => item.period_start))].sort().at(-1);
  const current = expenses.filter((item) => item.period_start === latestPeriod);
  return current.map((item) => {
    const bucket = categoryBucket(item.category);
    const usedPercent = Math.round((item.actual_amount / Math.max(item.planned_amount, 1)) * 100);
    return {
      id: item.id,
      name: humanizeCategory(item.category),
      planned: roundMoney(item.planned_amount),
      actual: roundMoney(item.actual_amount),
      usedPercent,
      bucket,
      guidance: buildBudgetGuidance(item.category, item.actual_amount, item.planned_amount),
    } satisfies BudgetCategoryDTO;
  });
}

function buildBudgetGuidance(category: string, actual: number, planned: number) {
  if (actual > planned) {
    return `${humanizeCategory(category)} is above plan right now. One option is to compare how a small adjustment here could affect your monthly leftover.`;
  }

  if (actual < planned * 0.75) {
    return `This category is currently below plan. That difference could support another scenario elsewhere in the dashboard.`;
  }

  return "This category is close to plan, which makes it a useful baseline for comparing future months.";
}

function buildSpendingTrend(
  expenses: Array<{
    period_start: string;
    actual_amount: number;
  }>,
) {
  const grouped = new Map<string, number>();
  for (const expense of expenses) {
    grouped.set(
      expense.period_start,
      roundMoney((grouped.get(expense.period_start) ?? 0) + expense.actual_amount),
    );
  }

  return [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([label, value]) => ({
      label: label.slice(0, 7),
      value,
    }));
}

function compareDebtPriority(
  a: { apr: number | null; balance: number; monthly_payment: number },
  b: { apr: number | null; balance: number; monthly_payment: number },
) {
  const aprA = a.apr ?? -1;
  const aprB = b.apr ?? -1;
  if (aprA !== aprB) {
    return aprB - aprA;
  }

  const pressureA = a.monthly_payment / Math.max(a.balance, 1);
  const pressureB = b.monthly_payment / Math.max(b.balance, 1);
  if (pressureA !== pressureB) {
    return pressureB - pressureA;
  }

  return b.balance - a.balance;
}

function explainDebtPriority(
  debt: { apr: number | null; monthly_payment: number; balance: number },
  isFocus: boolean,
) {
  if (debt.apr !== null) {
    return isFocus
      ? `This account is surfaced because ${debt.apr}% APR may change total cost faster than the others.`
      : `Compared with higher-rate balances, this account may have a smaller effect on total cost in the short term.`;
  }

  return isFocus
    ? "This account is surfaced because the rate is unknown and its monthly strain appears comparatively heavy."
    : "Add the APR when you can to make future scenario comparisons more precise.";
}

function simulateAvalanche(
  debts: Array<{
    id: string;
    balance: number;
    apr: number | null;
    monthly_payment: number;
  }>,
  extraPayment: number,
) {
  const state = debts.map((debt) => ({ ...debt }));
  const timeline: Array<{ month: number; remainingBalance: number }> = [];
  let totalInterest = 0;
  let month = 0;

  while (state.some((item) => item.balance > 0.01) && month < 360) {
    month += 1;
    const active = state.filter((item) => item.balance > 0.01).sort(compareDebtPriority);
    let rollover = extraPayment;

    for (const debt of active) {
      const monthlyRate = (debt.apr ?? 0) / 100 / 12;
      const interest = debt.balance * monthlyRate;
      totalInterest += interest;
      debt.balance += interest;

      const payment = Math.min(debt.balance, debt.monthly_payment + rollover);
      debt.balance = Math.max(0, debt.balance - payment);
      rollover = Math.max(0, rollover + debt.monthly_payment - payment);
    }

    timeline.push({
      month,
      remainingBalance: roundMoney(sum(state.map((item) => item.balance))),
    });
  }

  return {
    months: month,
    totalInterest: roundMoney(totalInterest),
    timeline: timeline.slice(0, 24),
  };
}

function estimateSingleDebtMonths(balance: number, apr: number, payment: number) {
  if (balance <= 0 || payment <= 0) {
    return null;
  }

  let months = 0;
  let remaining = balance;
  while (remaining > 0.01 && months < 360) {
    months += 1;
    remaining += remaining * (apr / 100 / 12);
    remaining -= payment;
  }

  return months >= 360 ? null : months;
}

function projectCompletionDate(goal: {
  saved_amount: number;
  target_amount: number;
  monthly_contribution: number;
  target_date: string | null;
}) {
  if (goal.saved_amount >= goal.target_amount) {
    return "Completed";
  }

  if (goal.target_date) {
    return goal.target_date;
  }

  if (goal.monthly_contribution <= 0) {
    return null;
  }

  const months = Math.ceil(
    (goal.target_amount - goal.saved_amount) / Math.max(goal.monthly_contribution, 1),
  );
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function buildGoalProjection(goal: {
  saved_amount: number;
  target_amount: number;
  monthly_contribution: number;
}) {
  const values: number[] = [];
  let current = goal.saved_amount;
  for (let month = 0; month < 12; month += 1) {
    current = Math.min(goal.target_amount, current + goal.monthly_contribution);
    values.push(roundMoney(current));
  }
  return values;
}

function buildBadges({
  completedCount,
  streakDays,
}: {
  completedCount: number;
  streakDays: number;
}) {
  const badges: string[] = [];
  if (completedCount >= 1) {
    badges.push("First lesson complete");
  }
  if (completedCount >= 3) {
    badges.push("Momentum builder");
  }
  if (streakDays >= 7) {
    badges.push("7-day money streak");
  }
  return badges;
}

function categoryBucket(category: string): "Needs" | "Wants" | "Savings" {
  switch (category) {
    case "housing":
    case "food":
    case "transport":
    case "health":
      return "Needs";
    case "entertainment":
    case "clothing":
      return "Wants";
    default:
      return "Savings";
  }
}

function humanizeCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function readNestedNumber(input: JsonLike, path: string[]) {
  const value = readPath(input, path);
  return typeof value === "number" ? value : 0;
}

function readNestedString(input: JsonLike, path: string[]) {
  const value = readPath(input, path);
  return typeof value === "string" ? value : "";
}

function readPath(input: JsonLike, path: string[]) {
  let current: unknown = input;
  for (const segment of path) {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "EUR",
    style: "currency",
    maximumFractionDigits: 0,
  }).format(value);
}

function sum(values: number[]) {
  return roundMoney(values.reduce((total, value) => total + value, 0));
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
