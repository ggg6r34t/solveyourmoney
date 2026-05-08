import {
  OverviewRequestSchema,
  OverviewResponseSchema,
  OverviewResponse,
} from "./overviewSchema";

export async function getOverviewData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<OverviewResponse> {
  OverviewRequestSchema.parse({ userId });

  const now = new Date().toISOString();

  const { createSupabaseServerClient } = await import(
    "@/lib/supabase/server"
  );
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return OverviewResponseSchema.parse({ userId, timestamp: now, items: [] });
  }

  // Ensure financial_profiles row exists for new users (no-op if already present)
  await supabase
    .from("financial_profiles")
    .upsert(
      { user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    .toISOString()
    .split("T")[0];

  const [profileResult, debtsResult, savingsResult, expensesResult] =
    await Promise.all([
      supabase
        .from("financial_profiles")
        .select("monthly_income")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("debts").select("balance").eq("user_id", userId),
      supabase.from("savings_goals").select("saved_amount").eq("user_id", userId),
      supabase
        .from("expenses")
        .select("actual_amount")
        .eq("user_id", userId)
        .gte("period_start", monthStart)
        .lt("period_start", monthEnd),
    ]);

  const monthlyIncome = Number(profileResult.data?.monthly_income ?? 0);
  const totalDebt = (debtsResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.balance),
    0,
  );
  const totalSaved = (savingsResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.saved_amount),
    0,
  );
  const spentMonth = (expensesResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.actual_amount),
    0,
  );

  const items = [
    { id: "income", type: "metric" as const, label: "Monthly Income", value: monthlyIncome },
    { id: "total_debt", type: "metric" as const, label: "Total Debt", value: totalDebt },
    { id: "total_saved", type: "metric" as const, label: "Total Saved", value: totalSaved },
    { id: "spent_month", type: "metric" as const, label: "Spent This Month", value: spentMonth },
  ];

  return OverviewResponseSchema.parse({ userId, timestamp: now, items });
}
