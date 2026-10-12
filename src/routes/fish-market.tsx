import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import marketHero from "@/assets/fish-market-hero.jpg";
import { CATCHES_UPDATED, FISH, loadInventory, sellFish } from "@/lib/catches";
import { fmt } from "@/lib/ships";
import { playSfx } from "@/lib/sound";

export const Route = createFileRoute("/fish-market")({
  head: () => ({
    meta: [
      { title: "سوق السمك — عرش البحار" },
      { name: "description", content: "بِع الأسماك التي اصطادها أسطولك فعلياً في سوق السمك." },
      { property: "og:title", content: "سوق السمك — عرش البحار" },
      { property: "og:description", content: "صيدك الحقيقي من رحلات أسطولك، جاهز للبيع في سوق عرش البحار." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FishMarket,
});

export function FishMarket() {
  const [stock, setStock] = useState<Record<string, number> | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const load = () => void loadInventory().then(setStock);
    load();
    window.addEventListener(CATCHES_UPDATED, load);
    return () => window.removeEventListener(CATCHES_UPDATED, load);
  }, []);

  const owned = FISH.filter((f) => (stock?.[f.id] ?? 0) > 0);
  const total = owned.reduce((s, f) => s + f.price * (stock?.[f.id] ?? 0), 0);

  const sell = async (id: string, name: string) => {
    playSfx("click", 0.6);
    setNote((await sellFish(id)) ? `تم بيع كل ${name}` : "تعذّر البيع — سجّل دخولك");
  };

  return (
    <div dir="rtl" className="tos-market">
      <figure className="tos-market-hero">
        <img src={marketHero} alt="سوق السمك على الميناء" width={1280} height={720} />
        <figcaption><small>قيمة صيدك</small><strong>{fmt(total)}</strong></figcaption>
      </figure>
      {stock === null ? (
        <p className="tos-empty">جارٍ تحميل صيدك…</p>
      ) : owned.length === 0 ? (
        <p className="tos-empty">لا يوجد صيد بعد. أرسل قاربك للبحر واسحب الشباك عند عودته.</p>
      ) : (
        <ul className="tos-fish-grid">
          {owned.map((f) => (
            <li key={f.id} className="tos-fish-card">
              <img src={f.img} alt="" loading="lazy" />
              <strong>{f.name}</strong>
              <span>×{fmt(stock[f.id] ?? 0)} · {fmt(f.price)} للواحدة</span>
              <button type="button" className="tos-btn" onClick={() => void sell(f.id, f.name)}>بيع الكل</button>
            </li>
          ))}
        </ul>
      )}
      {note && <p role="status" className="tos-empty">{note}</p>}
    </div>
  );
}
