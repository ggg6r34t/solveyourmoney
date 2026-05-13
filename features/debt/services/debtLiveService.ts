// features/debt/services/debtLiveService.ts
import { DebtRequestSchema, DebtResponseSchema, DebtResponse } from "./debtSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { avalanchePayoff } from "../debtCalculations";

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

  const emptyComputed = {
    totalBalance: 0, totalMinPayment: 0, totalInterest: 0,
    debtFreeDate: "—", monthsToPayoff: 0, avalancheOrder: [],
  };

  if (!supabase) {
    return DebtResponseSchema.parse({ userId, timestamp: now, items: [], computed: emptyComputed });
  }

  const { data, error } = await supabase
    .from("debts")
    .select("id, name, balance, apr, monthly_payment")
    .eq("user_id", userId)
    .order("balance", { ascending: false });

  if (error || !data) {
    return DebtResponseSchema.parse({ userId, timestamp: now, items: [], computed: emptyComputed });
  }

  const items = data.map((row) => {
    const principal = Number(row.balance);
    const interestRate = Number(row.apr ?? 0) / 100; // DB stores as percent (19.4 → 0.194)
    const minPayment = Number(row.monthly_payment ?? Math.round(principal * 0.02));
    return { id: row.id as string, label: row.name as string, principal, interestRate, minPayment };
  });

  const payoffResult = avalanchePayoff(items, 0);
  const computed = {
    totalBalance: items.reduce((s, d) => s + d.principal, 0),
    totalMinPayment: items.reduce((s, d) => s + d.minPayment, 0),
    totalInterest: payoffResult.totalInterest,
    debtFreeDate: payoffResult.debtFreeDate,
    monthsToPayoff: payoffResult.monthsToPayoff,
    avalancheOrder: payoffResult.order,
  };

  return DebtResponseSchema.parse({ userId, timestamp: now, items, computed });
}
