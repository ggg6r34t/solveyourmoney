import { z } from "zod";

export const BudgetRequestSchema = z.object({ userId: z.string().min(1) });

export const BudgetCategory = z.object({
  id: z.string(),
  label: z.string(),
  allocated: z.number(),
  spent: z.number(),
});

export const BudgetResponseSchema = z.object({
  userId: z.string(),
  categories: z.array(BudgetCategory),
  timestamp: z.string(),
});

export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;
