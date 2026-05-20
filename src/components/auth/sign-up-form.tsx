"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signUpAction, signInWithGoogleAction } from "@/lib/actions/auth";
import { INITIAL_STATE } from "@/lib/actions/auth-types";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    INITIAL_STATE,
  );

  return (
    <>
      <form action={signInWithGoogleAction}>
        <Button
          type="submit"
          variant="outline"
          className="w-full mb-3"
        >
          <GoogleIcon />
          Google ile kayıt ol
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ink-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-ink-400 uppercase tracking-wider">
            veya email ile
          </span>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Field
          id="nickname"
          label="Site kullanıcı adın"
          placeholder="Topluluk içi nick"
          required
          error={state.fieldErrors?.nickname}
        />
        <Field
          id="email"
          type="email"
          label="Email"
          placeholder="ornek@email.com"
          autoComplete="email"
          required
          error={state.fieldErrors?.email}
        />
        <div>
          <Field
            id="ggd_main_name"
            label="GGD ana ismin"
            placeholder="Hesap-seviyesi ismin (Friend Code'la sabit)"
            required
            error={state.fieldErrors?.ggd_main_name}
            noWrapper
          />
          <p className="mt-1.5 text-xs text-ink-500 flex items-start gap-1.5">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            GGD&apos;de hesabınla birlikte gelen sabit isim — oyun içinde
            değiştirdiğin nick&apos;ten farklı
          </p>
        </div>
        <div>
          <Field
            id="ggd_user_id"
            label="GGD Friend Code / User ID"
            placeholder="örn. 123456789"
            required
            error={state.fieldErrors?.ggd_user_id}
            noWrapper
          />
          <p className="mt-1.5 text-xs text-ink-500 flex items-start gap-1.5">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            Oyun içi Settings → Account bölümünden öğrenebilirsin
          </p>
        </div>
        <div>
          <Field
            id="ggd_level"
            type="number"
            label="GGD Level (opsiyonel)"
            placeholder="örn. 42"
            error={state.fieldErrors?.ggd_level}
            noWrapper
          />
          <p className="mt-1.5 text-xs text-ink-500 flex items-start gap-1.5">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            Şu anki seviyen. İlerde ayarlardan güncelleyebilirsin.
          </p>
        </div>
        <Field
          id="password"
          type="password"
          label="Şifre"
          placeholder="En az 8 karakter"
          autoComplete="new-password"
          required
          error={state.fieldErrors?.password}
        />

        <label className="flex items-start gap-2.5 text-sm text-ink-600 cursor-pointer mt-1">
          <input
            type="checkbox"
            name="accept_rules"
            className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="leading-snug">
            <Link href="/kurallar" target="_blank" className="text-brand-700 hover:underline">
              Lobi kurallarını
            </Link>{" "}
            okudum ve kabul ediyorum.
          </span>
        </label>
        {state.fieldErrors?.accept_rules && (
          <p className="text-xs text-danger-600">
            {state.fieldErrors.accept_rules}
          </p>
        )}

        {state.error && (
          <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <Button type="submit" className="w-full mt-2" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Hesap oluşturuluyor...
            </>
          ) : (
            <>
              Kayıt Ol
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </>
  );
}

interface FieldProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  noWrapper?: boolean;
}

function Field({
  id,
  label,
  placeholder,
  type = "text",
  autoComplete,
  required,
  error,
  noWrapper,
}: FieldProps) {
  const content = (
    <>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={!!error}
      />
      {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
    </>
  );
  return noWrapper ? content : <div>{content}</div>;
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.1l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.3 0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

