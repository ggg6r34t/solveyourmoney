"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

if (typeof window !== "undefined" && posthogKey && !posthog.__loaded) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
    persistence: "localStorage+cookie",
  });
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PostHogProvider>
  );
}
