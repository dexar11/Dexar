"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import ReactMarkdown from "react-markdown";
import remarkGfm    from "remark-gfm";

interface Message {
  id:      string;
  role:    "user" | "assistant";
  content: string;
}

const EXAMPLE_PROMPTS = [
  "Swap 1 USDC to EURC",
  "Swap 2 USDC to cirBTC",
  "What is Arc Network?",
  "How do I bridge USDC?",
];

function LoadingDots() {
  return (
    <div className="flex gap-1.5 items-center py-0.5">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-full"
          style={{
            width: 7, height: 7, background: "#C9693A",
            animation: `agentBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
      ))}
      <style>{`
        @keyframes agentBounce {
          0%,80%,100%{transform:scale(0.7);opacity:0.4}
          40%{transform:scale(1);opacity:1}
        }
      `}</style>
    </div>
  );
}

export function AgentChat() {
  const { address } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = [...messages, userMsg].slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res  = await fetch("/api/agent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history, userAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) { setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: data.error ?? "Something went wrong." }]); return; }
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: data.content }]);
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, address]);

  return (
    <div className="flex flex-col"
      style={{ height: "calc(100dvh - 56px - 64px - env(safe-area-inset-bottom))", background: "var(--bg-primary)" }}>

      {/* ── Title ── */}
      <div className="shrink-0 px-4 pt-6 pb-4" style={{ background: "var(--bg-primary)" }}>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold" style={{ color: "#C9693A" }}>Arbi AI Agent</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            I&apos;ll find the best swap route for you.
          </p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="mx-auto max-w-2xl">

          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-3 rounded-2xl px-8 py-10">
                <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#C9693A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="7" width="18" height="13" rx="2"/>
                  <path d="M8 11h.01M12 11h.01M16 11h.01"/>
                  <path d="M12 7V4"/><circle cx="12" cy="3" r="1"/>
                </svg>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Ask me anything about swapping, sending, or bridging on Arc.
                </p>
                <div className="inline-flex flex-wrap gap-3 justify-center">
                  {EXAMPLE_PROMPTS.map(p => (
                    <button key={p} onClick={() => sendMessage(p)}
                      className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all border"
                      style={{ borderColor: "var(--border)", background: "var(--bg-card)", color: "var(--text-primary)" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#C9693A")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map(msg => (
            <div key={msg.id} className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                style={{
                  background:   msg.role === "user" ? "var(--bg-input)" : "var(--bg-card)",
                  color:        msg.role === "user" ? "var(--text-primary)" : "var(--text-primary)",
                  border:       "1px solid var(--border)",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                }}>
                {msg.role === "assistant"
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  : msg.content}
              </div>
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="rounded-2xl px-5 py-3 border"
                style={{ background: "var(--bg-card)", borderColor: "var(--border)", borderRadius: "18px 18px 18px 4px" }}>
                <LoadingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 px-4 pb-2 pt-2 border-t"
        style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2 border"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            <textarea rows={1} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask about swaps on Arc..."
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
              style={{ color: "var(--text-primary)", maxHeight: 120 }}
            />
            <button onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-1.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-40"
              style={{ background: "#C9693A" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21L23 12 2 3v7l15 2-15 2v7z"/>
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
