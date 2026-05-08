"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { events, type AnalyticsEventName } from "@/observability/events";

export function PageViewTracker({
  page,
  event = events.dashboardViewed,
}: {
  page: string;
  event?: AnalyticsEventName;
}) {
  useEffect(() => {
    if (!posthog.__loaded) {
      return;
    }

    posthog.capture(event, { page });
  }, [event, page]);

  return null;
}
