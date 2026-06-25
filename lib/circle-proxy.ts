const CIRCLE_API = "https://api.circle.com";

function getAuthHeader(request: Request): string | undefined {
  const fromClient = request.headers.get("authorization");
  if (fromClient) return fromClient;

  const kitKey = process.env.KIT_KEY ?? process.env.NEXT_PUBLIC_KIT_KEY;
  if (kitKey) return `Bearer ${kitKey}`;

  return undefined;
}

export async function proxyCircleApi(request: Request, circlePath: string) {
  const incoming = new URL(request.url);
  const target   = new URL(circlePath, CIRCLE_API);
  target.search  = incoming.search;

  console.log(`[circle-proxy] ${request.method} ${circlePath} → ${target.toString()}`);

  const auth = getAuthHeader(request);
  if (!auth) {
    return Response.json(
      { message: "KIT_KEY or Authorization header is missing." },
      { status: 401 }
    );
  }

  const headers: HeadersInit = {
    Authorization: auth,
    Accept: request.headers.get("accept") ?? "application/json",
  };

  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }

  const upstream = await fetch(target.toString(), {
    method: request.method,
    headers,
    body,
  });

  const responseBody = await upstream.text();
  console.log(`[circle-proxy] Response ${upstream.status}:`, responseBody.slice(0, 500));

  return new Response(responseBody, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
