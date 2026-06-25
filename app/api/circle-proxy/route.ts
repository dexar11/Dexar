import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "https://api.circle.com",
  "https://api-staging.circle.com",
  "https://iris-api.circle.com",
  "https://iris-api-sandbox.circle.com",
  "https://gateway-api.circle.com",
  "https://gateway-api-testnet.circle.com",
]);

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = rateLimitMap.get(ip);
  if (!rec || now > rec.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); return true; }
  if (rec.count >= 60) return false;
  rec.count++;
  return true;
}

async function handleRequest(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // Get target URL from header (set by patch-circle-fetch.ts)
  const targetUrl = req.headers.get("x-circle-target-url");

  if (!targetUrl) {
    // Fallback: reconstruct from query params
    const host = req.nextUrl.searchParams.get("host");
    const path = req.nextUrl.searchParams.get("path");
    if (!host || !path) return NextResponse.json({ error: "Missing target" }, { status: 400 });
    const fullUrl = `${host}${path}`;
    return forwardRequest(req, fullUrl);
  }

  return forwardRequest(req, targetUrl);
}

async function forwardRequest(req: NextRequest, targetUrl: string): Promise<NextResponse> {
  // Security: only allow known Circle hosts
  const allowed = [...ALLOWED_HOSTS].some(host => targetUrl.startsWith(host));
  if (!allowed) {
    console.error("[circle-proxy] Blocked:", targetUrl);
    return NextResponse.json({ error: "Forbidden host" }, { status: 403 });
  }

  const kitKey = process.env.KIT_KEY ?? process.env.NEXT_PUBLIC_KIT_KEY;

  const headers: Record<string, string> = {
    Accept: req.headers.get("accept") ?? "application/json",
  };

  // Forward auth — use KIT_KEY if no auth header from client
  const clientAuth = req.headers.get("authorization");
  if (clientAuth) {
    headers["Authorization"] = clientAuth;
  } else if (kitKey) {
    headers["Authorization"] = `Bearer ${kitKey}`;
  }

  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  console.log(`[circle-proxy] ${req.method} → ${targetUrl}`);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const responseBody = await upstream.text();
    console.log(`[circle-proxy] Response ${upstream.status}:`, responseBody.slice(0, 200));

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[circle-proxy] Fetch error:", err);
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }
}

export async function GET(req: NextRequest)    { return handleRequest(req); }
export async function POST(req: NextRequest)   { return handleRequest(req); }
export async function PUT(req: NextRequest)    { return handleRequest(req); }
export async function DELETE(req: NextRequest) { return handleRequest(req); }
export async function PATCH(req: NextRequest)  { return handleRequest(req); }
