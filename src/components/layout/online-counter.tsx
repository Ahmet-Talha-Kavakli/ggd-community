"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

// "Su an N kisi sitede" gostericisi — Supabase realtime presence kullanir.
// Her sayfa load olunca channel'a join eder, presence sync ile diger
// kullanicilarin sayisini cekeriz. Tamamen gercek veri.
//
// Eger ENV yoksa veya realtime baglanamzazsa sessizce gizlenir (return null).

export function OnlineCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return;

    const supabase = createBrowserClient(url, anonKey);
    const sessionId = crypto.randomUUID();

    const channel = supabase.channel("public:online", {
      config: { presence: { key: sessionId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const totalUsers = Object.keys(state).length;
        setCount(totalUsers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ joined_at: Date.now() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  if (count === null || count < 1) return null;

  return (
    <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 backdrop-blur px-3 py-1.5 text-xs font-semibold text-brand-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-75" />
        <span className="relative h-2 w-2 rounded-full bg-brand-500" />
      </span>
      <span className="tabular-nums">{count}</span>
      <span className="text-brand-600/80">çevrimiçi</span>
    </div>
  );
}
