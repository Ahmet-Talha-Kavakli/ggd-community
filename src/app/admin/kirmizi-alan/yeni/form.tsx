"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { EvidenceUpload } from "@/components/admin/evidence-upload";
import { createRedZoneAction } from "@/lib/actions/admin";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

export function RedZoneForm() {
  const [state, action, pending] = useActionState(
    createRedZoneAction,
    INITIAL_ADMIN_STATE,
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="nickname">Oyun içi nick</Label>
          <Input
            id="nickname"
            name="nickname"
            placeholder="Lobide görünen ismi"
            required
          />
          {state.fieldErrors?.nickname && (
            <p className="mt-1.5 text-xs text-danger-600">
              {state.fieldErrors.nickname}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="main_name">Ana isim (opsiyonel)</Label>
          <Input
            id="main_name"
            name="main_name"
            placeholder="GGD ana / Friend Code ismi"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <div>
          <Label htmlFor="ggd_user_id">
            GGD User ID{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <Input
            id="ggd_user_id"
            name="ggd_user_id"
            placeholder="Sadece rakam — örn. 123456789"
            inputMode="numeric"
            pattern="\d*"
            className="font-mono"
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Bilmiyorsan boş bırak.
          </p>
        </div>
        <div>
          <Label htmlFor="ggd_level">
            GGD Level{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <Input
            id="ggd_level"
            name="ggd_level"
            placeholder="örn. 87"
            type="number"
            min={1}
            max={9999}
            className="font-mono"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="aliases">
          Eski / diğer nick&apos;ler{" "}
          <span className="text-ink-400 font-normal">(opsiyonel)</span>
        </Label>
        <Input
          id="aliases"
          name="aliases"
          placeholder="Virgülle ayır — örn. ToxicHonk, TrolKaz"
        />
        <p className="mt-1.5 text-xs text-ink-500">
          Sorgulamada bu nick&apos;ler de eşleşir. En fazla 10 nick.
        </p>
      </div>

      <div>
        <Label htmlFor="reason">Kısa gerekçe</Label>
        <Input
          id="reason"
          name="reason"
          placeholder="Örn. Tekrarlı teaming, hile kullanımı, taciz"
          required
          maxLength={200}
        />
        {state.fieldErrors?.reason && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.reason}
          </p>
        )}
        <p className="mt-1.5 text-xs text-ink-500">
          Kartta vurgulu görünür — net ve kısa tut.
        </p>
      </div>

      <div>
        <Label htmlFor="description">Detaylı açıklama (opsiyonel)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Olayların detayı, kanıt açıklaması, geçmiş olaylar..."
          maxLength={2000}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="source">Kaynak (opsiyonel)</Label>
          <Input
            id="source"
            name="source"
            placeholder="Örn. GooseHub topluluğu, Discord ihbar"
            maxLength={80}
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Kartın üstünde küçük etiket olarak gözükür.
          </p>
        </div>
        <div>
          <Label htmlFor="evidence_url">Kanıt linki (opsiyonel)</Label>
          <Input
            id="evidence_url"
            name="evidence_url"
            placeholder="https://... veya boş bırak"
            type="url"
            maxLength={500}
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Harici link. Foto/video aşağıdan yükleyebilirsin.
          </p>
        </div>
      </div>

      <EvidenceUpload label="Kanıt yükle (foto/video)" />

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
            Ekleniyor...
          </>
        ) : (
          <>
            <Skull className="h-4 w-4" />
            Kırmızı Alana Ekle
          </>
        )}
      </Button>
    </form>
  );
}
