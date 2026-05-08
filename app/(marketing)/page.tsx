import { Hero } from "@/components/marketing/hero";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";

export default function HomePage() {
  return (
    <MarketingShell>
      <Hero />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="marketing-hero-panel rounded-[3rem] p-7 text-white md:p-10">
          <div className="grid gap-8 md:grid-cols-[0.82fr_1.18fr] md:items-end">
            <div>
              <Eyebrow className="text-white/72">Why it works</Eyebrow>
              <h2 className="mt-3 text-5xl font-black leading-[0.92] tracking-[-0.065em] md:text-6xl">
                Direction beats more data.
              </h2>
            </div>
            <p className="text-xl font-semibold leading-9 text-white/78">
              SolveYourMoney is not trying to become your bank. It helps you
              understand what your money could support next, then shows the
              assumptions behind each scenario.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              "Give money a job",
              "See what is available, what is already spoken for, and what needs attention.",
            ],
            [
              "Build breathing room",
              "Runway comes before perfection. The first win is feeling less cornered.",
            ],
            [
              "Compare debt timing",
              "Debt scenarios stay plain, explainable, and honest about missing details.",
            ],
          ].map(([title, body]) => (
            <Card className="shadow-none" key={title}>
              <Eyebrow>{title}</Eyebrow>
              <p className="mt-4 text-lg font-semibold leading-8 text-muted">
                {body}
              </p>
            </Card>
          ))}
        </div>
        <div className="marketing-soft-panel mt-8 rounded-[3rem] p-7 md:flex md:items-center md:justify-between md:p-9">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-accent-strong">
              Start small
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              One check-in. One next move. Less dread.
            </h2>
          </div>
          <ButtonLink className="mt-6 md:mt-0" href="/sign-up">
            Start free
          </ButtonLink>
        </div>
      </section>
    </MarketingShell>
  );
}
