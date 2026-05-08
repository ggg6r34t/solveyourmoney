import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { SavingsGoalCard } from "@/components/dashboard/savings-goal-card";
import { getDevelopmentDashboardData } from "@/features/dashboard/mockData";
import { requireSession } from "@/server/dal/session";

export default async function SavingsPage() {
  await requireSession();
  const data = getDevelopmentDashboardData();

  if (!data) {
    return (
      <PageShell active="savings" title="Savings Goals" subtitle="Production savings data is not configured yet.">
        <EmptyState message="No savings goals are available." />
      </PageShell>
    );
  }

  const metrics = [
    { label: "Total Saved", value: "€1.610", helper: "40% of targets", tone: "success" as const },
    { label: "Remaining", value: "€2.390", helper: "Across all goals", tone: "danger" as const },
    { label: "Monthly Auto-Save", value: "€260", helper: "Standing orders", tone: "primary" as const },
    { label: "Progress", value: "40%", helper: "Total target funded", tone: "success" as const },
  ];

  return (
    <PageShell active="savings" title="Savings Goals" subtitle="€1.610 saved of €4.000 total target">
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 flex gap-5 overflow-x-auto pb-4">
        {data.savingsGoals.map((goal) => (
          <SavingsGoalCard goal={goal} key={goal.name} />
        ))}
      </div>
    </PageShell>
  );
}
