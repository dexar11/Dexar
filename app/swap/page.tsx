"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { SwapCard } from "@/components/swap/SwapCard";

export default function SwapPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 py-4 pb-24 md:pb-6">
        <div className="flex flex-col items-center w-full max-w-md -mt-[90px]">
          <div className="w-full">
            <SwapCard />
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}
