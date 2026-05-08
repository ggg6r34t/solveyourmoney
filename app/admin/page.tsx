import Link from "next/link";
import type { Route } from "next";
import { AppMetricCard } from "@/components/dashboard/app-metric-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RightPanel } from "@/components/dashboard/right-panel";

const links = [
  ["/admin/users", "Users", "Support and account review"],
  ["/admin/plans", "Plans", "Roadmap oversight"],
  ["/admin/payments", "Payments", "Billing reconciliation"],
  ["/admin/events", "Events", "Operational monitoring"],
] as const;

export default function AdminPage() {
  const metrics = [
    { label: "Users", value: "0", helper: "Live data pending", tone: "primary" as const },
    { label: "Plans", value: "0", helper: "Review queue", tone: "success" as const },
    { label: "Payments", value: "0", helper: "Needs LemonSqueezy", tone: "warning" as const },
    { label: "Events", value: "0", helper: "Monitor stream", tone: "info" as const },
  ];

  return (
    <DashboardShell
      active="admin"
      title="Admin Dashboard"
      description="Internal tools for safe support, billing, plan review, and event monitoring."
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AppMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <section className="grid gap-3 md:grid-cols-2">
          {links.map(([href, label, helper]) => (
            <Link
              key={href}
              href={href as Route}
              className="rounded-2xl border border-border bg-panel p-5 transition hover:border-primary/70 hover:bg-primary-soft"
            >
              <p className="text-lg font-black text-white">{label}</p>
              <p className="mt-2 text-sm font-semibold text-muted">{helper}</p>
            </Link>
          ))}
        </section>
        <RightPanel title="Admin Safety">
          <div className="grid gap-3 text-sm font-semibold text-muted">
            <p>Admin actions must be audited.</p>
            <p>Payment truth comes from webhooks.</p>
            <p>No destructive actions without confirmation.</p>
          </div>
        </RightPanel>
      </div>
    </DashboardShell>
  );
}
