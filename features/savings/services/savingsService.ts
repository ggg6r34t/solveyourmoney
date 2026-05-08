import { resolveDataSource } from "../../../lib/data-source/resolveDataSource";
import * as mockService from "./savingsMockService";
import * as liveService from "./savingsLiveService";
import type { SavingsResponse } from "./savingsSchema";

type SavingsDataOptions = Parameters<typeof mockService.getSavingsData>[0];
type SavingsDataService = {
  getSavingsData: (
    opts: SavingsDataOptions,
  ) => SavingsResponse | Promise<SavingsResponse>;
};

export function getSavingsData(opts: SavingsDataOptions) {
  const service = resolveDataSource<SavingsDataService>({
    featureName: "savings",
    mockService,
    liveService,
  });
  return service.getSavingsData(opts);
}
