import { z } from "zod";

export const SavingsRequestSchema = z.object({ userId: z.string().min(1) });

export const SavingsGoal = z.object({
  id: z.string(),
  label: z.string(),
  target: z.number(),
  current: z.number(),
  monthlyContribution: z.number(),
  pctComplete: z.number(),
  remaining: z.number(),
  etaDate: z.string(),
});

export const SavingsComputedSchema = z.object({
  totalSaved: z.number(),
  totalTarget: z.number(),
  totalRemaining: z.number(),
  monthlyTotal: z.number(),
});

export const SavingsResponseSchema = z.object({
  userId: z.string(),
  goals: z.array(SavingsGoal),
  computed: SavingsComputedSchema,
  timestamp: z.string(),
});

export type SavingsResponse = z.infer<typeof SavingsResponseSchema>;
