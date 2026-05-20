import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Email Doğrulama" };

export default function OnayBeklenenPage() {
  return (
    <section className="hero-wash flex-1 flex items-center py-16">
      <div className="container-page">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardContent className="p-10 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <Mail className="h-7 w-7" />
              </div>
              <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-900">
                Email&apos;ine bir bağlantı gönderdik
              </h1>
              <p className="mt-3 text-ink-600 leading-relaxed">
                Hesabını doğrulamak için emailindeki linke tıkla. Spam
                klasörünü de kontrol et.
              </p>

              <div className="my-7 border-t border-ink-200" />

              <div className="text-left rounded-2xl bg-ink-50 p-5 flex gap-3">
                <ShieldCheck className="h-5 w-5 text-brand-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-ink-900 text-sm">
                    Email doğrulamadan sonra
                  </h3>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                    Hesabın <strong>onay bekliyor</strong> durumuna geçecek.
                    Bir admin GGD User ID&apos;ni doğruladıktan sonra chat ve
                    şikayet özellikleri açılır. Genelde 24 saat içinde
                    onaylanır.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex gap-2 justify-center">
                <Link href="/">
                  <Button variant="outline">Anasayfa</Button>
                </Link>
                <Link href="/giris">
                  <Button>Giriş yap</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
