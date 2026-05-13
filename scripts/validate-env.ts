import { loadEnv } from "../lib/config/env";

try {
  const env = loadEnv(process.env as NodeJS.ProcessEnv);

  if (env.NEXT_PUBLIC_APP_ENV === "production" && env.USE_MOCK) {
    console.error(
      "validate-env: Mock data flag is enabled in production — failing build",
    );
    process.exitCode = 2;
    throw new Error("Mock data is not allowed in production");
  }

  if (
    env.NEXT_PUBLIC_APP_ENV === "preview" &&
    env.USE_MOCK &&
    !env.ALLOW_PREVIEW_MOCK
  ) {
    console.warn(
      "validate-env: WARN — Mock data is enabled in preview but ALLOW_PREVIEW_MOCK_DATA is not set. " +
        "Set ALLOW_PREVIEW_MOCK_DATA=true to allow, or set NEXT_PUBLIC_USE_MOCK_DATA=false.",
    );
  }

  console.log("validate-env: OK", {
    env: env.NEXT_PUBLIC_APP_ENV,
    useMock: env.USE_MOCK,
  });
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("validate-env: Configuration invalid", message);
  process.exitCode = 1;
}
