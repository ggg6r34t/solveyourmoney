import { z } from "zod";

export const OverviewRequestSchema = z.object({ userId: z.string().min(1) });

export const OverviewItem = z.object({
  id: z.string(),
  type: z.enum(["account", "metric"]),
  label: z.string(),
  value: z.number().nullable(),
});

export const OverviewResponseSchema = z.object({
  userId: z.string(),
  items: z.array(OverviewItem),
  timestamp: z.string(),
});

export type OverviewResponse = z.infer<typeof OverviewResponseSchema>;
