"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg)" }}>
      <div className="card" style={{ padding: 32, textAlign: "center", maxWidth: 400 }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Something went wrong</div>
        <div className="muted f-sm" style={{ marginBottom: 16 }}>{error.message}</div>
        <button className="btn primary" onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
