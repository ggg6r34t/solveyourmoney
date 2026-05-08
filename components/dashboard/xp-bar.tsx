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
      <div className="mb-2 flex items-center gap-3">
        <span className="rounded bg-primary px-2 py-1 text-xs font-black text-white">
          LVL {level}
        </span>
        <div className="min-w-0 flex-1">
          <ProgressBar value={percent} tone="primary" className={compact ? "h-1.5" : "h-2"} />
        </div>
        <span className="text-xs font-bold text-muted">
          {xp}/{max}
          {!compact ? " XP" : ""}
        </span>
      </div>
    </div>
  );
}
