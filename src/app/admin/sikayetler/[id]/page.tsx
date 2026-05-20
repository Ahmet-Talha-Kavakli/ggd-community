import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, FileImage, FileVideo } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { ResolveReportForm } from "./resolve-form";
import type { Report, Profile, ReportEvidence } from "@/lib/supabase/types";

export const metadata = { title: "Şikayet Detayı" };

const categoryLabels: Record<string, string> = {
  insult: "Hakaret",
  sabotage: "Sabotaj",
  cheat: "Hile",
  spam: "Spam",
  stream_sniping: "Stream sniping",
  other: "Diğer",
};

const statusMeta: Record<
  string,
  { label: string; variant: "outline" | "warning" | "brand" | "danger" }
> = {
  pending: { label: "Bekliyor", variant: "warning" },
  investigating: { label: "İnceleniyor", variant: "warning" },
  resolved: { label: "Çözüldü", variant: "brand" },
  rejected: { label: "Reddedildi", variant: "outline" },
};

type ReportDetail = Report & {
  reporter: Pick<Profile, "id" | "nickname" | "email"> | null;
  resolver: Pick<Profile, "nickname"> | null;
};

export default async function AdminSikayetDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reportId = Number(id);
  if (!Number.isFinite(reportId)) notFound();

  const supabase = await createClient();
  const { data: reportData } = await supabase
    .from("reports")
    .select(
      "*, reporter:profiles!reports_reporter_id_fkey(id, nickname, email), resolver:profiles!reports_resolved_by_fkey(nickname)",
    )
    .eq("id", reportId)
    .maybeSingle();

  const report = reportData as unknown as ReportDetail | null;
  if (!report) notFound();

  const { data: evidenceData } = await supabase
    .from("report_evidence")
    .select("id, storage_path, media_type, file_size_bytes, created_at")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  const evidenceRows = (evidenceData ?? []) as Pick<
    ReportEvidence,
    "id" | "storage_path" | "media_type" | "file_size_bytes" | "created_at"
  >[];

  // Signed URL'leri üret (private bucket)
  const evidence = await Promise.all(
    evidenceRows.map(async (e) => {
      const { data } = await supabase.storage
        .from("report-evidence")
        .createSignedUrl(e.storage_path, 60 * 60);
      return { ...e, url: data?.signedUrl ?? null };
    }),
  );

  const meta = statusMeta[report.status];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Şikayet"
        title={`#${report.id} · ${report.target_nickname}`}
        description={`${categoryLabels[report.category] ?? report.category} kategorisinde şikayet`}
        backHref="/admin/sikayetler"
        actions={<Badge variant={meta.variant}>{meta.label}</Badge>}
      />

      {report.ai_severity != null && (
        <Card
          className={
            report.ai_severity >= 4
              ? "border-danger-200 bg-danger-50/40"
              : report.ai_severity === 3
                ? "border-warning-200 bg-warning-50/40"
                : "border-ink-200 bg-ink-50"
          }
        >
          <CardContent className="p-5 flex items-start gap-3">
            <div
              className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 ${
                report.ai_severity >= 4
                  ? "bg-danger-100 text-danger-700"
                  : report.ai_severity === 3
                    ? "bg-warning-100 text-warning-700"
                    : "bg-ink-100 text-ink-700"
              }`}
            >
              <span className="font-bold text-sm">AI</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-xs uppercase tracking-wider text-ink-500 font-medium">
                  AI ön analizi
                </p>
                <Badge
                  variant={
                    report.ai_severity >= 4
                      ? "danger"
                      : report.ai_severity === 3
                        ? "warning"
                        : "outline"
                  }
                >
                  Ciddiyet: {report.ai_severity}/5
                </Badge>
                {report.ai_recommendation && (
                  <Badge variant="outline">
                    Öneri:{" "}
                    {report.ai_recommendation === "ban"
                      ? "Banla"
                      : report.ai_recommendation === "warn"
                        ? "Uyar"
                        : report.ai_recommendation === "investigate"
                          ? "Araştır"
                          : report.ai_recommendation === "reject"
                            ? "Reddet"
                            : "Daha çok bilgi"}
                  </Badge>
                )}
              </div>
              {report.ai_summary && (
                <p className="text-sm text-ink-700">{report.ai_summary}</p>
              )}
              <p className="mt-2 text-xs text-ink-400">
                AI önerisi tavsiye niteliğindedir — kararı sen verirsin.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-ink-900 mb-3">Şikayet bilgileri</h3>
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-500">
                Şikayet edilen
              </dt>
              <dd className="mt-1 text-ink-900">
                <span className="font-medium">{report.target_nickname}</span>
                {report.target_main_name && (
                  <span className="text-xs text-ink-500 ml-2">
                    ({report.target_main_name})
                  </span>
                )}
                {report.target_ggd_user_id && (
                  <code className="text-xs font-mono text-ink-500 bg-ink-100 px-1.5 py-0.5 rounded ml-2">
                    {report.target_ggd_user_id}
                  </code>
                )}
              </dd>
              <Link
                href={`/sorgu?q=${encodeURIComponent(
                  report.target_ggd_user_id ??
                    report.target_main_name ??
                    report.target_nickname,
                )}`}
                className="mt-1 inline-block text-xs text-brand-700 hover:underline"
              >
                Sicili gör →
              </Link>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-500">
                Şikayet eden
              </dt>
              <dd className="mt-1 text-ink-900">{report.reporter?.nickname ?? "—"}</dd>
              <dd className="text-xs text-ink-500">
                {report.reporter?.email ?? ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-500">
                Tarih
              </dt>
              <dd className="mt-1 text-ink-900 inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(report.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-500">
                Durum
              </dt>
              <dd className="mt-1">
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </dd>
            </div>
          </dl>

          <h4 className="mt-6 font-medium text-ink-900 text-sm">Açıklama</h4>
          <p className="mt-2 text-[15px] text-ink-700 leading-relaxed whitespace-pre-wrap">
            {report.description}
          </p>
        </CardContent>
      </Card>

      {evidence.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-ink-900 mb-4">
              Kanıtlar ({evidence.length})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {evidence.map((e) => (
                <div
                  key={e.id}
                  className="rounded-2xl border border-ink-200 overflow-hidden bg-ink-50"
                >
                  {e.url ? (
                    e.media_type === "video" ? (
                      <video
                        src={e.url}
                        controls
                        className="w-full aspect-video bg-black"
                      />
                    ) : (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <Image
                          src={e.url}
                          alt="Kanıt"
                          width={400}
                          height={300}
                          className="w-full aspect-video object-cover"
                          unoptimized
                        />
                      </a>
                    )
                  ) : (
                    <div className="aspect-video grid place-items-center text-ink-400 text-sm">
                      Yüklenemedi
                    </div>
                  )}
                  <div className="p-3 flex items-center gap-2 text-xs text-ink-500">
                    {e.media_type === "video" ? (
                      <FileVideo className="h-3.5 w-3.5" />
                    ) : (
                      <FileImage className="h-3.5 w-3.5" />
                    )}
                    {e.file_size_bytes
                      ? `${(e.file_size_bytes / 1024 / 1024).toFixed(1)} MB`
                      : ""}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {report.resolution_note && (
        <Card className="bg-brand-50 border-brand-200">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-wider text-brand-700 font-medium">
              Önceki karar notu — {report.resolver?.nickname ?? ""}
            </p>
            <p className="mt-2 text-sm text-brand-900">
              {report.resolution_note}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Karar ver</h3>
          <ResolveReportForm
            reportId={report.id}
            targetGgdUserId={report.target_ggd_user_id ?? ""}
            targetNickname={report.target_nickname}
            currentStatus={report.status}
          />
        </CardContent>
      </Card>
    </div>
  );
}
