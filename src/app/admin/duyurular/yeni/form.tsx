"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createAnnouncementAction } from "@/lib/actions/admin";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

export function AnnouncementForm() {
  const [state, action, pending] = useActionState(
    createAnnouncementAction,
    INITIAL_ADMIN_STATE,
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="title">Başlık</Label>
        <Input
          id="title"
          name="title"
          placeholder="Kısa ve net bir başlık"
          required
          maxLength={160}
        />
        {state.fieldErrors?.title && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_140px]">
        <div>
          <Label htmlFor="tag">Etiket</Label>
          <Input
            id="tag"
            name="tag"
            defaultValue="genel"
            placeholder="genel, etkinlik, kural, sistem"
            maxLength={32}
          />
        </div>
        <div>
          <Label className="mb-2 block">&nbsp;</Label>
          <label className="flex items-center gap-2 h-11 px-4 rounded-xl border border-ink-200 cursor-pointer hover:bg-ink-50">
            <input
              type="checkbox"
              name="pinned"
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-ink-700">Sabitle</span>
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="body">İçerik</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="Detay yaz..."
          required
          minLength={10}
          maxLength={4000}
          className="min-h-[200px]"
        />
        {state.fieldErrors?.body && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.body}
          </p>
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
            Yayınlanıyor...
          </>
        ) : (
          <>
            <Megaphone className="h-4 w-4" />
            Yayınla
          </>
        )}
      </Button>
    </form>
  );
}
