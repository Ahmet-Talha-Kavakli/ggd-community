"use client";

import { useActionState } from "react";
import {
  CheckCircle,
  WarningCircle,
  Spinner,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { setNewPasswordAction } from "@/lib/actions/profile";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(
    setNewPasswordAction,
    INITIAL_ADMIN_STATE,
  );

  if (state.ok) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-sm text-brand-800 flex items-start gap-2">
        <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-brand-600" />
        <div>
          <p className="font-medium">{state.message}</p>
          <p className="mt-1 text-xs">
            Artık yeni şifrenle giriş yapabilirsin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="new_password">Yeni şifre</Label>
        <Input
          id="new_password"
          name="new_password"
          type="password"
          placeholder="En az 8 karakter"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.new_password && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.new_password}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="confirm_password">Tekrar yaz</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.confirm_password && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.confirm_password}
          </p>
        )}
      </div>

      {state.error && (
        <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
          <WarningCircle size={16} weight="duotone" className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Spinner size={16} className="animate-spin" />
            Güncelleniyor...
          </>
        ) : (
          "Şifreyi Belirle"
        )}
      </Button>
    </form>
  );
}
