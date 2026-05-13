"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Tone } from "./tone-utils";

export type { Tone } from "./tone-utils";
export { toneText, toneBgSoft } from "./tone-utils";

const toneFill: Record<Tone, string> = {
  primary: "oklch(0.66 0.18 282)",
  success: "oklch(0.73 0.13 152)",
  warning: "oklch(0.80 0.13 82)",
  danger:  "oklch(0.68 0.15 24)",
  info:    "oklch(0.72 0.13 220)",
  xp:      "linear-gradient(90deg, oklch(0.66 0.18 282), oklch(0.78 0.14 250))",
};

const toneGlow: Record<Tone, string> = {
  primary: "0 0 10px oklch(0.66 0.18 282 / 0.5)",
  success: "0 0 10px oklch(0.73 0.13 152 / 0.5)",
  warning: "0 0 10px oklch(0.80 0.13 82 / 0.5)",
  danger:  "0 0 10px oklch(0.68 0.15 24 / 0.5)",
  info:    "0 0 10px oklch(0.72 0.13 220 / 0.5)",
  xp:      "0 0 12px oklch(0.72 0.17 270 / 0.6)",
};

export function ProgressBar({
  value,
  tone = "primary",
  thick = false,
  className,
}: {
  value: number;
  tone?: Tone;
  thick?: boolean;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(className)}
      style={{
        height: thick ? 8 : 6,
        borderRadius: 999,
        background: "oklch(1 0 0 / 0.06)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          height: "100%",
          borderRadius: 999,
          background: toneFill[tone],
          boxShadow: toneGlow[tone],
        }}
      />
    </div>
  );
}
