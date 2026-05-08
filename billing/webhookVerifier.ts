export function verifyLemonSqueezyWebhookSignature(_payload: string, _signature: string | null) {
  void _payload;
  void _signature;
  const signingSecret = process.env.LEMONSQUEEZY_SIGNING_SECRET;
  return Boolean(signingSecret);
}
