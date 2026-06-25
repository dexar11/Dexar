"use client";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { SendCard } from "@/components/send/SendCard";

export default function SendPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 py-8 pb-24 md:pb-8">
        <div className="-mt-[100px] w-full flex flex-col items-center">
          <SendCard />
        </div>
      </main>
      <MobileNav />
    </>
  );
}
