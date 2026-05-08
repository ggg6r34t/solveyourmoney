import { AppShell } from "./app-shell";
import type { AppNavKey } from "./app-shell";

export function PageShell({
  active,
  title,
  subtitle,
  children,
}: {
  active: AppNavKey;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <AppShell active={active}>
      <header className="mb-6">
        <h1 className="text-3xl font-black tracking-[-0.04em] text-white">
          {title}
        </h1>
        <p className="mt-1 text-base font-semibold text-muted">{subtitle}</p>
      </header>
      {children}
    </AppShell>
  );
}
