import { z } from "zod";

export const GamificationRequestSchema = z.object({ userId: z.string().min(1) });

export const GamificationResponseSchema = z.object({
  userId: z.string(),
  xp: z.number(),
  streak: z.number(),
  level: z.number(),
  levelName: z.string(),
  xpForCurrentLevel: z.number(),
  xpForNextLevel: z.number().nullable(),
  xpPct: z.number(),
  nextLevelName: z.string().nullable(),
  timestamp: z.string(),
});

export type GamificationResponse = z.infer<typeof GamificationResponseSchema>;
