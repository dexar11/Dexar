export const NFT_TIERS = [
  {
    id:            0,
    name:          "Bronze",
    requiredScore: 1000,
    color:         "#CD7F32",
    benefits:      ["0.1% fee discount", "Exclusive profile badge"],
  },
  {
    id:            1,
    name:          "Silver",
    requiredScore: 2500,
    color:         "#A0A0A0",
    benefits:      ["0.2% fee discount", "Hidden tokens"],
  },
  {
    id:            2,
    name:          "Gold",
    requiredScore: 5000,
    color:         "#D4A017",
    benefits:      ["0.3% fee discount", "VIP support", "Early access"],
  },
  {
    id:            3,
    name:          "Diamond",
    requiredScore: 10000,
    color:         "#7B5EA7",
    benefits:      ["0.5% fee discount", "Governance vote", "Exclusive API access"],
  },
] as const;

export type NftTierId = 0 | 1 | 2 | 3;

export const POINTS = {
  SWAP:         100,
  MULTI_SWAP:   150,
  AI_AGENT:     250,
  SEND:          75,
  BRIDGE:       200,
  NFT_MINT:     100,
  STREAK_7_DAY: 500,
  X_FOLLOW:    1000,
} as const;

// Tier icon emojis
export const TIER_ICONS: Record<string, string> = {
  Bronze:  "🥉",
  Silver:  "🥈",
  Gold:    "🥇",
  Diamond: "💎",
};
