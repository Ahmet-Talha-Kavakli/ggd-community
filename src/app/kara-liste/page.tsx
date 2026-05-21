import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TagChips } from "@/components/ui/tag-chips";
import { InitialAvatar } from "@/components/ui/initial-avatar";
import { PageHero } from "@/components/layout/page-hero";
import { CtaCard } from "@/components/layout/cta-card";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Ban, Profile } from "@/lib/supabase/types";

export const metadata = { title: "Kara Liste" };
export const revalidate = 30; // 30 saniyede bir cache yenilensin (Vercel ISR)

type BanRow = Ban & { banned_by_profile: Pick<Profile, "nickname"> | null };

export default async function KaraListePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bans")
    .select(
      "id, ggd_user_id, target_nickname, target_main_name, reason, reason_tags, duration, expires_at, created_at, banned_by, is_active, banned_by_profile:profiles!bans_banned_by_fkey(nickname)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const bans = ((data ?? []) as unknown) as BanRow[];

  return (
    <>
      <PageHero
        eyebrow="Kara liste"
        title="Banlanmış oyuncular."
        description="Topluluğumuzdan ban almış oyuncuların güncel listesi. Şeffaflık için herkese açık."
        image={{
          src: "/goose-shield.png",
          alt: "Koruyucu kaz",
          videoSrc: "/kara-liste-video.mp4",
        }}
      />

      <section className="container-page py-14">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-ink-500">
            Toplam{" "}
            <span className="font-semibold text-ink-900">{bans.length}</span>{" "}
            kayıt
          </div>
          <Link
            href="/sorgu"
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Bir oyuncu sorgula →
          </Link>
        </div>

        {error && (
          <Card className="border-danger-500/30 bg-danger-50/50">
            <CardContent className="p-5 text-sm text-danger-700">
              Veri çekilirken bir hata oluştu: {error.message}
            </CardContent>
          </Card>
        )}

        {!error && bans.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                title="Topluluk temiz"
                description="Şu anda kara listede kimse bulunmuyor. Toksisitenin sıfıra indiği günlerdeyiz."
                image="/goose-sleeping.png"
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {bans.map((ban) => {
            const displayName = ban.target_main_name ?? ban.target_nickname;
            const isPermanent = ban.duration === "permanent";
            const ring = isPermanent
              ? "border-l-danger-500"
              : "border-l-warning-500";
            return (
              <Link
                key={ban.id}
                href={`/sorgu?q=${encodeURIComponent(
                  ban.ggd_user_id ??
                    ban.target_main_name ??
                    ban.target_nickname,
                )}`}
                className="group"
              >
                <Card
                  className={`transition-all hover:shadow-card hover:border-brand-200 border-l-4 ${ring}`}
                >
                  <CardContent className="p-5 md:p-6 flex gap-4 items-center">
                    <InitialAvatar name={displayName} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-semibold text-ink-900 text-base">
                          {displayName}
                        </h3>
                        <span className="text-xs text-ink-500">
                          {ban.target_main_name &&
                            ban.target_main_name !== ban.target_nickname && (
                              <>· {ban.target_nickname} </>
                            )}
                          {ban.ggd_user_id && (
                            <>
                              · <span className="font-mono">{ban.ggd_user_id}</span>
                            </>
                          )}
                          {" · "}
                          <span
                            className={
                              isPermanent
                                ? "font-medium text-danger-600"
                                : "font-medium text-warning-600"
                            }
                          >
                            {isPermanent ? "Kalıcı" : ban.duration}
                          </span>
                        </span>
                      </div>
                      {ban.reason_tags && ban.reason_tags.length > 0 && (
                        <TagChips slugs={ban.reason_tags} className="mt-2" />
                      )}
                      {ban.reason && (
                        <p className="mt-2 text-sm text-ink-700">{ban.reason}</p>
                      )}
                      <div className="mt-2 text-xs text-ink-500">
                        {formatDate(ban.created_at)} ·{" "}
                        {ban.banned_by_profile?.nickname ?? "—"}
                        {ban.expires_at && (
                          <> · bitiş {formatDate(ban.expires_at)}</>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <CtaCard
        title="Bir oyuncuyu mu araştırmak istiyorsun?"
        description="Nick, ana isim veya User ID — hangisi elindeyse anında sicil sorgusu yapabilirsin."
        primary={{ label: "Oyuncu Sorgula", href: "/sorgu" }}
        secondary={{ label: "Şikayet Et", href: "/sikayet" }}
        image="/goose-search.png"
      />
    </>
  );
}
