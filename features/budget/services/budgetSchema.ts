import { z } from "zod";

export const BudgetRequestSchema = z.object({ userId: z.string().min(1) });

export const BudgetCategory = z.object({
  id: z.string(),
  label: z.string(),
  allocated: z.number(),
  spent: z.number(),
});

export const BudgetComputedSchema = z.object({
  totalAllocated: z.number(),
  totalSpent: z.number(),
  surplusDeficit: z.number(),
  percentSpent: z.number(),
  savingsRate: z.number(),
});

export const BudgetResponseSchema = z.object({
  userId: z.string(),
  income: z.number(),
  categories: z.array(BudgetCategory),
  computed: BudgetComputedSchema,
  timestamp: z.string(),
});

export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;
