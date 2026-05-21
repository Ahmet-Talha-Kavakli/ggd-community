import Link from "next/link";
import Image from "next/image";
import { Hash, Lock, MessagesSquare, Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/layout/page-hero";
import { CtaCard } from "@/components/layout/cta-card";
import { TONE_STYLES, type Tone } from "@/lib/card-tones";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { Channel } from "@/lib/supabase/types";

export const metadata = { title: "Topluluk" };

export default async function ToplulukPage() {
  const supabase = await createClient();
  const [channelsRes, memberCountRes, current] = await Promise.all([
    supabase
      .from("channels")
      .select("id, slug, name, description, locked, position")
      .order("position", { ascending: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    getCurrentUser(),
  ]);

  const channels = (channelsRes.data ?? []) as Pick<
    Channel,
    "id" | "slug" | "name" | "description" | "locked" | "position"
  >[];
  const totalMembers = memberCountRes.count ?? 0;

  return (
    <>
      <PageHero
        eyebrow="Topluluk"
        title="Birlikte muhabbet edelim."
        description="Kanallı sohbet sistemimiz ile oyuncularla anlık iletişim kur, lobi ara, deneyim paylaş."
        image={{
          src: "/community.png",
          alt: "Birlikte duran kazlar",
          videoSrc: "/topluluk-video.mp4",
        }}
      />

      <section className="container-page py-14">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink-900 mb-5">
              Kanallar
            </h2>
            <div className="grid gap-3">
              {channels.map((ch) => (
                <Link
                  key={ch.slug}
                  href={`/topluluk/${ch.slug}`}
                  className="group"
                >
                  <Card className="transition-all duration-200 hover:shadow-card hover:border-brand-200">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink-100 text-ink-700 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                        {ch.locked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <Hash className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-ink-900">
                            #{ch.name}
                          </h3>
                          {ch.locked && (
                            <Badge variant="outline" className="text-xs">
                              Sadece yönetim
                            </Badge>
                          )}
                        </div>
                        {ch.description && (
                          <p className="mt-0.5 text-sm text-ink-500">
                            {ch.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <aside>
            <h2 className="text-xl font-semibold tracking-tight text-ink-900 mb-5">
              Özet
            </h2>
            <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Users className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-bold text-ink-900">
                  {totalMembers}
                </p>
                <p className="text-sm text-ink-500">Toplam üye</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <MessagesSquare className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-bold text-ink-900">
                  {channels.length}
                </p>
                <p className="text-sm text-ink-500">Aktif kanal</p>
              </CardContent>
            </Card>
            {!current && (
              <div className="rounded-2xl bg-brand-50 border border-brand-200 p-5">
                <p className="text-sm text-brand-800 leading-relaxed">
                  Sohbete katılmak için{" "}
                  <Link
                    href="/giris"
                    className="font-semibold underline underline-offset-2"
                  >
                    giriş yap
                  </Link>{" "}
                  veya{" "}
                  <Link
                    href="/kayit"
                    className="font-semibold underline underline-offset-2"
                  >
                    kayıt ol
                  </Link>
                  .
                </p>
              </div>
            )}
            {current && !current.isApproved && (
              <div className="rounded-2xl bg-warning-50 border border-warning-500/30 p-5">
                <p className="text-sm text-warning-800 leading-relaxed">
                  Sohbet için hesabının onaylanması bekleniyor.
                </p>
              </div>
            )}
            </div>
          </aside>
        </div>
      </section>

      <CommunityValuesSection />

      <CtaCard
        title="Lobide eğlence başlasın."
        description="Sohbete katıl, yeni etkinlikleri kaçırma, çekilişlere şansını dene."
        primary={{ label: "Etkinliklere Bak", href: "/etkinlikler" }}
        secondary={{ label: "Duyuruları Gör", href: "/duyurular" }}
        image="/goose-friendly.png"
      />
    </>
  );
}

function CommunityValuesSection() {
  const values: {
    num: string;
    title: string;
    desc: string;
    image: string;
    alt: string;
    tone: Tone;
  }[] = [
    {
      num: "01",
      title: "Şeffaflık",
      desc: "Her ban gerekçeli, audit log herkese açık. Yönetim ne yaptığını gizlemez — topluluk kararları görünür.",
      image: "/goose-shield.png",
      alt: "Koruyucu kaz",
      tone: "info",
    },
    {
      num: "02",
      title: "Aktif yönetim",
      desc: "2-5 kişilik moderatör ekip. Her şikayet 48 saat içinde değerlendirilir, kanıtla beraber incelenir.",
      image: "/goose-thinking.png",
      alt: "Düşünen kaz",
      tone: "brand",
    },
    {
      num: "03",
      title: "Sıcak ortam",
      desc: "Türkçe konuşan, kuralları benimsemiş oyuncular. Yeni gelen rahat eder, eski gelen kuralı bilir.",
      image: "/goose-friendly.png",
      alt: "Arkadaş canlısı kaz",
      tone: "warning",
    },
  ];

  return (
    <section className="container-page py-20 md:py-28">
      <div className="max-w-2xl mb-12 animate-fade-up">
        <Badge variant="brand" className="mb-4">
          Topluluk değerleri
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
          Neden GooseCage?
        </h2>
        <p className="text-lg text-ink-500 mt-4 leading-relaxed">
          Sıradan bir Discord değil. Toksisiteyi azaltıp Goose Goose Duck
          oyununu yeniden eğlenceli yapmak için kurulmuş bir topluluk.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {values.map((v, i) => {
          const t = TONE_STYLES[v.tone];
          return (
            <div
              key={v.num}
              className={`animate-fade-up stagger-${i + 1} relative overflow-hidden rounded-3xl bg-white/90 p-8 border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300`}
              style={{ backgroundImage: t.texture }}
            >
              <div
                className={`absolute -top-2 right-4 text-[88px] font-bold ${t.bigNumber} leading-none select-none pointer-events-none`}
              >
                {v.num}
              </div>

              <div className="relative h-40 w-40 mx-auto mb-6 rounded-3xl overflow-hidden ring-1 ring-ink-200">
                <Image
                  src={v.image}
                  alt={v.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <h3 className="relative text-xl font-semibold tracking-tight text-ink-900">
                {v.title}
              </h3>
              <p className="relative mt-3 text-sm text-ink-600 leading-relaxed">
                {v.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
