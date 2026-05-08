import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, Eyebrow } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Card>
          <Eyebrow>Privacy</Eyebrow>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-foreground">Privacy first.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            Financial information is sensitive. The product is designed around user-scoped data access, clear boundaries, and conservative defaults.
          </p>
        </Card>
      </section>
    </MarketingShell>
  );
}
