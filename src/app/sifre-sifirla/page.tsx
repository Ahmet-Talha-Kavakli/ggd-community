import Link from "next/link";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "./form";

export const metadata = { title: "Şifre Sıfırla" };

export default function SifreSifirlaPage() {
  return (
    <section className="hero-wash flex-1 flex items-center py-16">
      <div className="container-page">
        <div className="max-w-md mx-auto">
          <Card className="animate-scale-in">
            <CardContent className="p-8 md:p-10">
              <div className="mb-7 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                  <EnvelopeSimple size={22} weight="duotone" />
                </div>
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900">
                  Şifremi unuttum
                </h1>
                <p className="mt-2 text-sm text-ink-500">
                  Email adresini yaz, sıfırlama linki gönderelim.
                </p>
              </div>

              <ResetPasswordForm />

              <p className="mt-6 text-center text-sm text-ink-500">
                <Link
                  href="/giris"
                  className="font-medium text-brand-700 hover:text-brand-800"
                >
                  ← Giriş sayfasına dön
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
