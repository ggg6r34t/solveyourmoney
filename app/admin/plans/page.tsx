import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { RightPanel } from "@/components/dashboard/right-panel";

export default function AdminPlansPage() {
  const metrics = [
    { label: "Draft", value: "0", helper: "Waiting checkout", tone: "warning" as const },
    { label: "Paid", value: "0", helper: "Needs generation", tone: "primary" as const },
    { label: "Reviewed", value: "0", helper: "Ready delivery", tone: "success" as const },
    { label: "Delivered", value: "0", helper: "Customer visible", tone: "info" as const },
  ];

  return (
    <DashboardShell active="admin" title="Plans" description="Review plan generation, assumptions, and delivery state.">
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section className="grid gap-3">
          {["Paid queue", "Needs review", "Delivered"].map((label, index) => (
            <article className="rounded-2xl border border-border bg-panel p-5" key={label}>
              <h2 className="text-base font-black text-white">{label}</h2>
              <ProgressBar value={[0, 0, 0][index]} tone="primary" className="mt-4" />
            </article>
          ))}
        </section>
        <RightPanel title="Plan Safety">
          <div className="grid gap-3 text-sm font-semibold text-muted">
            <p>Logic version required.</p>
            <p>Assumptions must be visible.</p>
            <p>No fabricated advice.</p>
          </div>
        </RightPanel>
      </div>
    </DashboardShell>
  );
}
