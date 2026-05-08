import { OverviewResponseSchema, OverviewResponse } from "./overviewSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";

export function getOverviewData({
  userId,
}: {
  userId: string;
}): OverviewResponse {
  assertMockDataAllowed("overview");

  const now = new Date().toISOString();
  const data = {
    userId,
    timestamp: now,
    items: [
      { id: "m-1", type: "metric", label: "Monthly Cashflow", value: 1200 },
      { id: "m-2", type: "metric", label: "Emergency Fund", value: 3500 },
      { id: "a-1", type: "account", label: "Checking", value: 4200 },
    ],
  };

  return OverviewResponseSchema.parse(data);
}
