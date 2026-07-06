"use client";

import { useState } from "react";
import Link from "next/link";

const DOCS_SECTIONS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "swap", label: "Swap" },
  { id: "send", label: "Send" },
  { id: "bridge", label: "Bridge" },
  { id: "ai-agent", label: "AI Agent" },
  { id: "wallet-stats", label: "Arc Wallet Stats" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "dexar-score", label: "Dexar Score & Reward" },
  { id: "profile", label: "Profile" },
  { id: "faq", label: "FAQ" },
  { id: "security", label: "Security" },
];

export function DocsModal() {
  const [activeSection, setActiveSection] = useState("getting-started");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div
        className="relative w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
      >
        {/* Close Button */}
        <Link
          href="/"
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-red-500/20"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </Link>

        {/* Sidebar */}
        <aside
          className="w-52 border-r overflow-y-auto"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9693A" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Dexar Documentation
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2">
            {DOCS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1"
                style={{
                  background: activeSection === section.id ? "#C9693A1A" : "transparent",
                  color: activeSection === section.id ? "#C9693A" : "var(--text-secondary)",
                  border: activeSection === section.id ? "1px solid #C9693A4D" : "1px solid transparent",
                }}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <DocsContent section={activeSection} />
        </main>
      </div>
    </div>
  );
}

function DocsContent({ section }: { section: string }) {
  const content = DOCS_CONTENT[section] || DOCS_CONTENT["getting-started"];
  
  return (
    <div className="prose prose-sm max-w-none" style={{ color: "var(--text-primary)" }}>
      {content}
    </div>
  );
}

const DOCS_CONTENT: Record<string, React.ReactNode> = {
  "getting-started": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>🚀 Getting Started</h1>
      
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Step</th>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>1️⃣</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Connect your wallet</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>2️⃣</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Get testnet USDC from the Arc faucet</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>3️⃣</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Start swapping, sending, or bridging</td>
          </tr>
          <tr>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>4️⃣</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Earn points and climb the leaderboard</td>
          </tr>
        </tbody>
      </table>

      <div 
        className="p-4 rounded-lg mt-6"
        style={{ background: "#C9693A1A", border: "1px solid #C9693A4D" }}
      >
        <p style={{ color: "var(--text-primary)", fontSize: "14px" }}>
          💡 Dexar runs on <strong>Arc Testnet</strong> — USDC is the native gas token, so fees stay predictable and dollar-denominated.
        </p>
      </div>
    </>
  ),

  "swap": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>🔄 Swap</h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
        Instantly exchange stablecoins like <strong>USDC ⇄ EURC</strong> with full control over slippage.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Field</th>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>You pay</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Amount + token you're swapping from</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>You receive</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Amount + token you're swapping to</td>
          </tr>
          <tr>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>⚙️ Slippage</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Default 0.5%, adjustable</td>
          </tr>
        </tbody>
      </table>
    </>
  ),

  "send": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>📤 Send</h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
        Transfer any ERC-20 token directly to a wallet address on Arc Testnet.
      </p>

      <ul style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
        <li>✅ Pick a token</li>
        <li>✅ Paste a recipient address (<code>0x...</code>)</li>
        <li>✅ Confirm — done in one step</li>
      </ul>
    </>
  ),

  "bridge": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>🌉 Bridge</h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
        Move assets across chains using <strong>Circle's CCTP V2</strong> — no wrapped tokens involved.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Feature</th>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🔒 Secure</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Native burn & mint, zero wrapped-token risk</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🌍 Coverage</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>5 testnet chains supported via CCTP</td>
          </tr>
          <tr>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Example route</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Arc Testnet → Ethereum Sepolia</td>
          </tr>
        </tbody>
      </table>
    </>
  ),

  "ai-agent": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>🤖 AI Agent</h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
        Ask Dexar's AI Agent to handle swaps, sends, and questions about Arc — in plain language.
      </p>

      <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginTop: "24px", marginBottom: "12px" }}>Try prompts like:</h2>
      <ul style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
        <li>💬 "Swap 1 USDC to EURC"</li>
        <li>💬 "Swap 2 USDC to cirBTC"</li>
        <li>💬 "1 USDC send to 0xef351..."</li>
        <li>💬 "What is Arc Network?"</li>
      </ul>

      <div 
        className="p-4 rounded-lg mt-4"
        style={{ background: "#C9693A1A", border: "1px solid #C9693A4D" }}
      >
        <p style={{ color: "var(--text-primary)", fontSize: "14px" }}>
          🛡️ The agent finds the best route, then asks for your confirmation before executing anything.
        </p>
      </div>
    </>
  ),

  "wallet-stats": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>📊 Arc Wallet Stats</h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
        A live, public table of wallet activity across Arc.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Column</th>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>#</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Rank</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Address</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Wallet address</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Score</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Dexar Score</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>TXs</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Total transactions</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Volume</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Total volume traded</td>
          </tr>
          <tr>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Age</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Wallet age on Arc</td>
          </tr>
        </tbody>
      </table>
    </>
  ),

  "leaderboard": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>🏆 Leaderboard</h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
        Network-wide stats plus the top traders, ranked by score.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Metric</th>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>💰 Arc Total Volume</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Total USD volume across the network</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🔁 Arc Total Swap</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Total completed swaps</td>
          </tr>
          <tr>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>👥 Arc Total Traders</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Total unique traders</td>
          </tr>
        </tbody>
      </table>

      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginTop: "20px" }}>
        Each trader on the board shows their <strong>rank badge</strong>, address, score, volume, and swap count. 🥇🥈🥉
      </p>
    </>
  ),

  "dexar-score": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>⭐ Dexar Score & Reward</h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
        Your on-platform activity is scored and mapped to a tier system.
      </p>

      <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginTop: "24px", marginBottom: "12px" }}>🎖️ Tiers</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Tier</th>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🥉 Bronze</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>1,000 pts</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🥈 Silver</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>2,500 pts</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🥇 Gold</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>5,000 pts</td>
          </tr>
          <tr>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>💎 Diamond</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>10,000 pts</td>
          </tr>
        </tbody>
      </table>


      <h2 style={{ color: "var(--text-primary)", fontSize: "20px", marginTop: "24px", marginBottom: "12px" }}>✅ Tasks & Points</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Task</th>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>❌ Follow Arc on X</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>+1,000</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🔄 Make 1 swap</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>+100</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>📤 Send tokens</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>+75</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🌉 Bridge USDC</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>+200</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🤖 Swap with AI Agent</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>+250</td>
          </tr>
          <tr>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🔥 Trade 7 days in a row</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>+500</td>
          </tr>
        </tbody>
      </table>

      <div 
        className="p-4 rounded-lg mt-4"
        style={{ background: "#C9693A1A", border: "1px solid #C9693A4D" }}
      >
        <p style={{ color: "var(--text-primary)", fontSize: "14px" }}>
          📌 Ranking is based on <strong>score</strong>, not raw volume — consistent activity beats a single large trade.
        </p>
      </div>
    </>
  ),

  "profile": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>👤 Profile</h1>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
        Your personal hub on Dexar.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Tab</th>
            <th style={{ color: "var(--text-primary)", textAlign: "left", padding: "12px", fontSize: "14px" }}>Contents</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>💼 Portfolio</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Total balance, 24h change, token breakdown</td>
          </tr>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>📜 History</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Full transaction history</td>
          </tr>
          <tr>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>🔗 Referral</td>
            <td style={{ color: "var(--text-secondary)", padding: "12px", fontSize: "14px" }}>Invite links & referral tracking</td>
          </tr>
        </tbody>
      </table>
    </>
  ),

  "faq": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>❓ FAQ</h1>
      
      <h3 style={{ color: "var(--text-primary)", fontSize: "18px", marginTop: "20px", marginBottom: "8px" }}>
        Is Dexar live on mainnet?
      </h3>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
        Not yet — Dexar currently runs on Arc Testnet. 🧪
      </p>

      <h3 style={{ color: "var(--text-primary)", fontSize: "18px", marginTop: "20px", marginBottom: "8px" }}>
        Do I need ETH for gas?
      </h3>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
        No — Arc uses USDC as native gas, so no volatile token is required. ⛽💵
      </p>

      <h3 style={{ color: "var(--text-primary)", fontSize: "18px", marginTop: "20px", marginBottom: "8px" }}>
        What wallets are supported?
      </h3>
      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
        Any standard EVM-compatible wallet. 🦊
      </p>
    </>
  ),

  "security": (
    <>
      <h1 style={{ color: "var(--text-primary)", fontSize: "28px", marginBottom: "16px" }}>🔐 Security</h1>
      
      <ul style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
        <li>🔥 Bridge transfers use <strong>native burn & mint</strong> — no wrapped-asset exposure</li>
        <li>⚡ Transactions finalize in <strong>under a second</strong> thanks to Arc's consensus layer</li>
        <li>🧾 All swap and bridge activity is verifiable on-chain</li>
      </ul>

      <div 
        className="p-4 rounded-lg mt-6"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontStyle: "italic" }}>
          <em>This documentation reflects Dexar's current feature set on Arc Testnet and is subject to change as the product evolves.</em> 🧡
        </p>
      </div>
    </>
  ),
};
