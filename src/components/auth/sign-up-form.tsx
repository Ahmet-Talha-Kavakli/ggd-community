"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/react/legacy";
import { ArrowRight, AlertCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { clerkErrorToTr } from "@/lib/clerk-errors";

export function SignUpForm() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [ggdMainName, setGgdMainName] = useState("");
  const [ggdUserId, setGgdUserId] = useState("");
  const [ggdLevel, setGgdLevel] = useState("");
  const [password, setPassword] = useState("");
  const [acceptRules, setAcceptRules] = useState(false);

  // Doğrulama akışı için
  const [verifyMode, setVerifyMode] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;
    setError("");

    if (!acceptRules) {
      setError("Lobi kurallarını kabul etmelisin.");
      return;
    }

    setPending(true);
    try {
      const created = await signUp.create({
        emailAddress: email,
        password,
        username: nickname,
        unsafeMetadata: {
          nickname,
          ggd_user_id: ggdUserId,
          ggd_main_name: ggdMainName,
          ggd_level: ggdLevel ? Number(ggdLevel) : null,
        },
      });

      // Email doğrulama gerekiyorsa kod modunu aç
      if (created.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setVerifyMode(true);
      } else if (created.status === "complete") {
        await setActive({ session: created.createdSessionId });
        router.push("/profil");
        router.refresh();
      } else {
        setError("Kayıt tamamlanamadı: " + created.status);
      }
    } catch (err: unknown) {
      setError(clerkErrorToTr(err));
    } finally {
      setPending(false);
    }
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoaded || pending) return;
    setError("");
    setPending(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verifyCode,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/profil");
        router.refresh();
      } else {
        setError("Kod hatalı veya eksik.");
      }
    } catch (err: unknown) {
      setError(clerkErrorToTr(err));
    } finally {
      setPending(false);
    }
  }

  async function handleGoogle() {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/profil",
      });
    } catch (err: unknown) {
      setError(clerkErrorToTr(err));
    }
  }

  // -------- VERIFY EKRANI --------
  if (verifyMode) {
    return (
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="code">Email doğrulama kodu</Label>
          <Input
            id="code"
            type="text"
            placeholder="6 haneli kod"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            required
          />
          <p className="mt-1.5 text-xs text-ink-500 flex items-start gap-1.5">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            {email} adresine gönderilen 6 haneli kodu gir.
          </p>
        </div>
        {error && (
          <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" className="w-full mt-2" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Doğrulanıyor...
            </>
          ) : (
            <>
              Doğrula ve Kaydı Tamamla
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    );
  }

  // -------- KAYIT FORMU --------
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full mb-3"
        onClick={handleGoogle}
        disabled={!isLoaded || pending}
      >
        <GoogleIcon />
        Google ile kayıt ol
      </Button>

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

      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <Field
          id="nickname"
          label="Site kullanıcı adın"
          placeholder="Topluluk içi nick"
          required
          value={nickname}
          onChange={setNickname}
        />
        <Field
          id="email"
          type="email"
          label="Email"
          placeholder="ornek@email.com"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
        />
        <div>
          <Field
            id="ggd_main_name"
            label="GGD ana ismin"
            placeholder="Hesap-seviyesi ismin (Friend Code'la sabit)"
            required
            value={ggdMainName}
            onChange={setGgdMainName}
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
            value={ggdUserId}
            onChange={setGgdUserId}
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
            value={ggdLevel}
            onChange={setGgdLevel}
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
          value={password}
          onChange={setPassword}
        />

        <label className="flex items-start gap-2.5 text-sm text-ink-600 cursor-pointer mt-1">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            checked={acceptRules}
            onChange={(e) => setAcceptRules(e.target.checked)}
          />
          <span className="leading-snug">
            <Link
              href="/kurallar"
              target="_blank"
              className="text-brand-700 hover:underline"
            >
              Lobi kurallarını
            </Link>{" "}
            okudum ve kabul ediyorum.
          </span>
        </label>

        {/* CAPTCHA için Clerk container — görsel etkilemesin diye küçük */}
        <div id="clerk-captcha" className="empty:hidden" />

        {error && (
          <div className="rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={!isLoaded || pending}
        >
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
  value: string;
  onChange: (v: string) => void;
  noWrapper?: boolean;
}

function Field({
  id,
  label,
  placeholder,
  type = "text",
  autoComplete,
  required,
  value,
  onChange,
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
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
