import { NextRequest, NextResponse } from "next/server";

const CACHE     = new Map<string, { price: number; expiry: number }>();
const CACHE_TTL = 60_000; // 1 minute

const COINGECKO_IDS: Record<string, string> = {
  USDC:   "usd-coin",
  EURC:   "euro-coin",
  cirBTC: "bitcoin",
  NATIVE: "usd-coin",
};

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase() ?? "";
  const cgId   = COINGECKO_IDS[symbol];
  if (!cgId) return NextResponse.json({ price: 1, symbol });

  const cached = CACHE.get(symbol);
  if (cached && Date.now() < cached.expiry) {
    return NextResponse.json({ price: cached.price, symbol });
  }

  try {
    const res  = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    const price = data[cgId]?.usd ?? 1;
    CACHE.set(symbol, { price, expiry: Date.now() + CACHE_TTL });
    return NextResponse.json({ price, symbol });
  } catch {
    return NextResponse.json({ price: 1, symbol });
  }
}
