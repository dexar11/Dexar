"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

const PRESETS = [0.1, 0.5, 1.0, 2.0];

export function SlippageSettings({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:border-accent-orange"
        style={{ background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        {/* gear icon */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        Slippage: {value}%
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-50 rounded-xl border p-3 shadow-xl w-44"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Slippage Tolerance</p>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => { onChange(p); setOpen(false); }}
                className="rounded-lg py-1 text-xs font-semibold transition-all"
                style={{
                  background: value === p ? "var(--accent-orange)" : "var(--bg-input)",
                  color:      value === p ? "#fff" : "var(--text-secondary)",
                  border:     `1px solid ${value === p ? "var(--accent-orange)" : "var(--border)"}`,
                }}
              >
                {p}%
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Custom"
            min={0.01}
            max={50}
            step={0.1}
            className="w-full rounded-lg border px-2 py-1 text-xs outline-none"
            style={{ background: "var(--bg-input)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            onChange={e => { const v = parseFloat(e.target.value); if (v > 0 && v <= 50) onChange(v); }}
          />
        </div>
      )}
    </div>
  );
}
