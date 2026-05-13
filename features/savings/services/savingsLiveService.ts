// features/savings/services/savingsLiveService.ts
import { SavingsRequestSchema, SavingsResponseSchema, SavingsResponse } from "./savingsSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { goalEta } from "../savingsCalculations";

export async function getSavingsData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<SavingsResponse> {
  SavingsRequestSchema.parse({ userId });
  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  const emptyComputed = { totalSaved: 0, totalTarget: 0, totalRemaining: 0, monthlyTotal: 0 };

  if (!supabase) {
    return SavingsResponseSchema.parse({ userId, timestamp: now, goals: [], computed: emptyComputed });
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .select("id, name, target_amount, saved_amount, monthly_contribution")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return SavingsResponseSchema.parse({ userId, timestamp: now, goals: [], computed: emptyComputed });
  }

  const goals = data.map((row) => {
    const target = Number(row.target_amount);
    const current = Number(row.saved_amount);
    const monthlyContribution = Number(row.monthly_contribution ?? 0);
    const eta = goalEta({ target, current }, monthlyContribution);
    return {
      id: row.id as string,
      label: row.name as string,
      target,
      current,
      monthlyContribution,
      pctComplete: eta.pctComplete,
      remaining: eta.remaining,
      etaDate: eta.etaDate,
    };
  });

  const computed = {
    totalSaved: goals.reduce((s, g) => s + g.current, 0),
    totalTarget: goals.reduce((s, g) => s + g.target, 0),
    totalRemaining: goals.reduce((s, g) => s + g.remaining, 0),
    monthlyTotal: goals.reduce((s, g) => s + g.monthlyContribution, 0),
  };

  return SavingsResponseSchema.parse({ userId, timestamp: now, goals, computed });
}
