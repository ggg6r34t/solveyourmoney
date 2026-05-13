"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { updateProfileDisplayName } from "@/server/actions/dashboard";

export function SettingsContent({ initialDisplayName }: { initialDisplayName: string }) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await updateProfileDisplayName({ displayName });
      if (result.ok) {
        setSaved(true);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Sparkles size={18} style={{ color: "var(--primary-glow)" }} />
        <h2 style={{ fontSize: 16, fontWeight: 520, margin: 0 }}>Profile</h2>
      </div>

      <form onSubmit={handleSave}>
        <div className="card" style={{ padding: 20 }}>
          <div className="card-head" style={{ marginBottom: 16 }}>
            <div>
              <div className="card-title">Display name</div>
              <div className="card-sub">Shown in your dashboard greeting and sidebar</div>
            </div>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="f-xs muted">Name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              required
              style={{
                height: 36,
                background: "oklch(1 0 0 / 0.04)",
                border: 0,
                color: "var(--fg)",
                font: "inherit",
                padding: "0 12px",
                borderRadius: 8,
                boxShadow: "0 0 0 1px var(--line)",
                outline: "none",
                fontSize: 13,
                width: "100%",
              }}
            />
          </label>

          {error && (
            <div className="f-xs" style={{ color: "var(--danger)", marginTop: 8 }}>{error}</div>
          )}
          {saved && (
            <div className="f-xs" style={{ color: "var(--success)", marginTop: 8 }}>Profile saved.</div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn primary" type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
