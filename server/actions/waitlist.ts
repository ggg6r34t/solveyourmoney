"use server";

import { waitlistSchema } from "@/lib/validation/forms";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { captureServerEvent, events } from "@/observability/posthog";

export type WaitlistState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function joinWaitlist(
  _state: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse({
    email: formData.get("email"),
    intent: formData.get("intent") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid email so we can save your spot.",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Waitlist storage is not configured yet. Add Supabase env vars before launch.",
    };
  }

  const { error } = await supabase.from("waitlist_signups").upsert(
    {
      email: parsed.data.email,
      intent: parsed.data.intent ?? null,
      source: "marketing_site",
    },
    { onConflict: "email" },
  );

  if (error) {
    return {
      status: "error",
      message: "We could not save this safely. Please try again in a moment.",
    };
  }

  await captureServerEvent({
    distinctId: parsed.data.email,
    event: events.signupStarted,
    properties: { source: "waitlist" },
  });

  return {
    status: "success",
    message: "You are on the list. We will send the calm-money bat signal soon.",
  };
}
