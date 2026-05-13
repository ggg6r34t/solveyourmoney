export type Tone = "primary" | "success" | "warning" | "danger" | "info" | "xp";

export function toneText(tone: Tone) {
  return ({
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger:  "text-danger",
    info:    "text-info",
    xp:      "text-xp",
  } as Record<Tone, string>)[tone];
}

export function toneBgSoft(tone: Tone) {
  return ({
    primary: "bg-primary-soft",
    success: "bg-success-soft",
    warning: "bg-warning-soft",
    danger:  "bg-danger-soft",
    info:    "bg-info/15",
    xp:      "bg-primary-soft",
  } as Record<Tone, string>)[tone];
}
