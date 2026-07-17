"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, useSwitchChain, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AppKit } from "@circle-fin/app-kit";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BRIDGE_CHAINS, arcTestnet } from "@/lib/arc-kit";
import type { BridgeChainId } from "@/lib/arc-kit";
import { getAdapter } from "@/lib/adapter";
import { patchCircleFetch } from "@/lib/patch-circle-fetch";
import { addScore } from "@/lib/supabase";

/* ── Custom chain selector ── */
function ChainSelector({
  value, onChange, exclude,
}: {
  value: BridgeChainId;
  onChange: (v: BridgeChainId) => void;
  exclude: BridgeChainId;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = BRIDGE_CHAINS.filter(c => c.id !== exclude);
  const selected = BRIDGE_CHAINS.find(c => c.id === value)!;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold border transition-all"
        style={{ background: "var(--bg-card)", borderColor: open ? "#C9693A" : "var(--border)", color: "var(--text-primary)", minWidth: 140 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={selected.logoUrl} alt={selected.name} width={16} height={16} className="rounded-full shrink-0"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span className="flex-1 text-left truncate">{selected.name}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 rounded-xl border shadow-lg z-50 overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)", minWidth: 160 }}>
          {options.map(c => (
            <button key={c.id} onClick={() => { onChange(c.id as BridgeChainId); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all text-left"
              style={{
                background: c.id === value ? "var(--bg-input)" : undefined,
                color: "var(--text-primary)",
              }}
              onMouseEnter={e => { if (c.id !== value) e.currentTarget.style.background = "var(--bg-input)"; }}
              onMouseLeave={e => { if (c.id !== value) e.currentTarget.style.background = ""; }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.logoUrl} alt={c.name} width={18} height={18} className="rounded-full shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span>{c.name}</span>
              {c.id === value && (
                <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9693A" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BridgeCard() {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const [fromChain, setFromChain] = useState<BridgeChainId>("Arc_Testnet");
  const [toChain,   setToChain]   = useState<BridgeChainId>("Ethereum_Sepolia");
  const [amount,    setAmount]    = useState("");
  const [status,    setStatus]    = useState<"idle" | "bridging" | "success" | "error">("idle");
  const [bridgeStep, setBridgeStep] = useState<string>("");

  const isWrongChain = !!address && chainId !== arcTestnet.id;
  const isPending    = status === "bridging";

  // Patch window.fetch for Circle API CORS fix
  useEffect(() => { patchCircleFetch(); }, []);

  // FROM balance — Arc Testnet USDC native balance (USDC = native gas token on Arc)
  const { data: fromBalance, refetch: refetchFrom } = useBalance({
    address,
    chainId: arcTestnet.id,
  });
  const fromBalFloat = fromBalance ? Number(fromBalance.value) / Math.pow(10, fromBalance.decimals) : 0;
  const fromBalStr   = fromBalFloat > 0 ? fromBalFloat.toFixed(4) : "0";

  // TO balance — only meaningful when destination is Arc Testnet
  const toBalStr = toChain === "Arc_Testnet" ? fromBalStr : "—";

  function swapChains() {
    const tmp = fromChain;
    setFromChain(toChain);
    setToChain(tmp);
    setAmount("");
  }

  const handleBridge = useCallback(async () => {
    if (!address || !amount || parseFloat(amount) <= 0) return;
    setStatus("bridging");
    try {
      const adapter = await getAdapter();
      const kit = new AppKit();

      // lifecycle events → adım adım kullanıcıya göster
      kit.on("*", (payload) => {
        console.log("[bridge event]", payload);
        const p = payload as { values?: { name?: string; state?: string } };
        const name  = p?.values?.name;
        const state = p?.values?.state;
        if (state === "pending" || state === "started") {
          if (name === "approve")          setBridgeStep("1/4 Approving USDC...");
          else if (name === "burn")        setBridgeStep("2/4 Burning on Arc Testnet...");
          else if (name === "fetchAttestation") setBridgeStep("3/4 Waiting for Circle attestation (2-5 min)...");
          else if (name === "mint")        setBridgeStep("4/4 Minting on destination...");
        }
        if (name === "burn" && state === "success") {
          toast.info("✓ Burned — waiting for Circle attestation...");
          setBridgeStep("3/4 Waiting for Circle attestation (2-5 min)...");
        }
        if (name === "mint" && state === "success") {
          toast.success(`✓ Minted on ${toChain}! Bridge complete.`);
          setBridgeStep("");
          refetchFrom();
        }
      });

      // useForwarder: true → Circle Forwarding Service hedef zincirde mint'i kendisi yapar.
      // Cüzdanın Sepolia/hedef zincire switch etmesine gerek kalmaz.
      // Dokümantasyon: https://docs.arc.io/app-kit/tutorials/bridge/use-forwarding-service
      let result = await kit.bridge({
        from: { adapter, chain: fromChain },
        to:   { adapter, chain: toChain, useForwarder: true },
        amount,
      });

      if (result.state === "error") {
        toast.error("Bridge failed. Please try again.");
        setStatus("error");
        setBridgeStep("");
        setTimeout(() => setStatus("idle"), 2000);
        return;
      }

      if (result.state === "success") {
        toast.success(`Bridge complete: ${amount} USDC → ${toChain}`);
        // Bridge task: +200 puan
        addScore(address, 200);
        refetchFrom();
      } else {
        // CCTP can take time — burn happened, mint pending
        toast.info(`Bridge submitted. Mint on ${toChain} may take 1-5 minutes.`);
      }

      setAmount("");
      setBridgeStep("");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("[bridge]", err);
      const msg = err instanceof Error ? err.message : "Bridge failed";
      if (!msg.toLowerCase().includes("user rejected")) toast.error(msg);
      else toast.info("Bridge cancelled");
      setStatus("error");
      setBridgeStep("");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [address, amount, fromChain, toChain, refetchFrom]);

  const canBridge = !!address && !isWrongChain && !isPending && !!amount && parseFloat(amount) > 0 && fromChain !== toChain;

  const btnLabel =
    !address       ? null
    : isWrongChain ? "Switch to Arc Testnet"
    : isPending    ? "Bridging..."
    : !amount      ? "Enter amount"
    : fromChain === toChain ? "Select different chains"
    : "Bridge USDC";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Title removed */}

      <div className="rounded-2xl border p-6 shadow-2xl" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex justify-end mb-4">
          <span className="text-xs px-2 py-1 rounded-full border" style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
            Powered by Circle CCTP V2
          </span>
        </div>

        {/* FROM */}
        <div className="rounded-xl border p-4 mb-1" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>FROM</span>
            {address && (
              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                USDC Balance: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{fromBalStr}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-xl font-bold outline-none min-w-0 w-0"
              style={{ color: "var(--text-primary)" }}
            />
            <ChainSelector value={fromChain} onChange={setFromChain} exclude={toChain} />
          </div>
          {/* 25/50/75/MAX buttons */}
          {address && (
            <div className="flex gap-1">
              {[{ label: "25%", pct: 0.25 }, { label: "50%", pct: 0.50 }, { label: "75%", pct: 0.75 }, { label: "MAX", pct: 1.00 }].map(({ label, pct }) => (
                <button
                  key={label}
                  onClick={() => {
                    if (fromBalFloat <= 0) return;
                    const val = pct === 1.0 ? fromBalStr : (fromBalFloat * pct).toFixed(4).replace(/\.?0+$/, "");
                    setAmount(val);
                  }}
                  className="flex-1 rounded-full border py-0.5 text-[11px] font-semibold transition-all"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9693A"; e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex justify-center my-4">
          <button
            onClick={swapChains}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-all hover:border-accent-orange"
            style={{ background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            ⇅
          </button>
        </div>

        {/* TO */}
        <div className="rounded-xl border p-4 mb-5" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>TO</span>
            {address && (
              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                USDC Balance: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{toBalStr}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-xl font-bold min-w-0 w-0 truncate" style={{ color: "var(--text-secondary)" }}>
              {amount ? amount : "0.00"}
            </div>
            <ChainSelector value={toChain} onChange={setToChain} exclude={fromChain} />
          </div>
        </div>

        {/* Info removed */}

        {/* Action */}
        {!address ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: "var(--accent-orange)" }}
              >
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        ) : isWrongChain ? (
          <button
            onClick={() => switchChain({ chainId: arcTestnet.id })}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ background: "var(--accent-red)" }}
          >
            Switch to Arc Testnet
          </button>
        ) : (
          <button
            onClick={handleBridge}
            disabled={!canBridge}
            className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:cursor-not-allowed enabled:hover:brightness-110"
            style={{
              background: canBridge ? "linear-gradient(90deg,#C9693A,#B55A2E)" : "var(--bg-input)",
              color:      canBridge ? "#fff" : "var(--text-secondary)",
            }}
          >
            {isPending
              ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size={16} color="white" /> {bridgeStep || "Bridging..."}</span>
              : `⇌ ${btnLabel ?? "Bridge USDC"}`}
          </button>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {[
          { icon: "🔒", title: "Secure", desc: "Native burn & mint. No wrapped tokens." },
          { icon: "🌐", title: "5 Chains", desc: "Testnet chains supported via CCTP." },
        ].map(item => (
          <div key={item.title} className="rounded-xl border p-3" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <div className="text-lg mb-1">{item.icon}</div>
            <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>{item.title}</div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
