"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { WaitlistForm } from "@/components/forms/waitlist-form";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-10 md:grid-cols-[0.98fr_1.02fr] md:items-center md:pb-24 md:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="space-y-7"
      >
        <div className="inline-flex rounded-full border border-primary/12 bg-white/72 px-4 py-2 text-sm font-black text-primary shadow-[var(--shadow-soft)]">
          Financial coaching software, not a bank.
        </div>
        <Eyebrow>Money decisions, minus the dread</Eyebrow>
        <h1 className="max-w-4xl text-6xl font-black leading-[0.9] tracking-[-0.075em] text-foreground md:text-8xl">
          Get clear
          <br />
          with money.
        </h1>
        <p className="max-w-2xl text-xl font-semibold leading-9 text-muted">
          A premium financial clarity tool that turns debt, spending, savings,
          and goals into scenarios you can understand at a glance.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/sign-up">Start free</ButtonLink>
          <ButtonLink href="/how-it-works" variant="secondary">
            How it works
          </ButtonLink>
        </div>
        <WaitlistForm />
        <p className="max-w-xl text-sm font-semibold leading-6 text-soft">
          No bank connection in v1. No judgment. Just a clearer way to compare
          what your money could support next.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, rotate: -1.5, scale: 0.96 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.12 }}
        className="relative"
      >
        <div className="playful-blob absolute -right-8 -top-10 h-40 w-40 bg-xp/20" />
        <div className="playful-blob absolute -bottom-10 -left-8 h-48 w-48 bg-accent/16" />
        <Card className="relative overflow-hidden p-5 sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-surface-strong/70 blur-3xl" />
          <div className="relative space-y-5">
            <div className="marketing-hero-panel rounded-[2rem] p-6 text-white">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
                Today&apos;s scenario
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
                Explore how one month of breathing room could change the picture.
              </h2>
              <p className="mt-4 text-sm font-semibold leading-6 text-white/78">
                Compare what happens if the next extra amount goes toward your
                buffer before being spread across everything at once.
              </p>
            </div>
            {[
              ["Ready to use", "EUR 420", "Visible"],
              ["Debt pressure", "14%", "Trackable"],
              ["Runway", "1.8 months", "Growing"],
            ].map(([label, value, status]) => (
              <div
                className="dashboard-card-soft flex items-center justify-between rounded-[1.75rem] p-4 transition hover:-translate-y-0.5"
                key={label}
              >
                <div>
                  <p className="text-sm font-bold text-muted">{label}</p>
                  <p className="text-2xl font-black tracking-tight">{value}</p>
                </div>
                <span className="status-pill" data-tone="primary">
                  {status}
                </span>
              </div>
            ))}
            <div className="dashboard-card-soft rounded-[1.75rem] p-4 text-sm font-semibold leading-6 text-muted">
              Every insight shows assumptions first. Tiny numbers and big
              feelings, handled gently.
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
