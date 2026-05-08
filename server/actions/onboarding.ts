"use server";

import { redirect } from "next/navigation";
import { moneyRealityCheckSchema } from "@/lib/validation/forms";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateFinancialSnapshot } from "@/features/financial-health/logic";
import { requireSession } from "@/server/dal/session";
import { writeAuditLog } from "@/server/services/audit";
import { captureServerEvent, events } from "@/observability/posthog";

export type OnboardingState = {
  status: "idle" | "error";
  message: string;
};

export async function submitMoneyRealityCheck(
  _state: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await requireSession();
  const parsed = moneyRealityCheckSchema.safeParse({
    monthlyIncome: formData.get("monthlyIncome"),
    monthlyFixedExpenses: formData.get("monthlyFixedExpenses"),
    monthlyFlexibleExpenses: formData.get("monthlyFlexibleExpenses"),
    totalDebt: formData.get("totalDebt"),
    minimumDebtPayments: formData.get("minimumDebtPayments"),
    savingsBalance: formData.get("savingsBalance"),
    goalName: formData.get("goalName"),
    goalMonthlyTarget: formData.get("goalMonthlyTarget"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Some money inputs need a second look before we can trust the plan.",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Data storage is not configured. Add Supabase service env vars before launch.",
    };
  }

  const snapshot = calculateFinancialSnapshot(parsed.data);
  const { data: intake, error: intakeError } = await supabase
    .from("money_intakes")
    .insert({
      user_id: session.userId,
      income: { monthly: parsed.data.monthlyIncome },
      expenses: {
        fixed_monthly: parsed.data.monthlyFixedExpenses,
        flexible_monthly: parsed.data.monthlyFlexibleExpenses,
      },
      debt: {
        total: parsed.data.totalDebt,
        minimum_monthly_payments: parsed.data.minimumDebtPayments,
      },
      savings: { balance: parsed.data.savingsBalance },
      goals: {
        primary_name: parsed.data.goalName,
        monthly_target: parsed.data.goalMonthlyTarget,
      },
      assumptions: { source: "manual_money_reality_check" },
    })
    .select("id")
    .single();

  if (intakeError) {
    return { status: "error", message: "We could not save the intake safely." };
  }

  const { error: snapshotError } = await supabase.from("financial_snapshots").insert({
    user_id: session.userId,
    intake_id: intake.id,
    monthly_surplus: snapshot.monthlySurplus,
    debt_pressure_ratio: snapshot.debtPressureRatio,
    runway_months: snapshot.runwayMonths,
    savings_rate: snapshot.savingsRate,
    risk_flags: snapshot.riskFlags,
    assumptions: snapshot.assumptions,
    logic_version: snapshot.logicVersion,
  });

  if (snapshotError) {
    return { status: "error", message: "We saved the intake but could not compute the snapshot." };
  }

  await supabase
    .from("profiles")
    .update({ onboarding_status: "completed" })
    .eq("id", session.userId);

  await writeAuditLog({
    actorId: session.userId,
    action: "onboarding.completed",
    targetType: "money_intake",
    targetId: intake.id,
  });

  await captureServerEvent({
    distinctId: session.userId,
    event: events.onboardingCompleted,
    properties: { logic_version: snapshot.logicVersion },
  });

  redirect("/dashboard");
}
