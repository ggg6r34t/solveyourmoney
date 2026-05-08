import { cn } from "@/lib/utils";
import type { Tone } from "@/features/dashboard/mockData";

const toneClass: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export function toneText(tone: Tone) {
  return {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
  }[tone];
}

export function toneBgSoft(tone: Tone) {
  return {
    primary: "bg-primary-soft",
    success: "bg-surface-success",
    warning: "bg-warning-soft",
    danger: "bg-danger-soft",
    info: "bg-info/15",
  }[tone];
}

export function ProgressBar({
  value,
  tone,
  className,
}: {
  value: number;
  tone: Tone;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-track", className)}>
      <div
        className={cn("h-full rounded-full", toneClass[tone])}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
