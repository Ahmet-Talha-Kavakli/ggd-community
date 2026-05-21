"use client";

import { useEffect, useState } from "react";
import { X, ArrowLeft, ArrowRight, Download } from "lucide-react";

// Kanit gorselleri grid + lightbox popup.
// Tiklayinca tarayicida yeni sekme yerine sayfa icinde modal acilir.
// Sol/sag oklarla galeri gezilir, ESC ile kapanir.

type EvidenceItem = {
  id: number;
  url: string | null;
  media_type: "image" | "video" | "audio";
};

export function EvidenceGrid({ items }: { items: EvidenceItem[] }) {
  const valid = items.filter((e): e is EvidenceItem & { url: string } => !!e.url);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // Lightbox sadece image/video icin (audio inline calar)
  const visualItems = valid.filter((e) => e.media_type !== "audio");

  useEffect(() => {
    if (openIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIdx(null);
      if (e.key === "ArrowLeft")
        setOpenIdx((i) =>
          i === null
            ? null
            : (i - 1 + visualItems.length) % visualItems.length,
        );
      if (e.key === "ArrowRight")
        setOpenIdx((i) => (i === null ? null : (i + 1) % visualItems.length));
    }
    document.addEventListener("keydown", onKey);
    // Modal acikken arka plan scroll'u kilitle
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIdx, visualItems.length]);

  if (valid.length === 0) return null;

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {valid.map((e) => {
          if (e.media_type === "audio") {
            return (
              <div
                key={e.id}
                className="relative h-12 w-56 rounded-lg overflow-hidden border border-ink-200 bg-ink-50 flex items-center px-2 gap-2"
              >
                <span className="text-[10px] font-bold uppercase text-ink-500 shrink-0">
                  Ses
                </span>
                <audio
                  src={e.url}
                  controls
                  preload="metadata"
                  className="h-9 flex-1 min-w-0"
                />
              </div>
            );
          }
          const visualIdx = visualItems.findIndex((v) => v.id === e.id);
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setOpenIdx(visualIdx)}
              className="relative block h-20 w-20 rounded-lg overflow-hidden border border-ink-200 bg-ink-50 hover:border-brand-400 hover:ring-2 hover:ring-brand-500/20 transition-all cursor-zoom-in"
              title={e.media_type === "video" ? "Video kanıtı" : "Foto kanıtı"}
            >
              {e.media_type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.url}
                  alt="Kanıt"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <video
                  src={e.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              )}
              {e.media_type === "video" && (
                <span className="absolute bottom-1 right-1 text-[10px] font-bold uppercase bg-black/60 text-white px-1.5 py-0.5 rounded">
                  VID
                </span>
              )}
            </button>
          );
        })}
      </div>

      {openIdx !== null && visualItems[openIdx] && (
        <Lightbox
          item={visualItems[openIdx]}
          total={visualItems.length}
          index={openIdx}
          onClose={() => setOpenIdx(null)}
          onPrev={() =>
            setOpenIdx((openIdx - 1 + visualItems.length) % visualItems.length)
          }
          onNext={() => setOpenIdx((openIdx + 1) % visualItems.length)}
        />
      )}
    </>
  );
}

function Lightbox({
  item,
  total,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  item: EvidenceItem & { url: string };
  total: number;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Üst bar: kapat + indir */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          download
          onClick={(e) => e.stopPropagation()}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="İndir / yeni sekmede aç"
          title="İndir"
        >
          <Download className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Sayac */}
      <div className="absolute top-4 left-4 text-white/80 text-sm font-mono">
        {index + 1} / {total}
      </div>

      {/* Sol / sag oklar (birden fazla item varsa) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Önceki"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Sonraki"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Medya */}
      <div
        className="relative max-w-[92vw] max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {item.media_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt="Kanıt"
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <video
            src={item.url}
            controls
            autoPlay
            className="max-w-[92vw] max-h-[88vh] rounded-lg shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}
