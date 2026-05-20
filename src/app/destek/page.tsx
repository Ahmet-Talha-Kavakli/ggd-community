import { Bot, MessageCircleQuestion, Mail, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { AiChat } from "@/components/destek/ai-chat";
import { SupportForm } from "@/components/destek/support-form";
import { getCurrentUser } from "@/lib/auth/current-user";

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
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                    AI Destek Asistanı
                  </h2>
                  <p className="text-sm text-ink-500">Anında yanıt, 7/24</p>
                </div>
              </div>
              <AiChat />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink-100 text-ink-700">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                    Yönetime Ulaş
                  </h2>
                  <p className="text-sm text-ink-500">48 saat içinde dönüş</p>
                </div>
              </div>
              <SupportForm defaultEmail={current?.email} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-14">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="h-4 w-4 text-brand-600" />
            <h2 className="text-xl font-semibold tracking-tight text-ink-900">
              Sık Sorulan Sorular
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FAQ.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-ink-900 flex items-start gap-2">
                    <MessageCircleQuestion className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                    {item.q}
                  </h3>
                  <p className="mt-2 text-sm text-ink-600 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
