import { resolveDataSource } from "../../../lib/data-source/resolveDataSource";
import * as mockService from "./overviewMockService";
import * as liveService from "./overviewLiveService";
import type { OverviewResponse } from "./overviewSchema";

type OverviewDataOptions = Parameters<typeof mockService.getOverviewData>[0];
type OverviewDataService = {
  getOverviewData: (
    opts: OverviewDataOptions,
  ) => OverviewResponse | Promise<OverviewResponse>;
};

export function getOverviewData(opts: OverviewDataOptions) {
  const service = resolveDataSource<OverviewDataService>({
    featureName: "overview",
    mockService,
    liveService,
  });
  return service.getOverviewData(opts);
}
