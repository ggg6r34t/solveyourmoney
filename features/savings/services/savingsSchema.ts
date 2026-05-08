import { z } from "zod";

export const SavingsRequestSchema = z.object({ userId: z.string().min(1) });

export const SavingsGoal = z.object({
  id: z.string(),
  label: z.string(),
  target: z.number(),
  current: z.number(),
});

export const SavingsResponseSchema = z.object({
  userId: z.string(),
  goals: z.array(SavingsGoal),
  timestamp: z.string(),
});

export type SavingsResponse = z.infer<typeof SavingsResponseSchema>;
