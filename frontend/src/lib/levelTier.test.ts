import { describe, it, expect } from "vitest";
import { getLevelTier } from "./levelTier";

describe("getLevelTier - 3-level topic (totalLevels=3)", () => {
  it("level 1 is Beginner", () => {
    expect(getLevelTier(1, 3).label).toBe("Beginner");
  });
  it("level 2 is Intermediate", () => {
    expect(getLevelTier(2, 3).label).toBe("Intermediate");
  });
  it("level 3 is Advanced", () => {
    expect(getLevelTier(3, 3).label).toBe("Advanced");
  });
});

describe("getLevelTier - 15-level topic (legacy default)", () => {
  it("levels 1-5 are Beginner", () => {
    for (let i = 1; i <= 5; i++) {
      expect(getLevelTier(i, 15).label).toBe("Beginner");
    }
  });
  it("levels 6-10 are Intermediate", () => {
    for (let i = 6; i <= 10; i++) {
      expect(getLevelTier(i, 15).label).toBe("Intermediate");
    }
  });
  it("levels 11-15 are Advanced", () => {
    for (let i = 11; i <= 15; i++) {
      expect(getLevelTier(i, 15).label).toBe("Advanced");
    }
  });
});

describe("getLevelTier - returns brand-aligned colors", () => {
  it("Beginner uses brand green", () => {
    expect(getLevelTier(1, 3).color).toBe("#10b981");
  });
  it("Intermediate uses brand amber", () => {
    expect(getLevelTier(2, 3).color).toBe("#f59e0b");
  });
  it("Advanced uses brand red", () => {
    expect(getLevelTier(3, 3).color).toBe("#ef4444");
  });
  it("returns a non-empty bg + border for each tier", () => {
    for (const tier of [
      getLevelTier(1, 3),
      getLevelTier(2, 3),
      getLevelTier(3, 3),
    ]) {
      expect(tier.bg).toMatch(/^rgba\(/);
      expect(tier.border).toMatch(/^rgba\(/);
    }
  });
});

describe("getLevelTier - edge cases", () => {
  it("level 0 is Beginner", () => {
    expect(getLevelTier(0, 3).label).toBe("Beginner");
  });
  it("negative level clamps to Beginner", () => {
    expect(getLevelTier(-5, 3).label).toBe("Beginner");
  });
  it("totalLevels=0 still classifies as Beginner", () => {
    expect(getLevelTier(0, 0).label).toBe("Beginner");
  });
  it("level > totalLevels stays Advanced (no overflow)", () => {
    expect(getLevelTier(50, 3).label).toBe("Advanced");
  });
  // For small total-level counts the third-bucket ratio leans toward
  // higher tiers, which is fine: a topic that's only "1 level" probably
  // shouldn't exist long-term, and these tests just lock the math down.
  it("totalLevels=1: the single level falls in Advanced (ratio=1.0)", () => {
    expect(getLevelTier(1, 1).label).toBe("Advanced");
  });
  it("totalLevels=2: level 1 is Intermediate, level 2 is Advanced", () => {
    expect(getLevelTier(1, 2).label).toBe("Intermediate");
    expect(getLevelTier(2, 2).label).toBe("Advanced");
  });
});

describe("getLevelTier - monotonic difficulty", () => {
  it("tier label never decreases as level rises in a 30-level topic", () => {
    const ordering = { Beginner: 0, Intermediate: 1, Advanced: 2 } as const;
    let last = -1;
    for (let i = 1; i <= 30; i++) {
      const t = ordering[getLevelTier(i, 30).label];
      expect(t).toBeGreaterThanOrEqual(last);
      last = t;
    }
  });
  it("partitions a 9-level topic into 3+3+3", () => {
    const counts: Record<string, number> = {
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0,
    };
    for (let i = 1; i <= 9; i++) {
      counts[getLevelTier(i, 9).label]++;
    }
    expect(counts.Beginner).toBe(3);
    expect(counts.Intermediate).toBe(3);
    expect(counts.Advanced).toBe(3);
  });
});
