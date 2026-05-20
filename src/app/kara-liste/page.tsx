import Link from "next/link";
import { ShieldOff, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TagChips } from "@/components/ui/tag-chips";
import { PageHero } from "@/components/layout/page-hero";
import { CtaCard } from "@/components/layout/cta-card";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Ban, Profile } from "@/lib/supabase/types";

export const metadata = { title: "Kara Liste" };

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
        image={{ src: "/goose-shield.png", alt: "Koruyucu kaz" }}
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
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {bans.map((ban) => (
            <Link
              key={ban.id}
              href={`/sorgu?q=${encodeURIComponent(
                ban.ggd_user_id ??
                  ban.target_main_name ??
                  ban.target_nickname,
              )}`}
              className="group"
            >
              <Card className="transition-all hover:shadow-card hover:border-brand-200">
                <CardContent className="p-5 md:p-6 flex flex-col md:flex-row gap-4 md:items-center">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-danger-50 text-danger-600 shrink-0">
                    <ShieldOff className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="font-semibold text-ink-900">
                        {ban.target_main_name ?? ban.target_nickname}
                      </h3>
                      {ban.target_main_name &&
                        ban.target_main_name !== ban.target_nickname && (
                          <span className="text-xs text-ink-500">
                            oyun içi:{" "}
                            <span className="font-medium text-ink-700">
                              {ban.target_nickname}
                            </span>
                          </span>
                        )}
                      {ban.ggd_user_id && (
                        <code className="text-xs font-mono text-ink-500 bg-ink-100 px-2 py-0.5 rounded-md">
                          {ban.ggd_user_id}
                        </code>
                      )}
                      <Badge
                        variant={
                          ban.duration === "permanent" ? "danger" : "warning"
                        }
                      >
                        {ban.duration === "permanent" ? "Kalıcı" : ban.duration}
                      </Badge>
                    </div>
                    {ban.reason_tags && ban.reason_tags.length > 0 && (
                      <TagChips slugs={ban.reason_tags} className="mt-2" />
                    )}
                    {ban.reason && (
                      <p className="mt-2 text-sm text-ink-600">{ban.reason}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(ban.created_at)}
                      </span>
                      <span>
                        Banlayan: {ban.banned_by_profile?.nickname ?? "—"}
                      </span>
                      {ban.expires_at && (
                        <span>Bitiş: {formatDate(ban.expires_at)}</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
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
