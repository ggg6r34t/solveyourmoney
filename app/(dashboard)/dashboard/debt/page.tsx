import { EmptyState } from "@/components/dashboard/empty-state";
import { PageShell } from "@/components/dashboard/page-shell";
import { getDebtData } from "@/features/debt/services/debtService";
import { requireSession } from "@/server/dal/session";
import type { Route } from "next";
import Link from "next/link";

function fmt(value: number): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export default async function DebtPage() {
  const session = await requireSession();
  const { items } = await getDebtData({ userId: session.userId });
  const totalDebt = items.reduce((sum, d) => sum + d.principal, 0);

  if (items.length === 0) {
    return (
      <PageShell active="debt" title="Debt Tracker" subtitle="Track what you owe and build a payoff plan.">
        <EmptyState message="No debts added yet." />
        <div className="mt-4">
          <Link href={"/dashboard/import" as Route} className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">
            Import from bank statement
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell active="debt" title="Debt Tracker" subtitle={`Total: ${fmt(totalDebt)} across ${items.length} account${items.length === 1 ? "" : "s"}`}>
      <div className="grid gap-4">
        {items.map((debt) => (
          <div key={debt.id} className="rounded-2xl border border-border bg-panel p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-black text-foreground">{debt.label}</p>
                <p className="mt-1 text-sm font-semibold text-muted">
                  {debt.interestRate > 0 ? `${(debt.interestRate * 100).toFixed(1)}% APR` : "No interest"}
                </p>
              </div>
              <p className="text-xl font-black text-foreground">{fmt(debt.principal)}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
