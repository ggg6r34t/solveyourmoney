import { resolveDataSource } from "../../../lib/data-source/resolveDataSource";
import * as mockService from "./debtMockService";
import * as liveService from "./debtLiveService";
import type { DebtResponse } from "./debtSchema";

type DebtDataOptions = Parameters<typeof mockService.getDebtData>[0];
type DebtDataService = {
  getDebtData: (opts: DebtDataOptions) => DebtResponse | Promise<DebtResponse>;
};

export function getDebtData(opts: DebtDataOptions) {
  const service = resolveDataSource<DebtDataService>({
    featureName: "debt",
    mockService,
    liveService,
  });
  return service.getDebtData(opts);
}
