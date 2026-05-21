"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "@phosphor-icons/react";

const STORAGE_KEY = "goosecage:cookie-consent:v1";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // SSR/CSR uyumsuzlugu olmasin diye client-side mount sonrasi karar ver
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setShow(true);
    } catch {
      // localStorage erisilemiyorsa banner gosterme (private mode vb.)
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ accepted: true, at: new Date().toISOString() }),
      );
    } catch {
      // private mode — yine de banner'i kapat (oturum bazli)
    }
    setShow(false);
  }

  function dismiss() {
    // "X" sadece banner'i kapatir, kabul kaydetmez. Sonra tekrar gosterilir.
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] pb-4 px-4 pointer-events-none">
      <div className="mx-auto max-w-2xl pointer-events-auto">
        <div className="relative bg-white/95 backdrop-blur border border-brand-200 rounded-2xl shadow-float p-5 md:p-6 animate-fade-up">
          <button
            onClick={dismiss}
            aria-label="Kapat"
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X size={14} weight="bold" />
          </button>
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 shrink-0">
              <Cookie size={20} weight="duotone" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-sm font-semibold text-ink-900">
                Çerez kullanıyoruz 🍪
              </p>
              <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                GooseCage; oturum açma, güvenlik ve site deneyimini iyileştirme
                amacıyla zorunlu çerezler kullanır. Devam ederek kullanımını
                kabul etmiş olursun.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={accept}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Tamam, anladım
                </button>
                <a
                  href="/kurallar#cerez"
                  className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-100 transition-colors"
                >
                  Detaylı bilgi
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
