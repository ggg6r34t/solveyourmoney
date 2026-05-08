import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RightPanel } from "@/components/dashboard/right-panel";
import { StatBadge } from "@/components/dashboard/stat-badge";
import { ButtonLink } from "@/components/ui/button";
import { requireSession } from "@/server/dal/session";

export default async function PlanPage() {
  await requireSession();

  const metrics = [
    { label: "Roadmap Price", value: "€29", helper: "One-time plan", tone: "primary" as const },
    { label: "Plan Status", value: "Draft", helper: "Awaiting checkout", tone: "warning" as const },
    { label: "Actions", value: "3", helper: "Monthly moves", tone: "success" as const },
    { label: "Logic", value: "v1", helper: "Auditable rules", tone: "info" as const },
  ];

  return (
    <DashboardShell
      active="plan"
      title="Personal Money Plan"
      description="Know what to pay first, what to protect, and what can wait."
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section className="grid gap-4">
          {[
            ["1", "Protect breathing room", "Build one month of runway before speeding up risky goals.", 32],
            ["2", "Focus first debt", "Credit card gets priority once minimums stay current.", 61],
            ["3", "Set one transfer", "Give the next surplus a job before the week gets noisy.", 45],
          ].map(([step, title, body, progress]) => (
            <article className="rounded-2xl border border-border bg-panel p-5" key={step}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-sm font-black text-primary">
                      {step}
                    </span>
                    <h2 className="text-lg font-black text-white">{title}</h2>
                  </div>
                  <p className="text-sm font-semibold leading-6 text-muted">{body}</p>
                </div>
                <StatBadge tone="primary">Plan</StatBadge>
              </div>
              <ProgressBar value={Number(progress)} tone="primary" className="mt-4" />
            </article>
          ))}
        </section>
        <div className="grid content-start gap-5">
          <RightPanel title="Checkout">
            <p className="text-5xl font-black text-primary">€29</p>
            <p className="mt-2 text-sm font-semibold text-muted">
              Checkout is disabled until LemonSqueezy is configured.
            </p>
            <ButtonLink className="mt-5 w-full" href="/pricing">
              Review Pricing
            </ButtonLink>
          </RightPanel>
          <RightPanel title="Assumptions">
            <div className="grid gap-3 text-sm font-semibold text-muted">
              <p>Manual inputs only.</p>
              <p>No regulated financial advice.</p>
              <p>Logic version stored with plan.</p>
            </div>
          </RightPanel>
        </div>
      </div>
    </DashboardShell>
  );
}
