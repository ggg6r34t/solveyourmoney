import { PageShell } from "./page-shell";
import type { AppNavKey } from "./app-shell";

export function DashboardShell({
  children,
  title,
  description,
  active = "overview",
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  active?: AppNavKey;
}) {
  return (
    <PageShell
      active={active}
      title={title}
      subtitle={description ?? "Keep building your money skills."}
    >
      {children}
    </PageShell>
  );
}
