import { CheckCircle2, XCircle, Scale, MessageSquare, Volume2, Skull, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { CtaCard } from "@/components/layout/cta-card";

export const metadata = { title: "Lobi Kuralları" };

const RULES = [
  {
    icon: MessageSquare,
    title: "Saygı Çerçevesi",
    items: [
      { ok: true, text: "Yenilere karşı sabırlı ol, oyunu öğrenmelerine yardım et." },
      { ok: false, text: "Hakaret, küfür, ırkçılık, cinsiyetçilik kesinlikle yasak." },
      { ok: false, text: "Kişisel saldırı, taciz veya tehdit ban gerekçesidir." },
    ],
  },
  {
    icon: Scale,
    title: "Oyun İçi Davranış",
    items: [
      { ok: true, text: "Rolünü oyna — Dodo'ysan dodola, Goose'sun ortağına ihanet etme." },
      { ok: false, text: "Stream sniping (yayıncıyı izleyerek oynamak) yasak." },
      { ok: false, text: "Takımına bilerek engel olmak (sabotaj) ban gerekçesidir." },
    ],
  },
  {
    icon: Volume2,
    title: "Mikrofon ve Sohbet",
    items: [
      { ok: true, text: "Net konuş, mikrofon kalitesine dikkat et." },
      { ok: false, text: "Müzik, ses efekti veya gürültü çalmak yasak." },
      { ok: false, text: "Spam yazmak, ALL CAPS bağırmak hoş karşılanmaz." },
    ],
  },
  {
    icon: Skull,
    title: "Hile ve Suistimal",
    items: [
      { ok: false, text: "Hile (cheat, mod) kullanan oyuncu KALICI ban alır." },
      { ok: false, text: "Çoklu hesap (multi-account) ile ban atlatmak yasak." },
      { ok: false, text: "Yönetimi kandırma veya sahte şikayet ban gerekçesidir." },
    ],
  },
];

export default function KurallarPage() {
  return (
    <>
      <PageHero
        eyebrow="Lobi kuralları"
        title="Birlikte daha keyifli bir oyun için."
        description="Bu kurallar topluluğumuzun ortak hafızasıdır. Lobi açtığında veya katıldığında bu çerçeveye uyman beklenir."
        image={{ src: "/goose-wise.png", alt: "Bilge kaz" }}
      />

      <section className="container-page py-14">
        <div className="max-w-4xl">
          <div className="rounded-2xl bg-brand-50 border border-brand-200 p-6 mb-10 flex gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-900">3 Uyarı Sistemi</h3>
              <p className="mt-1 text-sm text-brand-800 leading-relaxed">
                Kural ihlalinde önce uyarı alırsın. 3 uyarı biriktiğinde
                otomatik olarak 30 günlük ban verilir. Ağır ihlallerde
                doğrudan kalıcı ban uygulanır.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {RULES.map((rule) => (
              <Card key={rule.title}>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-900">
                      <rule.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-ink-900">
                      {rule.title}
                    </h2>
                  </div>
                  <ul className="grid gap-2.5">
                    {rule.items.map((item, i) => (
                      <li key={i} className="flex gap-2.5 items-start">
                        {item.ok ? (
                          <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-danger-500 shrink-0 mt-0.5" />
                        )}
                        <span className="text-[15px] text-ink-700 leading-relaxed">
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CtaCard
        title="Kuralları okudun mu? Hadi katıl."
        description="Topluluğa kayıt ücretsiz. Lobiye katılmadan önce kuralları kabul ettiğini biliyoruz."
        primary={{ label: "Kayıt Ol", href: "/kayit" }}
        secondary={{ label: "Topluluğa Göz At", href: "/topluluk" }}
        image="/goose-friendly.png"
      />
    </>
  );
}
