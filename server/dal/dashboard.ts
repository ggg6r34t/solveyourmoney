import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildBudgetDashboard,
  buildDebtScenario,
  buildLearnDashboard,
  buildSavingsGoals,
  buildTimelineItems,
  computeLevel,
  createSummaryCards,
  extractLegacyOverview,
  getCoachCue,
  type BudgetDashboardDTO,
  type DashboardChrome,
  type DebtScenarioDTO,
  type LearnDashboardDTO,
  type SavingsGoalDTO,
  type SummaryCardDTO,
  type TimelineItemDTO,
} from "@/features/dashboard/logic";
import { requireSession } from "./session";

type DashboardBaseData = {
  configured: boolean;
  session: Awaited<ReturnType<typeof requireSession>>;
  financialProfile: Record<string, unknown> | null;
  debts: Array<Record<string, unknown>>;
  expenses: Array<Record<string, unknown>>;
  savingsGoals: Array<Record<string, unknown>>;
  learningProgress: Array<Record<string, unknown>>;
  activityLogs: Array<Record<string, unknown>>;
  latestSnapshot: Record<string, unknown> | null;
  latestIntake: Record<string, unknown> | null;
  errors: string[];
};

type OverviewDashboardDTO = {
  chrome: DashboardChrome;
  summaryCards: SummaryCardDTO[];
  debtScenario: DebtScenarioDTO;
  savingsGoals: SavingsGoalDTO[];
  timeline: TimelineItemDTO[];
  monthlyIncome: number;
  spentThisMonth: number;
  totalSaved: number;
  incompleteAreas: string[];
  configured: boolean;
};

type SavingsDashboardDTO = {
  chrome: DashboardChrome;
  goals: SavingsGoalDTO[];
  totalSaved: number;
  totalTarget: number;
  remaining: number;
  monthlyAutoSave: number;
  incompleteAreas: string[];
  configured: boolean;
};

export async function getDashboardChromeData() {
  const base = await getDashboardBaseData();
  return {
    chrome: createChrome(base),
    configured: base.configured,
    incompleteAreas: collectIncompleteAreas(base),
  };
}

export async function getOverviewDashboardData(): Promise<OverviewDashboardDTO> {
  const base = await getDashboardBaseData();
  const chrome = createChrome(base);
  const income = getMonthlyIncome(base);
  const spentThisMonth = getSpentThisMonth(base);
  const totalSaved = getTotalSaved(base);
  const debtScenario = createDebtScenario(base, 0);
  const savingsGoals = createSavingsGoals(base);
  const summaryCards = createSummaryCards({
    totalDebt: debtScenario.totalDebt,
    monthlyIncome: income,
    spentThisMonth,
    totalSaved,
    debtTrend: readNumber(base.latestSnapshot?.monthly_surplus) < 0 ? 120 : -240,
    spendingTrend: getTrendDelta(base),
    savingsTrend: savingsGoals.length ? savingsGoals[0].monthlyContribution : 0,
  });

  return {
    chrome,
    summaryCards,
    debtScenario,
    savingsGoals,
    timeline: createTimeline(base),
    monthlyIncome: income,
    spentThisMonth,
    totalSaved,
    incompleteAreas: collectIncompleteAreas(base),
    configured: base.configured,
  };
}

export async function getDebtDashboardData(extraPayment = 0) {
  const base = await getDashboardBaseData();
  return {
    chrome: createChrome(base),
    debtScenario: createDebtScenario(base, extraPayment),
    incompleteAreas: collectIncompleteAreas(base),
    configured: base.configured,
  };
}

export async function getBudgetDashboardData(): Promise<{
  chrome: DashboardChrome;
  budget: BudgetDashboardDTO;
  incompleteAreas: string[];
  configured: boolean;
}> {
  const base = await getDashboardBaseData();
  return {
    chrome: createChrome(base),
    budget: buildBudgetDashboard({
      expenses: base.expenses.map((item) => ({
        id: String(item.id),
        category: String(item.category ?? "housing"),
        period_start: String(item.period_start ?? new Date().toISOString().slice(0, 10)),
        planned_amount: readNumber(item.planned_amount),
        actual_amount: readNumber(item.actual_amount),
      })),
      monthlyIncome: getMonthlyIncome(base),
      monthlyAutoSave: readNumber(base.financialProfile?.monthly_auto_save),
    }),
    incompleteAreas: collectIncompleteAreas(base),
    configured: base.configured,
  };
}

export async function getSavingsDashboardData(): Promise<SavingsDashboardDTO> {
  const base = await getDashboardBaseData();
  const goals = createSavingsGoals(base);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  return {
    chrome: createChrome(base),
    goals,
    totalSaved,
    totalTarget,
    remaining: Math.max(0, totalTarget - totalSaved),
    monthlyAutoSave: readNumber(base.financialProfile?.monthly_auto_save),
    incompleteAreas: collectIncompleteAreas(base),
    configured: base.configured,
  };
}

export async function getLearnDashboardData(): Promise<{
  chrome: DashboardChrome;
  learn: LearnDashboardDTO;
  incompleteAreas: string[];
  configured: boolean;
}> {
  const base = await getDashboardBaseData();
  const debtScenario = createDebtScenario(base, 0);

  return {
    chrome: createChrome(base),
    learn: buildLearnDashboard({
      xp: readNumber(base.financialProfile?.level_xp),
      streakDays: readNumber(base.financialProfile?.streak_days),
      learningProgress: base.learningProgress.map((item) => ({
        slug: String(item.slug),
        completed_at: typeof item.completed_at === "string" ? item.completed_at : null,
      })),
      debtFocusActive: Boolean(debtScenario.focusDebtId),
    }),
    incompleteAreas: collectIncompleteAreas(base),
    configured: base.configured,
  };
}

export async function getDebtScenarioPreview(extraPayment: number) {
  const base = await getDashboardBaseData();
  return createDebtScenario(base, extraPayment);
}

async function getDashboardBaseData(): Promise<DashboardBaseData> {
  const session = await requireSession();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      configured: false,
      session,
      financialProfile: null,
      debts: [],
      expenses: [],
      savingsGoals: [],
      learningProgress: [],
      activityLogs: [],
      latestSnapshot: null,
      latestIntake: null,
      errors: ["Supabase is not configured yet."],
    };
  }

  const [
    financialProfile,
    debts,
    expenses,
    savingsGoals,
    learningProgress,
    activityLogs,
    latestSnapshot,
    latestIntake,
  ] = await Promise.all([
    selectSingle(supabase, "financial_profiles", session.userId),
    selectMany(supabase, "debts", session.userId),
    selectMany(supabase, "expenses", session.userId),
    selectMany(supabase, "savings_goals", session.userId),
    selectMany(supabase, "learning_progress", session.userId),
    selectMany(supabase, "activity_logs", session.userId, "occurred_at"),
    selectSingle(supabase, "financial_snapshots", session.userId, "created_at"),
    selectSingle(supabase, "money_intakes", session.userId, "created_at"),
  ]);

  return {
    configured: true,
    session,
    financialProfile: financialProfile.data,
    debts: debts.data,
    expenses: expenses.data,
    savingsGoals: savingsGoals.data,
    learningProgress: learningProgress.data,
    activityLogs: activityLogs.data,
    latestSnapshot: latestSnapshot.data,
    latestIntake: latestIntake.data,
    errors: [
      ...financialProfile.errors,
      ...debts.errors,
      ...expenses.errors,
      ...savingsGoals.errors,
      ...learningProgress.errors,
      ...activityLogs.errors,
      ...latestSnapshot.errors,
      ...latestIntake.errors,
    ],
  };
}

async function selectMany(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  table: string,
  userId: string,
  orderColumn = "updated_at",
) {
  const query = supabase
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .order(orderColumn, { ascending: false });

  const { data, error } = await query;
  if (error) {
    return {
      data: [] as Array<Record<string, unknown>>,
      errors: [error.message],
    };
  }

  return {
    data: (data ?? []) as Array<Record<string, unknown>>,
    errors: [] as string[],
  };
}

async function selectSingle(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  table: string,
  userId: string,
  orderColumn?: string,
) {
  let query = supabase.from(table).select("*").eq("user_id", userId);
  if (orderColumn) {
    query = query.order(orderColumn, { ascending: false }).limit(1);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    return {
      data: null as Record<string, unknown> | null,
      errors: [error.message],
    };
  }

  return {
    data: data as Record<string, unknown> | null,
    errors: [] as string[],
  };
}

function createChrome(base: DashboardBaseData): DashboardChrome {
  const legacy = extractLegacyOverview(base.latestIntake, base.latestSnapshot);
  const xp = readNumber(base.financialProfile?.level_xp);
  const totalDebt = base.debts.length
    ? base.debts.reduce((sum, debt) => sum + readNumber(debt.balance), 0)
    : legacy.totalDebt;
  const monthlySurplus =
    readNumber(base.latestSnapshot?.monthly_surplus) ||
    legacy.monthlySurplus ||
    (legacy.income - legacy.fixed - legacy.flexible - legacy.minimumDebtPayments);
  const runwayMonths = readNumber(base.latestSnapshot?.runway_months) || legacy.runwayMonths;

  return {
    configured: base.configured,
    displayName:
      (base.financialProfile?.preferred_name as string | undefined) ||
      base.session.displayName ||
      "Jordan",
    level: computeLevel(xp),
    xp,
    streakDays: readNumber(base.financialProfile?.streak_days),
    coachCue: getCoachCue({ monthlySurplus, totalDebt, runwayMonths }),
  };
}

function createDebtScenario(base: DashboardBaseData, extraPayment: number) {
  if (base.debts.length) {
    return buildDebtScenario(
      base.debts.map((item) => ({
        id: String(item.id),
        name: String(item.name ?? "Debt"),
        provider: typeof item.provider === "string" ? item.provider : null,
        balance: readNumber(item.balance),
        limit_amount: readNullableNumber(item.limit_amount),
        apr: readNullableNumber(item.apr),
        monthly_payment: readNumber(item.monthly_payment),
      })),
      extraPayment,
    );
  }

  const legacy = extractLegacyOverview(base.latestIntake, base.latestSnapshot);
  return buildDebtScenario(
    legacy.totalDebt
      ? [
          {
            id: "legacy-debt",
            name: "Recorded debt",
            provider: "Reality check",
            balance: legacy.totalDebt,
            limit_amount: null,
            apr: null,
            monthly_payment: legacy.minimumDebtPayments,
          },
        ]
      : [],
    extraPayment,
  );
}

function createSavingsGoals(base: DashboardBaseData) {
  if (base.savingsGoals.length) {
    return buildSavingsGoals(
      base.savingsGoals.map((item) => ({
        id: String(item.id),
        name: String(item.name ?? "Goal"),
        saved_amount: readNumber(item.saved_amount),
        target_amount: readNumber(item.target_amount),
        monthly_contribution: readNumber(item.monthly_contribution),
        target_date: typeof item.target_date === "string" ? item.target_date : null,
      })),
    );
  }

  const legacy = extractLegacyOverview(base.latestIntake, base.latestSnapshot);
  return buildSavingsGoals(
    legacy.goalName
      ? [
          {
            id: "legacy-goal",
            name: legacy.goalName,
            saved_amount: legacy.savingsBalance,
            target_amount: Math.max(legacy.goalMonthlyTarget * 6, legacy.savingsBalance + 1),
            monthly_contribution: legacy.goalMonthlyTarget,
            target_date: null,
          },
        ]
      : [],
  );
}

function createTimeline(base: DashboardBaseData) {
  if (base.activityLogs.length) {
    return buildTimelineItems(
      base.activityLogs.map((item) => ({
        id: String(item.id),
        kind: String(item.kind ?? "progress"),
        title: String(item.title ?? "Progress logged"),
        description: typeof item.description === "string" ? item.description : null,
        occurred_at:
          typeof item.occurred_at === "string" ? item.occurred_at : new Date().toISOString(),
      })),
    );
  }

  if (base.latestSnapshot?.created_at) {
    return [
      {
        id: "legacy-snapshot",
        kind: "checkin",
        title: "Reality check saved",
        description: "Your first dashboard view can already point to the next calmer decision.",
        occurredAt: String(base.latestSnapshot.created_at),
      },
    ];
  }

  return [];
}

function collectIncompleteAreas(base: DashboardBaseData) {
  const areas: string[] = [];
  if (!base.debts.length) {
    areas.push("Add individual debts with APRs to unlock precise payoff ordering.");
  }
  if (!base.expenses.length) {
    areas.push("Add categorized expenses to surface overspending instead of only totals.");
  }
  if (!base.savingsGoals.length) {
    areas.push("Add savings goals to turn progress into projected milestones.");
  }
  if (!base.learningProgress.length) {
    areas.push("Learning progress will begin filling once the first lesson is completed.");
  }
  return [...new Set([...areas, ...base.errors.slice(0, 2)])];
}

function getMonthlyIncome(base: DashboardBaseData) {
  const legacy = extractLegacyOverview(base.latestIntake, base.latestSnapshot);
  return readNumber(base.financialProfile?.monthly_income) || legacy.income;
}

function getSpentThisMonth(base: DashboardBaseData) {
  if (base.expenses.length) {
    return base.expenses
      .filter((item) => {
        const period = String(item.period_start ?? "");
        return period.startsWith(new Date().toISOString().slice(0, 7));
      })
      .reduce((sum, item) => sum + readNumber(item.actual_amount), 0);
  }

  const legacy = extractLegacyOverview(base.latestIntake, base.latestSnapshot);
  return legacy.fixed + legacy.flexible + legacy.minimumDebtPayments;
}

function getTotalSaved(base: DashboardBaseData) {
  if (base.savingsGoals.length) {
    return base.savingsGoals.reduce((sum, item) => sum + readNumber(item.saved_amount), 0);
  }

  const legacy = extractLegacyOverview(base.latestIntake, base.latestSnapshot);
  return legacy.savingsBalance;
}

function getTrendDelta(base: DashboardBaseData) {
  if (!base.expenses.length) {
    return 0;
  }

  const periods = [...new Set(base.expenses.map((item) => String(item.period_start)))].sort();
  const current = periods.at(-1);
  const previous = periods.at(-2);
  if (!current || !previous) {
    return 0;
  }

  const currentTotal = base.expenses
    .filter((item) => String(item.period_start) === current)
    .reduce((sum, item) => sum + readNumber(item.actual_amount), 0);
  const previousTotal = base.expenses
    .filter((item) => String(item.period_start) === previous)
    .reduce((sum, item) => sum + readNumber(item.actual_amount), 0);

  return currentTotal - previousTotal;
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function readNullableNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}
