/**
 * Wallet Score Calculator — Hybrid Tier + Combo system
 * Categories: Transactions, Wallet Age, Volume, Active Days, Gas Fee
 */

export const TIERS = {
  transactions: [10,  25,   50,   100,  250 ],
  walletAge:    [6,   12,   18,   24,   36  ],  // months
  volume:       [100, 500,  1000, 2500, 5000],  // USD
  activeDays:   [1,   5,    10,   15,   20  ],
  gasFee:       [0.1, 0.5,  1,    3,    5   ],  // USD
} as const;

export const WEIGHTS = {
  transactions: 0.25,
  walletAge:    0.15,
  volume:       0.25,
  activeDays:   0.20,
  gasFee:       0.15,
} as const;

type Category = keyof typeof TIERS;

interface TierResult {
  tier:  number;  // 0-5
  score: number;  // 0-10
}

/**
 * Returns tier index (1-based) and raw score (0-10) for a value.
 * Tier 1 → base 2, Tier 2 → base 4, ..., Tier 5 → base 10.
 * Within a tier, proportional bonus up to +1.99 toward next tier.
 */
function getTierScore(value: number, thresholds: readonly number[]): TierResult {
  const len = thresholds.length;

  if (value < thresholds[0])        return { tier: 0, score: 0 };
  if (value >= thresholds[len - 1]) return { tier: 5, score: 10 };

  for (let i = 0; i < len - 1; i++) {
    if (value >= thresholds[i] && value < thresholds[i + 1]) {
      const tierIndex = i + 1;
      const base      = tierIndex * 2;
      const progress  = (value - thresholds[i]) / (thresholds[i + 1] - thresholds[i]);
      const bonus     = progress * 1.99;
      return { tier: tierIndex, score: parseFloat((base + bonus).toFixed(2)) };
    }
  }
  return { tier: 0, score: 0 };
}

function getComboBonus(tierMap: Record<string, number>): number {
  const tiers      = Object.values(tierMap);
  const tier3Plus  = tiers.filter(t => t >= 3).length;
  const tier5Count = tiers.filter(t => t >= 5).length;

  let bonus = 0;

  if      (tier3Plus === 3) bonus += 5;
  else if (tier3Plus === 4) bonus += 10;
  else if (tier3Plus >= 5)  bonus += 15;

  if      (tier5Count === 1) bonus += 3;
  else if (tier5Count === 2) bonus += 8;
  else if (tier5Count >= 3)  bonus += 15;

  return bonus;
}

export interface ScoreBreakdownItem {
  inputValue:            number;
  tier:                  number;
  rawScore:              number;
  weight:                number;
  weightedContribution:  number;
}

export interface WalletScoreResult {
  finalScore:  number;
  baseScore:   number;
  comboBonus:  number;
  breakdown:   Record<Category, ScoreBreakdownItem>;
  tierMap:     Record<Category, number>;
  // Legacy fields for backward compat with wallet-stats route
  total: number;
  txS:   number;
  ageS:  number;
  volS:  number;
  conS:  number;
  feeS:  number;
}

export function getWalletScore(
  transactions:    number,
  walletAgeMonths: number,
  volumeUSD:       number,
  activeDays:      number,
  gasFeeUSD:       number,
): WalletScoreResult {
  const categories: Record<Category, TierResult> = {
    transactions: getTierScore(transactions,    TIERS.transactions),
    walletAge:    getTierScore(walletAgeMonths, TIERS.walletAge),
    volume:       getTierScore(volumeUSD,       TIERS.volume),
    activeDays:   getTierScore(activeDays,      TIERS.activeDays),
    gasFee:       getTierScore(gasFeeUSD,       TIERS.gasFee),
  };

  // Weighted score 0-10
  const weightedScore = (Object.entries(categories) as [Category, TierResult][]).reduce(
    (sum, [key, val]) => sum + val.score * WEIGHTS[key], 0,
  );

  // Normalize to 0-85 base (leaves room for combo bonuses)
  const baseScore  = parseFloat(((weightedScore / 10) * 85).toFixed(2));

  const tierMap = Object.fromEntries(
    Object.entries(categories).map(([key, val]) => [key, val.tier]),
  ) as Record<Category, number>;

  const comboBonus = getComboBonus(tierMap);
  const finalScore = Math.min(100, parseFloat((baseScore + comboBonus).toFixed(1)));

  const breakdown = Object.fromEntries(
    (Object.entries(categories) as [Category, TierResult][]).map(([key, val]) => [
      key,
      {
        inputValue:           0, // filled below
        tier:                 val.tier,
        rawScore:             val.score,
        weight:               WEIGHTS[key],
        weightedContribution: parseFloat((val.score * WEIGHTS[key]).toFixed(2)),
      } satisfies ScoreBreakdownItem,
    ]),
  ) as Record<Category, ScoreBreakdownItem>;

  // Fill inputValues
  breakdown.transactions.inputValue = transactions;
  breakdown.walletAge.inputValue    = walletAgeMonths;
  breakdown.volume.inputValue       = volumeUSD;
  breakdown.activeDays.inputValue   = activeDays;
  breakdown.gasFee.inputValue       = gasFeeUSD;

  return {
    finalScore,
    baseScore,
    comboBonus,
    breakdown,
    tierMap,
    // Legacy
    total: finalScore,
    txS:   categories.transactions.score,
    ageS:  categories.walletAge.score,
    volS:  categories.volume.score,
    conS:  categories.activeDays.score,
    feeS:  categories.gasFee.score,
  };
}
