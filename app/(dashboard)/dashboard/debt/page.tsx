import { AppShell } from "@/components/dashboard/app-shell";
import { DebtSimulator } from "@/components/dashboard/debt-simulator";
import { getDebtData } from "@/features/debt/services/debtService";
import { requireSession } from "@/server/dal/session";

const DEMO_DEBTS = [
  { name: "Visa Platinum", apr: 19.4, balance: 3210.00, min: 95,  paid: 32, payoff: "Aug 2027", issuer: "Chase",    bg: "oklch(0.68 0.15 24 / 0.18)"  },
  { name: "Student Loan",  apr: 5.1,  balance: 4180.00, min: 140, paid: 58, payoff: "Mar 2029", issuer: "Nelnet",   bg: "oklch(0.66 0.18 282 / 0.18)" },
  { name: "Care Credit",   apr: 11.2, balance: 1030.00, min: 45,  paid: 71, payoff: "Dec 2026", issuer: "Synchrony", bg: "oklch(0.80 0.13 82 / 0.18)"  },
];

export default async function DebtPage() {
  const session = await requireSession();
  const { items } = await getDebtData({ userId: session.userId });

  const debts = items.length > 0
    ? items.map((d, i) => ({
        name: d.label, apr: d.interestRate * 100,
        balance: d.principal, min: Math.round(d.principal * 0.02),
        paid: 50, payoff: "Dec 2027", issuer: "—",
        bg: ["oklch(0.68 0.15 24 / 0.18)", "oklch(0.66 0.18 282 / 0.18)", "oklch(0.80 0.13 82 / 0.18)"][i % 3],
      }))
    : DEMO_DEBTS;

  const totalDebt     = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin      = debts.reduce((s, d) => s + d.min, 0);
  const totalInterest = 1840;

  return (
    <AppShell active="debt">
      <div className="page-hd">
        <div>
          <h1>Debt</h1>
          <div className="sub">A clear picture of what you owe — and the fastest way out.</div>
        </div>
        <div className="row gap-8">
          <button className="btn ghost" type="button">
            Strategy: <b style={{ marginLeft: 6, color: "var(--fg)" }}>Avalanche</b> ⌄
          </button>
          <button className="btn primary" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add a debt
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics">
        <div className="metric accent">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </span>
            Total debt
          </div>
          <div className="val">
            $<span>{Math.floor(totalDebt).toLocaleString()}</span>
            <span className="cents">.{((totalDebt * 100) % 100).toFixed(0).padStart(2, "0")}</span>
          </div>
          <span className="delta down">↓ −$412 this month</span>
        </div>
        <div className="metric">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </span>
            Monthly minimum
          </div>
          <div className="val">${totalMin.toLocaleString()}<span className="cents">.00</span></div>
          <span className="delta neut">Next due May 18</span>
        </div>
        <div className="metric">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </span>
            Debt-free estimate
          </div>
          <div className="val" style={{ fontSize: 22 }}>Feb 2028</div>
          <span className="delta up">↑ 4 months earlier than last quarter</span>
        </div>
        <div className="metric">
          <div className="lbl">
            <span className="ico">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </span>
            Interest total
          </div>
          <div className="val">${totalInterest.toLocaleString()}</div>
          <span className="delta neut">Projected over remaining life</span>
        </div>
      </div>

      <DebtSimulator demoDebts={debts} />
    </AppShell>
  );
}
