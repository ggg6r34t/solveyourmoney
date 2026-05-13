import { GamificationResponseSchema, GamificationResponse } from "./gamificationSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";
import { deriveLevel } from "../gamificationCalculations";

export function getGamificationData({ userId }: { userId: string }): GamificationResponse {
  assertMockDataAllowed("gamification");
  const now = new Date().toISOString();
  const xp = 940;
  const streak = 12;
  const lvl = deriveLevel(xp);
  return GamificationResponseSchema.parse({
    userId,
    xp,
    streak,
    timestamp: now,
    level: lvl.level,
    levelName: lvl.name,
    xpForCurrentLevel: lvl.xpForCurrentLevel,
    xpForNextLevel: lvl.xpForNextLevel,
    xpPct: lvl.xpPct,
    nextLevelName: lvl.nextLevelName,
  });
}
