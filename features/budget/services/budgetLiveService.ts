import {
  BudgetRequestSchema,
  BudgetResponseSchema,
  BudgetResponse,
} from "./budgetSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    return BudgetResponseSchema.parse({ userId, timestamp: now, categories: [] });
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
    return BudgetResponseSchema.parse({ userId, timestamp: now, categories: [] });
  }

  const categories = data.map((row) => ({
    id: row.id as string,
    label: row.category as string,
    allocated: Number(row.planned_amount),
    spent: Number(row.actual_amount),
  }));

  return BudgetResponseSchema.parse({ userId, timestamp: now, categories });
}
