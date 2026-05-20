"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { submitSupportAction } from "@/lib/actions/support";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

export function SupportForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(
    submitSupportAction,
    INITIAL_ADMIN_STATE,
  );

  if (state.ok) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-semibold text-ink-900">
          Mesajın alındı
        </h3>
        <p className="mt-2 text-sm text-ink-500 max-w-sm mx-auto">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {!defaultEmail && (
        <div>
          <Label htmlFor="contact_email">Email (cevap için)</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            placeholder="ornek@email.com"
          />
        </div>
      )}
      <div>
        <Label htmlFor="subject">Konu</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="Konuyu özetle..."
          required
        />
        {state.fieldErrors?.subject && (
          <p className="mt-1.5 text-xs text-danger-600">
            {state.fieldErrors.subject}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="body">Mesaj</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="Detaylı anlat..."
          required
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
            Gönderiliyor...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Gönder
          </>
        )}
      </Button>
    </form>
  );
}
