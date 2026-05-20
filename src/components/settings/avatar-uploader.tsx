"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { AlertCircle, Check, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteAvatarAction,
  uploadAvatarAction,
} from "@/lib/actions/avatar";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

export function AvatarUploader({
  currentUrl,
  nickname,
  hasUploaded,
}: {
  currentUrl: string;
  nickname: string;
  hasUploaded: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, action, pending] = useActionState(
    uploadAvatarAction,
    INITIAL_ADMIN_STATE,
  );

  function pickFile() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
      <div className="relative shrink-0">
        <Image
          src={preview ?? currentUrl}
          alt={nickname}
          width={96}
          height={96}
          className="h-24 w-24 rounded-2xl border border-ink-200 object-cover"
          unoptimized
        />
        {state.ok && (
          <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-white border-2 border-white">
            <Check className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-ink-900">Profil resmi</p>
        <p className="text-xs text-ink-500 mt-0.5">
          JPG, PNG veya WEBP — max 2MB. Yüklemezsen Gravatar kullanılır.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <form action={action} className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={pickFile}
              disabled={pending}
            >
              <Upload className="h-3.5 w-3.5" />
              Dosya seç
            </Button>
            <Button type="submit" size="sm" disabled={pending || !preview}>
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Yükleniyor
                </>
              ) : (
                "Kaydet"
              )}
            </Button>
          </form>
          {hasUploaded && (
            <form action={deleteAvatarAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-danger-600 hover:text-danger-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Kaldır
              </Button>
            </form>
          )}
        </div>

        {state.error && (
          <p className="mt-2 text-xs text-danger-600 inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {state.error}
          </p>
        )}
        {state.ok && state.message && (
          <p className="mt-2 text-xs text-brand-700 inline-flex items-center gap-1">
            <Check className="h-3 w-3" />
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
