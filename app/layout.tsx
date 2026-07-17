import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SocialButtons } from "@/components/ui/SocialButtons";

export const metadata: Metadata = {
  metadataBase: new URL("https://dexar.app"),
  title: "Dexar",
  description: "Dexar is a DEX aggregator on Arc Network. Swap, Send, and Bridge stablecoins with the best routes, AI-powered trading, and on-chain reputation scoring.",
  icons: {
    icon: "/dexar sembol.png",
    apple: "/dexar sembol.png",
  },
  openGraph: {
    title: "Dexar",
    description: "Dexar is a DEX aggregator on Arc Network. Swap, Send, and Bridge stablecoins with the best routes, AI-powered trading, and on-chain reputation scoring.",
    url: "https://dexar.app",
    siteName: "Dexar",
    images: [{ url: "/dexar sembol.png", width: 512, height: 512, alt: "Dexar" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@dexar_app",
    title: "Dexar",
    description: "Dexar is a DEX aggregator on Arc Network. Swap, Send, and Bridge stablecoins with the best routes, AI-powered trading, and on-chain reputation scoring.",
    images: ["/dexar sembol.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <SocialButtons />
      </body>
    </html>
  );
}
