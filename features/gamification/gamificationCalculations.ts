// features/gamification/gamificationCalculations.ts

const THRESHOLDS = [0, 250, 600, 1200, 2000, 3500] as const;
const NAMES = ["Starter", "Explorer", "Steady", "Architect", "Master", "Legend"] as const;

export type GamificationLevel = {
  level: number;
  name: string;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpPct: number;
  nextLevelName: string | null;
};

export function deriveLevel(xp: number): GamificationLevel {
  let idx = 0;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= THRESHOLDS[i]) {
      idx = i;
      break;
    }
  }

  const level = idx + 1;
  const isMax = level === THRESHOLDS.length;
  const xpForCurrentLevel = THRESHOLDS[idx];
  const xpForNextLevel = isMax ? 0 : THRESHOLDS[idx + 1];
  const range = isMax ? 1 : xpForNextLevel - xpForCurrentLevel;
  const xpPct = isMax
    ? 100
    : Math.min(100, Math.round(((xp - xpForCurrentLevel) / range) * 100));
  const nextLevelName = isMax ? null : NAMES[idx + 1];

  return {
    level,
    name: NAMES[idx],
    xpForCurrentLevel,
    xpForNextLevel,
    xpPct,
    nextLevelName,
  };
}
