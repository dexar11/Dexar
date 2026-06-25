import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SocialButtons } from "@/components/ui/SocialButtons";

export const metadata: Metadata = {
  title: "Dexar",
  description: "Dexar is a DEX aggregator on Arc Network. Swap, Send, and Bridge stablecoins with the best routes, AI-powered trading, and on-chain reputation scoring.",
  icons: {
    icon: "/dexar üst logo.png",
    apple: "/dexar üst logo.png",
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
