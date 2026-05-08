import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RightPanel } from "@/components/dashboard/right-panel";

export default function AdminPaymentsPage() {
  const metrics = [
    { label: "Orders", value: "0", helper: "Webhook truth", tone: "primary" as const },
    { label: "Failed", value: "0", helper: "Needs action", tone: "danger" as const },
    { label: "Subscriptions", value: "0", helper: "Guidance access", tone: "success" as const },
    { label: "Duplicates", value: "0", helper: "Idempotency", tone: "warning" as const },
  ];

  return (
    <DashboardShell active="admin" title="Payments" description="Monitor checkout, webhook reconciliation, and entitlement state.">
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section className="rounded-2xl border border-border bg-panel p-5">
          <h2 className="text-lg font-black text-white">Payment Timeline</h2>
          <p className="mt-3 text-sm font-semibold text-muted">
            LemonSqueezy orders, renewals, cancellations, and failed payments will appear here.
          </p>
        </section>
        <RightPanel title="Billing Rule">
          <p className="text-sm font-semibold text-muted">Redirects are not payment truth. Webhooks decide access.</p>
        </RightPanel>
      </div>
    </DashboardShell>
  );
}
