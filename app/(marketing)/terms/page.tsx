import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, Eyebrow } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Card>
          <Eyebrow>Terms</Eyebrow>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-foreground">Use with clarity.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            SolveYourMoney provides educational planning tools and product guidance. It does not provide financial advice.
          </p>
        </Card>
      </section>
    </MarketingShell>
  );
}
