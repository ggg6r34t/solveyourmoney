import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { getBudgetData } from "@/features/budget/services/budgetService";
import { requireSession } from "@/server/dal/session";
import type { Route } from "next";
import Link from "next/link";

function fmt(value: number): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default async function BudgetPage() {
  const session = await requireSession();
  const { categories } = await getBudgetData({ userId: session.userId });
  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);

  if (categories.length === 0) {
    return (
      <PageShell active="budget" title="Budget" subtitle="Track your monthly spending by category.">
        <EmptyState message="No budget categories added yet." />
        <div className="mt-4">
          <Link href={"/dashboard/import" as Route} className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">
            Import from bank statement
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell active="budget" title="Budget" subtitle={`${fmt(totalSpent)} spent of ${fmt(totalAllocated)} budgeted across ${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}>
      <div className="grid gap-4">
        {categories.map((category) => {
          const pct = category.allocated > 0 ? Math.round((category.spent / category.allocated) * 100) : 0;
          const over = category.spent > category.allocated;
          return (
            <div key={category.id} className="rounded-2xl border border-border bg-panel p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-black text-foreground">{category.label}</p>
                  <p className="mt-1 text-sm font-semibold text-muted">
                    {fmt(category.spent)} of {fmt(category.allocated)} allocated
                  </p>
                </div>
                <p className={`text-xl font-black ${over ? "text-danger" : "text-foreground"}`}>{pct}%</p>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-track">
                <div
                  className={`h-full rounded-full ${over ? "bg-danger" : "bg-primary"}`}
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
