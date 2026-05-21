"use client";

import { useState } from "react";
import { Paperclip, X } from "lucide-react";
import { Label } from "@/components/ui/input";

// Admin formlarinda kullanilan dosya yukleme — ban, warning, red zone icin
// ortak. Form action submit edildiginde 'evidence' name'li input ile gonderir.
// Server-side action File[] olarak okur, admin-evidence bucket'ina yukler.

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 50;

export function EvidenceUpload({ label = "Kanıt (foto/video)" }: { label?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setError(null);
    const merged = [...files, ...selected].slice(0, MAX_FILES);
    for (const f of merged) {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`${f.name} ${MAX_FILE_SIZE_MB}MB'tan büyük.`);
        return;
      }
    }
    setFiles(merged);
    e.target.value = "";
  }

  function removeAt(i: number) {
    setFiles(files.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <Label htmlFor="evidence-input">
        {label}{" "}
        <span className="font-normal text-ink-400">
          (opsiyonel · en fazla {MAX_FILES} dosya · max {MAX_FILE_SIZE_MB}MB)
        </span>
      </Label>
      <label
        htmlFor="evidence-input"
        className="mt-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-dashed border-ink-300 bg-ink-50/40 hover:border-brand-400 hover:bg-brand-50/40 cursor-pointer transition-colors text-sm text-ink-600"
      >
        <Paperclip className="h-4 w-4" />
        <span>Foto / video seç (JPG, PNG, WEBP, MP4, WEBM)</span>
      </label>
      <input
        id="evidence-input"
        name="evidence"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        onChange={handleChange}
        className="hidden"
      />
      {files.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li
              key={i}
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
