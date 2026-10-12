import { supabase } from "@/integrations/supabase/client";

const A = "https://project--356242e8-144f-42b3-8292-474399c324ac.lovable.app/__l5e/assets-v1/";
export const FISH = [
  { id: "sardine", name: "سردين", img: A + "25365535-261c-4a49-a6e3-842b94b8a2d8/fish-sardine.png", price: 12, weight: 50 },
  { id: "mackerel", name: "ماكريل", img: A + "ffebb842-1d7a-4cd2-9fae-d66883e496e6/fish-mackerel.png", price: 34, weight: 25 },
  { id: "tuna", name: "تونة", img: A + "d40f7c1c-8c7f-47ec-89a0-120eaa992bde/fish-tuna.png", price: 92, weight: 12 },
  { id: "swordfish", name: "سمك السيف", img: A + "c3244a96-c3a8-495b-ac9e-2ece36ee74e6/fish-swordfish.png", price: 175, weight: 7 },
  { id: "turtle", name: "سلحفاة", img: A + "67e96dc8-9734-4101-8659-09807e61e0af/fish-turtle.png", price: 214, weight: 4 },
  { id: "pearl", name: "محار اللؤلؤ", img: A + "4b0616ca-5528-47ea-8c87-3ea157b6de3e/fish-pearl.png", price: 480, weight: 2 },
] as const;
export type FishId = (typeof FISH)[number]["id"];
export const CATCHES_UPDATED = "tos:catches";

/** Rolls a random haul of 1-3 species. */
export function rollHaul(): { id: FishId; qty: number }[] {
  const total = FISH.reduce((s, f) => s + f.weight, 0);
  const picks = new Map<FishId, number>();
  const kinds = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < kinds; i++) {
    let r = Math.random() * total;
    const f = FISH.find((x) => (r -= x.weight) < 0) ?? FISH[0];
    picks.set(f.id, (picks.get(f.id) ?? 0) + 1 + Math.floor(Math.random() * 6));
  }
  return [...picks].map(([id, qty]) => ({ id, qty }));
}

export async function saveHaul(haul: { id: FishId; qty: number }[]) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { error } = await supabase.from("catches").insert(haul.map((h) => ({ user_id: data.user!.id, fish_id: h.id, qty: h.qty })));
  if (!error) window.dispatchEvent(new Event(CATCHES_UPDATED));
  return !error;
}

export async function loadInventory() {
  const { data } = await supabase.from("catches").select("fish_id,qty");
  const totals: Record<string, number> = {};
  for (const r of data ?? []) totals[r.fish_id] = (totals[r.fish_id] ?? 0) + r.qty;
  return totals;
}

export async function sellFish(fishId: string) {
  const { error } = await supabase.from("catches").delete().eq("fish_id", fishId);
  if (!error) window.dispatchEvent(new Event(CATCHES_UPDATED));
  return !error;
}
