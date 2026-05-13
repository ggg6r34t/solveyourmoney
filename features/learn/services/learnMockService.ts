import { LearnResponseSchema, LearnResponse } from "./learnSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { lessonCatalog } from "../../dashboard/catalog";

export function getLearnData({ userId }: { userId: string }): LearnResponse {
  assertMockDataAllowed("learn");
  const now = new Date().toISOString();
  const lessons = lessonCatalog.map((item) => ({
    id: item.slug,
    title: item.title,
    completed: false,
    category: item.category,
    readingMinutes: item.readingMinutes,
    xpReward: item.xpReward,
  }));
  const completedCount = lessons.filter((l) => l.completed).length;
  return LearnResponseSchema.parse({ userId, timestamp: now, lessons, completedCount });
}
