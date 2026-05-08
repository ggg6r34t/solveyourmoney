import {
  SavingsRequestSchema,
  SavingsResponseSchema,
  SavingsResponse,
} from "./savingsSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  if (!supabase) {
    return SavingsResponseSchema.parse({ userId, timestamp: now, goals: [] });
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .select("id, name, target_amount, saved_amount")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return SavingsResponseSchema.parse({ userId, timestamp: now, goals: [] });
  }

  const goals = data.map((row) => ({
    id: row.id as string,
    label: row.name as string,
    target: Number(row.target_amount),
    current: Number(row.saved_amount),
  }));

  return SavingsResponseSchema.parse({ userId, timestamp: now, goals });
}
