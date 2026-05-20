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

const FEATURES = [
  {
    icon: MagnifyingGlass,
    title: "Oyuncu Sorgu",
    description:
      "GGD User ID ile herhangi bir oyuncunun uyarı ve kara liste durumunu anında öğren.",
    href: "/sorgu",
  },
  {
    icon: ShieldCheck,
    title: "Kara Liste & Uyarılar",
    description:
      "Toksik oyuncuların listesi, gerekçeli ban kayıtları ve uyarı geçmişi.",
    href: "/kara-liste",
  },
  {
    icon: Warning,
    title: "Şikayet Sistemi",
    description:
      "Kanıt yükleyerek (foto/video) oyuncuları yönetime şikayet et. Şeffaf süreç.",
    href: "/sikayet",
  },
  {
    icon: ChatsCircle,
    title: "Topluluk Sohbeti",
    description:
      "Kanallı yapı ile oyuncularla anlık sohbet et, lobi ara, deneyim paylaş.",
    href: "/topluluk",
  },
  {
    icon: Megaphone,
    title: "Duyurular",
    description:
      "Yönetimden gelen güncel duyurular, kural değişiklikleri ve etkinlikler.",
    href: "/duyurular",
  },
  {
    icon: UserPlus,
    title: "Üye Kaydı",
    description:
      "Topluluğun bir parçası ol, GGD Friend Code ile kayıt ol.",
    href: "/kayit",
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
      <section className="hero-wash">
        <div className="container-page py-16 md:py-24 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="flex flex-col gap-7">
              <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                {SITE.name} · Lobi yönetim merkezi
              </span>
              <h1 className="animate-fade-up stagger-1 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink-900 leading-[1.02]">
                Goose Goose Duck için
                <br />
                <span className="text-brand-600">sağlıklı bir topluluk.</span>
              </h1>
              <p className="animate-fade-up stagger-2 text-lg md:text-xl text-ink-500 leading-relaxed max-w-xl">
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
                <Image
                  src="/hero.png"
                  alt="GooseGuard topluluğunun maskotu"
                  width={1600}
                  height={1000}
                  priority
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page -mt-8 md:-mt-12 relative z-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 overflow-hidden animate-scale-in stagger-4">
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

      {recentMembers.length > 0 && (
        <section className="container-page py-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-ink-900">
              Son katılanlar
            </h2>
            <Link
              href="/topluluk"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Tümü →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {recentMembers.map((m, i) => (
              <div
                key={m.id}
                className={`animate-fade-up stagger-${Math.min(i + 1, 6)} rounded-2xl border border-ink-200/70 bg-white p-5 flex flex-col items-center text-center lift`}
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
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Tümü →
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {announcements.map((a, i) => (
              <Link key={a.id} href="/duyurular" className="group">
                <Card
                  className={`animate-fade-up stagger-${Math.min(i + 1, 6)} h-full lift hover:border-brand-200 hover:shadow-card`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {a.pinned && (
                        <Badge variant="brand">
                          <PushPin size={10} weight="fill" />
                          Sabit
                        </Badge>
                      )}
                      <Badge variant="outline">{a.tag}</Badge>
                    </div>
                    <h3 className="font-semibold text-ink-900 line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink-500 line-clamp-3 leading-relaxed">
                      {a.body}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs text-ink-400">
                      <CalendarBlank size={12} weight="regular" />
                      {formatDate(a.published_at)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Link key={f.href} href={f.href} className="group">
              <Card
                className={`animate-fade-up stagger-${Math.min(i + 1, 6)} h-full lift hover:shadow-float hover:border-brand-200`}
              >
                <CardContent className="p-7">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                    <f.icon size={22} weight="duotone" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                    {f.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:gap-2 transition-all">
                    Keşfet
                    <ArrowRight size={14} weight="bold" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="rounded-3xl bg-linear-to-br from-brand-600 to-brand-700 p-10 md:p-16 text-white shadow-card relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay [background:radial-gradient(80%_60%_at_50%_0%,#ffffff_0%,transparent_60%)]" />
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none hidden md:block">
            <Image
              src="/flying.png"
              alt=""
              fill
              className="object-cover object-right mix-blend-screen"
              aria-hidden
            />
          </div>
          <div className="relative max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Topluluğa katılmaya hazır mısın?
            </h3>
            <p className="mt-4 text-brand-50 text-lg">
              Ücretsiz kayıt ol, kuralları benimse, oyuna keyifle dön.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/kayit">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-brand-700 hover:bg-brand-50 shine"
                >
                  Kayıt Ol
                  <ArrowRight size={18} weight="bold" />
                </Button>
              </Link>
              <Link href="/kurallar">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Önce kuralları oku
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
