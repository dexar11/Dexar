"use client";

import { useState, useRef, useEffect } from "react";
import { ARC_TOKENS } from "@/lib/arc-kit";

const TOKENS = ARC_TOKENS.filter(t => t.symbol !== "NATIVE");

export interface TokenInfo {
  symbol: string;
  name:   string;
  decimals: number;
  logoUrl: string;
}

interface Props {
  selected: TokenInfo;
  onSelect: (t: TokenInfo) => void;
  exclude?: string;
  label?: string;
}

export function TokenSelector({ selected, onSelect, exclude, label = "token" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const available = TOKENS.filter(t => {
    if (!exclude) return true;
    // exclude can be a single symbol or comma-separated list
    const excludeList = exclude.split(",").map(s => s.trim());
    return !excludeList.includes(t.symbol);
  });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-xl border px-3 py-1.5 font-semibold text-sm transition-all hover:border-accent-orange"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)" }}
        aria-label={`Select ${label}`}
      >
        {/* Token icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={selected.logoUrl}
          alt={selected.symbol}
          width={20}
          height={20}
          className="rounded-full"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span>{selected.symbol}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 rounded-xl border shadow-xl w-48 overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="p-2">
            <p className="text-xs font-semibold px-2 py-1 mb-1" style={{ color: "var(--text-secondary)" }}>
              Select token
            </p>
            {available.map(t => (
              <button
                key={t.symbol}
                onClick={() => { onSelect(t); setOpen(false); }}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-all hover:bg-bg-input"
                style={{ color: selected.symbol === t.symbol ? "var(--accent-orange)" : "var(--text-primary)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.logoUrl} alt={t.symbol} width={24} height={24} className="rounded-full"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="text-left">
                  <div className="font-semibold">{t.symbol}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
