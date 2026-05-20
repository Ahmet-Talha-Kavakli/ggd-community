import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/layout/page-hero";
import { requireMember } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { Report } from "@/lib/supabase/types";

export const metadata = { title: "Şikayetlerim" };

const statusMap: Record<
  string,
  { label: string; variant: "outline" | "warning" | "brand" | "danger" }
> = {
  pending: { label: "Beklemede", variant: "warning" },
  investigating: { label: "İnceleniyor", variant: "warning" },
  resolved: { label: "Çözüldü", variant: "brand" },
  rejected: { label: "Reddedildi", variant: "danger" },
};

const categoryLabels: Record<string, string> = {
  insult: "Hakaret",
  sabotage: "Sabotaj",
  cheat: "Hile",
  spam: "Spam",
  stream_sniping: "Stream sniping",
  other: "Diğer",
};

export default async function SikayetlerimPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const current = await requireMember();
  const params = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select(
      "id, target_ggd_user_id, target_nickname, category, description, status, resolution_note, created_at, resolved_at",
    )
    .eq("reporter_id", current.user.id)
    .order("created_at", { ascending: false });

  const reports = (data ?? []) as Pick<
    Report,
    | "id"
    | "target_ggd_user_id"
    | "target_nickname"
    | "category"
    | "description"
    | "status"
    | "resolution_note"
    | "created_at"
    | "resolved_at"
  >[];

  return (
    <>
      <PageHero
        eyebrow="Şikayetlerim"
        title={`${reports.length} şikayet kaydın var.`}
        description="Açtığın şikayetler ve durumları."
      />

      <section className="container-page py-14">
        {params.ok && (
          <Card className="mb-6 border-brand-200 bg-brand-50">
            <CardContent className="p-5 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium text-brand-900">
                  Şikayetin alındı.
                </p>
                <p className="text-sm text-brand-700">
                  Yönetim 48 saat içinde değerlendirecek.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {reports.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent>
              <EmptyState
                title="Henüz şikayetin yok"
                description="Bir oyuncuyla ilgili sorun yaşadıysan şikayet edebilirsin."
                cta={{ label: "Şikayet Et", href: "/sikayet" }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {reports.map((r) => {
              const status = statusMap[r.status];
              return (
                <Card key={r.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant="outline">
                        {categoryLabels[r.category] ?? r.category}
                      </Badge>
                      <span className="text-xs text-ink-500 ml-auto">
                        {formatDateTime(r.created_at)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-ink-900">
                      {r.target_nickname}
                      {r.target_ggd_user_id && (
                        <>
                          {" "}
                          <code className="text-xs font-mono text-ink-500 bg-ink-100 px-1.5 py-0.5 rounded">
                            {r.target_ggd_user_id}
                          </code>
                        </>
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-ink-600 leading-relaxed line-clamp-3">
                      {r.description}
                    </p>
                    {r.resolution_note && (
                      <div className="mt-3 rounded-xl bg-ink-50 border border-ink-200 p-3">
                        <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">
                          Yönetim notu
                        </p>
                        <p className="mt-1 text-sm text-ink-700">
                          {r.resolution_note}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
