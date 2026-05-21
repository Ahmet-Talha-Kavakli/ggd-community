"use client";

import { useActionState, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
  Paperclip,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { submitSupportAction } from "@/lib/actions/support";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";
import type { SupportCategory } from "@/lib/supabase/types";

const CATEGORY_OPTIONS: { value: SupportCategory; label: string; desc: string }[] = [
  {
    value: "ban_appeal",
    label: "Ban itirazı",
    desc: "Hakkımda ban verildi, itiraz etmek istiyorum",
  },
  {
    value: "account_approval",
    label: "Hesap onayı",
    desc: "GGD User ID doğrulamam bekliyor",
  },
  {
    value: "account_issue",
    label: "Hesap sorunu",
    desc: "Giriş, şifre, profil veya hesap silme",
  },
  {
    value: "bug_report",
    label: "Hata bildirimi",
    desc: "Sitede bir bug / sorun buldum",
  },
  {
    value: "general",
    label: "Genel soru / diğer",
    desc: "Diğer konular",
  },
];

const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 20;

export function SupportForm({
  defaultEmail,
  canAttach,
}: {
  defaultEmail?: string;
  canAttach: boolean;
}) {
  const [state, action, pending] = useActionState(
    submitSupportAction,
    INITIAL_ADMIN_STATE,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Input.files'i state ile senkron tutar — DataTransfer ile yeniden yaz.
  // Aksi takdirde "input.value = ''" dosyalari siler ve FormData'da bos kalir.
  function syncInput(next: File[]) {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    for (const f of next) dt.items.add(f);
    fileInputRef.current.files = dt.files;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFileError(null);
    const merged = [...files, ...selected].slice(0, MAX_FILES);
    for (const f of merged) {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`${f.name} ${MAX_FILE_SIZE_MB}MB'tan büyük.`);
        return;
      }
    }
    setFiles(merged);
    syncInput(merged);
  }

  function removeFile(idx: number) {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    syncInput(next);
  }

  if (state.ok) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-semibold text-ink-900">Mesajın alındı</h3>
        <p className="mt-2 text-sm text-ink-500 max-w-sm mx-auto">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {!defaultEmail && (
        <div>
          <Label htmlFor="contact_email">Email (cevap için)</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            placeholder="ornek@email.com"
          />
        </div>
      )}

      <div>
        <Label htmlFor="category">Konu</Label>
        <select
          id="category"
          name="category"
          defaultValue="general"
          required
          className="h-11 w-full px-3 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2371717a%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-position-[right_0.75rem_center] pr-9"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} — {opt.desc}
            </option>
          ))}
        </select>
        {state.fieldErrors?.category && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.category}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="subject">Başlık</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="Tek cümlede özetle..."
          required
        />
        {state.fieldErrors?.subject && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.subject}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="body">Mesaj</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="Detaylı anlat..."
          required
        />
        {state.fieldErrors?.body && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.body}
          </p>
        )}
      </div>

      {canAttach && (
        <div>
          <Label htmlFor="attachments">
            Dosya ekle{" "}
            <span className="font-normal text-ink-400">
              (opsiyonel · en fazla {MAX_FILES} dosya · max {MAX_FILE_SIZE_MB}MB)
            </span>
          </Label>
          <label
            htmlFor="attachments-input"
            className="mt-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-dashed border-ink-300 bg-ink-50/40 hover:border-brand-400 hover:bg-brand-50/40 cursor-pointer transition-colors text-sm text-ink-600"
          >
            <Paperclip className="h-4 w-4" />
            <span>Foto / video seç (JPG, PNG, WEBP, MP4, WEBM)</span>
          </label>
          <input
            ref={fileInputRef}
            id="attachments-input"
            name="attachments"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
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
                    onClick={() => removeFile(i)}
                    className="text-ink-400 hover:text-danger-600 transition-colors"
                    aria-label="Dosyayı kaldır"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Form submit'te bu input'tan dosyalar gonderilir. Yukaridaki gizli
              input gercek file input — files array sadece UI gosterimi icin.
              Form action() FormData kullandiginda hidden input direkt gider. */}
          {fileError && (
            <p className="mt-1.5 text-xs text-danger-600">{fileError}</p>
          )}
        </div>
      )}

      {state.error && (
        <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gönderiliyor...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Gönder
          </>
        )}
      </Button>
    </form>
  );
}
