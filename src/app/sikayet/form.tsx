"use client";

import { useActionState, useRef, useState } from "react";
import {
  Upload,
  AlertCircle,
  Loader2,
  Send,
  X,
  FileImage,
  FileVideo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { createReportAction } from "@/lib/actions/report";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

export function ReportForm() {
  const [state, action, pending] = useActionState(
    createReportAction,
    INITIAL_ADMIN_STATE,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...list].slice(0, 5));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="target_nickname">Oyuncunun oyun içi nick&apos;i</Label>
        <Input
          id="target_nickname"
          name="target_nickname"
          placeholder="örn. ToxicHonk99"
          required
        />
        <p className="mt-1.5 text-xs text-ink-500">
          Lobide gördüğün isim. Yönetim için en önemli bilgi bu.
        </p>
        {state.fieldErrors?.target_nickname && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.target_nickname}
          </p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="target_main_name">
            GGD ana ismi{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <Input
            id="target_main_name"
            name="target_main_name"
            placeholder="Biliyorsan yaz"
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Hesap-seviyesi sabit ismi
          </p>
        </div>
        <div>
          <Label htmlFor="target_ggd_user_id">
            Friend Code / User ID{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <Input
            id="target_ggd_user_id"
            name="target_ggd_user_id"
            placeholder="Biliyorsan yaz"
            className="font-mono"
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Genelde bilemezsin — sorun değil
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="category">Şikayet kategorisi</Label>
        <select
          id="category"
          name="category"
          defaultValue="insult"
          required
          className="flex h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="insult">Hakaret / küfür</option>
          <option value="sabotage">Takım sabotajı</option>
          <option value="cheat">Hile / cheat</option>
          <option value="spam">Spam / reklam</option>
          <option value="stream_sniping">Stream sniping</option>
          <option value="other">Diğer</option>
        </select>
      </div>

      <div>
        <Label htmlFor="description">Olayı anlat</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Detayları yaz — tarih, lobi, ne oldu... En az 20 karakter."
          minLength={20}
          maxLength={2000}
          required
        />
        {state.fieldErrors?.description && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.description}
          </p>
        )}
      </div>

      <div>
        <Label>Kanıt (opsiyonel, foto/video, max 5 dosya)</Label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-ink-200 p-6 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
        >
          <Upload className="h-6 w-6 text-ink-400 mx-auto" />
          <p className="mt-2 text-sm font-medium text-ink-700">
            Dosya seç veya buraya tıkla
          </p>
          <p className="text-xs text-ink-500">
            JPG, PNG, WEBP, MP4, WEBM — max 50MB / dosya
          </p>
        </button>
        <input
          ref={fileRef}
          type="file"
          name="evidence"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={onFileSelect}
        />

        {files.length > 0 && (
          <ul className="mt-3 grid gap-2">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-ink-200 px-4 py-2.5"
              >
                {f.type.startsWith("video/") ? (
                  <FileVideo className="h-4 w-4 text-ink-500 shrink-0" />
                ) : (
                  <FileImage className="h-4 w-4 text-ink-500 shrink-0" />
                )}
                <span className="text-sm text-ink-700 truncate flex-1">
                  {f.name}
                </span>
                <span className="text-xs text-ink-400 whitespace-nowrap">
                  {(f.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label="Kaldır"
                  className="text-ink-400 hover:text-danger-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
            Şikayeti Gönder
          </>
        )}
      </Button>
    </form>
  );
}
