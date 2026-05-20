"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  createPlayerAction,
  updatePlayerAction,
} from "@/lib/actions/players";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

type PlayerFormDefaults = {
  id?: string;
  ggd_user_id?: string;
  nickname?: string;
  main_name?: string | null;
  keyword?: string | null;
  level?: number | null;
  notes?: string | null;
};

export function PlayerForm({
  mode,
  defaults = {},
}: {
  mode: "create" | "edit";
  defaults?: PlayerFormDefaults;
}) {
  const action = mode === "edit" ? updatePlayerAction : createPlayerAction;
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_ADMIN_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {mode === "edit" && defaults.id && (
        <input type="hidden" name="id" value={defaults.id} />
      )}

      <div>
        <Label htmlFor="ggd_user_id">GGD Friend Code / User ID</Label>
        <Input
          id="ggd_user_id"
          name="ggd_user_id"
          placeholder="örn. 123456789"
          defaultValue={defaults.ggd_user_id ?? ""}
          className="font-mono"
          required
        />
        {state.fieldErrors?.ggd_user_id && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.ggd_user_id}
          </p>
        )}
        <p className="mt-1.5 text-xs text-ink-500">
          Oyuncunun kalıcı kimliği. Lobiye geldiğinde sor — User ID olmadan
          oyuncu kaydı tutamayız.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="nickname">Oyun içi nick</Label>
          <Input
            id="nickname"
            name="nickname"
            placeholder="Lobide kullandığı nick"
            defaultValue={defaults.nickname ?? ""}
            required
          />
          {state.fieldErrors?.nickname && (
            <p className="mt-1.5 text-xs text-danger-600">
              {state.fieldErrors.nickname}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="main_name">
            GGD ana ismi{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <Input
            id="main_name"
            name="main_name"
            placeholder="Hesap-seviyesi ismi"
            defaultValue={defaults.main_name ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="keyword">
            Anahtar kelime{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <Input
            id="keyword"
            name="keyword"
            placeholder="Oyuncunun seçtiği kelime"
            defaultValue={defaults.keyword ?? ""}
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Tekrar geldiğinde doğrulama için
          </p>
        </div>
        <div>
          <Label htmlFor="level">
            GGD Level{" "}
            <span className="text-ink-400 font-normal">(opsiyonel)</span>
          </Label>
          <Input
            id="level"
            name="level"
            type="number"
            min={0}
            max={9999}
            placeholder="0-9999"
            defaultValue={defaults.level ?? ""}
            className="font-mono"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">
          Admin notu{" "}
          <span className="text-ink-400 font-normal">(opsiyonel)</span>
        </Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Bu oyuncu hakkında hatırlamak istediğin notlar — sadece adminler görür"
          defaultValue={defaults.notes ?? ""}
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
          <Check className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {mode === "edit" ? "Kaydediliyor..." : "Ekleniyor..."}
          </>
        ) : (
          <>
            {mode === "edit" ? (
              <Check className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {mode === "edit" ? "Değişiklikleri kaydet" : "Oyuncuyu ekle"}
          </>
        )}
      </Button>
    </form>
  );
}
