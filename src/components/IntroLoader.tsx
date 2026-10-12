import { useEffect, useRef, useState } from "react";

import { playSfx } from "@/lib/sound";
import introArt from "@/assets/intro-throne.jpg";

const STAGES = ["تجهيز الأسطول", "شحن المدافع", "رسم خرائط المحيط", "رفع الراية"];

export function IntroLoader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const total = 2200;
    const loop = (t: number) => {
      const p = Math.min(100, ((t - t0) / total) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(loop);
      else { setLeaving(true); window.setTimeout(onDone, 520); }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  useEffect(() => {
    const fire = () => { if (started.current) return; started.current = true; playSfx("intro", 0.9); };
    fire();
    window.addEventListener("pointerdown", fire, { once: true });
    return () => window.removeEventListener("pointerdown", fire);
  }, []);

  const stage = Math.min(STAGES.length - 1, Math.floor((progress / 100) * STAGES.length));

  return (
    <div className={`tos-intro ${leaving ? "out" : ""}`} role="status" aria-live="polite" aria-label="جاري تحميل اللعبة">
      <img src={introArt} alt="عرش ذهبي يرتفع من بحر عاصف" width={1088} height={1920} className="tos-intro-art" />
      <div className="tos-intro-rays" aria-hidden="true" />
      <div className="tos-intro-top" dir="rtl">
        <span className="tos-intro-badge">الموسم الأول</span>
        <h1 className="tos-intro-title"><span>عرش</span><b>البحار</b></h1>
        <p>من يحكم الموج… يحكم العالم</p>
      </div>
      <div className="tos-intro-bottom" dir="rtl">
        <ol className="tos-intro-steps" aria-hidden="true">
          {STAGES.map((s, i) => <li key={s} className={i < stage ? "done" : i === stage ? "now" : ""}>{s}</li>)}
        </ol>
        <div className="tos-intro-ring" style={{ "--p": `${progress * 3.6}deg` } as React.CSSProperties}>
          <span>{Math.round(progress)}</span>
        </div>
      </div>
    </div>
  );
}
