import Link from "next/link";
import { AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TagChips } from "@/components/ui/tag-chips";
import { PageHero } from "@/components/layout/page-hero";
import { CtaCard } from "@/components/layout/cta-card";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Warning, Profile, WarningSeverity } from "@/lib/supabase/types";

export const metadata = { title: "Uyarılar" };

type WarningRow = Warning & {
  issued_by_profile: Pick<Profile, "nickname"> | null;
};

const severityMap: Record<
  WarningSeverity,
  { label: string; variant: "outline" | "warning" | "danger" }
> = {
  low: { label: "Hafif", variant: "outline" },
  medium: { label: "Orta", variant: "warning" },
  high: { label: "Ağır", variant: "danger" },
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
        image={{ src: "/goose-warning.png", alt: "Tetikte bekleyen kaz" }}
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
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {warnings.map((w) => {
            const sev = severityMap[w.severity];
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
                <Card className="transition-all hover:shadow-card hover:border-brand-200">
                  <CardContent className="p-5 md:p-6 flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-warning-50 text-warning-600 shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="font-semibold text-ink-900">
                          {w.target_main_name ?? w.target_nickname}
                        </h3>
                        {w.target_main_name &&
                          w.target_main_name !== w.target_nickname && (
                            <span className="text-xs text-ink-500">
                              oyun içi:{" "}
                              <span className="font-medium text-ink-700">
                                {w.target_nickname}
                              </span>
                            </span>
                          )}
                        {w.ggd_user_id && (
                          <code className="text-xs font-mono text-ink-500 bg-ink-100 px-2 py-0.5 rounded-md">
                            {w.ggd_user_id}
                          </code>
                        )}
                        <Badge variant={sev.variant}>{sev.label}</Badge>
                      </div>
                      {w.reason_tags && w.reason_tags.length > 0 && (
                        <TagChips slugs={w.reason_tags} className="mt-2" />
                      )}
                      {w.reason && (
                        <p className="mt-2 text-sm text-ink-600">{w.reason}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(w.created_at)}
                        </span>
                        <span>
                          Uyarıyı veren: {w.issued_by_profile?.nickname ?? "—"}
                        </span>
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
