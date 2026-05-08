import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Card, Eyebrow } from "@/components/ui/card";

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          ["Reality check", "Start with your actual numbers, not an idealized budget."],
          ["Decision clarity", "See what may happen next before acting."],
          ["Ongoing guidance", "Return for calmer, more consistent money choices."],
        ].map(([title, body]) => (
          <Card key={title}>
            <Eyebrow>{title}</Eyebrow>
            <p className="mt-4 text-lg font-semibold leading-8 text-muted">{body}</p>
          </Card>
        ))}
      </section>
    </MarketingShell>
  );
}
