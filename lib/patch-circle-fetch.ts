const CIRCLE_APIS = [
  "https://api.circle.com",
  "https://api-staging.circle.com",
  "https://iris-api.circle.com",
  "https://iris-api-sandbox.circle.com",
  "https://gateway-api.circle.com",
  "https://gateway-api-testnet.circle.com",
];

let patched = false;

export function patchCircleFetch() {
  if (patched || typeof window === "undefined") return;
  patched = true;

  const original = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.href
        : (input as Request).url;

    // Check if URL matches any Circle API
    const matchedApi = CIRCLE_APIS.find(api => url.startsWith(api));
    if (matchedApi) {
      // Extract the path after the base URL
      const path = url.slice(matchedApi.length);
      // Encode the original host so server knows where to forward
      const proxied = `${window.location.origin}/api/circle-proxy?host=${encodeURIComponent(matchedApi)}&path=${encodeURIComponent(path)}`;
      console.log("[circle-proxy] Redirecting:", url, "→", proxied);
      // Pass original URL as header for the proxy to use
      const newInit: RequestInit = {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          "x-circle-target-url": url,
        },
      };
      return original(proxied, newInit);
    }

    return original(input, init);
  };
}
