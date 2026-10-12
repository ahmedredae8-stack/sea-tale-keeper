import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { useArtworkMap } from "@/lib/artwork";
import { tripLabel } from "@/lib/fleetCatalog";
import { useLiveShips, type LiveShip } from "@/lib/shipOverrides";
import { fmt } from "@/lib/ships";
import { playSfx } from "@/lib/sound";

export const Route = createFileRoute("/shipyard")({
  head: () => ({
    meta: [
      { title: "مصنع السفن — عرش البحار" },
      { name: "description", content: "كل سفن متجر عرش البحار: من القارب الصغير حتى سفن القبيلة." },
      { property: "og:title", content: "مصنع السفن — عرش البحار" },
      { property: "og:description", content: "كتالوج السفن الحقيقي في عرش البحار بأسعاره ورحلاته." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shipyard,
});

export function Shipyard() {
  const ships = useLiveShips();
  const art = useArtworkMap();
  const [src, setSrc] = useState<"store" | "tribe">("store");
  const [open, setOpen] = useState<LiveShip | null>(null);
  const list = ships.filter((s) => s.source === src);
  const img = (s: LiveShip) => art[`${s.key}:idle`] ?? s.hull;

  return (
    <div dir="rtl" className="tos-yard">
      <div className="tos-seg" role="group" aria-label="مصدر السفن">
        <button type="button" className={src === "store" ? "on" : ""} onClick={() => setSrc("store")}>سفن المتجر</button>
        <button type="button" className={src === "tribe" ? "on" : ""} onClick={() => setSrc("tribe")}>سفن القبيلة</button>
      </div>
      <ul className="tos-yard-grid">
        {list.map((s, i) => (
          <li key={s.key}>
            <button type="button" className="tos-yard-card" onClick={() => { playSfx("click", 0.6); setOpen(s); }}>
              <span className="tos-yard-tier">{String(i + 1).padStart(2, "0")}</span>
              <img src={img(s)} alt="" loading="lazy" />
              <strong>{s.name}</strong>
              <small>رحلة {tripLabel(s.tripSeconds)}</small>
              <em>{fmt(s.price)} {s.currency === "coin" ? "عملة" : "جوهرة"}</em>
            </button>
          </li>
        ))}
      </ul>
      {open && (
        <div className="tos-yard-detail" role="dialog" aria-label={open.name}>
          <img src={img(open)} alt={open.name} />
          <div>
            <h3>{open.name}</h3>
            {open.description && <p>{open.description}</p>}
            <p>الصيد: {open.fish.join(" · ")}</p>
            <p>مدة الرحلة: {tripLabel(open.tripSeconds)}</p>
            <div className="tos-row">
              <button type="button" className="tos-btn" disabled title="الشراء غير متاح حالياً">{fmt(open.price)} · قريباً</button>
              <button type="button" className="tos-btn tos-btn-ghost" onClick={() => setOpen(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
