import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RightPanel } from "@/components/dashboard/right-panel";
import { requireSession } from "@/server/dal/session";

export default async function SettingsPage() {
  const session = await requireSession();

  const metrics = [
    { label: "Account", value: "Dev", helper: session.email ?? "Local user", tone: "primary" as const },
    { label: "Data Mode", value: "Manual", helper: "No bank sync", tone: "success" as const },
    { label: "Exports", value: "Soon", helper: "Before launch", tone: "warning" as const },
    { label: "Security", value: "RLS", helper: "Policy planned", tone: "info" as const },
  ];

  return (
    <DashboardShell
      active="settings"
      title="Settings"
      description="Account, data boundaries, and launch safety controls."
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section className="grid gap-4">
          {[
            ["Profile", "Jordan", "Display name and email settings will live here."],
            ["Data Boundaries", "Manual inputs", "Bank aggregation is intentionally out of v1."],
            ["Billing", "Not connected", "Billing portal appears after LemonSqueezy is configured."],
          ].map(([label, value, helper]) => (
            <article className="rounded-2xl border border-border bg-panel p-5" key={label}>
              <p className="text-xs font-black uppercase tracking-[0.08em] text-muted">{label}</p>
              <h2 className="mt-2 text-xl font-black text-white">{value}</h2>
              <p className="mt-2 text-sm font-semibold text-muted">{helper}</p>
            </article>
          ))}
        </section>
        <RightPanel title="Safety Checklist">
          <div className="grid gap-3 text-sm font-semibold text-muted">
            <p>✓ Dev auth isolated from production</p>
            <p>✓ Production mock fallback blocked</p>
            <p>• RLS verification still required</p>
            <p>• Data export still required</p>
          </div>
        </RightPanel>
      </div>
    </DashboardShell>
  );
}
