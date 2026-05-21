import { Crown, Vote, Users, Skull, Volume2, Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { CtaCard } from "@/components/layout/cta-card";
import { TONE_STYLES, type Tone } from "@/lib/card-tones";

export const metadata = { title: "Lobi Kuralları" };

// Lobi kurallari — tematik 5 kategori. Numaralar render sirasinda otomatik
// uretilir; baska bir kategoriye madde tasidigin zaman ardisikliklik kendi
// kendine korunur.
const RULES: Array<{
  icon: typeof Crown;
  title: string;
  tone: Tone;
  items: string[];
}> = [
  {
    icon: Crown,
    tone: "info",
    title: "Kanadalı & Ünlü Kuralları",
    items: [
      "Kanadalı ve Ünlü yalanı yasak.",
      "Kanadalı veya Ünlüyseniz sizden oylamada 2 rol istenirse başka 2 rol vermek zorundasınız. Ünlü hiçbir şekilde ünlü olduğunu ne oylamada ne de oyun içinde belli edemez.",
      "Ünlü yapılırken ölmediyse iki defa 'ölmedi' yazılacak, öldüyse de turunu yazmak zorunludur — aksi takdirde asılmayı göze alacaksınız. 5–7 kişi almadan ünlü yapılması kesinlikle yasaktır.",
      "Oyun içinde ünlü ölünce ses çıkarmak, belli eden şeyler söylemek veya bir oyuncudan ünlü infosu sormak — masum, tarafsız ya da katil fark etmez — kesinlikle yasaktır.",
      "Kanadalıyı reportlayan kişi her ne olursa olsun asılmak zorundadır.",
    ],
  },
  {
    icon: Vote,
    tone: "brand",
    title: "Oylama & Sohbet Düzeni",
    items: [
      "Oylamada söz kesmek, insanları bastırmak, söz almadan konuşmak kesinlikle yasaktır.",
      "Oylamada sizden iki rol istendiğinde vermek zorundasınız. Rollerden birisi veya daha fazlası tanınıyorsa, tanıyan herkes chatte safeleşecektir. Sadece kesici roller oyun içinde safeleşecektir.",
      "Oylamada konuşma sırası: önce reportlayan, ardından varsa suçlanan, sonra chatte sırasıyla '1' yazarak söz hakkı alınır.",
    ],
  },
  {
    icon: Users,
    tone: "warning",
    title: "Oyun İçi Davranış",
    items: [
      "Boş infolar için (bomba size geldi, güvercin tehlikesi, nişancı kovalıyor, biri kovalıyor vs.) zile basmak kesinlikle yasaktır.",
      "Oyun içerisinde üç kişiden fazla gezmek, az kişi kaldıysa iki kişiden fazla gezmek kesinlikle yasaktır.",
      "Tarafsızlar istediği tarafa oynayabilir; köylülere ya da katillere çalışacağım deyip yine de oynamamayı tercih edebilir. Taraf değiştirmekte tamamen özgürdürler.",
      "Oyun içerisinde oyuncuları masumken ısrarla takip etmek, darlamak, sıkıştırmak kesinlikle yasaktır.",
      "Masum kesici rollerin infosuz kesmesi kesinlikle yasaktır.",
      "Pelikanın zile basması da, ceset raporlaması da serbesttir.",
    ],
  },
  {
    icon: Skull,
    tone: "danger",
    title: "Kalıcı Ban Sebepleri",
    items: [
      "Teaming yapmak — en ufak belirtinin olması halinde bile kalıcı olarak sunucularımızdan banlanacaksınız.",
    ],
  },
  {
    icon: Volume2,
    tone: "danger",
    title: "Ses ve Mikrofon",
    items: [
      "Oyun içerisinde veya lobide müzik açmak, soundpad veya yükseltici ile konuşmak kesinlikle yasaktır.",
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
          {(() => {
            const info = TONE_STYLES.info;
            return (
              <div
                className={`relative overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${info.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] p-6 mb-10 flex gap-4`}
                style={{ backgroundImage: info.texture }}
              >
                <div
                  className={`relative grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br ${info.iconBg} ring-1 ${info.iconRing} ${info.iconColor} shrink-0 shadow-sm`}
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="relative">
                  <h3 className="font-semibold text-ink-900">3 Uyarı Sistemi</h3>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                    Kural ihlalinde önce uyarı alırsın. 3 uyarı biriktiğinde
                    otomatik olarak 30 günlük ban verilir. Ağır ihlallerde
                    doğrudan kalıcı ban uygulanır.
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="grid gap-5">
            {(() => {
              let counter = 0;
              return RULES.map((rule, i) => {
                const t = TONE_STYLES[rule.tone];
                return (
                <div
                  key={rule.title}
                  className={`animate-fade-up stagger-${Math.min(i + 1, 6)} relative overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300 p-6 md:p-8`}
                  style={{ backgroundImage: t.texture }}
                >
                  <div className="relative flex items-center gap-3 mb-5">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br ${t.iconBg} ring-1 ${t.iconRing} ${t.iconColor} shadow-sm`}
                    >
                      <rule.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-ink-900">
                      {rule.title}
                    </h2>
                  </div>
                  <ul className="relative grid gap-3">
                    {rule.items.map((item) => {
                      counter += 1;
                      const num = counter;
                      return (
                      <li key={num} className="flex gap-3 items-start">
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full bg-white/80 border ${
                            rule.tone === "danger"
                              ? "border-danger-200 text-danger-700"
                              : rule.tone === "warning"
                                ? "border-warning-200 text-warning-700"
                                : rule.tone === "info"
                                  ? "border-sky-200 text-sky-700"
                                  : "border-brand-200 text-brand-700"
                          } shrink-0 mt-0.5 text-[11px] font-bold tabular-nums`}
                        >
                          {num}
                        </span>
                        <span className="text-[15px] text-ink-700 leading-relaxed pt-0.5">
                          {item}
                        </span>
                      </li>
                      );
                    })}
                  </ul>
                </div>
                );
              });
            })()}
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
