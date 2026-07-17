"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

const DOCS_SECTIONS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "swap",            label: "Swap" },
  { id: "send",            label: "Send" },
  { id: "bridge",          label: "Bridge" },
  { id: "ai-agent",        label: "AI Agent" },
  { id: "wallet-stats",    label: "Arc Wallet Stats" },
  { id: "leaderboard",     label: "Leaderboard" },
  { id: "dexar-score",     label: "Dexar Score & Reward" },
  { id: "profile",         label: "Profile" },
  { id: "faq",             label: "FAQ" },
  { id: "security",        label: "Security" },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const content = DOCS_CONTENT[activeSection] || DOCS_CONTENT["getting-started"];

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl flex min-h-[calc(100vh-56px)] px-4 sm:px-6 pb-20 md:pb-6">

        {/* Sidebar */}
        <aside
          className="hidden md:block w-52 shrink-0 border-r pt-6 pr-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9693A" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Docs</span>
          </div>
          <nav className="flex flex-col gap-0.5">
            {DOCS_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeSection === s.id ? "#C9693A1A" : "transparent",
                  color:      activeSection === s.id ? "#C9693A"   : "var(--text-secondary)",
                  border:     activeSection === s.id ? "1px solid #C9693A4D" : "1px solid transparent",
                }}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 pt-6 md:pl-8 max-w-3xl">
          {content}
        </main>
      </div>
      <MobileNav />
    </>
  );
}

const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 style={{ color: "var(--text-primary)", fontSize: "26px", fontWeight: 700, marginBottom: "16px" }}>{children}</h1>
);
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 700, marginTop: "24px", marginBottom: "10px" }}>{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", marginBottom: "12px" }}>{children}</p>
);
const Note = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: "#C9693A1A", border: "1px solid #C9693A4D", borderRadius: 10, padding: "12px 16px", margin: "16px 0" }}>
    <p style={{ color: "var(--text-primary)", fontSize: "14px", margin: 0 }}>{children}</p>
  </div>
);
const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div style={{ overflowX: "auto", margin: "16px 0" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid var(--border)" }}>
          {headers.map(h => <th key={h} style={{ color: "var(--text-primary)", textAlign: "left", padding: "10px 12px", fontSize: "13px" }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
            {row.map((cell, j) => <td key={j} style={{ color: "var(--text-secondary)", padding: "10px 12px", fontSize: "14px" }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DOCS_CONTENT: Record<string, React.ReactNode> = {
  "getting-started": (<><H1>🚀 Getting Started</H1><P>Welcome to Dexar! A trading interface built on Arc, Circle's stablecoin-native Layer-1 network. Swap, send, bridge, and let an AI Agent route your trades — all in one place.</P><Table headers={["Step","Action"]} rows={[["1️⃣","Connect your wallet"],["2️⃣","Get testnet USDC from the Arc faucet"],["3️⃣","Start swapping, sending, or bridging"],["4️⃣","Earn points and climb the leaderboard"]]}/><Note>💡 Dexar runs on <strong>Arc Testnet</strong> — USDC is the native gas token, so fees stay predictable and dollar-denominated.</Note></>),
  "swap": (<><H1>🔄 Swap</H1><P>Instantly exchange stablecoins like <strong>USDC ⇄ EURC</strong> with full control over slippage.</P><Table headers={["Field","Description"]} rows={[["You pay","Amount + token you're swapping from"],["You receive","Amount + token you're swapping to"],["⚙️ Slippage","Default 0.5%, adjustable"]]}/></>),
  "send": (<><H1>📤 Send</H1><P>Transfer any ERC-20 token directly to a wallet address on Arc Testnet.</P><ul style={{color:"var(--text-secondary)",lineHeight:"1.8",paddingLeft:20}}><li>✅ Pick a token</li><li>✅ Paste a recipient address (0x...)</li><li>✅ Confirm — done in one step</li></ul></>),
  "bridge": (<><H1>🌉 Bridge</H1><P>Move assets across chains using <strong>Circle's CCTP V2</strong> — no wrapped tokens involved.</P><Table headers={["Feature","Detail"]} rows={[["🔒 Secure","Native burn & mint, zero wrapped-token risk"],["🌍 Coverage","5 testnet chains supported via CCTP"],["Example route","Arc Testnet → Ethereum Sepolia"]]}/></>),
  "ai-agent": (<><H1>🤖 AI Agent</H1><P>Ask Dexar's AI Agent to handle swaps, sends, and questions about Arc — in plain language.</P><H2>Try prompts like:</H2><ul style={{color:"var(--text-secondary)",lineHeight:"1.8",paddingLeft:20}}><li>💬 "Swap 1 USDC to EURC"</li><li>💬 "Swap 2 USDC to cirBTC"</li><li>💬 "1 USDC send to 0xef351..."</li><li>💬 "What is Arc Network?"</li></ul><Note>🛡️ The agent finds the best route, then asks for your confirmation before executing anything.</Note></>),
  "wallet-stats": (<><H1>📊 Arc Wallet Stats</H1><P>A live, public table of wallet activity across Arc.</P><Table headers={["Column","Meaning"]} rows={[["#","Rank"],["Address","Wallet address"],["Score","Dexar Score"],["TXs","Total transactions"],["Volume","Total volume traded"],["Age","Wallet age on Arc"]]}/></>),
  "leaderboard": (<><H1>🏆 Leaderboard</H1><P>Network-wide stats plus the top traders, ranked by score.</P><Table headers={["Metric","Description"]} rows={[["💰 Arc Total Volume","Total USD volume across the network"],["🔁 Arc Total Swap","Total completed swaps"],["👥 Arc Total Traders","Total unique traders"]]}/><P>Each trader on the board shows their <strong>rank badge</strong>, address, score, volume, and swap count. 🥇🥈🥉</P></>),
  "dexar-score": (<><H1>⭐ Dexar Score & Reward</H1><P>Your on-platform activity is scored and mapped to a tier system.</P><H2>🎖️ Tiers</H2><Table headers={["Tier","Points"]} rows={[["🥉 Bronze","1,000 pts"],["🥈 Silver","2,500 pts"],["🥇 Gold","5,000 pts"],["💎 Diamond","10,000 pts"]]}/><H2>✅ Tasks & Points</H2><Table headers={["Task","Points"]} rows={[["❌ Follow Arc on X","+1,000"],["🔄 Make 1 swap","+100"],["📤 Send tokens","+75"],["🌉 Bridge USDC","+200"],["🤖 Swap with AI Agent","+250"],["🔥 Trade 7 days in a row","+500"]]}/><Note>📌 Ranking is based on <strong>score</strong>, not raw volume — consistent activity beats a single large trade.</Note></>),
  "profile": (<><H1>👤 Profile</H1><P>Your personal hub on Dexar.</P><Table headers={["Tab","Contents"]} rows={[["💼 Portfolio","Total balance, 24h change, token breakdown"],["📜 History","Full transaction history"],["🔗 Referral","Invite links & referral tracking"]]}/></>),
  "faq": (<><H1>❓ FAQ</H1><H2>Is Dexar live on mainnet?</H2><P>Not yet — Dexar currently runs on Arc Testnet. 🧪</P><H2>Do I need ETH for gas?</H2><P>No — Arc uses USDC as native gas, so no volatile token is required. ⛽💵</P><H2>What wallets are supported?</H2><P>Any standard EVM-compatible wallet. 🦊</P></>),
  "security": (<><H1>🔐 Security</H1><ul style={{color:"var(--text-secondary)",lineHeight:"1.8",paddingLeft:20}}><li>🔥 Bridge transfers use <strong>native burn & mint</strong> — no wrapped-asset exposure</li><li>⚡ Transactions finalize in <strong>under a second</strong> thanks to Arc's consensus layer</li><li>🧾 All swap and bridge activity is verifiable on-chain</li></ul><div style={{marginTop:24,padding:"12px 16px",background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:10}}><p style={{color:"var(--text-secondary)",fontSize:"13px",fontStyle:"italic",margin:0}}>This documentation reflects Dexar's current feature set on Arc Testnet and is subject to change as the product evolves. 🧡</p></div></>),
};
