import { Bot, MessageCircleQuestion, Mail, BookOpen } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { AiChat } from "@/components/destek/ai-chat";
import { SupportForm } from "@/components/destek/support-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { TONE_STYLES } from "@/lib/card-tones";

export const metadata = { title: "Destek" };

const FAQ = [
  {
    q: "GGD User ID'mi nereden öğrenebilirim?",
    a: "Oyun içinde Settings → Account bölümünde görünür. Friend Code formatında da olabilir (ABCD-EFGH).",
  },
  {
    q: "Banlandım, itiraz edebilir miyim?",
    a: "Evet, destek formundan başvurabilirsin. Yönetim 48 saat içinde geri döner.",
  },
  {
    q: "Şikayet ettiğim oyuncu neden hala banlanmadı?",
    a: "Her şikayet incelenir ama her şikayet ban gerektirmez. Yönetim takdir yetkisini kullanır.",
  },
  {
    q: "Üyeliğimi silebilir miyim?",
    a: "Profil → Hesap → Hesabımı sil yolundan istediğin zaman silebilirsin.",
  },
];

export default async function DestekPage() {
  const current = await getCurrentUser();

  return (
    <>
      <PageHero
        eyebrow="Destek"
        title="Sana nasıl yardımcı olabiliriz?"
        description="Sorularını AI asistanımıza sor, yanıt alamazsan formdan ekibimize ulaş."
        image={{ src: "/goose-support.png", alt: "Yardımcı kaz" }}
      />

      <section className="container-page py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          {(() => {
            const t = TONE_STYLES.brand;
            return (
              <div
                className={`relative overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] p-8 animate-fade-up`}
                style={{ backgroundImage: t.texture }}
              >
                <div className="relative flex items-center gap-3 mb-4">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br ${t.iconBg} ring-1 ${t.iconRing} ${t.iconColor} shadow-sm`}
                  >
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                      AI Destek Asistanı
                    </h2>
                    <p className="text-sm text-ink-500">Anında yanıt, 7/24</p>
                  </div>
                </div>
                <div className="relative">
                  <AiChat />
                </div>
              </div>
            );
          })()}

          {(() => {
            const t = TONE_STYLES.neutral;
            return (
              <div
                className={`relative overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] p-8 animate-fade-up stagger-2`}
                style={{ backgroundImage: t.texture }}
              >
                <div className="relative flex items-center gap-3 mb-4">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br ${t.iconBg} ring-1 ${t.iconRing} ${t.iconColor} shadow-sm`}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                      Yönetime Ulaş
                    </h2>
                    <p className="text-sm text-ink-500">48 saat içinde dönüş</p>
                  </div>
                </div>
                <div className="relative">
                  <SupportForm
                    defaultEmail={current?.email}
                    canAttach={!!current}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        <div className="mt-14">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="h-4 w-4 text-brand-600" />
            <h2 className="text-xl font-semibold tracking-tight text-ink-900">
              Sık Sorulan Sorular
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FAQ.map((item, i) => {
              const t = TONE_STYLES.info;
              return (
                <div
                  key={i}
                  className={`animate-fade-up stagger-${Math.min(i + 1, 6)} relative overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300 p-6`}
                  style={{ backgroundImage: t.texture }}
                >
                  <h3 className="relative font-semibold text-ink-900 flex items-start gap-2">
                    <MessageCircleQuestion className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" />
                    {item.q}
                  </h3>
                  <p className="relative mt-2 text-sm text-ink-600 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
