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
import type { Warning, Profile, WarningSeverity } from "@/lib/supabase/types";

export const metadata = { title: "Uyarılar" };
export const revalidate = 30;

type WarningRow = Warning & {
  issued_by_profile: Pick<Profile, "nickname"> | null;
};

const severityRing: Record<WarningSeverity, string> = {
  low: "border-l-ink-300",
  medium: "border-l-warning-500",
  high: "border-l-danger-500",
};

export default async function UyarilarPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("warnings")
    .select(
      "id, ggd_user_id, target_nickname, target_main_name, reason, reason_tags, severity, created_at, issued_by, is_active, issued_by_profile:profiles!warnings_issued_by_fkey(nickname)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const warnings = (data as unknown as WarningRow[]) ?? [];

  return (
    <>
      <PageHero
        eyebrow="Uyarılar"
        title="Aktif uyarılar."
        description="Kurallara aykırı davranan ama henüz banlanmamış oyuncular. 3 uyarı = otomatik ban."
        image={{
          src: "/goose-warning.png",
          alt: "Tetikte bekleyen kaz",
          videoSrc: "/uyarilar-video.mp4",
        }}
      />

      <section className="container-page py-14">
        <div className="text-sm text-ink-500 mb-6">
          Toplam{" "}
          <span className="font-semibold text-ink-900">{warnings.length}</span>{" "}
          uyarı
        </div>

        {error && (
          <Card className="border-danger-500/30 bg-danger-50/50">
            <CardContent className="p-5 text-sm text-danger-700">
              Veri çekilirken bir hata oluştu: {error.message}
            </CardContent>
          </Card>
        )}

        {!error && warnings.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                title="Tertemiz"
                description="Şu anda kimsenin aktif uyarısı yok. Lobi keyifli geçiyor."
                image="/goose-sleeping.png"
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {warnings.map((w) => {
            const displayName = w.target_main_name ?? w.target_nickname;
            return (
              <Link
                key={w.id}
                href={`/sorgu?q=${encodeURIComponent(
                  w.ggd_user_id ??
                    w.target_main_name ??
                    w.target_nickname,
                )}`}
                className="group"
              >
                <Card
                  className={`transition-all hover:shadow-card hover:border-brand-200 border-l-4 ${severityRing[w.severity]}`}
                >
                  <CardContent className="p-5 md:p-6 flex gap-4 items-center">
                    <InitialAvatar name={displayName} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-semibold text-ink-900 text-base">
                          {displayName}
                        </h3>
                        <span className="text-xs text-ink-500">
                          {w.target_main_name &&
                            w.target_main_name !== w.target_nickname && (
                              <>· {w.target_nickname} </>
                            )}
                          {w.ggd_user_id && (
                            <>
                              · <span className="font-mono">{w.ggd_user_id}</span>
                            </>
                          )}
                        </span>
                      </div>
                      {w.reason_tags && w.reason_tags.length > 0 && (
                        <TagChips slugs={w.reason_tags} className="mt-2" />
                      )}
                      {w.reason && (
                        <p className="mt-2 text-sm text-ink-700">{w.reason}</p>
                      )}
                      <div className="mt-2 text-xs text-ink-500">
                        {formatDate(w.created_at)} ·{" "}
                        {w.issued_by_profile?.nickname ?? "—"}
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
        title="Kuralları biliyor musun?"
        description="Uyarı almamak için ne yapman gerektiğini bir gözden geçir — basit ve net kurallar."
        primary={{ label: "Kuralları Oku", href: "/kurallar" }}
        secondary={{ label: "Oyuncu Sorgula", href: "/sorgu" }}
        image="/goose-wise.png"
        tone="ink"
      />
    </>
  );
}
