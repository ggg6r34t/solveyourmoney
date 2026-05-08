import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LemonSqueezyEvent = {
  meta?: {
    event_name?: string;
    custom_data?: { user_id?: string };
  };
  data?: { id?: string };
};

export async function POST(request: NextRequest) {
  // Read raw body FIRST — must happen before JSON.parse for HMAC to work
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const expectedSig = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSig !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as LemonSqueezyEvent;
  const eventName = event?.meta?.event_name;
  const userId = event?.meta?.custom_data?.user_id;
  const subscriptionId = event?.data?.id;

  if (!userId || !eventName) {
    return NextResponse.json({ received: true });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ received: true });
  }

  const base = { user_id: userId, updated_at: new Date().toISOString() };

  if (eventName === "order_created" || eventName === "subscription_created") {
    await supabase.from("financial_profiles").upsert(
      {
        ...base,
        subscription_status: "active",
        subscription_id: subscriptionId ?? null,
      },
      { onConflict: "user_id" },
    );
  } else if (eventName === "subscription_cancelled") {
    await supabase.from("financial_profiles").upsert(
      { ...base, subscription_status: "cancelled" },
      { onConflict: "user_id" },
    );
  } else if (eventName === "subscription_payment_failed") {
    await supabase.from("financial_profiles").upsert(
      { ...base, subscription_status: "past_due" },
      { onConflict: "user_id" },
    );
  }

  return NextResponse.json({ received: true });
}
