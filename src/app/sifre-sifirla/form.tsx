"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/react/legacy";
import {
  AlertCircle,
  Loader2,
  Mail,
  CheckCircle2,
  Key,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { clerkErrorToTr } from "@/lib/clerk-errors";

type Step = "email" | "code" | "done";

export function ResetPasswordForm() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;
    setError("");
    setPending(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("code");
    } catch (err) {
      setError(clerkErrorToTr(err));
    } finally {
      setPending(false);
    }
  }

  async function handleCodeSubmit(e: FormEvent<HTMLFormElement>) {
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
        setStep("done");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      } else if (result.status === "needs_second_factor") {
        setError(
          "Hesabın 2FA korumalı — Clerk Account Portal'dan tamamlaman gerekiyor.",
        );
      } else {
        setError("Şifre güncellenemedi. Lütfen tekrar dene.");
      }
    } catch (err) {
      setError(clerkErrorToTr(err));
    } finally {
      setPending(false);
    }
  }

  if (step === "done") {
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

  if (step === "code") {
    return (
      <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-xs text-brand-800 flex items-start gap-2">
          <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            <strong>{email}</strong> adresine 6 haneli bir kod gönderildi.
            Gelen kutusunu kontrol et.
          </span>
        </div>

        <div>
          <Label htmlFor="code">Doğrulama kodu</Label>
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

        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setPassword("");
            setConfirm("");
            setError("");
          }}
          className="text-xs text-ink-500 hover:text-ink-700 inline-flex items-center gap-1 mx-auto"
        >
          <ArrowLeft className="h-3 w-3" />
          Farklı bir email kullan
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ornek@email.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            Gönderiliyor…
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Sıfırlama Kodu Gönder
          </>
        )}
      </Button>
    </form>
  );
}
