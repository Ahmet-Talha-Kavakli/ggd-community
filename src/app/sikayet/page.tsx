import Link from "next/link";
import { AlertTriangle, Info, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { ReportForm } from "./form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Button } from "@/components/ui/button";
import { TONE_STYLES } from "@/lib/card-tones";

export const metadata = { title: "Şikayet Et" };

export default async function SikayetPage() {
  const current = await getCurrentUser();

  return (
    <>
      <PageHero
        eyebrow="Şikayet"
        title="Bir oyuncuyu şikayet et."
        description="Yaşadığın olumsuz deneyimi yönetime bildir. Şikayetler 48 saat içinde değerlendirilir."
        image={{ src: "/goose-typing.png", alt: "Şikayet yazan kaz" }}
      />

      <section className="container-page py-14">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] max-w-5xl">
          {(() => {
            const t = TONE_STYLES.brand;
            return (
              <div
                className={`relative overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] p-8 animate-fade-up`}
                style={{ backgroundImage: t.texture }}
              >
                <div className="relative">
                  {!current ? (
                    <NotLoggedIn />
                  ) : !current.isApproved ? (
                    <NotApproved />
                  ) : (
                    <ReportForm />
                  )}
                </div>
              </div>
            );
          })()}

          <aside className="space-y-4">
            {(() => {
              const t = TONE_STYLES.warning;
              return (
                <div
                  className={`relative overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300 p-6 animate-fade-up stagger-2`}
                  style={{ backgroundImage: t.texture }}
                >
                  <div className="relative flex items-start gap-3">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br ${t.iconBg} ring-1 ${t.iconRing} ${t.iconColor} shadow-sm shrink-0`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-900">
                        Sahte şikayet yasaktır
                      </h3>
                      <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                        Asılsız veya kötü niyetli şikayetler sonucunda kendin
                        uyarı/ban alabilirsin.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
            {(() => {
              const t = TONE_STYLES.info;
              return (
                <div
                  className={`relative overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300 p-6 animate-fade-up stagger-3`}
                  style={{ backgroundImage: t.texture }}
                >
                  <div className="relative flex items-start gap-3">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br ${t.iconBg} ring-1 ${t.iconRing} ${t.iconColor} shadow-sm shrink-0`}
                    >
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-900">
                        Süreç nasıl işler?
                      </h3>
                      <ol className="mt-2 space-y-1 text-sm text-ink-600 list-decimal list-inside">
                        <li>Yönetim şikayeti inceler</li>
                        <li>Gerekirse taraflarla konuşulur</li>
                        <li>Karar 48 saatte verilir</li>
                        <li>Sonuç sana bildirilir</li>
                      </ol>
                    </div>
                  </div>
                </div>
              );
            })()}
          </aside>
        </div>
      </section>
    </>
  );
}

function NotLoggedIn() {
  return (
    <div className="text-center py-6">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-700">
        <Lock className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-ink-900">Şikayet için giriş yapmalısın</h3>
      <p className="mt-2 text-sm text-ink-500 max-w-sm mx-auto">
        Sahte şikayetlerin önüne geçmek için sadece kayıtlı üyeler şikayet
        gönderebilir.
      </p>
      <div className="mt-5 flex gap-2 justify-center">
        <Link href="/giris?next=/sikayet">
          <Button variant="outline">Giriş Yap</Button>
        </Link>
        <Link href="/kayit">
          <Button>Kayıt Ol</Button>
        </Link>
      </div>
    </div>
  );
}

function NotApproved() {
  return (
    <div className="text-center py-6">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-warning-50 text-warning-600">
        <Lock className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-ink-900">Hesabın onay bekliyor</h3>
      <p className="mt-2 text-sm text-ink-500 max-w-sm mx-auto">
        Bir admin GGD User ID&apos;ni doğruladıktan sonra şikayet
        gönderebileceksin. Genelde 24 saat içinde onaylanır.
      </p>
      <Link href="/profil" className="inline-block mt-5">
        <Button variant="outline">Profile dön</Button>
      </Link>
    </div>
  );
}
