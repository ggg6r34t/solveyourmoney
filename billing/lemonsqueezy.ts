export function getLemonSqueezyConfig() {
  return {
    storeId: process.env.LEMONSQUEEZY_STORE_ID ?? "",
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID ?? "",
    apiKey: process.env.LEMONSQUEEZY_API_KEY ?? "",
  };
}
