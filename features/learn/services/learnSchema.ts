import { z } from "zod";

export const LearnRequestSchema = z.object({ userId: z.string().min(1) });

export const Lesson = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  category: z.enum(["debt", "savings", "budget", "credit", "bnpl"]),
  readingMinutes: z.number(),
  xpReward: z.number(),
});

export const LearnResponseSchema = z.object({
  userId: z.string(),
  lessons: z.array(Lesson),
  completedCount: z.number(),
  timestamp: z.string(),
});

export type LearnResponse = z.infer<typeof LearnResponseSchema>;
