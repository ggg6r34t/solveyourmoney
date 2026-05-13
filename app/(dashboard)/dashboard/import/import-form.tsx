"use client";

import { useState } from "react";
import { saveImportedTransactions } from "@/server/actions/import";
import type { ParsedTransaction } from "@/lib/import/parseBankStatement";

type AssignedTransaction = ParsedTransaction & {
  assignment: "debt_payment" | "expense" | "savings" | "ignore";
  targetId?: string;
  targetLabel?: string;
};

function fmt(value: number): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(value);
}

export function ImportForm() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<AssignedTransaction[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setTransactions([]);
    setSaveResult(null);

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/import/bank-statement", { method: "POST", body: formData });
    const json = (await res.json()) as { transactions?: ParsedTransaction[]; error?: string };
    setUploading(false);

    if (!res.ok || json.error) {
      setUploadError(json.error ?? "Upload failed. Please try again.");
      return;
    }

    setTransactions((json.transactions ?? []).map(t => ({ ...t, assignment: "expense" as const })));
  }

  function updateAssignment(index: number, value: AssignedTransaction["assignment"]) {
    setTransactions(prev => prev.map((t, i) => (i === index ? { ...t, assignment: value } : t)));
  }

  async function handleConfirm() {
    setSaving(true);
    setSaveResult(null);
    const result = await saveImportedTransactions({ transactions });
    setSaving(false);
    if (result.ok) {
      setSaveResult({ ok: true, message: `${result.count} transaction${result.count === 1 ? "" : "s"} saved to your dashboard.` });
      setTransactions([]);
    } else {
      setSaveResult({ ok: false, message: result.message });
    }
  }

  return (
    <>
      {/* Upload area */}
      <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "var(--primary-soft)",
          display: "grid", placeItems: "center",
          margin: "0 auto 16px",
          color: "var(--primary-glow)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 520, letterSpacing: "-0.015em", marginBottom: 6 }}>
          Upload bank statement PDF
        </div>
        <div className="muted f-sm" style={{ marginBottom: 20 }}>
          Exported from your bank · transactions are parsed locally
        </div>
        <label style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          height: 34, padding: "0 16px", borderRadius: 8,
          background: "linear-gradient(180deg, oklch(0.7 0.18 282), oklch(0.58 0.18 282))",
          boxShadow: "0 0 0 1px oklch(0.7 0.18 282), 0 6px 16px -6px oklch(0.66 0.18 282 / 0.6), 0 1px 0 oklch(1 0 0 / 0.18) inset",
          fontSize: 13, fontWeight: 500, color: "oklch(0.98 0 0)",
          cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.6 : 1,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {uploading ? "Reading…" : "Choose file"}
          <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} style={{ display: "none" }} />
        </label>

        {uploadError && (
          <div style={{
            marginTop: 14, padding: "10px 14px", borderRadius: "var(--r-md)",
            background: "var(--danger-soft)", color: "oklch(0.84 0.10 24)",
            fontSize: 12.5, fontWeight: 480,
          }}>
            {uploadError}
          </div>
        )}
      </div>

      {/* Save result */}
      {saveResult && (
        <div style={{
          marginTop: 14, padding: "12px 16px", borderRadius: "var(--r-md)",
          background: saveResult.ok ? "var(--success-soft)" : "var(--danger-soft)",
          color: saveResult.ok ? "var(--success)" : "oklch(0.84 0.10 24)",
          fontSize: 13, fontWeight: 500,
          boxShadow: "0 0 0 1px var(--line)",
        }}>
          {saveResult.message}
        </div>
      )}

      {/* Transaction review */}
      {transactions.length > 0 && (
        <>
          <div className="section-hd">
            <h2>Review transactions</h2>
            <span className="pill">{transactions.length} found</span>
          </div>

          <div className="card flat" style={{ padding: 0, overflow: "hidden" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Assign to</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i}>
                    <td className="num muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{tx.date}</td>
                    <td style={{ maxWidth: 320 }}>
                      <div style={{ fontSize: 13, fontWeight: 480, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tx.description}
                      </div>
                    </td>
                    <td className="num" style={{
                      textAlign: "right", whiteSpace: "nowrap",
                      color: tx.type === "debit" ? "var(--danger)" : "var(--success)",
                    }}>
                      {tx.type === "debit" ? "−" : "+"}{fmt(tx.amount)}
                    </td>
                    <td>
                      <select
                        value={tx.assignment}
                        onChange={e => updateAssignment(i, e.target.value as AssignedTransaction["assignment"])}
                        style={{
                          appearance: "none", WebkitAppearance: "none",
                          height: 28, padding: "0 28px 0 10px",
                          borderRadius: 7, border: "1px solid var(--line)",
                          background: "oklch(1 0 0 / 0.04)", color: "var(--fg)",
                          fontSize: 12, fontWeight: 460, fontFamily: "inherit",
                          cursor: "pointer", outline: "none",
                          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(255,255,255,.35)' d='M0 0h10L5 6z'/></svg>\")",
                          backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
                        }}
                      >
                        <option value="expense">Expense</option>
                        <option value="debt_payment">Debt payment</option>
                        <option value="savings">Savings</option>
                        <option value="ignore">Ignore</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleConfirm}
            disabled={saving}
            type="button"
            className="btn primary"
            style={{ width: "100%", marginTop: 14, height: 38, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving…" : `Confirm and save ${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`}
          </button>
        </>
      )}
    </>
  );
}
