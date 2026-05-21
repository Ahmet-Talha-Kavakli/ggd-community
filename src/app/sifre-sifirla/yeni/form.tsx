"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/react/legacy";
import { AlertCircle, Loader2, CheckCircle2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function NewPasswordForm() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;

    if (code.trim().length < 4) {
      setError("Email'den gelen kodu yaz.");
      return;
    }
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setError("");
    setPending(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      } else if (result.status === "needs_second_factor") {
        setError(
          "Hesabın 2FA korumalı — Clerk Account Portal'dan tamamla.",
        );
      } else {
        setError("Şifre güncellenemedi. Lütfen tekrar dene.");
      }
    } catch (err: unknown) {
      const e = err as { errors?: { message: string; code?: string }[] };
      const errCode = e.errors?.[0]?.code;
      if (errCode === "form_code_incorrect") {
        setError("Kod yanlış veya süresi dolmuş.");
      } else if (errCode === "form_password_pwned") {
        setError("Bu şifre güvensiz, başka bir şifre seç.");
      } else if (errCode === "form_password_length_too_short") {
        setError("Şifre çok kısa, en az 8 karakter olmalı.");
      } else {
        setError(
          e.errors?.[0]?.message ?? "Bir hata oluştu, tekrar dene.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-sm text-brand-800 flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-brand-600" />
        <div>
          <p className="font-medium">Şifren güncellendi 🎉</p>
          <p className="mt-1 text-xs">Anasayfaya yönlendiriliyorsun…</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="code">Email&apos;den gelen 6 haneli kod</Label>
        <Input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="new_password">Yeni şifre</Label>
        <Input
          id="new_password"
          name="new_password"
          type="password"
          placeholder="En az 8 karakter"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="confirm">Tekrar yaz</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={!isLoaded || pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Güncelleniyor…
          </>
        ) : (
          <>
            <Key className="h-4 w-4" />
            Şifreyi Belirle
          </>
        )}
      </Button>
    </form>
  );
}
