import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Tasarım Mockupları" };

const SAMPLE_CARDS = [
  {
    image: "/goose-search.png",
    title: "Oyuncu Sorgu",
    desc: "GGD User ID ile geçmişi araştır.",
    href: "/sorgu",
  },
  {
    image: "/goose-shield.png",
    title: "Kara Liste & Uyarılar",
    desc: "Toksik oyuncuların listesi, gerekçeli ban kayıtları.",
    href: "/kara-liste",
  },
  {
    image: "/goose-friendly.png",
    title: "Topluluk Sohbeti",
    desc: "Kanallı yapı ile anlık sohbet, lobi ara.",
    href: "/topluluk",
  },
];

export default function TasarimPage() {
  return (
    <div className="flex-1">
      <section className="container-page py-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
          Kart tasarımı mockupları
        </h1>
        <p className="mt-3 text-lg text-ink-600 max-w-2xl">
          4 farklı stil. Her birinin kart görünümü + arka plan stili. Hangisini
          istersen söyle, hem kartlara hem siteye uygulayım.
        </p>
      </section>

      <StyleSection
        id="A"
        name="A. Glassmorphism"
        desc="Frosted glass, backdrop-blur, premium his (Apple/Linear pattern)."
        background={<GlassBackground />}
        cardClass="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-7 shadow-[0_8px_32px_rgba(16,185,129,0.08)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 transition-all duration-300"
        iconClass="relative h-14 w-14 overflow-hidden rounded-full bg-white/70 backdrop-blur border border-white/80 shadow-sm"
      />

      <StyleSection
        id="B"
        name="B. Soft floating"
        desc="Kenarsız, büyük yumuşak gölge, hover'da kıpır (Vercel/Notion pattern)."
        background={<DotBackground />}
        cardClass="relative bg-white rounded-3xl p-7 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300"
        iconClass="relative h-14 w-14 overflow-hidden rounded-2xl bg-brand-50"
      />

      <StyleSection
        id="C"
        name="C. Gradient border"
        desc="Etrafında ince gradient yeşil çizgi (Polar/Linear pattern)."
        background={<MeshBackground />}
        cardClass="group/card relative rounded-3xl p-[1.5px] bg-linear-to-br from-brand-300/80 via-brand-200/40 to-emerald-300/60 hover:from-brand-500 hover:via-brand-400 hover:to-emerald-500 transition-all duration-300"
        innerClass="relative bg-white rounded-[calc(1.5rem-1.5px)] p-7 h-full"
        iconClass="relative h-14 w-14 overflow-hidden rounded-full bg-linear-to-br from-brand-50 to-emerald-100"
      />

      <StyleSection
        id="D"
        name="D. Accent stripe"
        desc="Sol kenarda 4px renkli şerit (Github/Linear pattern)."
        background={<GridBackground />}
        cardClass="relative bg-white rounded-2xl p-7 border-l-4 border-brand-500 border-y border-r border-ink-200 hover:border-y-brand-200 hover:border-r-brand-200 hover:shadow-card transition-all duration-300"
        iconClass="relative h-12 w-12 overflow-hidden rounded-lg bg-brand-50"
      />

      <section className="container-page py-20 text-center">
        <p className="text-lg text-ink-700">
          Hangi stili istersen söyle — <strong>A, B, C</strong> veya{" "}
          <strong>D</strong>.
        </p>
      </section>
    </div>
  );
}

interface StyleSectionProps {
  id: string;
  name: string;
  desc: string;
  background: React.ReactNode;
  cardClass: string;
  innerClass?: string;
  iconClass: string;
}

function StyleSection({
  id,
  name,
  desc,
  background,
  cardClass,
  innerClass,
  iconClass,
}: StyleSectionProps) {
  return (
    <section className="relative py-16 border-y border-ink-200/60 overflow-hidden">
      {background}
      <div className="relative container-page">
        <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-brand-600 text-white font-bold text-sm mr-3">
              {id}
            </span>
            <span className="text-2xl font-bold tracking-tight text-ink-900">
              {name}
            </span>
            <p className="mt-2 text-sm text-ink-600 max-w-2xl">{desc}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SAMPLE_CARDS.map((c) => (
            <Link key={c.title} href={c.href} className={cardClass}>
              {innerClass ? (
                <div className={innerClass}>
                  <CardInner card={c} iconClass={iconClass} />
                </div>
              ) : (
                <CardInner card={c} iconClass={iconClass} />
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CardInner({
  card,
  iconClass,
}: {
  card: (typeof SAMPLE_CARDS)[number];
  iconClass: string;
}) {
  return (
    <>
      <div className={iconClass}>
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-contain p-1.5"
          sizes="56px"
        />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink-900">
        {card.title}
      </h3>
      <p className="mt-2 text-sm text-ink-600 leading-relaxed">{card.desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
        Keşfet
        <ArrowRight size={14} />
      </span>
    </>
  );
}

// === Arka plan stilleri ===

function GlassBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-brand-400/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-300/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-200/30 rounded-full blur-3xl" />
    </div>
  );
}

function DotBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 opacity-50"
      style={{
        backgroundImage:
          "radial-gradient(circle, #10b98133 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />
  );
}

function MeshBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-brand-50/40 via-emerald-50/30 to-teal-50/40" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-linear-to-r from-brand-200/40 to-emerald-200/40 rounded-full blur-2xl" />
    </div>
  );
}

function GridBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 opacity-60"
      style={{
        backgroundImage:
          "linear-gradient(#10b9811a 1px, transparent 1px), linear-gradient(90deg, #10b9811a 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}
