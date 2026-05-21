"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  DiscordLogo,
  YoutubeLogo,
  XLogo,
  InstagramLogo,
  TiktokLogo,
} from "@phosphor-icons/react/dist/ssr";

// Footer sosyal medya chip'leri — pasif (tiklanir ama hicbir yere gitmez).
// Goosecage'in gercek sosyal hesabi olmadan yanlis yere gitmesin.
// Client component cunku onClick var.

const SOCIAL: { name: string; color: string; icon: Icon }[] = [
  { name: "Discord", color: "#5865F2", icon: DiscordLogo },
  { name: "YouTube", color: "#FF0000", icon: YoutubeLogo },
  { name: "X", color: "#000000", icon: XLogo },
  { name: "Instagram", color: "#E4405F", icon: InstagramLogo },
  { name: "TikTok", color: "#000000", icon: TiktokLogo },
];

export function FooterSocials() {
  return (
    <div className="flex flex-wrap gap-2.5 justify-center mb-10 pb-8 border-b border-brand-200/40">
      {SOCIAL.map((s) => (
        <button
          type="button"
          key={s.name}
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ink-200 bg-white/70 backdrop-blur hover:bg-white hover:border-ink-300 hover:-translate-y-0.5 transition-all shadow-sm group cursor-pointer"
          aria-label={s.name}
        >
          <s.icon
            size={18}
            weight="fill"
            style={{ color: s.color }}
            className="transition-transform group-hover:scale-110"
          />
          <span className="text-sm font-medium text-ink-700">{s.name}</span>
        </button>
      ))}
    </div>
  );
}
