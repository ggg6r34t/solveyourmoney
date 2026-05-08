import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RightPanel } from "@/components/dashboard/right-panel";
import { StatBadge } from "@/components/dashboard/stat-badge";
import { requireSession } from "@/server/dal/session";

export default async function GuidancePage() {
  await requireSession();

  const metrics = [
    { label: "Streak", value: "14d", helper: "Keep it up", tone: "warning" as const },
    { label: "Check-ins", value: "3", helper: "This month", tone: "success" as const },
    { label: "Nudges", value: "5", helper: "Open actions", tone: "primary" as const },
    { label: "XP Earned", value: "+210", helper: "From guidance", tone: "info" as const },
  ];

  return (
    <DashboardShell
      active="guidance"
      title="Weekly Guidance"
      description="Notice what changed, choose one move, earn XP for showing up."
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section className="grid gap-4">
          {[
            ["This Week", "What changed since last time?", "Income, bills, debt, savings, pressure.", 72],
            ["Next Nudge", "Move €50 before Friday", "Small transfers count. Momentum beats perfection.", 45],
            ["Reflection", "What made money feel easier?", "Track the win so the next one is easier to repeat.", 30],
          ].map(([label, title, body, progress]) => (
            <article className="rounded-2xl border border-border bg-panel p-5" key={title}>
              <div className="mb-3 flex items-center justify-between">
                <StatBadge tone="primary">{label}</StatBadge>
                <span className="text-xs font-black text-muted">+35 XP</span>
              </div>
              <h2 className="text-lg font-black text-white">{title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted">{body}</p>
              <ProgressBar value={Number(progress)} tone="primary" className="mt-4" />
            </article>
          ))}
        </section>
        <div className="grid content-start gap-5">
          <RightPanel title="Your Progress">
            <div className="grid gap-4">
              {[
                ["Debt", 66],
                ["Savings", 44],
                ["Budget", 58],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs font-bold text-muted">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <ProgressBar value={Number(value)} tone="primary" />
                </div>
              ))}
            </div>
          </RightPanel>
          <RightPanel title="Current Badge">
            <div className="rounded-xl border border-warning bg-warning-soft p-4 text-sm font-black text-warning">
              🔥 14-day streak
            </div>
          </RightPanel>
        </div>
      </div>
    </DashboardShell>
  );
}
