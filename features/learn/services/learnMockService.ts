import { LearnResponseSchema, LearnResponse } from "./learnSchema";
import { assertMockDataAllowed } from "../../../lib/mocks/mockGuards";

export function getLearnData({ userId }: { userId: string }): LearnResponse {
  assertMockDataAllowed("learn");
  const now = new Date().toISOString();
  const data: LearnResponse = {
    userId,
    timestamp: now,
    lessons: [
      { id: "l-1", title: "Budgeting Basics", completed: false },
      { id: "l-2", title: "Debt Repayment Strategies", completed: true },
    ],
  };
  return LearnResponseSchema.parse(data);
}
