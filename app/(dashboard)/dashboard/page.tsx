import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageShell } from "@/components/dashboard/page-shell";
import { getOverviewData } from "@/features/overview/services/overviewService";
import { requireSession } from "@/server/dal/session";

export default async function DashboardPage() {
  const session = await requireSession();
  const overview = await getOverviewData({ userId: session.userId });

  if (!overview.items.length) {
    return (
      <PageShell
        active="overview"
        title="Overview"
        subtitle="Your financial overview will appear here once data is available."
      >
        <EmptyState message="No overview data available yet. Connect your accounts to get started." />
      </PageShell>
    );
  }

  return (
    <PageShell
      active="overview"
      title="Overview"
      subtitle="Your financial snapshot"
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {overview.items.map((item) => (
          <MetricCard
            key={item.id}
            label={item.label}
            value={item.value ?? 0}
          />
        ))}
      </div>
    </PageShell>
  );
}
