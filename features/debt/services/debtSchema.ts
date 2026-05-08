import { z } from "zod";

export const DebtRequestSchema = z.object({ userId: z.string().min(1) });

export const DebtItem = z.object({
  id: z.string(),
  principal: z.number(),
  interestRate: z.number(),
  label: z.string(),
});

export const DebtResponseSchema = z.object({
  userId: z.string(),
  items: z.array(DebtItem),
  timestamp: z.string(),
});

export type DebtResponse = z.infer<typeof DebtResponseSchema>;
