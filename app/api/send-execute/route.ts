/**
 * /api/send-execute
 * Server-side proxy to Arc App Kit send().
 * Send doesn't require a KIT_KEY — it's a plain ERC-20 transfer.
 * We proxy this to avoid CORS issues with Circle's Stablecoin Service.
 *
 * NOTE: Send requires user signing — we use the private key adapter only
 * for server-side wallets. For browser wallets, send is called directly
 * from the client using the browser wallet adapter.
 *
 * This route is kept as a future hook for server-side send flows.
 */
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "Use client-side send with browser wallet adapter" }, { status: 400 });
}
