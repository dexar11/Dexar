import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { addScore } from "@/lib/supabase";

const SYSTEM_PROMPT = `You are the Arc Aggregator AI Assistant — an expert on the Arc Network (a Layer-1 blockchain by Circle).

You help users with:
- Swapping tokens on Arc Testnet (USDC, EURC, cirBTC)
- Sending tokens to wallet addresses
- Bridging USDC across chains (Arc ↔ Ethereum, Base, Arbitrum, OP Sepolia)
- Arc Network information (Chain ID: 5042002, gas in USDC, sub-second finality)

Always respond in English. Be concise and helpful.

Key facts:
- Arc uses USDC as gas token (not ETH)
- Supported swap tokens: USDC, EURC, cirBTC
- Bridge uses Circle CCTP V2 — native USDC, no wrapped tokens
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com

Do NOT provide financial advice. Only help with Arc Network operations.`;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { messages, userAddress } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const history: Anthropic.MessageParam[] = messages
    .slice(-8)
    .map((m: { role: string; content: string }) => ({
      role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: String(m.content ?? "").slice(0, 2000),
    }));

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: history,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("\n");

    // AI üzerinden işlem algıla — kullanıcı işlem isteği yaptıysa puan ver
    const lastUserMsg = history.filter(m => m.role === "user").slice(-1)[0]?.content ?? "";
    const isSwapRequest   = /swap|exchange|convert/i.test(String(lastUserMsg));
    const isBridgeRequest = /bridge/i.test(String(lastUserMsg));

    if (userAddress && typeof userAddress === "string") {
      if (isSwapRequest)        addScore(userAddress, 250).catch(() => {});
      else if (isBridgeRequest) addScore(userAddress, 200).catch(() => {});
    }

    return NextResponse.json({ content: text });
  } catch (err) {
    console.error("[agent API error]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
