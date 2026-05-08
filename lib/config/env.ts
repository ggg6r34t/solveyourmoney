import { z } from "zod";

export const EnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(["local", "preview", "production"])
    .optional()
    .default("local"),
  NEXT_PUBLIC_USE_MOCK_DATA: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
  ALLOW_PREVIEW_MOCK_DATA: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
});

export function loadEnv(raw: NodeJS.ProcessEnv = process.env) {
  const parsed = EnvSchema.safeParse({
    NEXT_PUBLIC_APP_ENV: raw.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_USE_MOCK_DATA: raw.NEXT_PUBLIC_USE_MOCK_DATA,
    ALLOW_PREVIEW_MOCK_DATA: raw.ALLOW_PREVIEW_MOCK_DATA,
  });

  if (!parsed.success) {
    const err = new Error(
      "Invalid environment configuration: " + parsed.error.message,
    );

    throw err;
  }

  const env = parsed.data as {
    NEXT_PUBLIC_APP_ENV: "local" | "preview" | "production";
    NEXT_PUBLIC_USE_MOCK_DATA: "true" | "false";
    ALLOW_PREVIEW_MOCK_DATA: "true" | "false";
    USE_MOCK?: boolean;
    ALLOW_PREVIEW_MOCK?: boolean;
  };

  env.USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  env.ALLOW_PREVIEW_MOCK = env.ALLOW_PREVIEW_MOCK_DATA === "true";

  return env;
}
