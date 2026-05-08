import {
  BudgetRequestSchema,
  BudgetResponseSchema,
  BudgetResponse,
} from "./budgetSchema";

export async function getBudgetData({
  userId,
  supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<BudgetResponse> {
  BudgetRequestSchema.parse({ userId });
  if (!supabaseClient) {
    const now = new Date().toISOString();
    const data: BudgetResponse = { userId, timestamp: now, categories: [] };
    return BudgetResponseSchema.parse(data);
  }

  // TODO: implement DB queries
  const now = new Date().toISOString();
  const data: BudgetResponse = { userId, timestamp: now, categories: [] };
  return BudgetResponseSchema.parse(data);
}
