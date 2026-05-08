import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { getSavingsData } from "@/features/savings/services/savingsService";
import { requireSession } from "@/server/dal/session";
import type { Route } from "next";
import Link from "next/link";

function fmt(value: number): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default async function SavingsPage() {
  const session = await requireSession();
  const { goals } = await getSavingsData({ userId: session.userId });
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + g.current, 0);

  if (goals.length === 0) {
    return (
      <PageShell active="savings" title="Savings Goals" subtitle="Build toward what matters most.">
        <EmptyState message="No savings goals added yet." />
        <div className="mt-4">
          <Link href={"/dashboard/import" as Route} className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">
            Import from bank statement
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell active="savings" title="Savings Goals" subtitle={`${fmt(totalCurrent)} saved of ${fmt(totalTarget)} total target`}>
      <div className="grid gap-4">
        {goals.map((goal) => {
          const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
          return (
            <div key={goal.id} className="rounded-2xl border border-border bg-panel p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-black text-foreground">{goal.label}</p>
                  <p className="mt-1 text-sm font-semibold text-muted">
                    {fmt(goal.current)} of {fmt(goal.target)} target
                  </p>
                </div>
                <p className="text-xl font-black text-foreground">{pct}%</p>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-track">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
