import {
  DebtRequestSchema,
  DebtResponseSchema,
  DebtResponse,
} from "./debtSchema";

export async function getDebtData({
  userId,
  supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<DebtResponse> {
  DebtRequestSchema.parse({ userId });
  if (!supabaseClient) {
    const now = new Date().toISOString();
    const data: DebtResponse = { userId, timestamp: now, items: [] };
    return DebtResponseSchema.parse(data);
  }

  // TODO: Implement DB queries
  const now = new Date().toISOString();
  const data: DebtResponse = { userId, timestamp: now, items: [] };
  return DebtResponseSchema.parse(data);
}
