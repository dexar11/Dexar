"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { BridgeCard } from "@/components/bridge/BridgeCard";

export default function BridgePage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 py-8 pb-24 md:pb-8">
        <BridgeCard />
      </main>
      <MobileNav />
    </>
  );
}
