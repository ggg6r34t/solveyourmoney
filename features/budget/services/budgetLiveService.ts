import {
  BudgetRequestSchema,
  BudgetResponseSchema,
  BudgetResponse,
} from "./budgetSchema";
import { computeBudget } from "../budgetCalculations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const FALLBACK_INCOME = 0;

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

  if (!supabase) {
    const categories: { id: string; label: string; allocated: number; spent: number }[] = [];
    return BudgetResponseSchema.parse({
      userId,
      timestamp: now,
      income: FALLBACK_INCOME,
      categories,
      computed: computeBudget(categories, FALLBACK_INCOME),
    });
  }

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("expenses")
    .select("id, category, planned_amount, actual_amount")
    .eq("user_id", userId)
    .gte("period_start", monthStart)
    .lt("period_start", monthEnd)
    .order("created_at", { ascending: true });

  if (error || !data) {
    const categories: { id: string; label: string; allocated: number; spent: number }[] = [];
    return BudgetResponseSchema.parse({
      userId,
      timestamp: now,
      income: FALLBACK_INCOME,
      categories,
      computed: computeBudget(categories, FALLBACK_INCOME),
    });
  }

  const categories = data.map((row) => ({
    id: row.id as string,
    label: row.category as string,
    allocated: Number(row.planned_amount),
    spent: Number(row.actual_amount),
  }));

  return BudgetResponseSchema.parse({
    userId,
    timestamp: now,
    income: FALLBACK_INCOME,
    categories,
    computed: computeBudget(categories, FALLBACK_INCOME),
  });
}
