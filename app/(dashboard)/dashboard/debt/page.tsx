import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DebtCard } from "@/components/dashboard/debt-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RightPanel } from "@/components/dashboard/right-panel";
import { getDevelopmentDashboardData } from "@/features/dashboard/mockData";
import { requireSession } from "@/server/dal/session";

export default async function DebtPage() {
  await requireSession();
  const data = getDevelopmentDashboardData();

  if (!data) {
    return (
      <PageShell active="debt" title="Debt Tracker" subtitle="Production debt data is not configured yet.">
        <EmptyState message="No debt accounts are available." />
      </PageShell>
    );
  }

  const metrics = [
    { label: "Total Debt", value: "€6.910", helper: "↓ €240 this month", tone: "danger" as const },
    { label: "Monthly Minimum", value: "€285", helper: "Min required", tone: "primary" as const },
    { label: "Debt-Free In", value: "33mo", helper: "2y 9m", tone: "success" as const },
    { label: "Total Interest", value: "€1.196", helper: "Estimated cost", tone: "warning" as const },
  ];

  return (
    <PageShell active="debt" title="Debt Tracker" subtitle="Total: €6.910 across 4 accounts">
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_260px]">
        <section className="grid gap-4">
          {data.debts.map((debt) => (
            <DebtCard debt={debt} key={debt.name} />
          ))}
        </section>

        <div className="grid gap-5">
          <RightPanel title="Extra Monthly Payment">
            <p className="text-5xl font-black text-primary">€50</p>
            <ProgressBar value={22} tone="primary" className="mt-4" />
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl bg-surface-success p-3 text-sm font-black text-success">
                Interest saved €240
              </div>
              <div className="rounded-xl bg-primary-soft p-3 text-sm font-black text-primary">
                Months faster 5mo
              </div>
            </div>
          </RightPanel>
          <RightPanel title="Payoff Timeline">
            <div className="h-28 rounded-xl bg-panel-soft p-4">
              <div className="h-20 bg-primary [clip-path:polygon(0_0,100%_34%,100%_100%,0_100%)]" />
            </div>
            <p className="mt-3 text-xs font-semibold text-muted">Now: €6.910</p>
          </RightPanel>
        </div>
      </div>
    </PageShell>
  );
}
