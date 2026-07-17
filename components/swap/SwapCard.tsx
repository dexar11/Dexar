"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useSwitchChain, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AppKit } from "@circle-fin/app-kit";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SlippageSettings } from "./SlippageSettings";
import { TokenSelector } from "./TokenSelector";
import type { TokenInfo } from "./TokenSelector";
import { arcTestnet, TOKEN_ADDRESSES, SWAP_TOKENS } from "@/lib/arc-kit";
import { getAdapter } from "@/lib/adapter";
import { patchCircleFetch } from "@/lib/patch-circle-fetch";
import { upsertSwapRecord, upsertUserScore, supabase } from "@/lib/supabase";

const PCT_BUTTONS = [
  { label: "25%", pct: 0.25 },
  { label: "50%", pct: 0.50 },
  { label: "75%", pct: 0.75 },
  { label: "MAX", pct: 1.00 },
];

interface EstimateResult {
  estimatedOutput: { amount: string; token: string };
  stopLimit:       { amount: string; token: string };
  fees:            { type: string; amount: string; token: string }[];
}

export function SwapCard() {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const [tokenIn,  setTokenIn]  = useState<TokenInfo>(SWAP_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<TokenInfo>(SWAP_TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [status,   setStatus]   = useState<"idle"|"estimating"|"swapping"|"success"|"error">("idle");
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [errMsg,   setErrMsg]   = useState("");

  const tokenInAddress  = tokenIn.symbol  === "USDC" ? undefined : TOKEN_ADDRESSES[tokenIn.symbol];
  const tokenOutAddress = tokenOut.symbol === "USDC" ? undefined : TOKEN_ADDRESSES[tokenOut.symbol];

  const { data: balanceData,    refetch: refetchBalIn  } = useBalance({
    address,
    chainId: arcTestnet.id,
    ...(tokenInAddress  ? { token: tokenInAddress  } : {}),
  });
  const { data: balanceOutData, refetch: refetchBalOut } = useBalance({
    address,
    chainId: arcTestnet.id,
    ...(tokenOutAddress ? { token: tokenOutAddress } : {}),
  });

  // ERC-20 balances via direct RPC (wagmi useBalance unreliable on Arc Testnet)
  const [ercBalances, setErcBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!address) return;
    const tokens = [
      { symbol: "EURC",   addr: TOKEN_ADDRESSES["EURC"],   dec: 6 },
      { symbol: "cirBTC", addr: TOKEN_ADDRESSES["cirBTC"], dec: 8 },
    ];
    const selector = "0x70a08231"; // balanceOf(address)
    const padded   = address.slice(2).toLowerCase().padStart(64, "0");

    Promise.all(
      tokens.map(t =>
        fetch("https://rpc.testnet.arc.network", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: 1, jsonrpc: "2.0", method: "eth_call",
            params: [{ to: t.addr, data: selector + padded }, "latest"],
          }),
        })
          .then(r => r.json())
          .then(j => ({ symbol: t.symbol, val: Number(BigInt(j.result ?? "0x0")) / Math.pow(10, t.dec) }))
          .catch(() => ({ symbol: t.symbol, val: 0 }))
      )
    ).then(results => {
      const map: Record<string, number> = {};
      results.forEach(r => { map[r.symbol] = r.val; });
      setErcBalances(map);
    });
  }, [address]);

  // Patch window.fetch to proxy Circle API calls (CORS fix)
  useEffect(() => { patchCircleFetch(); }, []);

  // Auto-quote: miktar değişince 800ms debounce ile otomatik estimate al
  useEffect(() => {
    if (!address || !amountIn || parseFloat(amountIn) <= 0) {
      setEstimate(null);
      return;
    }
    const timer = setTimeout(() => {
      handleEstimate();
    }, 400);
    return () => clearTimeout(timer);
  }, [amountIn, tokenIn.symbol, tokenOut.symbol, address]); // eslint-disable-line react-hooks/exhaustive-deps

  // USDC → wagmi native balance, EURC/cirBTC → direct RPC
  const balanceFloat    = tokenIn.symbol  === "USDC"
    ? (balanceData    ? Number(balanceData.value)    / Math.pow(10, balanceData.decimals)    : 0)
    : (ercBalances[tokenIn.symbol]  ?? 0);
  const balanceOutFloat = tokenOut.symbol === "USDC"
    ? (balanceOutData ? Number(balanceOutData.value) / Math.pow(10, balanceOutData.decimals) : 0)
    : (ercBalances[tokenOut.symbol] ?? 0);

  // cirBTC gibi küçük değerli tokenlar için yeterli ondalık göster
  function fmtBalance(val: number, decimals: number): string {
    if (val <= 0) return "0";
    // Tokena özgü decimal sayısını kullan, max 8
    const d = Math.min(decimals, 8);
    const str = val.toFixed(d).replace(/\.?0+$/, "");
    return str || "0";
  }

  const balanceStr    = fmtBalance(balanceFloat,    balanceData?.decimals    ?? 6);
  const balanceOutStr = fmtBalance(balanceOutFloat, balanceOutData?.decimals ?? 6);

  const isWrongChain = !!address && chainId !== arcTestnet.id;
  const isPending    = status === "swapping" || status === "estimating";

  function swapTokens() {
    setTokenIn(tokenOut); setTokenOut(tokenIn);
    setAmountIn(""); setEstimate(null); setErrMsg("");
  }

  function setPct(pct: number) {
    if (balanceFloat <= 0) return;
    const val = pct === 1.0 ? balanceStr : (balanceFloat * pct).toFixed(6).replace(/\.?0+$/, "");
    setAmountIn(val); setEstimate(null);
  }

  // ── Step 1: Get quote from server (CORS-safe) ──────────────────────────
  const handleEstimate = useCallback(async () => {
    if (!address || !amountIn || parseFloat(amountIn) <= 0) return;
    setStatus("estimating"); setEstimate(null); setErrMsg("");
    try {
      const res = await fetch("/api/swap-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenIn:     tokenIn.symbol,
          tokenOut:    tokenOut.symbol,
          amountIn,
          userAddress: address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get quote");
      setEstimate(data);
      setStatus("idle");
    } catch (err) {
      console.error("[estimate]", err);
      const msg = err instanceof Error ? err.message : "Failed to get quote";
      setErrMsg(msg);
      toast.error(msg);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [address, amountIn, tokenIn, tokenOut]);

  // ── Step 2: Execute swap from browser (user signs) ─────────────────────
  const handleSwap = useCallback(async () => {
    if (!address || !amountIn || parseFloat(amountIn) <= 0 || !estimate) return;
    setStatus("swapping"); setErrMsg("");
    try {
      const kitKey = process.env.NEXT_PUBLIC_KIT_KEY;
      if (!kitKey) throw new Error("KIT_KEY not configured");

      const adapter = await getAdapter();
      const kit = new AppKit();

      const result = await kit.swap({
        from: { adapter, chain: "Arc_Testnet" },
        tokenIn:  tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn,
        config: {
          kitKey,
        },
      });

      toast.success(`✓ Swapped ${amountIn} ${tokenIn.symbol} → ${result.amountOut} ${tokenOut.symbol}`);

      // Supabase'e kaydet
      upsertSwapRecord({
        user_address: address,
        token_in:     tokenIn.symbol,
        token_out:    tokenOut.symbol,
        amount_in:    amountIn,
        amount_out:   result.amountOut ?? "0",
        tx_hash:      result.txHash   ?? "",
        chain:        "Arc_Testnet",
      });

      // User score güncelle — mevcut score'u çekip artır
      supabase
        .from("user_scores")
        .select("swap_count, volume_usd")
        .eq("address", address.toLowerCase())
        .single()
        .then(({ data }) => {
          upsertUserScore({
            address:    address.toLowerCase(),
            swap_count: (data?.swap_count ?? 0) + 1,
            volume_usd: (data?.volume_usd ?? 0) + parseFloat(amountIn),
          });
        });

      setAmountIn(""); setEstimate(null);
      setStatus("success");
      // Refetch balances after swap
      setTimeout(() => {
        refetchBalIn();
        refetchBalOut();
        setStatus("idle");
      }, 2000);
    } catch (err) {
      console.error("[swap]", err);
      const msg = err instanceof Error ? err.message : "Swap failed";
      // User rejected = not an error to show loudly
      if (msg.toLowerCase().includes("user rejected") || msg.includes("4001")) {
        toast.info("Swap cancelled");
      } else {
        setErrMsg(msg);
        toast.error(msg);
      }
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [address, amountIn, tokenIn, tokenOut, estimate, slippage]);

  const btnLabel =
    !address       ? null
    : isWrongChain ? "Switch to Arc Testnet"
    : isPending    ? (status === "estimating" ? "Getting quote..." : "Swapping...")
    : !amountIn || parseFloat(amountIn) <= 0 ? "Enter amount"
    : "Swap";

  const isActive = !isPending && !!amountIn && parseFloat(amountIn) > 0;

  return (
    <div className="rounded-2xl border p-3 shadow-2xl w-full"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>

      {/* Slippage */}
      <div className="flex justify-end mb-3">
        <SlippageSettings value={slippage} onChange={setSlippage} />
      </div>

      {/* You pay */}
      <div className="rounded-xl border p-2.5 mb-1" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>You pay</span>
          {address && (
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Balance: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{balanceStr}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="number" placeholder="0.0" value={amountIn}
            onChange={e => { setAmountIn(e.target.value.replace(",", ".")); setEstimate(null); setErrMsg(""); }}
            className="flex-1 bg-transparent text-xl font-bold outline-none min-w-0 w-0"
            style={{ color: "var(--text-primary)" }}
          />
          <TokenSelector selected={tokenIn}
            onSelect={t => { setTokenIn(t); setAmountIn(""); setEstimate(null); }}
            exclude={tokenOut.symbol} label="pay token" />
        </div>
        {address && (
          <div className="flex gap-1">
            {PCT_BUTTONS.map(({ label, pct }) => (
              <button key={label} onClick={() => setPct(pct)}
                className="flex-1 rounded-full border py-0.5 text-[11px] font-semibold transition-all"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9693A"; e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div className="flex justify-center my-1.5">
        <button onClick={swapTokens}
          className="flex h-10 w-10 items-center justify-center rounded-full border transition-all"
          style={{ background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9693A"; e.currentTarget.style.color = "#C9693A"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
        </button>
      </div>

      {/* You receive */}
      <div className="rounded-xl border p-2.5 mb-2.5" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>You receive</span>
          {address && (
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Balance: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{balanceOutStr}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 text-xl font-bold min-w-0 w-0 truncate" style={{ color: "var(--text-primary)" }}>
            {status === "estimating"
              ? <LoadingSpinner size={18} />
              : estimate?.estimatedOutput?.amount ?? "0.0"}
          </div>
          <TokenSelector selected={tokenOut}
            onSelect={t => { setTokenOut(t); setEstimate(null); }}
            exclude={tokenIn.symbol} label="receive token" />
        </div>
      </div>

      {/* Error */}
      {errMsg && (
        <p className="mb-2 text-[11px] rounded-lg px-2 py-1.5" style={{ color: "#C9522A", background: "#C9522A15" }}>
          ⚠ {errMsg}
        </p>
      )}

      {/* Quote info */}
      {estimate && amountIn && parseFloat(amountIn) > 0 && (
        <div className="mb-2 rounded-xl border px-2.5 py-2 text-[11px] space-y-1"
          style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Rate</span>
            <span style={{ color: "var(--text-primary)" }}>
              1 {tokenIn.symbol} ≈ {(parseFloat(estimate.estimatedOutput.amount) / parseFloat(amountIn)).toFixed(4)} {tokenOut.symbol}
            </span>
          </div>
          {estimate.fees?.map(f => (
            <div key={f.type} className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>{f.type} fee</span>
              <span style={{ color: "var(--text-primary)" }}>{parseFloat(f.amount).toFixed(4)} {f.token}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Min received</span>
            <span style={{ color: "var(--text-primary)" }}>{estimate.stopLimit.amount} {tokenOut.symbol}</span>
          </div>
        </div>
      )}

      {/* Action */}
      {!address ? (
        <ConnectButton.Custom>{({ openConnectModal }) => (
          <button onClick={openConnectModal}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ background: "var(--accent-orange)" }}>
            Connect Wallet
          </button>
        )}</ConnectButton.Custom>
      ) : isWrongChain ? (
        <button onClick={() => switchChain({ chainId: arcTestnet.id })}
          className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-110"
          style={{ background: "var(--accent-red)" }}>
          Switch to Arc Testnet
        </button>
      ) : (
        <button
          onClick={estimate ? handleSwap : handleEstimate}
          disabled={isPending || !amountIn || parseFloat(amountIn) <= 0}
          className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:cursor-not-allowed enabled:hover:brightness-110"
          style={{
            background: isActive ? "linear-gradient(90deg,#C9693A,#B55A2E)" : "var(--bg-input)",
            color:      isActive ? "#fff" : "var(--text-secondary)",
          }}>
          {isPending
            ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size={16} color="white" />{btnLabel}</span>
            : btnLabel}
        </button>
      )}
    </div>
  );
}
