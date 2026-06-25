"use client";

import { useState, useCallback } from "react";
import { useAccount, useSwitchChain, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AppKit } from "@circle-fin/app-kit";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ARC_TOKENS, arcTestnet } from "@/lib/arc-kit";
import { getAdapter } from "@/lib/adapter";
import { addScore } from "@/lib/supabase";

const SEND_TOKENS = ARC_TOKENS;

export function SendCard() {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const [token, setToken] = useState<string>(SEND_TOKENS[0].symbol);
  const [amount,    setAmount]    = useState("");
  const [recipient, setRecipient] = useState("");
  const [status,    setStatus]    = useState<"idle" | "sending" | "success" | "error">("idle");

  const isWrongChain = !!address && chainId !== arcTestnet.id;
  const isPending    = status === "sending";

  // Balance
  const { data: balData } = useBalance({ address, chainId: arcTestnet.id });
  const balFloat = balData ? Number(balData.value) / Math.pow(10, balData.decimals) : 0;
  const balStr   = balFloat > 0 ? balFloat.toFixed(4) : "0";

  const isValidAddress = recipient.startsWith("0x") && recipient.length === 42;

  const handleSend = useCallback(async () => {
    if (!address || !amount || parseFloat(amount) <= 0 || !isValidAddress) return;
    setStatus("sending");
    try {
      const kit = new AppKit();
      const adapter = await getAdapter();

      const result = await kit.send({
        from: { adapter, chain: "Arc_Testnet" },
        to: recipient as `0x${string}`,
        amount,
        token,
      });

      toast.success(`Sent ${amount} ${token} → ${recipient.slice(0, 6)}...${recipient.slice(-4)}`);
      // Send task: +75 puan
      addScore(address, 75);
      if (result && "txHash" in result) {
        toast.info(
          <a
            href={`https://testnet.arcscan.app/tx/${(result as { txHash: string }).txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Explorer ↗
          </a>
        );
      }
      setAmount("");
      setRecipient("");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("[send]", err);
      toast.error("Send failed. Please try again.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [address, amount, token, recipient, isValidAddress]);

  const btnLabel =
    !address       ? null
    : isWrongChain ? "Switch to Arc Testnet"
    : isPending    ? "Sending..."
    : !amount      ? "Enter amount"
    : !recipient   ? "Enter recipient"
    : !isValidAddress ? "Invalid address"
    : "Send";

  const canSend = !!address && !isWrongChain && !isPending && !!amount && parseFloat(amount) > 0 && isValidAddress;

  return (
    <div
      className="rounded-2xl border p-4 shadow-2xl w-full max-w-md mx-auto"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>Transfer tokens</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Send any ERC-20 token to a wallet address on Arc Testnet
        </p>
      </div>

      {/* Token selector + amount */}
      <div className="rounded-xl border p-3 mb-3" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>You send</span>
          {address && (
            <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Balance: <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{balStr}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-xl font-bold outline-none min-w-0 w-0"
            style={{ color: "var(--text-primary)" }}
          />
          <select
            value={token}
            onChange={e => setToken(e.target.value)}
            className="rounded-xl px-3 py-1.5 text-sm font-semibold border outline-none shrink-0"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            {SEND_TOKENS.map(t => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipient */}
      <div className="rounded-xl border p-3 mb-4" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
        <div className="mb-2">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Recipient Address</span>
        </div>
        <input
          type="text"
          placeholder="0x..."
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          className="w-full bg-transparent text-sm font-mono outline-none"
          style={{ color: recipient && !isValidAddress ? "var(--accent-red)" : "var(--text-primary)" }}
        />
        {recipient && !isValidAddress && (
          <p className="text-xs mt-1" style={{ color: "var(--accent-red)" }}>Invalid Ethereum address</p>
        )}
      </div>

      {/* Action button */}
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
          onClick={handleSend}
          disabled={!canSend}
          className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:cursor-not-allowed enabled:hover:brightness-110"
          style={{
            background: canSend ? "linear-gradient(90deg,#C9693A,#B55A2E)" : "var(--bg-input)",
            color:      canSend ? "#fff" : "var(--text-secondary)",
          }}
        >
          {isPending
            ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size={16} color="white" /> {btnLabel}</span>
            : `↗ ${btnLabel ?? "Send"}`}
        </button>
      )}

      {/* Footer */}
      <p className="text-center text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
        Transfers on Arc Testnet ·{" "}
        <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer" className="underline">
          Get test tokens
        </a>
      </p>
    </div>
  );
}
