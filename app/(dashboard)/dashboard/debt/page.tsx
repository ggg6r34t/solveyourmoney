import { AppShell } from "@/components/dashboard/app-shell";
import { DebtSimulator } from "@/components/dashboard/debt-simulator";
import { getDebtData } from "@/features/debt/services/debtService";
import { requireSession } from "@/server/dal/session";
import { formatCurrency } from "@/lib/format";

export default async function DebtPage() {
  const session = await requireSession();
  const { items, computed } = await getDebtData({ userId: session.userId });

  const debts = items.map((d, i) => ({
    name: d.label,
    apr: parseFloat((d.interestRate * 100).toFixed(2)),
    balance: d.principal,
    min: d.minPayment,
    paid: 0,
    payoff: computed.debtFreeDate,
    issuer: "—",
    bg: ["oklch(0.68 0.15 24 / 0.18)", "oklch(0.66 0.18 282 / 0.18)", "oklch(0.80 0.13 82 / 0.18)"][i % 3],
  }));

  return (
    <AppShell active="debt">
      <div className="page-hd">
        <div>
          <h1>Debt</h1>
          <div className="sub">A clear picture of what you owe — and the fastest way out.</div>
        </div>
        <div className="row gap-8">
          <span className="pill">Strategy: <b style={{ marginLeft: 6, color: "var(--fg)" }}>Avalanche</b></span>
        </div>
      </div>

      <div className="metrics">
        <div className="metric accent">
          <div className="lbl">Total debt</div>
          <div className="val">{formatCurrency(computed.totalBalance)}</div>
          <span className="delta neut">{items.length} account{items.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="metric">
          <div className="lbl">Monthly minimum</div>
          <div className="val">{formatCurrency(computed.totalMinPayment)}</div>
          <span className="delta neut">Required payments</span>
        </div>
        <div className="metric">
          <div className="lbl">Debt-free estimate</div>
          <div className="val" style={{ fontSize: 22 }}>{computed.debtFreeDate}</div>
          <span className="delta up">Avalanche method</span>
        </div>
        <div className="metric">
          <div className="lbl">Total interest</div>
          <div className="val">{formatCurrency(computed.totalInterest)}</div>
          <span className="delta neut">Projected to payoff</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", marginTop: 16 }}>
          <div className="card-title" style={{ marginBottom: 8 }}>No debts tracked</div>
          <div className="muted f-sm">Import a bank statement or add debts manually to get started.</div>
        </div>
      ) : (
        <DebtSimulator demoDebts={debts} />
      )}
    </AppShell>
  );
}
