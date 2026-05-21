"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Loader2, Save, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  createEventAction,
  updateEventAction,
} from "@/lib/actions/events";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

type EventFormDefaults = {
  id?: number;
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  starts_at?: string;
  ends_at?: string | null;
  prize?: string | null;
  max_participants?: number | null;
  poll_options?: string[];
};

// ISO timestamp → datetime-local input formatı (YYYY-MM-DDTHH:mm)
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function EventForm({
  mode,
  defaults = {},
}: {
  mode: "create" | "edit";
  defaults?: EventFormDefaults;
}) {
  const action = mode === "edit" ? updateEventAction : createEventAction;
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_ADMIN_STATE,
  );

  const [eventType, setEventType] = useState<string>(defaults.type ?? "raffle");
  const [pollOptions, setPollOptions] = useState<string[]>(
    defaults.poll_options && defaults.poll_options.length > 0
      ? defaults.poll_options
      : ["", ""],
  );

  function updateOption(i: number, value: string) {
    setPollOptions((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }
  function addOption() {
    if (pollOptions.length < 8) setPollOptions((prev) => [...prev, ""]);
  }
  function removeOption(i: number) {
    if (pollOptions.length > 2)
      setPollOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  const selectClass =
    "flex h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mode === "edit" && defaults.id != null && (
        <input type="hidden" name="id" value={defaults.id} />
      )}

      <div>
        <Label htmlFor="title">Başlık</Label>
        <Input
          id="title"
          name="title"
          placeholder="örn. Mayıs Steam Çekilişi"
          defaultValue={defaults.title ?? ""}
          required
          maxLength={160}
        />
        {state.fieldErrors?.title && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Etkinliğin detayları — nasıl katılınır, kurallar, tarih, ödül vs."
          defaultValue={defaults.description ?? ""}
          required
          minLength={10}
          maxLength={4000}
        />
        {state.fieldErrors?.description && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.description}
          </p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="type">Tür</Label>
          <select
            id="type"
            name="type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className={selectClass}
          >
            <option value="raffle">Çekiliş</option>
            <option value="tournament">Turnuva</option>
            <option value="community">Topluluk buluşması</option>
            <option value="poll">Anket</option>
            <option value="other">Diğer</option>
          </select>
        </div>
        <div>
          <Label htmlFor="status">Durum</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaults.status ?? "draft"}
            className={selectClass}
          >
            <option value="draft">Taslak (yalnız adminler görür)</option>
            <option value="published">Yayında</option>
            <option value="ongoing">Devam ediyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="starts_at">Başlangıç tarihi</Label>
          <Input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            defaultValue={toLocalInput(defaults.starts_at)}
            required
          />
          {state.fieldErrors?.starts_at && (
            <p className="mt-1.5 text-xs text-danger-600">
              {state.fieldErrors.starts_at}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="ends_at">
            Bitiş tarihi{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <Input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={toLocalInput(defaults.ends_at)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="prize">
          Ödül <span className="text-ink-400 font-normal">(opsiyonel)</span>
        </Label>
        <Input
          id="prize"
          name="prize"
          placeholder="örn. 100₺ Steam kodu"
          defaultValue={defaults.prize ?? ""}
          maxLength={240}
        />
        <p className="mt-1.5 text-xs text-ink-500">
          Çekiliş için ödülü kısaca yaz — detay açıklamada.
        </p>
      </div>

      <div>
        <Label htmlFor="max_participants">
          Maks. katılımcı{" "}
          <span className="text-ink-400 font-normal">(opsiyonel)</span>
        </Label>
        <Input
          id="max_participants"
          name="max_participants"
          type="number"
          min={1}
          placeholder="Sınırsızsa boş bırak"
          defaultValue={defaults.max_participants ?? ""}
          className="font-mono"
        />
      </div>

      {eventType === "poll" && (
        <div className="rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-base">Anket seçenekleri</Label>
              <p className="text-xs text-ink-500 mt-0.5">
                En az 2, en fazla 8 seçenek. Üyeler birini seçer.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={pollOptions.length >= 8}
            >
              <Plus className="h-3 w-3" />
              Ekle
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-xs font-bold text-ink-400 w-5 text-center">
                  {i + 1}.
                </span>
                <Input
                  name="poll_option"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Seçenek ${i + 1}`}
                  maxLength={120}
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="text-ink-400 hover:text-danger-600 transition-colors p-2"
                    aria-label="Sil"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {state.error && (
        <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state.ok && state.message && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 flex items-start gap-2">
          <Check className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {mode === "edit" ? "Kaydediliyor..." : "Oluşturuluyor..."}
          </>
        ) : (
          <>
            {mode === "edit" ? (
              <Save className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {mode === "edit" ? "Değişiklikleri kaydet" : "Etkinliği oluştur"}
          </>
        )}
      </Button>
    </form>
  );
}
