import {
  OverviewRequestSchema,
  OverviewResponseSchema,
  OverviewResponse,
} from "./overviewSchema";

export async function getOverviewData({
  userId,
  supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<OverviewResponse> {
  OverviewRequestSchema.parse({ userId });

  if (!supabaseClient) {
    const now = new Date().toISOString();
    const data: OverviewResponse = {
      userId,
      timestamp: now,
      items: [],
    };
    return OverviewResponseSchema.parse(data);
  }

  // TODO: Implement real queries using supabaseClient
  const now = new Date().toISOString();
  const data: OverviewResponse = { userId, timestamp: now, items: [] };
  return OverviewResponseSchema.parse(data);
}
