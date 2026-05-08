"use server";

import { revalidatePath } from "next/cache";
import {
  debtScenarioSchema,
  debtUpdateSchema,
  expenseUpdateSchema,
  learningCompletionSchema,
  savingsContributionSchema,
} from "@/lib/validation/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { captureServerEvent, events } from "@/observability/posthog";
import { getDebtScenarioPreview } from "@/server/dal/dashboard";
import { requireSession } from "@/server/dal/session";
import { writeAuditLog } from "@/server/services/audit";

type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string };

export async function updateDebtDetails(input: {
  id: string;
  balance: number;
  apr: number | null;
  monthlyPayment: number;
}): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = debtUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Debt details need a second look before saving." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Data storage is not configured yet." };
  }

  const { error } = await supabase
    .from("debts")
    .update({
      balance: parsed.data.balance,
      apr: parsed.data.apr ?? null,
      monthly_payment: parsed.data.monthlyPayment,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .eq("user_id", session.userId);

  if (error) {
    return { ok: false, message: "We could not update this debt safely." };
  }

  await logDashboardActivity(session.userId, {
    kind: "debt_payment",
    title: "Debt details updated",
    description: "Your payoff strategy has been refreshed with the latest balance details.",
    metadata: { debt_id: parsed.data.id },
  });

  await writeAuditLog({
    actorId: session.userId,
    action: "dashboard.debt_updated",
    targetType: "debt",
    targetId: parsed.data.id,
  });

  await captureServerEvent({
    distinctId: session.userId,
    event: events.debtUpdated,
    properties: { debt_id: parsed.data.id },
  });

  revalidateDashboard();
  return { ok: true, message: "Debt updated." };
}

export async function recalculateDebtStrategy(input: {
  extraPayment: number;
}): Promise<ActionResult<Awaited<ReturnType<typeof getDebtScenarioPreview>>>> {
  const parsed = debtScenarioSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Extra payment needs a valid number." };
  }

  const scenario = await getDebtScenarioPreview(parsed.data.extraPayment);
  return { ok: true, data: scenario };
}

export async function updateExpenseBudget(input: {
  id: string;
  planned: number;
  actual: number;
}): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = expenseUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Expense amounts need a second look before saving." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Data storage is not configured yet." };
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      planned_amount: parsed.data.planned,
      actual_amount: parsed.data.actual,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .eq("user_id", session.userId);

  if (error) {
    return { ok: false, message: "We could not update this category safely." };
  }

  await logDashboardActivity(session.userId, {
    kind: "budget_adjustment",
    title: "Budget category updated",
    description: "Your spending guidance has been recalculated with the latest category numbers.",
    metadata: { expense_id: parsed.data.id },
  });

  revalidateDashboard();
  return { ok: true, message: "Budget updated." };
}

export async function addMoneyToSavingsGoal(input: {
  goalId: string;
  amount: number;
}): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = savingsContributionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "The savings contribution amount is not valid yet." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Data storage is not configured yet." };
  }

  const { data: goal, error: goalError } = await supabase
    .from("savings_goals")
    .select("saved_amount, name")
    .eq("id", parsed.data.goalId)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (goalError || !goal) {
    return { ok: false, message: "We could not find that goal for your account." };
  }

  const { error } = await supabase
    .from("savings_goals")
    .update({
      saved_amount: Number(goal.saved_amount ?? 0) + parsed.data.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.goalId)
    .eq("user_id", session.userId);

  if (error) {
    return { ok: false, message: "We could not add money to this goal safely." };
  }

  await logDashboardActivity(session.userId, {
    kind: "savings_added",
    title: `Added money to ${goal.name}`,
    description: "Your savings projection moved forward.",
    metadata: { goal_id: parsed.data.goalId, amount: parsed.data.amount },
  });

  await writeAuditLog({
    actorId: session.userId,
    action: "dashboard.savings_updated",
    targetType: "savings_goal",
    targetId: parsed.data.goalId,
    metadata: { amount: parsed.data.amount },
  });

  await captureServerEvent({
    distinctId: session.userId,
    event: events.savingsUpdated,
    properties: { goal_id: parsed.data.goalId },
  });

  revalidateDashboard();
  return { ok: true, message: "Savings goal updated." };
}

export async function markLessonComplete(input: {
  slug: string;
}): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = learningCompletionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "We could not identify that lesson." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Data storage is not configured yet." };
  }

  const { error } = await supabase.from("learning_progress").upsert(
    {
      user_id: session.userId,
      slug: parsed.data.slug,
      xp: 80,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,slug" },
  );

  if (error) {
    return { ok: false, message: "We could not save lesson progress right now." };
  }

  const { data: profile } = await supabase
    .from("financial_profiles")
    .select("level_xp, streak_days")
    .eq("user_id", session.userId)
    .maybeSingle();

  await supabase.from("financial_profiles").upsert(
    {
      user_id: session.userId,
      level_xp: Number(profile?.level_xp ?? 0) + 80,
      streak_days: Math.max(Number(profile?.streak_days ?? 0), 1),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  await logDashboardActivity(session.userId, {
    kind: "learning_completed",
    title: "Lesson completed",
    description: "Learning progress is now connected to your coaching dashboard.",
    metadata: { slug: parsed.data.slug },
  });

  await captureServerEvent({
    distinctId: session.userId,
    event: events.learningCompleted,
    properties: { slug: parsed.data.slug },
  });

  revalidateDashboard();
  return { ok: true, message: "Lesson completed." };
}

async function logDashboardActivity(
  userId: string,
  input: {
    kind: string;
    title: string;
    description: string;
    metadata?: Record<string, unknown>;
  },
) {
  const supabase = await createSupabaseServerClient();
  await supabase?.from("activity_logs").insert({
    user_id: userId,
    kind: input.kind,
    title: input.title,
    description: input.description,
    metadata: input.metadata ?? {},
    occurred_at: new Date().toISOString(),
  });
}

function revalidateDashboard() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/debt");
  revalidatePath("/dashboard/budget");
  revalidatePath("/dashboard/savings");
  revalidatePath("/dashboard/learn");
}
