import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  MagnifyingGlass,
  ChatsCircle,
  Megaphone,
  Warning,
  UserPlus,
  Users,
  ArrowRight,
  CalendarBlank,
  PushPin,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { PublicStatsWidget } from "@/components/stats/public-stats";
import { createClient } from "@/lib/supabase/server";
import { relativeTime, formatDate } from "@/lib/utils";
import { SITE } from "@/config/site";
import { findMap, findMode } from "@/lib/ggd-presets";
import type {
  RoomCode,
  Profile,
  Announcement,
} from "@/lib/supabase/types";

export const revalidate = 30; // Anasayfa 30 sn cache (oda kodu, son üyeler için)

import { TONE_STYLES, type Tone } from "@/lib/card-tones";
import { LampCTA } from "@/components/home/lamp-cta";

const FEATURES: {
  icon: typeof MagnifyingGlass;
  title: string;
  description: string;
  href: string;
  tone: Tone;
}[] = [
  {
    icon: MagnifyingGlass,
    title: "Oyuncu Sorgu",
    description:
      "GGD User ID ile herhangi bir oyuncunun uyarı ve kara liste durumunu anında öğren.",
    href: "/sorgu",
    tone: "brand",
  },
  {
    icon: ShieldCheck,
    title: "Kara Liste & Uyarılar",
    description:
      "Toksik oyuncuların listesi, gerekçeli ban kayıtları ve uyarı geçmişi.",
    href: "/kara-liste",
    tone: "danger",
  },
  {
    icon: Warning,
    title: "Şikayet Sistemi",
    description:
      "Kanıt yükleyerek (foto/video) oyuncuları yönetime şikayet et. Şeffaf süreç.",
    href: "/sikayet",
    tone: "warning",
  },
  {
    icon: ChatsCircle,
    title: "Topluluk Sohbeti",
    description:
      "Kanallı yapı ile oyuncularla anlık sohbet et, lobi ara, deneyim paylaş.",
    href: "/topluluk",
    tone: "info",
  },
  {
    icon: Megaphone,
    title: "Duyurular",
    description:
      "Yönetimden gelen güncel duyurular, kural değişiklikleri ve etkinlikler.",
    href: "/duyurular",
    tone: "brand",
  },
  {
    icon: UserPlus,
    title: "Üye Kaydı",
    description:
      "Topluluğun bir parçası ol, GGD Friend Code ile kayıt ol.",
    href: "/kayit",
    tone: "info",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  const [roomRes, recentMembersRes, memberCountRes, announcementsRes] =
    await Promise.all([
      supabase.from("room_code").select("*").eq("id", 1).single(),
      supabase
        .from("profiles")
        .select("id, nickname, joined_at")
        .order("joined_at", { ascending: false })
        .limit(5),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte(
          "joined_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ),
      supabase
        .from("announcements")
        .select("id, title, body, tag, pinned, published_at")
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(3),
    ]);

  const room = roomRes.data as RoomCode | null;
  const roomCode = room?.code?.trim() || "";
  const roomNote = room?.note ?? null;
  const roomMap = findMap(room?.map);
  const roomMode = findMode(room?.mode);
  const recentMembers = (recentMembersRes.data ?? []) as Pick<
    Profile,
    "id" | "nickname" | "joined_at"
  >[];
  const newMembers24h = memberCountRes.count ?? 0;
  const announcements = (announcementsRes.data ?? []) as Pick<
    Announcement,
    "id" | "title" | "body" | "tag" | "pinned" | "published_at"
  >[];

  return (
    <>
      <section className="hero-wash relative overflow-hidden">
        {/* Floating background cards — dekoratif, opacity hafif */}
        <div
          aria-hidden
          className="hidden md:block pointer-events-none absolute inset-0 z-0"
        >
          <FloatingCard
            position="top-[10%] left-[6%]"
            rotation="rotate-[-7deg]"
            icon={ShieldCheck}
            title="HENZAH"
            sub="Banlı · kalıcı"
            tone="danger"
            delay="0s"
          />
          <FloatingCard
            position="top-[18%] right-[14%]"
            rotation="rotate-6"
            icon={Warning}
            title="Leopar"
            sub="2 aktif uyarı"
            tone="warning"
            delay="0.6s"
          />
          <FloatingCard
            position="bottom-[18%] left-[10%]"
            rotation="rotate-[-4deg]"
            icon={Users}
            title="Carnage"
            sub="Kayıtlı üye"
            tone="brand"
            delay="1.2s"
          />
          <FloatingCard
            position="bottom-[10%] right-[8%]"
            rotation="rotate-[8deg]"
            icon={ChatsCircle}
            title="Yeni şikayet"
            sub="3 kanıt foto"
            tone="info"
            delay="1.8s"
          />
        </div>

        <div className="container-page py-16 md:py-24 lg:py-28 relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="flex flex-col gap-7">
              <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                {SITE.name} · Lobi yönetim merkezi
              </span>
              <h1 className="animate-fade-up stagger-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink-900 leading-[1.05] sm:leading-[1.02]">
                Goose Goose Duck için
                <br />
                <span className="text-brand-600">sağlıklı bir topluluk.</span>
              </h1>
              <p className="animate-fade-up stagger-2 text-base sm:text-lg md:text-xl text-ink-500 leading-relaxed max-w-xl">
                Toksik oyuncuları engelle, lobi kuralları net olsun, oyuncular
                birbirini şikayet edebilsin. Hepsi tek bir yerden.
              </p>
              <div className="animate-fade-up stagger-3 flex flex-wrap gap-3 mt-2">
                <Link href="/sorgu">
                  <Button size="lg" className="shine">
                    <MagnifyingGlass size={18} weight="bold" />
                    Oyuncu Sorgula
                  </Button>
                </Link>
                <Link href="/kayit">
                  <Button size="lg" variant="outline">
                    Topluluğa Katıl
                    <ArrowRight size={18} weight="bold" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="animate-scale-in stagger-2 relative hidden lg:block">
              <div className="absolute -inset-6 bg-brand-500/10 blur-3xl rounded-full" />
              <div className="relative overflow-hidden rounded-3xl border border-brand-200/40 shadow-float">
                <video
                  src="/hero-video.mp4"
                  poster="/hero.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="GooseCage topluluğunun maskotu"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page -mt-8 md:-mt-12 relative z-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 overflow-hidden animate-scale-in stagger-4 border-dashed border-2">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      roomCode ? "bg-brand-500 animate-pulse" : "bg-ink-300"
                    }`}
                  />
                  <span className="text-xs font-medium text-brand-700 uppercase tracking-wider">
                    {roomCode ? "Şu an aktif" : "Şu an pasif"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-ink-900">
                  Lobi Oda Kodu
                </h2>
                <p className="text-sm text-ink-500 mt-1">
                  {roomNote ?? "GGD oyununda bu kod ile odaya katılabilirsin"}
                </p>
                {roomCode && (roomMap || roomMode) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {roomMap && (
                      <Badge variant="outline">
                        <span className="text-ink-400 text-[10px] uppercase tracking-wider mr-1">
                          Harita
                        </span>
                        {roomMap.label}
                      </Badge>
                    )}
                    {roomMode && (
                      <Badge variant="outline">
                        <span className="text-ink-400 text-[10px] uppercase tracking-wider mr-1">
                          Mod
                        </span>
                        {roomMode.label}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              {roomCode ? (
                <div className="flex items-center gap-3">
                  <code className="font-mono text-3xl md:text-4xl font-bold tracking-[0.2em] text-brand-700 bg-brand-50 px-6 py-4 rounded-2xl border border-brand-200">
                    {roomCode}
                  </code>
                  <CopyButton value={roomCode} className="h-14 w-14" />
                </div>
              ) : (
                <div className="text-sm text-ink-400 italic">
                  Henüz aktif lobi yok
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-scale-in stagger-5">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} weight="duotone" className="text-brand-600" />
                <span className="text-xs font-medium text-brand-700 uppercase tracking-wider">
                  Yeni katılanlar
                </span>
              </div>
              <p className="text-3xl font-bold text-ink-900">
                {newMembers24h > 0 ? `+${newMembers24h}` : "0"}
              </p>
              <p className="text-sm text-ink-500 mt-1">
                Son 24 saatte yeni üye
              </p>
              <Link
                href="/topluluk"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800 mt-4 group/link"
              >
                Üyeleri gör
                <ArrowRight
                  size={14}
                  weight="bold"
                  className="group-hover/link:translate-x-0.5 transition-transform"
                />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <PublicStatsWidget />

      <section className="container-page py-20 md:py-28">
        <div className="max-w-2xl mb-12 animate-fade-up">
          <Badge variant="brand" className="mb-4">
            Nasıl çalışır?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
            Toksisiteyi 3 adımda azalt.
          </h2>
          <p className="text-lg text-ink-500 mt-4 leading-relaxed">
            GooseCage sürecini olabildiğince basit tutar — sen oyun keyfine
            odaklan, biz toksik oyuncuları süzelim.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(
            [
              {
                num: "01",
                title: "Tanı",
                desc: "GGD User ID, ana isim veya oyun içi nick ile oyuncunun geçmişini incele. Üyelik gerekmez, herkese açık.",
                image: "/goose-search.png",
                alt: "Sorgulayan kaz",
                tone: "info" as Tone,
              },
              {
                num: "02",
                title: "Kanıtla bildir",
                desc: "Foto / video kanıtla şikayet aç. AI ön analiz yapar, yönetim hızlıca inceleyip ban veya uyarı verir.",
                image: "/goose-report.png",
                alt: "Şikayet eden kaz",
                tone: "warning" as Tone,
              },
              {
                num: "03",
                title: "Sürünle dön",
                desc: "Toksik oyuncular kara listeye girer, lobiler temizlenir. Sen sürünle keyifli oyununa geri dönersin.",
                image: "/goose-sanctuary.png",
                alt: "Sağlıklı topluluk",
                tone: "brand" as Tone,
              },
            ] as const
          ).map((step, i) => {
            const t = TONE_STYLES[step.tone];
            return (
            <div
              key={step.num}
              className={`animate-fade-up stagger-${i + 1} relative overflow-hidden rounded-3xl bg-white/90 p-8 border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300`}
              style={{ backgroundImage: t.texture }}
            >
              <div className={`absolute -top-2 right-4 text-[88px] font-bold ${t.bigNumber} leading-none select-none pointer-events-none`}>
                {step.num}
              </div>

              <div className="relative h-40 w-40 mx-auto mb-6 rounded-3xl overflow-hidden ring-1 ring-ink-200">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <h3 className="relative text-xl font-semibold tracking-tight text-ink-900">
                {step.title}
              </h3>
              <p className="relative mt-3 text-sm text-ink-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
            );
          })}
        </div>
      </section>

      {recentMembers.length > 0 && (
        <section className="container-page py-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-ink-900">
              Son katılanlar
            </h2>
            <Link
              href="/topluluk"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink-900 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-900 hover:bg-brand-50 hover:border-brand-700 hover:text-brand-700 transition-colors"
            >
              Tümü
              <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {recentMembers.map((m, i) => (
              <div
                key={m.id}
                className={`animate-fade-up stagger-${Math.min(i + 1, 6)} rounded-2xl border border-ink-900 bg-white p-5 flex flex-col items-center text-center lift`}
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700 font-bold text-lg">
                  {m.nickname.charAt(0).toUpperCase()}
                </div>
                <p className="mt-3 font-medium text-sm text-ink-900 truncate w-full">
                  {m.nickname}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {relativeTime(m.joined_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {announcements.length > 0 && (
        <section className="container-page py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-ink-900">
              Son duyurular
            </h2>
            <Link
              href="/duyurular"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink-900 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-900 hover:bg-brand-50 hover:border-brand-700 hover:text-brand-700 transition-colors"
            >
              Tümü
              <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {announcements.map((a, i) => {
              const t = a.pinned ? TONE_STYLES.brand : TONE_STYLES.info;
              return (
              <Link
                key={a.id}
                href="/duyurular"
                className={`group animate-fade-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div
                  className={`relative h-full overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300 p-6`}
                  style={{ backgroundImage: t.texture }}
                >
                  <div
                    aria-hidden
                    className={`absolute top-0 right-0 w-28 h-28 bg-linear-to-br ${t.cornerGlow} to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />
                  <div className="relative flex flex-wrap items-center gap-2 mb-3">
                    {a.pinned && (
                      <Badge variant="brand">
                        <PushPin size={10} weight="fill" />
                        Sabit
                      </Badge>
                    )}
                    <Badge variant="outline">{a.tag}</Badge>
                  </div>
                  <h3 className="relative font-semibold text-ink-900 line-clamp-2 leading-snug">
                    {a.title}
                  </h3>
                  <p className="relative mt-2 text-sm text-ink-600 line-clamp-3 leading-relaxed">
                    {a.body}
                  </p>
                  <div className="relative mt-4 flex items-center gap-1.5 text-xs text-ink-500">
                    <CalendarBlank size={12} weight="duotone" />
                    {formatDate(a.published_at)}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="container-page py-20 md:py-28">
        <div className="max-w-2xl mb-12">
          <Badge variant="brand" className="mb-4">
            Özellikler
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
            Topluluk için ihtiyacın olan her şey.
          </h2>
          <p className="text-lg text-ink-500 mt-4 leading-relaxed">
            Tek tek araç değil, tek bir merkez. Yönetimden oyuncuya kadar
            herkesin işini kolaylaştır.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const t = TONE_STYLES[f.tone];
            return (
              <Link
                key={f.href}
                href={f.href}
                className={`group animate-fade-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div
                  className={`relative h-full bg-white rounded-2xl p-7 border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300`}
                  style={{ backgroundImage: t.texture }}
                >
                  <div
                    aria-hidden
                    className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${t.cornerGlow} to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />
                  <div
                    className={`relative inline-flex items-center justify-center h-14 w-14 rounded-full bg-linear-to-br ${t.iconBg} ring-1 ${t.iconRing} shadow-sm group-hover:scale-105 transition-all duration-300`}
                  >
                    <f.icon size={26} weight="duotone" className={t.iconColor} />
                  </div>
                  <h3 className="relative mt-5 text-lg font-semibold tracking-tight text-ink-900">
                    {f.title}
                  </h3>
                  <p className="relative mt-2 text-sm text-ink-600 leading-relaxed">
                    {f.description}
                  </p>
                  <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 group-hover:gap-2.5 transition-all">
                    Keşfet
                    <ArrowRight size={14} weight="bold" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page pb-24">
        <LampCTA />
      </section>
    </>
  );
}

// Hero arka planinda floating dekoratif kart — yumusak yukari/asagi salinim
// (CSS animation), opacity dusuk, kullanici dikkatini bozmaz.
function FloatingCard({
  icon: Icon,
  title,
  sub,
  tone,
  position,
  rotation,
  delay,
}: {
  icon: typeof ShieldCheck;
  title: string;
  sub: string;
  tone: "danger" | "warning" | "brand" | "info";
  position: string;
  rotation: string;
  delay: string;
}) {
  const styles = {
    danger: {
      border: "border-danger-200",
      bg: "bg-danger-50",
      iconColor: "text-danger-600",
      subColor: "text-danger-700",
    },
    warning: {
      border: "border-warning-200",
      bg: "bg-warning-50",
      iconColor: "text-warning-600",
      subColor: "text-warning-700",
    },
    brand: {
      border: "border-brand-200",
      bg: "bg-brand-50",
      iconColor: "text-brand-700",
      subColor: "text-brand-700",
    },
    info: {
      border: "border-sky-200",
      bg: "bg-sky-50",
      iconColor: "text-sky-600",
      subColor: "text-sky-700",
    },
  }[tone];
  // Outer: absolute pozisyon + animasyon (translateY ile)
  // Inner: rotate + card icerigi — rotate animasyon ile cakismaz
  return (
    <div
      className={`absolute ${position} animate-float-soft opacity-70`}
      style={{ animationDelay: delay }}
    >
      <div
        className={`${rotation} rounded-xl border ${styles.border} bg-white/90 backdrop-blur-sm shadow-lg px-3 py-2 w-44 flex items-center gap-2`}
      >
        <div
          className={`grid h-8 w-8 place-items-center rounded-lg ${styles.bg} shrink-0`}
        >
          <Icon className={`h-4 w-4 ${styles.iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-900 truncate">{title}</p>
          <p className={`text-[10px] ${styles.subColor} truncate`}>{sub}</p>
        </div>
      </div>
    </div>
  );
}
