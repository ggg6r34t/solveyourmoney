import {
  SavingsRequestSchema,
  SavingsResponseSchema,
  SavingsResponse,
} from "./savingsSchema";

export async function getSavingsData({
  userId,
  supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<SavingsResponse> {
  SavingsRequestSchema.parse({ userId });
  if (!supabaseClient) {
    const now = new Date().toISOString();
    const data: SavingsResponse = { userId, timestamp: now, goals: [] };
    return SavingsResponseSchema.parse(data);
  }

  // TODO: implement DB queries
  const now = new Date().toISOString();
  const data: SavingsResponse = { userId, timestamp: now, goals: [] };
  return SavingsResponseSchema.parse(data);
}
