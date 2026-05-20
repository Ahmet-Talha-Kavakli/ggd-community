import Link from "next/link";
import { Inbox, ArrowRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { Report, Profile } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Şikayetler" };

type ReportRow = Pick<
  Report,
  | "id"
  | "target_ggd_user_id"
  | "target_nickname"
  | "category"
  | "description"
  | "status"
  | "ai_severity"
  | "ai_summary"
  | "ai_recommendation"
  | "created_at"
> & { reporter: Pick<Profile, "nickname"> | null };

const statusMeta: Record<
  string,
  { label: string; variant: "outline" | "warning" | "brand" | "danger" }
> = {
  pending: { label: "Bekliyor", variant: "warning" },
  investigating: { label: "İnceleniyor", variant: "warning" },
  resolved: { label: "Çözüldü", variant: "brand" },
  rejected: { label: "Reddedildi", variant: "outline" },
};

const categoryLabels: Record<string, string> = {
  insult: "Hakaret",
  sabotage: "Sabotaj",
  cheat: "Hile",
  spam: "Spam",
  stream_sniping: "Stream sniping",
  other: "Diğer",
};

export default async function AdminSikayetlerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select(
      "id, target_ggd_user_id, target_nickname, category, description, status, ai_severity, ai_summary, ai_recommendation, created_at, reporter:profiles!reports_reporter_id_fkey(nickname)",
    )
    .order("status", { ascending: true })
    .order("ai_severity", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const reports = ((data ?? []) as unknown) as ReportRow[];
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Şikayetler"
        title="Şikayet incelemesi"
        description={`${pendingCount} bekleyen şikayet var.`}
        backHref="/admin"
      />

      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Inbox className="h-8 w-8 mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">Henüz şikayet yok.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {reports.map((r) => {
            const meta = statusMeta[r.status];
            return (
              <Link key={r.id} href={`/admin/sikayetler/${r.id}`}>
                <Card className="transition-all hover:shadow-card hover:border-brand-200">
                  <CardContent className="p-5 flex flex-col md:flex-row gap-4 md:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                        <Badge variant="outline">
                          {categoryLabels[r.category] ?? r.category}
                        </Badge>
                        {r.ai_severity != null && (
                          <Badge
                            variant={
                              r.ai_severity >= 4
                                ? "danger"
                                : r.ai_severity === 3
                                  ? "warning"
                                  : "outline"
                            }
                          >
                            AI: {r.ai_severity}/5
                          </Badge>
                        )}
                        <span className="text-xs text-ink-400 ml-auto">
                          {formatDateTime(r.created_at)}
                        </span>
                      </div>
                      {r.ai_summary && (
                        <p className="text-xs text-brand-700 mb-1 font-medium">
                          AI özeti: {r.ai_summary}
                        </p>
                      )}
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
                      <p className="mt-1 text-sm text-ink-600 line-clamp-2">
                        {r.description}
                      </p>
                      <p className="mt-2 text-xs text-ink-500">
                        Şikayet eden: {r.reporter?.nickname ?? "—"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-400 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
