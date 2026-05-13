import { AppShell } from "@/components/dashboard/app-shell";

export default function DashboardLoading() {
  return (
    <AppShell active="overview">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse" style={{ height: 80, background: "oklch(1 0 0 / 0.03)" }} />
        ))}
      </div>
    </AppShell>
  );
}
