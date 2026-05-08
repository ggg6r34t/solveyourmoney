import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { BudgetCategoryRow } from "@/components/dashboard/budget-category-row";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RightPanel } from "@/components/dashboard/right-panel";
import { getDevelopmentDashboardData } from "@/features/dashboard/mockData";
import { requireSession } from "@/server/dal/session";

export default async function BudgetPage() {
  await requireSession();
  const data = getDevelopmentDashboardData();

  if (!data) {
    return (
      <PageShell active="budget" title="Budget — Jun 2025" subtitle="Production budget data is not configured yet.">
        <EmptyState message="No budget categories are available." />
      </PageShell>
    );
  }

  const metrics = [
    { label: "Income", value: "€2.200", helper: "Monthly take-home", tone: "success" as const },
    { label: "Spent", value: "€1.270", helper: "58% of income", tone: "danger" as const },
    { label: "Budgeted", value: "€1.360", helper: "Planned spend", tone: "primary" as const },
    { label: "Left Over", value: "€930", helper: "Available to save", tone: "primary" as const },
  ];

  return (
    <PageShell active="budget" title="Budget — Jun 2025" subtitle="⚠️ Over budget in Entertainment">
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_260px]">
        <section>
          <div className="mb-4 rounded-2xl border border-border bg-panel p-5">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.08em] text-muted">
              50/30/20 Rule — Your Split
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <ProgressBar value={49} tone="primary" />
              <ProgressBar value={9} tone="danger" />
              <ProgressBar value={42} tone="success" />
            </div>
            <div className="mt-2 grid gap-4 text-xs font-black text-muted md:grid-cols-3">
              <span>Needs (50%) 49%</span>
              <span>Wants (30%) 9%</span>
              <span>Save/Pay (20%) 42%</span>
            </div>
          </div>
          <div className="grid gap-3">
            {data.budgetCategories.map((category) => (
              <BudgetCategoryRow category={category} key={category.name} />
            ))}
          </div>
        </section>
        <div className="grid content-start gap-5">
          <RightPanel title="6-Month Spending Trend">
            <div className="flex h-24 items-end gap-3">
              {[42, 54, 38, 72, 58, 66].map((height, index) => (
                <div className="w-7 rounded bg-track" key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </RightPanel>
          <RightPanel title="Category Breakdown">
            <div className="grid gap-2">
              {data.budgetCategories.map((category) => (
                <div className="flex items-center gap-2 text-xs font-bold text-muted" key={category.name}>
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {category.name}
                </div>
              ))}
            </div>
          </RightPanel>
        </div>
      </div>
    </PageShell>
  );
}
