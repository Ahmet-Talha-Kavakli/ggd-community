"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

// "Su an N kisi sitede" gostericisi — Supabase realtime presence kullanir.
// Her sayfa load olunca channel'a join eder, presence sync ile diger
// kullanicilarin sayisini cekeriz.
//
// "Topluluk canli" hissi icin gercek count'a TR saatine gore boost ekleriz:
//   - Gunduz (06:00-24:00)  → +31
//   - Gece  (00:00-06:00)  → +10
// Hesap her dakika yenilenir (saat degisimine duyarli olsun diye).

function getTrHour(): number {
  // TR saatine gore "0-23" arasi saat dondur (yaz/kis saati otomatik)
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const hourPart = parts.find((p) => p.type === "hour");
  const h = hourPart ? parseInt(hourPart.value, 10) : 12;
  return Number.isFinite(h) ? h : 12;
}

function getBoost(hour: number): number {
  // 00:00 - 05:59 → +10, diger saatler → +31
  return hour >= 0 && hour < 6 ? 10 : 31;
}

export function OnlineCounter() {
  const [realCount, setRealCount] = useState(0);
  const [boost, setBoost] = useState(() => getBoost(getTrHour()));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Saat degisimini her dakika kontrol et — saat dilim degisirse boost
    // otomatik guncellenir.
    const tick = () => setBoost(getBoost(getTrHour()));
    tick();
    const intervalId = window.setInterval(tick, 60_000);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return () => window.clearInterval(intervalId);

    const supabase = createBrowserClient(url, anonKey);
    const sessionId = crypto.randomUUID();

    const channel = supabase.channel("public:online", {
      config: { presence: { key: sessionId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setRealCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ joined_at: Date.now() });
        }
      });

    return () => {
      window.clearInterval(intervalId);
      channel.unsubscribe();
    };
  }, []);

  // SSR/hydration mismatch'i engellemek icin mount oncesi gizli
  if (!mounted) return null;

  const display = realCount + boost;

  return (
    <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 backdrop-blur px-3 py-1.5 text-xs font-semibold text-brand-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-75" />
        <span className="relative h-2 w-2 rounded-full bg-brand-500" />
      </span>
      <span className="tabular-nums">{display}</span>
      <span className="text-brand-600/80">çevrimiçi</span>
    </div>
  );
}
