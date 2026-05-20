"use client";

import { useEffect } from "react";
import { playClick, playPop, playTap, playThud } from "@/lib/sounds";

// Global tıklama ses efektleri. Layout'a bir kez mount edilir.
//
// Akıllı seçim:
//   data-sound="pop|tap|click|thud|off" → açık geçersiz kılma
//   .bg-danger-* (danger variant)       → thud
//   .bg-brand-* (primary variant)       → pop
//   <a> link                            → tap
//   diğer her buton                     → click (default)
//
// Disabled veya data-sound="off" işaretliyse pas geçer.

type Variant = "click" | "pop" | "tap" | "thud" | "off";

function pickSound(el: HTMLElement): Variant {
  const explicit = el.dataset.sound as Variant | undefined;
  if (explicit) return explicit;

  const cls = el.className?.toString?.() ?? "";
  if (cls.includes("bg-danger")) return "thud";
  if (cls.includes("bg-brand")) return "pop";
  if (el.tagName === "A") return "tap";
  return "click";
}

export function SoundEffects() {
  useEffect(() => {
    function handle(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest<HTMLElement>(
        "button, [role='button'], a[data-sound]",
      );
      if (!el) return;
      if (el.hasAttribute("disabled")) return;
      if (el.getAttribute("aria-disabled") === "true") return;

      const variant = pickSound(el);
      if (variant === "off") return;

      switch (variant) {
        case "pop":
          playPop();
          break;
        case "tap":
          playTap();
          break;
        case "thud":
          playThud();
          break;
        case "click":
        default:
          playClick();
      }
    }

    document.addEventListener("click", handle, true);
    return () => document.removeEventListener("click", handle, true);
  }, []);

  return null;
}
