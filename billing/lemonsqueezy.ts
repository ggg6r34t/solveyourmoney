export function getLemonSqueezyConfig() {
  return {
    storeId: process.env.LEMONSQUEEZY_STORE_ID ?? "",
    planVariantId: process.env.LEMONSQUEEZY_PLAN_VARIANT_ID ?? "",
    apiKey: process.env.LEMONSQUEEZY_API_KEY ?? "",
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "",
  };
}

export function isLemonSqueezyConfigured(): boolean {
  const { storeId, planVariantId, apiKey, webhookSecret } =
    getLemonSqueezyConfig();
  return Boolean(storeId && planVariantId && apiKey && webhookSecret);
}
