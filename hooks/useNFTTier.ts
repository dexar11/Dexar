"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { NFT_TIERS } from "@/constants/nft-tiers";

export function useNFTTier(address: string | undefined) {
  const [score,     setScore]     = useState(0);
  const [mintedSet, setMintedSet] = useState<Set<number>>(new Set());
  const [loading,   setLoading]   = useState(false);

  async function loadData(addr: string) {
    setLoading(true);
    const { data } = await supabase
      .from("user_scores")
      .select("score, minted_tiers")
      .eq("address", addr.toLowerCase())
      .single();

    setScore(data?.score ?? 0);
    const minted: number[] = data?.minted_tiers ?? [];
    setMintedSet(new Set(minted));
    setLoading(false);
  }

  useEffect(() => {
    if (address) loadData(address);
    else { setScore(0); setMintedSet(new Set()); }
  }, [address]);

  function refetchMinted() {
    if (address) loadData(address);
  }

  const mintedTiers = NFT_TIERS.map(tier => ({
    ...tier,
    minted:   mintedSet.has(tier.id),
    unlocked: score >= tier.requiredScore,
  }));

  const nextTier  = NFT_TIERS.find(t => score < t.requiredScore) ?? null;
  const ptsToNext = nextTier ? nextTier.requiredScore - score : 0;

  return { score, mintedTiers, mintedSet, nextTier, ptsToNext, loading, refetchMinted };
}
