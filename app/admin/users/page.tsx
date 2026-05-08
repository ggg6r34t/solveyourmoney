import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RightPanel } from "@/components/dashboard/right-panel";

export default function AdminUsersPage() {
  const metrics = [
    { label: "Total Users", value: "0", helper: "Live data pending", tone: "primary" as const },
    { label: "Admins", value: "1", helper: "Allowlist based", tone: "warning" as const },
    { label: "Onboarded", value: "0", helper: "Completed checks", tone: "success" as const },
    { label: "Support", value: "0", helper: "Open notes", tone: "info" as const },
  ];

  return (
    <DashboardShell active="admin" title="Users" description="Support people without breaking trust boundaries.">
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section className="rounded-2xl border border-border bg-panel p-5">
          <h2 className="text-lg font-black text-white">User Management</h2>
          <p className="mt-3 text-sm font-semibold text-muted">
            Live user table, support notes, and safe role controls will render here.
          </p>
        </section>
        <RightPanel title="Rules">
          <p className="text-sm font-semibold text-muted">Never expose cross-user financial data without admin authorization and audit logs.</p>
        </RightPanel>
      </div>
    </DashboardShell>
  );
}
