"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { updateRoomCodeAction } from "@/lib/actions/admin";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";
import { GGD_MAPS, GGD_MODES } from "@/lib/ggd-presets";

export function OdaKoduForm({
  initialCode,
  initialNote,
  initialMap,
  initialMode,
}: {
  initialCode: string;
  initialNote: string;
  initialMap: string;
  initialMode: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateRoomCodeAction,
    INITIAL_ADMIN_STATE,
  );

  const selectClass =
    "flex h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="code">Oda Kodu</Label>
        <Input
          id="code"
          name="code"
          defaultValue={initialCode}
          placeholder="örn. ABC123 (boş bırakırsan lobi kapanır)"
          maxLength={16}
          className="font-mono tracking-[0.2em] uppercase text-lg"
          autoComplete="off"
          aria-invalid={!!state.fieldErrors?.code}
        />
        {state.fieldErrors?.code && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.code}
          </p>
        )}
        <p className="mt-1.5 text-xs text-ink-500">
          Sadece harf, rakam ve tire. En fazla 16 karakter.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="map">
            Harita{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <select
            id="map"
            name="map"
            defaultValue={initialMap}
            className={selectClass}
          >
            <option value="">— Belirtilmedi —</option>
            {GGD_MAPS.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.map && (
            <p className="mt-1.5 text-xs text-danger-600">
              {state.fieldErrors.map}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="mode">
            Maç türü{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <select
            id="mode"
            name="mode"
            defaultValue={initialMode}
            className={selectClass}
          >
            <option value="">— Belirtilmedi —</option>
            {GGD_MODES.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.mode && (
            <p className="mt-1.5 text-xs text-danger-600">
              {state.fieldErrors.mode}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="note">Not (opsiyonel)</Label>
        <Textarea
          id="note"
          name="note"
          defaultValue={initialNote}
          placeholder="örn. 21:00'de başlıyoruz, sesli oda Discord'da"
          maxLength={200}
        />
      </div>

      {state.error && (
        <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state.ok && state.message && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Kaydediliyor...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Kaydet
          </>
        )}
      </Button>
    </form>
  );
}
