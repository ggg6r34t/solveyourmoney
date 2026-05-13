"use client";

import { AppShell } from "@/components/dashboard/app-shell";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <AppShell active="overview">
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Something went wrong</div>
        <div className="muted f-sm" style={{ marginBottom: 16 }}>{error.message}</div>
        <button className="btn primary" onClick={reset}>Try again</button>
      </div>
    </AppShell>
  );
}
