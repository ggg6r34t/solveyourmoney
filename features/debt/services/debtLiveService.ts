import {
  DebtRequestSchema,
  DebtResponseSchema,
  DebtResponse,
} from "./debtSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getDebtData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<DebtResponse> {
  DebtRequestSchema.parse({ userId });

  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return DebtResponseSchema.parse({ userId, timestamp: now, items: [] });
  }

  const { data, error } = await supabase
    .from("debts")
    .select("id, name, balance, apr")
    .eq("user_id", userId)
    .order("balance", { ascending: false });

  if (error || !data) {
    return DebtResponseSchema.parse({ userId, timestamp: now, items: [] });
  }

  const items = data.map((row) => ({
    id: row.id as string,
    label: row.name as string,
    principal: Number(row.balance),
    interestRate: Number(row.apr ?? 0),
  }));

  return DebtResponseSchema.parse({ userId, timestamp: now, items });
}
