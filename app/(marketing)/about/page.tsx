import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, Eyebrow } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Card>
          <Eyebrow>Trust</Eyebrow>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-foreground sm:text-5xl">
            A financial coaching product that stays explainable.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            SolveYourMoney is built to reduce confusion, surface trade-offs, and keep the logic visible.
            It is not trying to replace judgment with a black box.
          </p>
        </Card>
      </section>
    </MarketingShell>
  );
}
