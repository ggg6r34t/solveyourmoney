// features/budget/services/budgetLiveService.ts
import { BudgetRequestSchema, BudgetResponseSchema, BudgetResponse } from "./budgetSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeBudget } from "../budgetCalculations";

export async function getBudgetData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<BudgetResponse> {
  BudgetRequestSchema.parse({ userId });
  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  const emptyComputed = { totalAllocated: 0, totalSpent: 0, surplusDeficit: 0, percentSpent: 0, savingsRate: 0 };

  if (!supabase) {
    return BudgetResponseSchema.parse({ userId, timestamp: now, income: 0, categories: [], computed: emptyComputed });
  }

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split("T")[0];

  const [profileResult, expensesResult] = await Promise.all([
    supabase.from("financial_profiles").select("monthly_income").eq("user_id", userId).maybeSingle(),
    supabase
      .from("expenses")
      .select("id, category, planned_amount, actual_amount")
      .eq("user_id", userId)
      .gte("period_start", monthStart)
      .lt("period_start", monthEnd)
      .order("created_at", { ascending: true }),
  ]);

  if (profileResult.error && profileResult.error.code !== "PGRST116") {
    return BudgetResponseSchema.parse({ userId, timestamp: now, income: 0, categories: [], computed: emptyComputed });
  }
  const income = Number(profileResult.data?.monthly_income ?? 0);

  if (expensesResult.error || !expensesResult.data) {
    return BudgetResponseSchema.parse({ userId, timestamp: now, income, categories: [], computed: emptyComputed });
  }

  const categories = expensesResult.data.map((row) => ({
    id: row.id as string,
    label: row.category as string,
    allocated: Number(row.planned_amount),
    spent: Number(row.actual_amount),
  }));

  const computed = computeBudget(categories, income);
  return BudgetResponseSchema.parse({ userId, timestamp: now, income, categories, computed });
}
