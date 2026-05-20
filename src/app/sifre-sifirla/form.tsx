"use client";

import { useActionState } from "react";
import {
  CheckCircle,
  WarningCircle,
  Spinner,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestPasswordResetAction } from "@/lib/actions/profile";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    INITIAL_ADMIN_STATE,
  );

  if (state.ok) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-sm text-brand-800 flex items-start gap-2">
        <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-brand-600" />
        <span>{state.message}</span>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ornek@email.com"
          autoComplete="email"
          required
        />
        {state.fieldErrors?.email && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.email}
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
            Gönderiliyor...
          </>
        ) : (
          <>
            <PaperPlaneTilt size={16} weight="bold" />
            Sıfırlama Bağlantısı Gönder
          </>
        )}
      </Button>
    </form>
  );
}
