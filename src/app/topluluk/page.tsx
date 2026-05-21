import Link from "next/link";
import { Hash, Lock, MessagesSquare, Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/layout/page-hero";
import { CtaCard } from "@/components/layout/cta-card";
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

          <aside className="space-y-4">
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
          </aside>
        </div>
      </section>

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
