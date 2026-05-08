import { loadEnv } from "../config/env";
import { assertMockDataAllowed } from "../mocks/mockGuards";

export function resolveDataSource<T>({
  featureName,
  mockService,
  liveService,
}: {
  featureName: string;
  mockService: T;
  liveService: T;
}) {
  const env = loadEnv();

  if (env.USE_MOCK) {
    assertMockDataAllowed(featureName);
    console.info("data_source_resolved", { featureName, source: "mock" });
    return mockService;
  }

  console.info("data_source_resolved", { featureName, source: "live" });
  return liveService;
}
