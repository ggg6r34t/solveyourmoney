import { AppShell } from "./app-shell";
import type { AppNavKey } from "./app-shell";

export function PageShell({
  active,
  title,
  subtitle,
  children,
  actions,
}: {
  active: AppNavKey;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <AppShell active={active}>
      <header style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: 24, marginBottom: 28,
      }}>
        <div>
          <h1 style={{
            fontSize: 28, fontWeight: 540, letterSpacing: "-0.025em",
            margin: "0 0 4px", color: "var(--fg)",
          }}>
            {title}
          </h1>
          <p style={{ fontSize: 14, color: "var(--fg-mute)", margin: 0 }}>
            {subtitle}
          </p>
        </div>
        {actions && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </header>
      {children}
    </AppShell>
  );
}
