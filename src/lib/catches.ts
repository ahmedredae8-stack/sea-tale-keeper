import { supabase } from "@/integrations/supabase/client";

export const FISH = [
  { id: "sardine", name: "سردين", img: "/__l5e/assets-v1/6ee1de86-0dbb-4cd1-8a32-2ddae64f880b/fish-sardine.png", price: 12, weight: 50 },
  { id: "mackerel", name: "ماكريل", img: "/__l5e/assets-v1/22dd8ddd-6a49-44a3-8b5e-b77d478a6553/fish-mackerel.png", price: 34, weight: 25 },
  { id: "tuna", name: "تونة", img: "/__l5e/assets-v1/bf2ab850-8f33-4604-b538-342fcda67165/fish-tuna.png", price: 92, weight: 12 },
  { id: "swordfish", name: "سمك السيف", img: "/__l5e/assets-v1/f540ac8e-9aa5-46f1-8c18-68666fb7b8ef/fish-swordfish.png", price: 175, weight: 7 },
  { id: "turtle", name: "سلحفاة", img: "/__l5e/assets-v1/7ea2ace5-9054-4e26-8cd9-24c253d2b475/fish-turtle.png", price: 214, weight: 4 },
  { id: "pearl", name: "محار اللؤلؤ", img: "/__l5e/assets-v1/fc1415ea-a430-4c29-8634-b0229fd9bec9/fish-pearl.png", price: 480, weight: 2 },
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
