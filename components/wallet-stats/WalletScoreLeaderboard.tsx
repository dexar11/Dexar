"use client";

import { useState, useEffect } from "react";
import { useQuery }            from "@tanstack/react-query";
import { supabase }            from "@/lib/supabase";
import { Skeleton }            from "@/components/ui/LoadingSpinner";

const PAGE_SIZE = 10;

function shortAddr(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-6)}`; }

function fmtAge(days: number): string {
  if (!days || days <= 0) return "—";
  if (days < 30) return `${days}d`;
  const m = Math.floor(days / 30);
  if (m < 12) return `${m}mo`;
  const y = Math.floor(m / 12);
  const rem = m % 12;
  return rem > 0 ? `${y}y ${rem}mo` : `${y}y`;
}

function fmtTxs(n: number): string {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

function fmtVol(n: number): string {
  if (!n) return "$0";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;
}

function rankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}`;
}

async function fetchLeaderboard(limit = 500) {
  const { data, error } = await supabase
    .from("wallet_scores")
    .select("address, wallet_score, total_txs, wallet_age_days, base_volume_usd")
    .order("wallet_score", { ascending: false })
    .limit(limit);
  if (error) console.error("[leaderboard] fetch error:", error.message, error.details);
  else console.log("[leaderboard] fetched rows:", data?.length ?? 0);
  return data ?? [];
}

interface Props {
  currentAddress?: string;
  refreshKey?:     number;
  search?:         string;
  tierFilter?:     string;
}

export function WalletScoreLeaderboard({
  currentAddress,
  refreshKey,
  search:     searchProp    = "",
  tierFilter: tierFilterProp = "All tiers",
}: Props) {
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [searchProp, tierFilterProp]);

  const { data: allEntries = [], isLoading } = useQuery({
    queryKey:  ["arc-wallet-leaderboard", refreshKey],
    queryFn:   () => fetchLeaderboard(500),
    staleTime: 2 * 60 * 1000,
    gcTime:    5 * 60 * 1000,
  });

  const entries = allEntries.filter(e => {
    const matchAddr = !searchProp.trim() || e.address.toLowerCase().includes(searchProp.trim().toLowerCase());
    return matchAddr;
  });

  const totalPages  = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const pageEntries = entries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goPage(p: number) { setPage(Math.max(1, Math.min(p, totalPages))); }

  function pageNumbers(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (safePage > 3) pages.push("…");
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) pages.push(p);
    if (safePage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 480 }}>
          {/* Header */}
          <div className="grid grid-cols-[32px_1fr_64px_56px_88px_64px] gap-2 px-5 py-2.5 border-b"
            style={{ borderColor: "var(--border)" }}>
            {["#", "ADDRESS", "SCORE", "TXS", "VOLUME", "AGE"].map(h => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-secondary)" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {isLoading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <Skeleton className="h-6 w-full" />
              </div>
            ))
          ) : entries.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              No data yet — analyze a wallet to appear here.
            </p>
          ) : (
            pageEntries.map((entry, i) => {
              const rank  = (safePage - 1) * PAGE_SIZE + i + 1;
              const isSelf = currentAddress?.toLowerCase() === entry.address.toLowerCase();
              return (
                <div key={entry.address}
                  className="grid grid-cols-[32px_1fr_64px_56px_88px_64px] gap-2 px-5 py-3 border-b items-center transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    background:  isSelf ? "var(--bg-input)" : undefined,
                  }}
                  onMouseEnter={e => { if (!isSelf) e.currentTarget.style.background = "var(--bg-input)"; }}
                  onMouseLeave={e => { if (!isSelf) e.currentTarget.style.background = ""; }}
                >
                  <span className="text-sm font-bold text-center" style={{ color: "var(--text-secondary)" }}>
                    {rankEmoji(rank)}
                  </span>
                  <span className="font-mono text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                    {shortAddr(entry.address)}
                  </span>
                  <span className="text-sm font-black" style={{ color: "#C9693A" }}>
                    {(entry.wallet_score ?? 0).toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {fmtTxs(entry.total_txs ?? 0)}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {fmtVol(entry.base_volume_usd ?? 0)}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {fmtAge(entry.wallet_age_days)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-5 py-3 border-t flex-wrap"
          style={{ borderColor: "var(--border)" }}>
          <button onClick={() => goPage(safePage - 1)} disabled={safePage === 1}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
            style={{ borderColor: "var(--border)", background: "var(--bg-input)", color: "var(--text-secondary)" }}>
            ← Prev
          </button>
          {pageNumbers().map((p, idx) =>
            p === "…" ? (
              <span key={`e-${idx}`} className="px-1 text-sm" style={{ color: "var(--text-secondary)" }}>…</span>
            ) : (
              <button key={p} onClick={() => goPage(p as number)}
                className="rounded-lg border px-3 py-1.5 text-xs font-bold transition-all"
                style={p === safePage
                  ? { background: "#C9693A", borderColor: "#C9693A", color: "#fff" }
                  : { borderColor: "var(--border)", background: "var(--bg-input)", color: "var(--text-secondary)" }
                }>
                {p}
              </button>
            )
          )}
          <button onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
            style={{ borderColor: "var(--border)", background: "var(--bg-input)", color: "var(--text-secondary)" }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
