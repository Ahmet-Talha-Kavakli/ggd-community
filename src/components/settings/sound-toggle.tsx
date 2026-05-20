"use client";

import { useEffect, useState } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import {
  isSoundEnabled,
  setSoundEnabled,
  playClick,
  playPop,
  playTap,
  playThud,
  playSuccess,
  playError,
  playToggleOn,
  playToggleOff,
  playNotify,
} from "@/lib/sounds";

type Preview = {
  label: string;
  fn: () => void;
};

const PREVIEWS: Preview[] = [
  { label: "Click", fn: playClick },
  { label: "Pop", fn: playPop },
  { label: "Tap", fn: playTap },
  { label: "Thud", fn: playThud },
  { label: "Başarı", fn: playSuccess },
  { label: "Hata", fn: playError },
  { label: "Bildirim", fn: playNotify },
];

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnabled(isSoundEnabled());
    setMounted(true);
  }, []);

  function toggle() {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
    if (next) playToggleOn();
    else playToggleOff();
  }

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-ink-200 p-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-500">
          <SpeakerSlash size={20} weight="duotone" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-ink-900 text-sm">Ses efektleri</p>
          <p className="text-xs text-ink-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-ink-200 p-4 flex items-center gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            enabled
              ? "bg-brand-50 text-brand-700"
              : "bg-ink-100 text-ink-500"
          }`}
        >
          {enabled ? (
            <SpeakerHigh size={20} weight="duotone" />
          ) : (
            <SpeakerSlash size={20} weight="duotone" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-ink-900 text-sm">Ses efektleri</p>
          <p className="text-xs text-ink-500">
            Butonlara dokunmatik geri bildirim sesi ekler. Default kapalıdır.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={toggle}
          data-sound="off"
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
            enabled ? "bg-brand-500" : "bg-ink-300"
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="rounded-2xl border border-ink-200 p-4">
          <p className="text-xs font-medium text-ink-600 uppercase tracking-wider mb-3">
            Ses paleti — dinlemek için tıkla
          </p>
          <div className="flex flex-wrap gap-2">
            {PREVIEWS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={p.fn}
                data-sound="off"
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-ink-200 bg-white text-ink-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-500 leading-relaxed">
            Site içinde her buton tipine farklı bir ses çalar:{" "}
            <span className="font-medium">Pop</span> birincil aksiyonlarda,{" "}
            <span className="font-medium">Tap</span> linklerde,{" "}
            <span className="font-medium">Thud</span> tehlikeli butonlarda,{" "}
            <span className="font-medium">Click</span> diğer her yerde.
          </p>
        </div>
      )}
    </div>
  );
}
