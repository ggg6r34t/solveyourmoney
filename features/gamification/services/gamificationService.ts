// features/gamification/services/gamificationService.ts
import { resolveDataSource } from "../../../lib/data-source/resolveDataSource";
import * as mockService from "./gamificationMockService";
import * as liveService from "./gamificationLiveService";
import type { GamificationResponse } from "./gamificationSchema";

type GamificationDataOptions = Parameters<typeof mockService.getGamificationData>[0];
type GamificationDataService = {
  getGamificationData: (opts: GamificationDataOptions) => GamificationResponse | Promise<GamificationResponse>;
};

export function getGamificationData(opts: GamificationDataOptions) {
  const service = resolveDataSource<GamificationDataService>({
    featureName: "gamification",
    mockService,
    liveService,
  });
  return service.getGamificationData(opts);
}
