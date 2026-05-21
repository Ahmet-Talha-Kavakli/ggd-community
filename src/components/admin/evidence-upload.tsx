"use client";

import { useRef, useState } from "react";
import {
  Paperclip,
  X,
  ImageSquare,
  MusicNotes,
} from "@phosphor-icons/react/dist/ssr";
import { Label } from "@/components/ui/input";

// Admin formlarinda kullanilan dosya yukleme — ban, warning, red zone icin
// ortak. Form action submit edildiginde 'evidence' name'li input ile gonderir.
// Server-side action File[] olarak okur, admin-evidence bucket'ina yukler.
//
// Visual / Audio ikiye bolundu. Ikisi de ayni name="evidence" — server
// formData.getAll("evidence") ile her ikisini de alir.
//
// KRITIK: input.files DataTransfer API ile state'le senkron tutulur.
// Aksi takdirde "input.value = ''" reset etmek dosyalari siler ve
// FormData submit'te bos kalir.

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 50;

type Variant = "visual" | "audio";

interface BoxProps {
  variant: Variant;
  label?: string;
  inputId: string;
}

function syncInputFiles(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  input.files = dt.files;
}

function EvidenceBox({ variant, label, inputId }: BoxProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept =
    variant === "visual"
      ? "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
      : "audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm,audio/x-m4a";

  const ctaText =
    variant === "visual"
      ? "Foto / video seç (JPG, PNG, MP4, WEBM)"
      : "Ses dosyası seç (MP3, OGG, WAV, M4A)";

  const Icon = variant === "visual" ? ImageSquare : MusicNotes;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setError(null);
    // Mevcut state'e ekle (replace degil) — kullanici parça parça secebilir
    const merged = [...files, ...selected].slice(0, MAX_FILES);
    for (const f of merged) {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`${f.name} ${MAX_FILE_SIZE_MB}MB'tan büyük.`);
        return;
      }
    }
    setFiles(merged);
    // ONEMLI: input.files'i DataTransfer ile yeniden set et — value=""
    // diyemeyiz (dosyalari siler), ama DataTransfer ile guncel state
    // hem render hem form submit icin senkron kalir.
    syncInputFiles(inputRef.current, merged);
  }

  function removeAt(i: number) {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    syncInputFiles(inputRef.current, next);
  }

  const accentClass =
    variant === "visual"
      ? "hover:border-brand-400 hover:bg-brand-50/40"
      : "hover:border-warning-400 hover:bg-warning-50/40";

  const iconBgClass =
    variant === "visual"
      ? "bg-brand-50 text-brand-700"
      : "bg-warning-50 text-warning-700";

  return (
    <div>
      <Label htmlFor={inputId}>
        {label}{" "}
        <span className="font-normal text-ink-400">
          (opsiyonel · en fazla {MAX_FILES} dosya · max {MAX_FILE_SIZE_MB}MB)
        </span>
      </Label>
      <label
        htmlFor={inputId}
        className={`mt-1 flex items-center gap-3 h-14 px-4 rounded-xl border border-dashed border-ink-300 bg-ink-50/40 cursor-pointer transition-colors text-sm text-ink-600 ${accentClass}`}
      >
        <div
          className={`grid h-9 w-9 place-items-center rounded-lg ${iconBgClass} shrink-0`}
        >
          <Icon size={18} weight="duotone" />
        </div>
        <span className="flex-1">{ctaText}</span>
      </label>
      <input
        ref={inputRef}
        id={inputId}
        name="evidence"
        type="file"
        multiple
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {files.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ink-50 border border-ink-200 text-sm"
            >
              <Paperclip className="h-3.5 w-3.5 text-ink-500 shrink-0" />
              <span className="truncate text-ink-700 flex-1">{f.name}</span>
              <span className="text-xs text-ink-400 shrink-0">
                {(f.size / 1024 / 1024).toFixed(1)}MB
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="text-ink-400 hover:text-danger-600 transition-colors"
                aria-label="Kaldır"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
    </div>
  );
}

export function EvidenceUpload(_props?: { label?: string }) {
  void _props;
  return (
    <div className="flex flex-col gap-4">
      <EvidenceBox
        variant="visual"
        label="Foto / video kanıtı"
        inputId="evidence-visual"
      />
      <EvidenceBox
        variant="audio"
        label="Ses kanıtı"
        inputId="evidence-audio"
      />
    </div>
  );
}
