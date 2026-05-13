"use client";

import { useState } from "react";

type DebtItem = { name: string; apr: number; balance: number; min: number; paid: number; payoff: string; bg: string; issuer: string };

function shiftMonth(label: string, delta: number): string {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [m, y] = label.split(" ");
  let mi = M.indexOf(m) + delta;
  let yi = Number(y);
  while (mi < 0) { mi += 12; yi -= 1; }
  while (mi > 11) { mi -= 12; yi += 1; }
  return `${M[mi]} ${yi}`;
}

function DebtCard({ d, extra }: { d: DebtItem; extra: number }) {
  const aprTone = d.apr > 15 ? "danger" : d.apr > 8 ? "warn" : "primary";
  const barBg =
    aprTone === "danger" ? "linear-gradient(90deg, oklch(0.68 0.15 24), oklch(0.72 0.13 38))"
    : aprTone === "warn"  ? "linear-gradient(90deg, oklch(0.80 0.13 82), oklch(0.78 0.14 70))"
    : "linear-gradient(90deg, oklch(0.66 0.18 282), oklch(0.72 0.17 270))";
  const pillBg    = aprTone === "danger" ? "var(--danger-soft)" : aprTone === "warn" ? "var(--warn-soft)" : "var(--primary-soft)";
  const pillColor = aprTone === "danger" ? "oklch(0.84 0.10 24)" : aprTone === "warn" ? "oklch(0.88 0.10 82)" : "oklch(0.85 0.10 282)";
  const payoff    = extra > 0 && aprTone === "danger" ? shiftMonth(d.payoff, -Math.floor(extra / 30)) : d.payoff;

  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div className="row gap-12">
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: d.bg, display: "grid", placeItems: "center",
            color: "oklch(0.95 0.005 280)",
            boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.06)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 520, letterSpacing: "-0.015em" }}>{d.name}</div>
            <div className="muted f-xs">{d.issuer} · •••• 4421</div>
          </div>
        </div>
        <div className="row gap-8">
          <span className="pill" style={{ background: pillBg, color: pillColor }}>{d.apr}% APR</span>
          <button className="btn sm ghost" type="button">Pay</button>
        </div>
      </div>

      <div className="g-2" style={{ gap: 24 }}>
        <div>
          <div className="muted f-xs">Balance</div>
          <div className="mono" style={{ fontSize: 22, letterSpacing: "-0.025em" }}>
            ${d.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="muted f-xs">Monthly payment</div>
          <div className="mono" style={{ fontSize: 22, letterSpacing: "-0.025em" }}>
            ${d.min}
            {extra > 0 && <span style={{ color: "var(--primary-glow)", fontSize: 14 }}> +${extra}</span>}
          </div>
        </div>
      </div>

      <div className="row between mt-16">
        <span className="muted f-xs">{d.paid}% paid down</span>
        <span className="mono f-xs muted">Payoff {payoff}</span>
      </div>
      <div className="pb thick" style={{ marginTop: 6 }}>
        <i style={{ width: d.paid + "%", background: barBg }} />
      </div>
    </div>
  );
}

export function DebtSimulator({ demoDebts }: { demoDebts: DebtItem[] }) {
  const [extra, setExtra] = useState(120);
  const baseInterest = 1840;
  const interestSaved = Math.round(baseInterest * (extra / 600));
  const monthsSaved   = Math.round((extra / 600) * 14);

  return (
    <>
      {/* Accounts + Simulator grid */}
      <div className="g-12" style={{ marginTop: 16 }}>
        <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="section-hd" style={{ margin: "4px 4px 4px" }}>
            <h2>Your accounts</h2>
            <div className="row gap-8">
              <span className="muted f-xs">Sorted by APR</span>
              <span className="pill primary">
                <span style={{ width: 6, height: 6, borderRadius: 9, background: "var(--primary-glow)" }} />
                Targeting Visa first
              </span>
            </div>
          </div>
          {demoDebts.map((d, i) => (
            <DebtCard key={i} d={d} extra={i === 0 ? extra : 0} />
          ))}
        </div>

        {/* Simulator */}
        <div style={{ gridColumn: "span 4" }}>
          <div className="card" style={{ position: "sticky", top: 24 }}>
            <div className="card-head">
              <div>
                <div className="card-title">Payoff simulator</div>
                <div className="card-sub">See what an extra payment does.</div>
              </div>
              <span className="pill primary">Live</span>
            </div>

            <div className="slider-wrap">
              <div className="row between">
                <span className="muted f-xs">Extra each month</span>
                <span className="mono" style={{ fontSize: 22, letterSpacing: "-0.025em" }}>${extra}</span>
              </div>
              <input
                type="range" min="0" max="600" step="10" value={extra}
                onChange={e => setExtra(Number(e.target.value))}
                className="slim" style={{ marginTop: 10 }}
              />
              <div className="row between mt-8 mono f-xs muted">
                <span>$0</span><span>$300</span><span>$600</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              {[
                { label: "Interest saved",   value: `$${interestSaved.toLocaleString()}`,                        color: "var(--success)"      },
                { label: "Debt-free sooner", value: `${monthsSaved} months`,                                     color: "var(--primary-glow)" },
                { label: "New payoff date",  value: shiftMonth("Feb 2028", -monthsSaved),                        color: "var(--fg)"           },
                { label: "Total paid",       value: `$${(8420 + baseInterest - interestSaved).toLocaleString()}`, color: "var(--fg)"           },
              ].map(({ label, value, color }) => (
                <div key={label} className="row between">
                  <span className="muted f-sm">{label}</span>
                  <span className="mono" style={{ fontSize: 15, letterSpacing: "-0.02em", color }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="f-xs muted" style={{ lineHeight: 1.6 }}>
              We apply the extra to <b style={{ color: "var(--fg-soft)" }}>Visa Platinum</b> first
              (highest APR), then roll the freed payment into <b style={{ color: "var(--fg-soft)" }}>Care Credit</b>.
            </div>

            <button className="btn primary" type="button" style={{ width: "100%", marginTop: 14, height: 36 }}>
              Set ${extra}/mo as my plan
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming payments table */}
      <div className="section-hd">
        <h2>Upcoming payments</h2>
        <span className="sub">Next 4 weeks</span>
      </div>
      <div className="card flat" style={{ padding: 0, overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th><th>Account</th><th>Type</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th style={{ textAlign: "right" }}>Principal</th>
              <th style={{ textAlign: "right" }}>Interest</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: "May 18", name: "Visa Platinum", type: "Min + Extra", amt: "215", p: "173", i: "42", tone: "danger"  },
              { date: "May 24", name: "Student Loan",  type: "Auto",        amt: "140", p: "122", i: "18", tone: "primary" },
              { date: "Jun 02", name: "Care Credit",   type: "Auto",        amt: "45",  p: "36",  i: "9",  tone: "warn"    },
              { date: "Jun 18", name: "Visa Platinum", type: "Min + Extra", amt: "215", p: "178", i: "37", tone: "danger"  },
            ].map((row, idx) => (
              <tr key={idx}>
                <td className="num muted" style={{ fontSize: 12 }}>{row.date}</td>
                <td>
                  <div className="row gap-8">
                    <span style={{
                      width: 6, height: 6, borderRadius: 9,
                      background: row.tone === "danger" ? "var(--danger)" : row.tone === "warn" ? "var(--warn)" : "var(--primary)",
                    }} />
                    {row.name}
                  </div>
                </td>
                <td className="muted">{row.type}</td>
                <td className="num" style={{ textAlign: "right" }}>${row.amt}.00</td>
                <td className="num" style={{ textAlign: "right", color: "var(--success)" }}>${row.p}.00</td>
                <td className="num muted" style={{ textAlign: "right" }}>${row.i}.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
