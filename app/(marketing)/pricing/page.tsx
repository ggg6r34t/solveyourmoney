import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, Eyebrow } from "@/components/ui/card";
import { CheckoutButton } from "@/components/marketing/checkout-button";

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-6 rounded-2xl border border-border bg-surface-success px-5 py-3 text-sm font-bold text-success">
          Currently in free beta — all features are unlocked for early members.
        </div>
        <Card>
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="mt-3 text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
            Start free, then unlock a personalized roadmap.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            The free experience gives clarity and structure. The paid plan turns
            your reality check into a more detailed roadmap you can revisit
            later.
          </p>
          <div className="mt-8">
            <CheckoutButton />
          </div>
        </Card>
      </section>
    </MarketingShell>
  );
}
