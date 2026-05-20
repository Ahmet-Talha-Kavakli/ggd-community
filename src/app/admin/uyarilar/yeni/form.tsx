"use client";

import { useActionState } from "react";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { TagSelector } from "@/components/ui/tag-selector";
import { createWarningAction } from "@/lib/actions/admin";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";
import { tagsForScope } from "@/lib/preset-tags";

const WARNING_TAGS = tagsForScope("warning");

export function WarningForm({
  defaultGgd = "",
  defaultNick = "",
}: {
  defaultGgd?: string;
  defaultNick?: string;
}) {
  const [state, action, pending] = useActionState(
    createWarningAction,
    INITIAL_ADMIN_STATE,
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="target_main_name">GGD ana ismi</Label>
          <Input
            id="target_main_name"
            name="target_main_name"
            placeholder="Hesap-seviyesi ismi"
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Friend Code&apos;la sabit isim
          </p>
        </div>
        <div>
          <Label htmlFor="target_nickname">Oyun içi nick</Label>
          <Input
            id="target_nickname"
            name="target_nickname"
            placeholder="Lobide kullandığı nick"
            defaultValue={defaultNick}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="ggd_user_id">
          GGD Friend Code / User ID{" "}
          <span className="text-ink-400 font-normal">(opsiyonel)</span>
        </Label>
        <Input
          id="ggd_user_id"
          name="ggd_user_id"
          placeholder="Elinde varsa gir — örn. 123456789"
          defaultValue={defaultGgd}
          className="font-mono"
        />
        <p className="mt-1.5 text-xs text-ink-500">
          Elinde yoksa boş bırak — nick yeterli.
        </p>
      </div>

      <div>
        <Label htmlFor="severity">Şiddet</Label>
        <select
          id="severity"
          name="severity"
          defaultValue="low"
          className="flex h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="low">Hafif</option>
          <option value="medium">Orta</option>
          <option value="high">Ağır</option>
        </select>
      </div>

      <TagSelector
        name="reason_tags"
        tags={WARNING_TAGS}
        label="Uyarı sebebi etiketleri"
        description="En sık uyarı sebepleri. İstediğin kadar seçebilirsin."
      />

      <div>
        <Label htmlFor="reason">Ek açıklama (opsiyonel)</Label>
        <Textarea
          id="reason"
          name="reason"
          placeholder="Etiketler yeterli değilse buraya detay yaz"
        />
        {state.fieldErrors?.reason && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.reason}
          </p>
        )}
        <p className="mt-1.5 text-xs text-ink-500">
          En az bir etiket seçmen veya açıklama yazman gerek.
        </p>
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
            Kaydediliyor...
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4" />
            Uyarı Ver
          </>
        )}
      </Button>
    </form>
  );
}
