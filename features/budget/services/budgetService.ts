import { resolveDataSource } from "../../../lib/data-source/resolveDataSource";
import * as mockService from "./budgetMockService";
import * as liveService from "./budgetLiveService";
import type { BudgetResponse } from "./budgetSchema";

type BudgetDataOptions = Parameters<typeof mockService.getBudgetData>[0];
type BudgetDataService = {
  getBudgetData: (opts: BudgetDataOptions) => BudgetResponse | Promise<BudgetResponse>;
};

export function getBudgetData(opts: BudgetDataOptions) {
  const service = resolveDataSource<BudgetDataService>({
    featureName: "budget",
    mockService,
    liveService,
  });
  return service.getBudgetData(opts);
}
