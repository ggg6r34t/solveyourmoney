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
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function ImportPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<AssignedTransaction[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setTransactions([]);
    setSaveResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/import/bank-statement", {
      method: "POST",
      body: formData,
    });

    const json = (await res.json()) as {
      transactions?: ParsedTransaction[];
      error?: string;
    };

    setUploading(false);

    if (!res.ok || json.error) {
      setUploadError(json.error ?? "Upload failed. Please try again.");
      return;
    }

    const assigned: AssignedTransaction[] = (json.transactions ?? []).map(
      (t) => ({ ...t, assignment: "expense" as const }),
    );
    setTransactions(assigned);
  }

  function updateAssignment(
    index: number,
    value: AssignedTransaction["assignment"],
  ) {
    setTransactions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, assignment: value } : t)),
    );
  }

  async function handleConfirm() {
    setSaving(true);
    setSaveResult(null);
    const result = await saveImportedTransactions({ transactions });
    setSaving(false);
    if (result.ok) {
      setSaveResult({
        ok: true,
        message: `${result.count} transaction${result.count === 1 ? "" : "s"} saved to your dashboard.`,
      });
      setTransactions([]);
    } else {
      setSaveResult({ ok: false, message: result.message });
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-black text-foreground">
        Import Bank Statement
      </h1>
      <p className="mt-2 text-sm font-semibold text-muted">
        Upload a PDF bank statement exported from your bank. We&apos;ll extract
        the transactions so you can assign them to your debt, budget, or savings
        accounts.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-panel p-6">
        <label className="block text-sm font-bold text-foreground">
          Select PDF file
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
        />
        {uploading && (
          <p className="mt-3 text-sm font-semibold text-muted">
            Reading statement…
          </p>
        )}
        {uploadError && (
          <p className="mt-3 text-sm font-semibold text-danger">{uploadError}</p>
        )}
      </div>

      {saveResult && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${
            saveResult.ok
              ? "bg-surface-success text-success"
              : "bg-surface-danger text-danger"
          }`}
        >
          {saveResult.message}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-muted">
            {transactions.length} transaction
            {transactions.length === 1 ? "" : "s"} found. Assign each one or
            mark as ignore.
          </p>
          <div className="grid gap-3">
            {transactions.map((tx, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-panel p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-foreground">
                      {tx.description}
                    </p>
                    <p className="text-xs font-semibold text-muted">{tx.date}</p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-black ${
                      tx.type === "debit" ? "text-danger" : "text-success"
                    }`}
                  >
                    {tx.type === "debit" ? "-" : "+"}
                    {fmt(tx.amount)}
                  </p>
                </div>
                <select
                  value={tx.assignment}
                  onChange={(e) =>
                    updateAssignment(
                      i,
                      e.target.value as AssignedTransaction["assignment"],
                    )
                  }
                  className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground"
                >
                  <option value="expense">Expense</option>
                  <option value="debt_payment">Debt payment</option>
                  <option value="savings">Savings contribution</option>
                  <option value="ignore">Ignore</option>
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="mt-6 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Confirm and save to dashboard"}
          </button>
        </div>
      )}
    </div>
  );
}
