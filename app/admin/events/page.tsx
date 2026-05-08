import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RightPanel } from "@/components/dashboard/right-panel";
import { StatBadge } from "@/components/dashboard/stat-badge";

export default function AdminEventsPage() {
  const metrics = [
    { label: "Critical", value: "0", helper: "Needs response", tone: "danger" as const },
    { label: "Billing", value: "0", helper: "Webhook events", tone: "primary" as const },
    { label: "Audit", value: "0", helper: "Admin actions", tone: "success" as const },
    { label: "Open", value: "0", helper: "Unprocessed", tone: "warning" as const },
  ];

  return (
    <DashboardShell active="admin" title="Events" description="Operational event monitoring for launch safety.">
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section className="grid gap-3">
          {["billing.webhook.received", "auth.sign_in", "onboarding.completed"].map((event) => (
            <article className="flex items-center justify-between rounded-2xl border border-border bg-panel p-5" key={event}>
              <div>
                <h2 className="text-base font-black text-white">{event}</h2>
                <p className="mt-1 text-xs font-semibold text-muted">No live events yet</p>
              </div>
              <StatBadge tone="primary">Ready</StatBadge>
            </article>
          ))}
        </section>
        <RightPanel title="Monitoring">
          <p className="text-sm font-semibold text-muted">Sentry and PostHog correlation still need production configuration.</p>
        </RightPanel>
      </div>
    </DashboardShell>
  );
}
