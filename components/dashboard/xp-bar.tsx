import { ProgressBar } from "./progress-bar";

export function XPBar({
  level,
  xp,
  max,
  compact = false,
}: {
  level: number;
  xp: number;
  max: number;
  compact?: boolean;
}) {
  const percent = Math.round((xp / max) * 100);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "3px 8px 3px 6px", borderRadius: 999,
          background: "oklch(0.66 0.18 282 / 0.18)",
          fontSize: 11, fontWeight: 540, color: "oklch(0.85 0.10 282)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--primary-glow)",
            boxShadow: "0 0 8px var(--primary-glow)",
          }} />
          Lvl {level}
        </span>
        <div style={{ flex: 1 }}>
          <ProgressBar value={percent} tone="xp" thick={!compact} />
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--fg-dim)", whiteSpace: "nowrap",
        }}>
          {xp}/{max}
        </span>
      </div>
    </div>
  );
}
