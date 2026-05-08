import { loadEnv } from "../config/env";
import { emitEvent } from "../observability/events";

function logCritical(msg: string, meta: Record<string, unknown> = {}) {
  emitEvent("mock_data_blocked_production", { msg, meta });
}

export function assertMockDataAllowed(featureName = "unknown") {
  const env = loadEnv();

  if (env.NEXT_PUBLIC_APP_ENV === "production" && env.USE_MOCK) {
    logCritical("Mock data enabled in production", { featureName });
    const err = new Error(
      "Mock data is not allowed in production environments",
    );

    throw err;
  }

  if (
    env.NEXT_PUBLIC_APP_ENV === "preview" &&
    env.USE_MOCK &&
    !env.ALLOW_PREVIEW_MOCK
  ) {
    logCritical("Mock data attempted in preview without allow flag", {
      featureName,
    });
    const err = new Error(
      "Mock data is not allowed in preview environments by default",
    );
    throw err;
  }

  if (env.NEXT_PUBLIC_APP_ENV !== "local" && env.USE_MOCK) {
    logCritical("Mock data flagged outside local environment", {
      featureName,
      env: env.NEXT_PUBLIC_APP_ENV,
    });
    const err = new Error(
      "Mock data is only allowed in local development by default",
    );

    throw err;
  }

  return true;
}
