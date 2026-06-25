// ── Scoring constants ──────────────────────────────────────────────────────
export const TASKS = [
  {
    id:       "follow_x",
    icon:     "X",
    title:    "Follow Arc Aggregator on X",
    desc:     "Follow @ArcAggregator and earn points",
    pts:      1000,
    action:   "follow",
    actionUrl:"https://x.com/arc",
  },
  {
    id:    "swap_1",
    icon:  "swap",
    title: "Make 1 swap",
    desc:  "For each completed swap",
    pts:   100,
    action: null,
  },
  {
    id:    "multi_swap",
    icon:  "multi",
    title: "Make 1 Multi Swap",
    desc:  "For each completed Multi Swap",
    pts:   150,
    action: null,
  },
  {
    id:    "send_1",
    icon:  "send",
    title: "Send tokens",
    desc:  "For each completed send",
    pts:   75,
    action: null,
  },
  {
    id:    "bridge_1",
    icon:  "bridge",
    title: "Bridge USDC",
    desc:  "For each completed bridge",
    pts:   200,
    action: null,
  },
  {
    id:    "streak_7",
    icon:  "streak",
    title: "Trade 7 days in a row",
    desc:  "When a continuous weekly streak is completed",
    pts:   500,
    action: null,
  },
] as const;

export const TIERS = [
  { name: "Bronze",  pts: 1000,  icon: "🥉", color: "#CD7F32" },
  { name: "Silver",  pts: 2500,  icon: "🥈", color: "#A0A0A0" },
  { name: "Gold",    pts: 5000,  icon: "🥇", color: "#FFD700" },
  { name: "Diamond", pts: 10000, icon: "💎", color: "#89D4F5" },
] as const;

export type TierName = typeof TIERS[number]["name"];

/** Compute score from swap count (simple model) */
export function computeScore(swapCount: number, sendCount = 0, bridgeCount = 0): number {
  return swapCount * 100 + sendCount * 75 + bridgeCount * 200;
}

/** Which tier the user is currently in (null = below Bronze) */
export function getCurrentTier(score: number): typeof TIERS[number] | null {
  let current: typeof TIERS[number] | null = null;
  for (const tier of TIERS) {
    if (score >= tier.pts) current = tier;
  }
  return current;
}

/** Next tier to unlock */
export function getNextTier(score: number): typeof TIERS[number] | null {
  return TIERS.find(t => t.pts > score) ?? null;
}
