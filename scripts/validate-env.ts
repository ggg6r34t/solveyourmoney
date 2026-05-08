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

  console.log("validate-env: OK", {
    env: env.NEXT_PUBLIC_APP_ENV,
    useMock: env.USE_MOCK,
  });
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("validate-env: Configuration invalid", message);
  process.exitCode = 1;
}
