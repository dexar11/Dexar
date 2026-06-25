import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ── Merkezi puan ekleme fonksiyonu ─────────────────────────────────────────
export async function addScore(address: string, points: number) {
  const addr = address.toLowerCase();
  const { data } = await supabase
    .from("user_scores")
    .select("score, swap_count, volume_usd, minted_tiers, x_follow_claimed, last_trade_date, streak_days")
    .eq("address", addr)
    .single();

  const { error } = await supabase.from("user_scores").upsert(
    {
      address:          addr,
      score:            (data?.score      ?? 0) + points,
      swap_count:       (data?.swap_count ?? 0) + 1,
      volume_usd:        data?.volume_usd        ?? 0,
      minted_tiers:      data?.minted_tiers      ?? [],
      x_follow_claimed:  data?.x_follow_claimed  ?? false,
      last_trade_date:   data?.last_trade_date   ?? null,
      streak_days:       data?.streak_days       ?? 0,
      updated_at:        new Date().toISOString(),
    },
    { onConflict: "address" },
  );
  if (error) console.error("[supabase] addScore error:", error);
}

// ── Swap kaydı + puan ──────────────────────────────────────────────────────
export async function upsertSwapRecord(params: {
  user_address: string;
  token_in:     string;
  token_out:    string;
  amount_in:    string;
  amount_out:   string;
  tx_hash:      string;
  chain:        string;
}) {
  console.log("[supabase] upsertSwapRecord called:", params);
  const { data, error } = await supabase.from("swap_records").insert({
    user_address: params.user_address.toLowerCase(),
    token_in:     params.token_in,
    token_out:    params.token_out,
    amount_in:    params.amount_in,
    amount_out:   params.amount_out,
    tx_hash:      params.tx_hash,
    chain:        params.chain,
    created_at:   new Date().toISOString(),
  }).select();
  if (error) {
    console.error("[supabase] upsertSwapRecord error:", JSON.stringify(error, null, 2), "code:", error.code, "message:", error.message, "details:", error.details, "hint:", error.hint);
  } else {
    console.log("[supabase] upsertSwapRecord success:", data);
  }
}

// ── User score güncelle (swap_count + volume) ──────────────────────────────
export async function upsertUserScore(params: {
  address:    string;
  swap_count: number;
  volume_usd: number;
}) {
  const addr = params.address.toLowerCase();
  const { data: existing } = await supabase
    .from("user_scores")
    .select("score, minted_tiers, x_follow_claimed, last_trade_date, streak_days")
    .eq("address", addr)
    .single();

  // Streak hesapla: son işlem tarihi ile bugünü karşılaştır
  const today     = new Date().toISOString().slice(0, 10); // "2026-06-24"
  const lastDate  = existing?.last_trade_date ?? null;
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  let streakDays = existing?.streak_days ?? 0;
  if (lastDate === null || lastDate < yesterday) {
    // İlk işlem ya da streak koptu
    streakDays = 1;
  } else if (lastDate === yesterday) {
    // Dün işlem vardı, streak devam ediyor
    streakDays = streakDays + 1;
  }
  // lastDate === today ise bugün zaten işlem yapılmış, streak değişmez

  const streakBonus = streakDays >= 7 ? 500 : 0; // 7 gün streak bonus

  const { error } = await supabase.from("user_scores").upsert(
    {
      address:          addr,
      swap_count:       params.swap_count,
      volume_usd:       params.volume_usd,
      score:            (existing?.score ?? 0) + 100 + streakBonus,
      minted_tiers:     existing?.minted_tiers     ?? [],
      x_follow_claimed: existing?.x_follow_claimed ?? false,
      last_trade_date:  today,
      streak_days:      streakDays,
      updated_at:       new Date().toISOString(),
    },
    { onConflict: "address" },
  );
  if (error) console.error("[supabase] upsertUserScore error:", error);
}
