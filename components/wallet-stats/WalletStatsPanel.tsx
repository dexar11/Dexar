"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount }                  from "wagmi";
import { useQuery }                    from "@tanstack/react-query";
import { useWalletStats }              from "@/hooks/useWalletStats";
import { StatCard }                    from "./StatCard";
import { WalletScore }                 from "./WalletScore";
import { WalletScoreLeaderboard }      from "./WalletScoreLeaderboard";
import { Skeleton }                    from "@/components/ui/LoadingSpinner";

export function WalletStatsPanel() {
  const { address: connectedAddress } = useAccount();
  const [analyzed,   setAnalyzed]   = useState<string | undefined>(undefined);
  const [inputAddr,  setInputAddr]  = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [lbSearch,   setLbSearch]   = useState("");

  // Auto-fill when wallet connects
  useEffect(() => {
    if (connectedAddress) {
      setAnalyzed(connectedAddress.toLowerCase());
      setInputAddr(connectedAddress.toLowerCase());
    }
  }, [connectedAddress]);

  const { data, isLoading } = useWalletStats(analyzed);

  // Leaderboard — always visible
  const { data: lbEntries = [] } = useQuery({
    queryKey:  ["arc-wallet-leaderboard", refreshKey],
    queryFn:   async () => {
      const { data: rows } = await import("@/lib/supabase").then(m =>
        m.supabase.from("wallet_scores")
          .select("address, wallet_score, total_txs, wallet_age_days, base_volume_usd")
          .order("wallet_score", { ascending: false })
          .limit(500)
      );
      return rows ?? [];
    },
    staleTime: 0,
    gcTime:    5 * 60 * 1000,
  });

  const userRank = analyzed
    ? lbEntries.findIndex(e => e.address.toLowerCase() === analyzed.toLowerCase()) + 1
    : 0;

  // Refresh leaderboard when new data arrives
  const prevScoreRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (data?.address && data.walletScore !== prevScoreRef.current) {
      prevScoreRef.current = data.walletScore;
      setTimeout(() => setRefreshKey(k => k + 1), 2000);
    }
  }, [data?.address, data?.walletScore]);

  function handleAnalyze() {
    if (!inputAddr || !/^0x[a-fA-F0-9]{40}$/.test(inputAddr)) return;
    setAnalyzed(inputAddr.toLowerCase());
  }

  const loading = isLoading;

  // Wallet age display
  function walletAgeStr(): string {
    if (!data?.firstTxRaw) return "—";
    const days = Math.floor((Date.now() - new Date(data.firstTxRaw).getTime()) / 86400000);
    if (isNaN(days) || days < 0) return "—";
    if (days < 30)  return `${days} days`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const rem   = months % 12;
    return rem > 0 ? `${years}y ${rem}mo` : `${years} years`;
  }

  return (
    <div className="flex flex-col gap-4">

      {analyzed && (
        <>
          {/* ── Top summary card ── */}
          <div className="rounded-2xl border px-5 py-4"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">

              {/* Address */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-secondary)" }}>Address</span>
                <a
                  href={`https://testnet.arcscan.app/address/${analyzed}`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-sm font-bold truncate hover:underline"
                  style={{ color: "#C9693A" }}
                >
                  {analyzed}
                </a>
              </div>

              <div className="hidden sm:block w-px h-8" style={{ background: "var(--border)" }} />

              {/* Wallet Age */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-secondary)" }}>Wallet Age</span>
                {loading ? <Skeleton className="h-5 w-20 mt-0.5" /> : (
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {walletAgeStr()}
                  </span>
                )}
              </div>

              <div className="hidden sm:block w-px h-8" style={{ background: "var(--border)" }} />

              {/* USDC Balance */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-secondary)" }}>USDC Balance</span>
                {loading ? <Skeleton className="h-5 w-20 mt-0.5" /> : (
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {data?.usdcBalance ?? "—"} USDC
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* ── Wallet Score card ── */}
          <WalletScore data={data} isLoading={loading} />

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total txs"    value={data?.totalTxs ?? 0}        isLoading={loading} />
            <StatCard
              label="Arc Volume"
              value={data ? `$${(data.arcVolume ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—"}
              isLoading={loading}
            />
            <StatCard label="Gas fees"     value={data ? `${data.gasFees} USDC` : "—"} isLoading={loading} />
            <StatCard label="Last tx"      value={data?.lastTx          ?? "—"} isLoading={loading} />
            <StatCard label="Active days"  value={data?.activeDays      ?? 0}   isLoading={loading} />
            <StatCard label="Arc age"      value={data?.routisAge       ?? "—"} isLoading={loading} />

            {/* Wallet rank — full width */}
            <div className="col-span-2 sm:col-span-3 rounded-xl border px-4 py-3 flex items-center justify-between gap-4"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
              <span className="text-[11px] font-bold uppercase tracking-[0.04em]"
                style={{ color: "var(--text-secondary)" }}>Your wallet rank</span>
              <span className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                {userRank > 0 ? `#${userRank}` : "—"}
              </span>
            </div>
          </div>
        </>
      )}

      {/* ── Leaderboard ── always visible */}
      <WalletScoreLeaderboard
        currentAddress={analyzed}
        refreshKey={refreshKey}
        search={lbSearch}
      />
    </div>
  );
}
