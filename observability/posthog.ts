import "server-only";

import { events, type AnalyticsEventName } from "./events";

type CaptureInput = {
  distinctId: string;
  event: AnalyticsEventName;
  properties?: Record<string, unknown>;
};

export async function captureServerEvent(input: CaptureInput) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

  if (!key) {
    return { ok: false as const, reason: "posthog_not_configured" };
  }

  const response = await fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      distinct_id: input.distinctId,
      event: input.event,
      properties: input.properties ?? {},
    }),
  });

  return { ok: response.ok };
}

export { events };
