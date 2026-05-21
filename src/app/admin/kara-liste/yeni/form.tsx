"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { TagSelector } from "@/components/ui/tag-selector";
import { EvidenceUpload } from "@/components/admin/evidence-upload";
import { createBanAction } from "@/lib/actions/admin";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";
import { tagsForScope } from "@/lib/preset-tags";

const BAN_TAGS = tagsForScope("ban");

export function BanForm({
  defaultGgd = "",
  defaultNick = "",
}: {
  defaultGgd?: string;
  defaultNick?: string;
}) {
  const [state, action, pending] = useActionState(
    createBanAction,
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
          {state.fieldErrors?.target_nickname && (
            <p className="mt-1.5 text-xs text-danger-600">
              {state.fieldErrors.target_nickname}
            </p>
          )}
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
        {state.fieldErrors?.ggd_user_id && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.ggd_user_id}
          </p>
        )}
        <p className="mt-1.5 text-xs text-ink-500">
          Kalıcı kimlik. Elinde yoksa boş bırak — nick + ana isim yeterli.
        </p>
      </div>

      <div>
        <Label htmlFor="duration">Süre</Label>
        <select
          id="duration"
          name="duration"
          defaultValue="permanent"
          className="flex h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="7d">7 gün</option>
          <option value="30d">30 gün</option>
          <option value="90d">90 gün</option>
          <option value="permanent">Kalıcı</option>
        </select>
      </div>

      <TagSelector
        name="reason_tags"
        tags={BAN_TAGS}
        label="Ban sebebi etiketleri"
        description="En sık ban sebepleri. İstediğin kadar seçebilirsin."
      />

      <div>
        <Label htmlFor="reason">Ek açıklama (opsiyonel)</Label>
        <Textarea
          id="reason"
          name="reason"
          placeholder="Etiketler yeterli değilse buraya net ve kanıta dayalı detay yaz"
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
            Banlanıyor...
          </>
        ) : (
          <>
            <ShieldOff className="h-4 w-4" />
            Banla
          </>
        )}
      </Button>
    </form>
  );
}
