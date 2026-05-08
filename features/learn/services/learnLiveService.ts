import {
  LearnRequestSchema,
  LearnResponseSchema,
  LearnResponse,
} from "./learnSchema";

export async function getLearnData({
  userId,
  supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<LearnResponse> {
  LearnRequestSchema.parse({ userId });
  if (!supabaseClient) {
    const now = new Date().toISOString();
    const data: LearnResponse = { userId, timestamp: now, lessons: [] };
    return LearnResponseSchema.parse(data);
  }

  // TODO: implement DB queries
  const now = new Date().toISOString();
  const data: LearnResponse = { userId, timestamp: now, lessons: [] };
  return LearnResponseSchema.parse(data);
}
