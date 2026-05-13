// features/learn/services/learnLiveService.ts
import { LearnRequestSchema, LearnResponseSchema, LearnResponse } from "./learnSchema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { lessonCatalog } from "../../dashboard/catalog";

export async function getLearnData({
  userId,
  supabaseClient: _supabaseClient,
}: {
  userId: string;
  supabaseClient?: unknown;
}): Promise<LearnResponse> {
  LearnRequestSchema.parse({ userId });
  const now = new Date().toISOString();
  const supabase = await createSupabaseServerClient();

  const completedSlugs = new Set<string>();

  if (supabase) {
    const { data } = await supabase
      .from("learning_progress")
      .select("slug")
      .eq("user_id", userId)
      .not("completed_at", "is", null);

    if (data) {
      for (const row of data) completedSlugs.add(row.slug as string);
    }
  }

  const lessons = lessonCatalog.map((item) => ({
    id: item.slug,
    title: item.title,
    completed: completedSlugs.has(item.slug),
    category: item.category,
    readingMinutes: item.readingMinutes,
    xpReward: item.xpReward,
  }));

  return LearnResponseSchema.parse({
    userId,
    timestamp: now,
    lessons,
    completedCount: completedSlugs.size,
  });
}
