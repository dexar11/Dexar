"use client";

import { Skeleton } from "@/components/ui/LoadingSpinner";
import type { WalletStats } from "@/app/api/wallet-stats/route";
import { TIERS } from "@/lib/walletScore";

// ── Gauge ─────────────────────────────────────────────────────────────────────
const RADIUS        = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColor(): string {
  return "#c85c1a";
}

function Gauge({ score, isLoading }: { score: number; isLoading: boolean }) {
  const progress   = Math.min(score / 100, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const color      = scoreColor();

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={RADIUS} fill="none"
          stroke="var(--bg-input)" strokeWidth="13" strokeLinecap="round" />
        {!isLoading && (
          <circle cx="70" cy="70" r={RADIUS} fill="none"
            stroke={color} strokeWidth="13" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isLoading ? (
          <div style={{ width: 46, height: 28, borderRadius: 6, background: "var(--border)", opacity: 0.5 }} />
        ) : (
          <span style={{ fontSize: 34, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1 }}>
            {Number.isInteger(score) ? score : score.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Tier badge ────────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: number }) {
  const colors: Record<number, { bg: string; text: string }> = {
    0: { bg: "#6b728022", text: "#6b7280" },
    1: { bg: "#3b82f622", text: "#3b82f6" },
    2: { bg: "#8b5cf622", text: "#8b5cf6" },
    3: { bg: "#f59e0b22", text: "#f59e0b" },
    4: { bg: "#f97316aa", text: "#ea580c" },
    5: { bg: "#22c55e22", text: "#16a34a" },
  };
  const c = colors[tier] ?? colors[0];
  return (
    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
      style={{ background: c.bg, color: c.text }}>
      {tier === 0 ? "—" : `T${tier}`}
    </span>
  );
}

// ── Metric row ────────────────────────────────────────────────────────────────
function MetricRow({
  label, rawScore, weight, isLoading,
}: {
  label: string; rawScore: number; weight: string; isLoading: boolean;
}) {
  // Progress bar: rawScore is 0-10, map directly to percentage
  const fullPct = (rawScore / 10) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs shrink-0" style={{ color: "var(--text-secondary)" }}>{label}</span>
        {isLoading ? (
          <div className="h-3.5 w-16 rounded animate-pulse" style={{ background: "var(--border)" }} />
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {rawScore.toFixed(1)}<span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>/10</span>
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{weight}</span>
          </div>
        )}
      </div>
      <div style={{ height: 6, borderRadius: 4, overflow: "hidden", background: "var(--bg-input)" }}>
        {!isLoading && (
          <div style={{
            height: "100%", borderRadius: 4, background: "#c85c1a",
            width: `${Math.min(100, fullPct)}%`,
            transition: "width 0.8s ease",
          }} />
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface Props {
  data:      WalletStats | undefined;
  isLoading: boolean;
}

export function WalletScore({ data, isLoading }: Props) {
  const total      = data?.walletScore ?? 0;
  const txS        = data?.txS   ?? 0;
  const ageS       = data?.ageS  ?? 0;
  const volS       = data?.volS  ?? 0;
  const conS       = data?.conS  ?? 0;
  const feeS       = data?.feeS  ?? 0;

  // Tier hesabı (frontend'de de çalıştırılıyor — route'dan tier verisi gelmediği için)
  function tierOf(score: number): number {
    if (score <= 0)  return 0;
    if (score >= 10) return 5;
    return Math.min(5, Math.floor(score / 2) + 1);
  }

  const txTier  = tierOf(txS);
  const ageTier = tierOf(ageS);
  const volTier = tierOf(volS);
  const conTier = tierOf(conS);
  const feeTier = tierOf(feeS);

  // Combo bonus tahmini (display only)
  const tiers       = [txTier, ageTier, volTier, conTier, feeTier];
  const tier3Plus   = tiers.filter(t => t >= 3).length;
  const tier5Count  = tiers.filter(t => t >= 5).length;
  let comboBonus    = 0;
  if      (tier3Plus === 3) comboBonus += 5;
  else if (tier3Plus === 4) comboBonus += 10;
  else if (tier3Plus >= 5)  comboBonus += 15;
  if      (tier5Count === 1) comboBonus += 3;
  else if (tier5Count === 2) comboBonus += 8;
  else if (tier5Count >= 3)  comboBonus += 15;

  return (
    <div className="rounded-2xl border p-4"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
        style={{ color: "var(--text-secondary)" }}>
        Wallet Score Card
      </p>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 items-center">
        {/* Gauge */}
        <div className="flex flex-col items-center shrink-0 w-[30%] gap-2">
          <Gauge score={isLoading ? 0 : total} isLoading={isLoading} />
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-3 flex-1 w-full min-w-0">
          <MetricRow label="Transactions" rawScore={txS}  weight="25%" isLoading={isLoading} />
          <MetricRow label="Wallet Age"   rawScore={ageS} weight="15%" isLoading={isLoading} />
          <MetricRow label="Volume"       rawScore={volS} weight="25%" isLoading={isLoading} />
          <MetricRow label="Active Days"  rawScore={conS} weight="20%" isLoading={isLoading} />
          <MetricRow label="Gas Fees"     rawScore={feeS} weight="15%" isLoading={isLoading} />

          {/* Combo bonus */}
          {!isLoading && comboBonus > 0 && (
            <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold"
              style={{ background: "#C9693A15", border: "1px solid #C9693A33", color: "#C9693A" }}>
              <span>⚡ Combo Bonus</span>
              <span>+{comboBonus} pts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
