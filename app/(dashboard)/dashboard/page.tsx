import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { ProgressList } from "@/components/dashboard/progress-list";
import { RightPanel } from "@/components/dashboard/right-panel";
import { getDevelopmentDashboardData } from "@/features/dashboard/mockData";
import { requireSession } from "@/server/dal/session";

export default async function DashboardPage() {
  await requireSession();
  const data = getDevelopmentDashboardData();

  if (!data) {
    return (
      <PageShell
        active="overview"
        title="Overview"
        subtitle="Connect Supabase data before showing production dashboard data."
      >
        <EmptyState message="No production dashboard data is configured yet." />
      </PageShell>
    );
  }

  return (
    <PageShell
      active="overview"
      title="Hey Jordan 👋"
      subtitle={`You're on a ${data.user.streak}-day streak — keep it up!`}
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {data.overviewMetrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr_220px]">
        <section className="min-h-[660px] rounded-2xl border border-border bg-panel p-6">
          <h2 className="mb-5 text-lg font-black text-white">Debt Overview</h2>
          <ProgressList items={data.debtOverview} />
        </section>

        <section className="min-h-[660px] rounded-2xl border border-border bg-panel p-6">
          <h2 className="mb-5 text-lg font-black text-white">Savings Progress</h2>
          <ProgressList items={data.savingsProgress} />
        </section>

        <RightPanel title="Recent Wins" className="min-h-[660px]">
          <div className="grid gap-3">
            {data.recentWins.map((win, index) => (
              <div className="rounded-xl bg-panel-soft p-3" key={win}>
                <p className="text-sm font-black text-white">{win}</p>
                <p className="mt-1 text-xs font-semibold text-muted">
                  {index === 0 ? "Today" : `${index} day${index > 1 ? "s" : ""} ago`}
                </p>
              </div>
            ))}
          </div>
        </RightPanel>
      </div>
    </PageShell>
  );
}
