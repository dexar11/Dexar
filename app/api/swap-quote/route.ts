import { NextRequest, NextResponse } from "next/server";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
import { createPublicClient, http } from "viem";

const kit = new AppKit();

// Rate limit
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = rateLimitMap.get(ip);
  if (!rec || now > rec.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); return true; }
  if (rec.count >= 30) return false;
  rec.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const kitKey = process.env.NEXT_PUBLIC_KIT_KEY;
  if (!kitKey) return NextResponse.json({ error: "KIT_KEY not configured" }, { status: 503 });

  try {
    const { tokenIn, tokenOut, amountIn, userAddress } = await req.json();

    if (!tokenIn || !tokenOut || !amountIn || !userAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Server-side adapter with a dummy key just for estimation
    // estimateSwap doesn't need signing, just RPC access
    const adapter = createViemAdapterFromPrivateKey({
      // Use a deterministic dummy key — estimation only, no funds
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000001",
      getPublicClient: ({ chain }) =>
        createPublicClient({
          chain,
          transport: http("https://rpc.testnet.arc.network", { retryCount: 3, timeout: 15000 }),
        }),
    });

    const estimate = await kit.estimateSwap({
      from: { adapter, chain: "Arc_Testnet" },
      tokenIn,
      tokenOut,
      amountIn,
      config: { kitKey },
    });

    return NextResponse.json({
      tokenIn,
      tokenOut,
      amountIn,
      estimatedOutput: estimate.estimatedOutput,
      stopLimit:       estimate.stopLimit,
      fees:            estimate.fees,
    });
  } catch (err) {
    console.error("[swap-quote]", err);
    const msg = err instanceof Error ? err.message : "Failed to get quote";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
