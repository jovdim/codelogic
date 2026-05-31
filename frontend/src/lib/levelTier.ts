// Map a numeric level (1..totalLevels) to a difficulty tier.
// Client asked the levels to read as Beginner / Intermediate / Advanced
// even when topics have many numeric levels - we bucket the level into
// thirds based on totalLevels.
//
// Edge cases:
//   - totalLevels <= 0  -> treated as 1 (everything is Beginner)
//   - level <= 0        -> treated as Beginner
//   - level > totalLevels -> still Advanced (the caller can clamp upstream)

export type Tier = "Beginner" | "Intermediate" | "Advanced";

export interface TierInfo {
  label: Tier;
  color: string;
  bg: string;
  border: string;
}

const BEGINNER: TierInfo = {
  label: "Beginner",
  color: "#10b981",
  bg: "rgba(16,185,129,0.15)",
  border: "rgba(16,185,129,0.45)",
};

const INTERMEDIATE: TierInfo = {
  label: "Intermediate",
  color: "#f59e0b",
  bg: "rgba(245,158,11,0.15)",
  border: "rgba(245,158,11,0.45)",
};

const ADVANCED: TierInfo = {
  label: "Advanced",
  color: "#ef4444",
  bg: "rgba(239,68,68,0.15)",
  border: "rgba(239,68,68,0.45)",
};

export function getLevelTier(level: number, totalLevels: number): TierInfo {
  const safeTotal = Math.max(totalLevels, 1);
  const safeLevel = Math.max(level, 0);
  const ratio = safeLevel / safeTotal;
  if (ratio <= 1 / 3) return BEGINNER;
  if (ratio <= 2 / 3) return INTERMEDIATE;
  return ADVANCED;
}
