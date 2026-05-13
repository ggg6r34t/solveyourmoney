// features/debt/services/debtSchema.ts
import { z } from "zod";

export const DebtRequestSchema = z.object({ userId: z.string().min(1) });

export const DebtItem = z.object({
  id: z.string(),
  principal: z.number(),
  interestRate: z.number(), // decimal, e.g. 0.194
  label: z.string(),
  minPayment: z.number(),
});

export const DebtComputed = z.object({
  totalBalance: z.number(),
  totalMinPayment: z.number(),
  totalInterest: z.number(),
  debtFreeDate: z.string(),
  monthsToPayoff: z.number(),
  avalancheOrder: z.array(z.string()),
});

export const DebtResponseSchema = z.object({
  userId: z.string(),
  items: z.array(DebtItem),
  computed: DebtComputed,
  timestamp: z.string(),
});

export type DebtResponse = z.infer<typeof DebtResponseSchema>;
