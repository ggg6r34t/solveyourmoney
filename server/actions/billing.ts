"use server";

import {
  getLemonSqueezyConfig,
  isLemonSqueezyConfigured,
} from "@/billing/lemonsqueezy";
import { requireSession } from "@/server/dal/session";

type CheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; message: string };

export async function createCheckoutSession(): Promise<CheckoutResult> {
  const session = await requireSession();

  if (!isLemonSqueezyConfigured()) {
    return { ok: false, message: "Checkout is not available right now." };
  }

  const { apiKey, storeId, planVariantId } = getLemonSqueezyConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  let response: Response;
  try {
    response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_options: {
              success_url: `${appUrl}/dashboard?checkout=success`,
              cancel_url: `${appUrl}/pricing`,
            },
            checkout_data: {
              email: session.email ?? undefined,
              custom: { user_id: session.userId },
            },
          },
          relationships: {
            store: { data: { type: "stores", id: storeId } },
            variant: { data: { type: "variants", id: planVariantId } },
          },
        },
      }),
    });
  } catch {
    return { ok: false, message: "Checkout is not available right now." };
  }

  if (!response.ok) {
    return { ok: false, message: "Checkout is not available right now." };
  }

  const json = (await response.json()) as {
    data?: { attributes?: { url?: string } };
  };
  const checkoutUrl = json?.data?.attributes?.url;

  if (!checkoutUrl) {
    return { ok: false, message: "Checkout is not available right now." };
  }

  return { ok: true, checkoutUrl };
}
