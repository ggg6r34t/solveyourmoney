import { resolveDataSource } from "../../../lib/data-source/resolveDataSource";
import * as mockService from "./learnMockService";
import * as liveService from "./learnLiveService";
import type { LearnResponse } from "./learnSchema";

type LearnDataOptions = Parameters<typeof mockService.getLearnData>[0];
type LearnDataService = {
  getLearnData: (opts: LearnDataOptions) => LearnResponse | Promise<LearnResponse>;
};

export function getLearnData(opts: LearnDataOptions) {
  const service = resolveDataSource<LearnDataService>({
    featureName: "learn",
    mockService,
    liveService,
  });
  return service.getLearnData(opts);
}
