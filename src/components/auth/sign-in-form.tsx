"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signInAction, signInWithGoogleAction } from "@/lib/actions/auth";
import { INITIAL_STATE } from "@/lib/actions/auth-types";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(
    signInAction,
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
          Google ile devam et
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
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="ornek@email.com"
            autoComplete="email"
            required
            aria-invalid={!!state.fieldErrors?.email}
          />
          {state.fieldErrors?.email && (
            <p className="mt-1.5 text-xs text-danger-600">
              {state.fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="password" className="mb-0">
              Şifre
            </Label>
            <Link
              href="/sifre-sifirla"
              className="text-xs text-brand-700 hover:text-brand-800"
            >
              Şifremi unuttum
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            aria-invalid={!!state.fieldErrors?.password}
          />
          {state.fieldErrors?.password && (
            <p className="mt-1.5 text-xs text-danger-600">
              {state.fieldErrors.password}
            </p>
          )}
        </div>

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
              Giriş yapılıyor...
            </>
          ) : (
            <>
              Giriş Yap
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </>
  );
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
