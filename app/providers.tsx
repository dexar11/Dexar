"use client";

import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme, type AvatarComponent } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi-config";
import { useTheme } from "@/lib/theme";
import { Toaster } from "sonner";
import { useEffect } from "react";

import "@rainbow-me/rainbowkit/styles.css";

const CustomAvatar: AvatarComponent = ({ size }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #C9693A, #B55A2E)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, color: "white", fontWeight: "bold",
    }}
  >
    A
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
});

function InnerProviders({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  let rkTheme;
  try {
    rkTheme = theme === "dark"
      ? darkTheme({ accentColor: "#C9693A", accentColorForeground: "#FFFFFF", borderRadius: "medium" })
      : lightTheme({ accentColor: "#C9693A", accentColorForeground: "#FFFFFF", borderRadius: "medium" });
  } catch {
    rkTheme = lightTheme({ accentColor: "#C9693A", accentColorForeground: "#FFFFFF", borderRadius: "medium" });
  }

  const toastStyle = theme === "dark"
    ? { background: "#181c27", border: "1px solid #2a2f45", color: "#f0ece4" }
    : { background: "#ffffff", border: "1px solid #e8ddd4", color: "#2d1f14" };

  return (
    <RainbowKitProvider theme={rkTheme} avatar={CustomAvatar}>
      {children}
      <Toaster position="bottom-right" toastOptions={{ style: toastStyle }} />
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <InnerProviders>{children}</InnerProviders>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
