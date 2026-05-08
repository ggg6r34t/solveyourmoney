import { SavingsResponseSchema, SavingsResponse } from "./savingsSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";

export function getSavingsData({
  userId,
}: {
  userId: string;
}): SavingsResponse {
  assertMockDataAllowed("savings");
  const now = new Date().toISOString();
  const data: SavingsResponse = {
    userId,
    timestamp: now,
    goals: [
      { id: "g-1", label: "Emergency Fund", target: 6000, current: 3500 },
      { id: "g-2", label: "Holiday", target: 1500, current: 300 },
    ],
  };
  return SavingsResponseSchema.parse(data);
}
