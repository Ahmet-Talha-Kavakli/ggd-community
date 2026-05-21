"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/react/legacy";
import { AlertCircle, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ResetPasswordForm() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;
    setError("");
    setPending(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSent(true);
      // 1.5 sn sonra kod giris sayfasina yonlendir
      setTimeout(() => {
        router.push("/sifre-sifirla/yeni");
      }, 1500);
    } catch (err: unknown) {
      const e = err as { errors?: { message: string; code?: string }[] };
      const code = e.errors?.[0]?.code;
      if (code === "form_identifier_not_found") {
        setError("Bu email ile kayıtlı kullanıcı bulunamadı.");
      } else {
        setError(
          e.errors?.[0]?.message ??
            "Bir hata oluştu. Birazdan tekrar dene.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-sm text-brand-800 flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-brand-600" />
        <div>
          <p className="font-medium">Kod email&apos;ine gönderildi 📬</p>
          <p className="mt-1 text-xs">
            6 haneli kodu kontrol et, yönlendiriliyorsun…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
