import { formatCurrency } from "@/lib/format";
import type { LucideIcon } from "lucide-react";

type Tone = "primary" | "success" | "warning" | "danger" | "flat";

const toneConfig: Record<Tone, { color: string; bg: string; arrow: string }> = {
  primary: { color: "oklch(0.85 0.10 282)", bg: "var(--primary-soft)",   arrow: "↑" },
  success: { color: "oklch(0.85 0.10 152)", bg: "var(--success-soft)",   arrow: "↑" },
  warning: { color: "oklch(0.88 0.10 82)",  bg: "var(--warn-soft)",      arrow: "↓" },
  danger:  { color: "oklch(0.84 0.10 24)",  bg: "var(--danger-soft)",    arrow: "↓" },
  flat:    { color: "var(--fg-mute)",        bg: "oklch(1 0 0 / 0.05)",  arrow: "·" },
};

export function MetricCard({
  label,
  value,
  trendValue = "Stable",
  trendDirection = "flat",
  insight,
  helper,
  Icon,
  accent = false,
}: {
  label: string;
  value: number | string;
  trendValue?: string;
  trendDirection?: "up" | "down" | "flat";
  insight?: string;
  helper?: string;
  Icon?: LucideIcon;
  accent?: boolean;
}) {
  const tone: Tone =
    trendDirection === "up"   ? "success" :
    trendDirection === "down" ? "warning" :
    "flat";

  const cfg = toneConfig[tone];
  const resolvedValue = typeof value === "number" ? formatCurrency(value) : value;
  const resolvedInsight = insight ?? helper ?? trendValue;

  return (
    <div style={{
      padding: "18px 20px",
      borderRadius: "var(--r-lg)",
      background: "var(--bg-1)",
      boxShadow: "0 0 0 1px var(--line), 0 1px 0 var(--inner-hl) inset",
      display: "flex", flexDirection: "column", gap: 8,
      minHeight: 116, position: "relative", overflow: "hidden",
    }}>
      {accent && (
        <span style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(220px 120px at 100% 0%, oklch(0.66 0.18 282 / 0.14), transparent 60%)",
        }} />
      )}

      {/* Label row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 11.5, color: "var(--fg-mute)",
      }}>
        {Icon && (
          <span style={{
            width: 22, height: 22, borderRadius: 6,
            background: "oklch(1 0 0 / 0.04)",
            display: "grid", placeItems: "center",
            color: "var(--fg-soft)", flexShrink: 0,
          }}>
            <Icon size={13} />
          </span>
        )}
        {label}
      </div>

      {/* Value */}
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em",
        color: "var(--fg)",
      }}>
        {resolvedValue}
      </div>

      {/* Delta */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontFamily: "var(--font-mono)", fontSize: 11,
        color: cfg.color,
      }}>
        <span>{cfg.arrow}</span>
        {resolvedInsight}
      </div>
    </div>
  );
}
