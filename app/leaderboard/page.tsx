"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { supabase } from "@/lib/supabase";

interface LeaderboardEntry {
  address:   string;
  swap_count: number;
  volume_usd: number;
}

function shortAddr(a: string) { return `${a.slice(0, 6)}...${a.slice(-4)}`; }

function fmtVol(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtScore(swaps: number, vol: number): number {
  return swaps * 100;
}

function fmtScoreStr(score: number): string {
  if (score >= 1_000) return `${(score / 1_000).toFixed(1)}K`;
  return String(score);
}

function getTier(swaps: number): { label: string; color: string; emoji: string } {
  if (swaps >= 50) return { label: "Gold Trader",   color: "#C9693A", emoji: "🥇" };
  if (swaps >= 10) return { label: "Silver Trader", color: "#8B8B8B", emoji: "🥈" };
  if (swaps >= 3)  return { label: "Bronze Trader", color: "#A0522D", emoji: "🥉" };
  return { label: "Unranked Trader", color: "var(--text-secondary)", emoji: "" };
}

function TierAvatar({ swaps, size = 32 }: { swaps: number; size?: number }) {
  const tier = getTier(swaps);
  return (
    <div className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: "var(--bg-input)", border: `2px solid var(--border)`, fontSize: size * 0.5 }}>
      {tier.emoji || "👤"}
    </div>
  );
}

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [data,    setData]    = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    async function fetchAll() {
      let all: LeaderboardEntry[] = [];
      let from = 0;
      const batch = 1000;
      while (true) {
        const { data: rows } = await supabase
          .from("user_scores")
          .select("address, swap_count, volume_usd")
          .order("swap_count", { ascending: false })
          .range(from, from + batch - 1);
        if (!rows || rows.length === 0) break;
        all = [...all, ...rows];
        if (rows.length < batch) break;
        from += batch;
      }
      setData(all);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const totalVolume  = data.reduce((s, r) => s + (r.volume_usd ?? 0), 0);
  const totalSwaps   = data.reduce((s, r) => s + (r.swap_count ?? 0), 0);
  const totalTraders = data.length;

  const totalPages  = Math.ceil(totalTraders / PAGE_SIZE);
  const pagedData   = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const myEntry  = address ? data.find(r => r.address.toLowerCase() === address.toLowerCase()) : null;
  const myRank   = address ? data.findIndex(r => r.address.toLowerCase() === address.toLowerCase()) + 1 : 0;
  const myScore  = myEntry ? fmtScore(myEntry.swap_count, myEntry.volume_usd) : 0;
  const myTier   = myEntry ? getTier(myEntry.swap_count) : getTier(0);

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-56px)] flex-col items-center px-4 py-6 pb-24 md:pb-6">
        <div className="w-full max-w-2xl">

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "ARC TOTAL VOLUME", value: fmtVol(totalVolume) },
              { label: "ARC TOTAL SWAP",   value: String(totalSwaps)  },
              { label: "ARC TOTAL TRADERS",value: String(totalTraders)},
            ].map(card => (
              <div key={card.label} className="rounded-2xl border p-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
                <p className="text-[9px] font-bold tracking-widest uppercase mb-2"
                  style={{ color: "var(--text-secondary)" }}>{card.label}</p>
                <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* ── My rank card ── */}
          {address && (
            <div className="rounded-2xl border mb-4 overflow-hidden"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="grid px-4 py-2 border-b text-[9px] font-bold tracking-widest uppercase"
                style={{ gridTemplateColumns: "1fr 80px 100px 80px", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                <span>YOUR WALLET RANK</span>
                <span className="text-center">SCORE</span>
                <span className="text-center">VOLUME</span>
                <span className="text-center">SWAPS</span>
              </div>
              <div className="grid items-center px-4 py-3"
                style={{ gridTemplateColumns: "1fr 80px 100px 80px" }}>
                <span className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                  {myRank > 0 ? `#${myRank}` : "—"}
                </span>
                <span className="text-center font-black text-base" style={{ color: "#C9693A" }}>
                  {myRank > 0 ? fmtScoreStr(myScore) : "—"}
                </span>
                <span className="text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {myEntry ? fmtVol(myEntry.volume_usd) : "—"}
                </span>
                <span className="text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {myEntry ? myEntry.swap_count : "—"}
                </span>
              </div>
            </div>
          )}

          {/* ── Trader table ── */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>

            {/* Header */}
            <div className="grid px-4 py-2.5 border-b text-[9px] font-bold tracking-widest uppercase"
              style={{ gridTemplateColumns: "32px 1fr 80px 100px 80px", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <span>#</span>
              <span>TRADER</span>
              <span className="text-center">SCORE</span>
              <span className="text-center">VOLUME</span>
              <span className="text-center">SWAPS</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><LoadingSpinner size={24} /></div>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: "var(--text-secondary)" }}>
                <div className="text-4xl mb-2">🏆</div>
                No data yet. Be the first to swap!
              </div>
            ) : (
              pagedData.map((row, i) => {
                const globalRank = (page - 1) * PAGE_SIZE + i + 1;
                const score  = fmtScore(row.swap_count, row.volume_usd);
                const tier   = getTier(row.swap_count);
                const isSelf = address?.toLowerCase() === row.address.toLowerCase();
                return (
                  <div key={row.address}
                    className="grid items-center px-4 py-3 border-b transition-all"
                    style={{
                      gridTemplateColumns: "32px 1fr 80px 100px 80px",
                      borderColor: "var(--border)",
                      background: isSelf ? "var(--bg-input)" : undefined,
                    }}
                    onMouseEnter={e => { if (!isSelf) e.currentTarget.style.background = "var(--bg-input)"; }}
                    onMouseLeave={e => { if (!isSelf) e.currentTarget.style.background = ""; }}>

                    {/* Rank */}
                    <span className="text-sm font-bold text-center" style={{ color: "var(--text-secondary)" }}>
                      {globalRank}
                    </span>

                    {/* Trader */}
                    <div className="flex items-center gap-2">
                      <TierAvatar swaps={row.swap_count} size={30} />
                      <div>
                        <p className="text-sm font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                          {shortAddr(row.address)}
                        </p>
                        <p className="text-[10px] font-semibold" style={{ color: tier.color }}>
                          {tier.label}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <span className="text-center font-black text-sm" style={{ color: "#C9693A" }}>
                      {fmtScoreStr(score)}
                    </span>

                    {/* Volume */}
                    <span className="text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {fmtVol(row.volume_usd)}
                    </span>

                    {/* Swaps */}
                    <span className="text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {row.swap_count}
                    </span>
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalTraders)} / {totalTraders}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-2 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                    style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                  >«</button>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                    style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                  >‹</button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 5) p = i + 1;
                    else if (page <= 3) p = i + 1;
                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                    else p = page - 2 + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className="w-7 h-7 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: page === p ? "#C9693A" : "var(--bg-input)",
                          color:      page === p ? "#fff"    : "var(--text-secondary)",
                        }}
                      >{p}</button>
                    );
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                    style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                  >›</button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-2 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                    style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                  >»</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
      <MobileNav />
    </>
  );
}
