import Link from "next/link";
import { ScrollText, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog, Profile } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Audit Log" };

type LogRow = AuditLog & { actor: Pick<Profile, "nickname" | "id"> | null };

const actionLabels: Record<
  string,
  { label: string; tone: "brand" | "warning" | "danger" | "default" }
> = {
  "ban.create": { label: "Ban verdi", tone: "danger" },
  "ban.auto_create": { label: "Otomatik ban (3 uyarı)", tone: "danger" },
  "ban.deactivate": { label: "Ban kaldırdı", tone: "default" },
  "warning.create": { label: "Uyarı verdi", tone: "warning" },
  "warning.deactivate": { label: "Uyarı kaldırdı", tone: "default" },
  "announcement.create": { label: "Duyuru yayınladı", tone: "brand" },
  "announcement.delete": { label: "Duyuru sildi", tone: "default" },
  "announcement.update": { label: "Duyuru güncelledi", tone: "brand" },
  "room_code.update": { label: "Oda kodunu güncelledi", tone: "brand" },
  "profile.verification": { label: "Üye doğrulama", tone: "brand" },
  "profile.role_change": { label: "Rol değiştirdi", tone: "brand" },
  "report.investigating": { label: "Şikayete bakıyor", tone: "warning" },
  "report.resolved": { label: "Şikayet çözdü", tone: "brand" },
  "report.rejected": { label: "Şikayet reddetti", tone: "default" },
  "red_zone.create": { label: "Kırmızı Alan ekledi", tone: "danger" },
  "red_zone.deactivate": { label: "Kırmızı Alan pasifledi", tone: "default" },
  "red_zone.delete": { label: "Kırmızı Alan sildi", tone: "default" },
};

// Filtre gruplari
const ACTION_GROUPS: { key: string; label: string; actions: string[] }[] = [
  {
    key: "ban",
    label: "Banlar",
    actions: ["ban.create", "ban.auto_create", "ban.deactivate"],
  },
  {
    key: "warning",
    label: "Uyarılar",
    actions: ["warning.create", "warning.deactivate"],
  },
  {
    key: "redzone",
    label: "Kırmızı Alan",
    actions: ["red_zone.create", "red_zone.deactivate", "red_zone.delete"],
  },
  {
    key: "report",
    label: "Şikayetler",
    actions: [
      "report.investigating",
      "report.resolved",
      "report.rejected",
    ],
  },
  {
    key: "announcement",
    label: "Duyurular",
    actions: [
      "announcement.create",
      "announcement.update",
      "announcement.delete",
    ],
  },
  {
    key: "system",
    label: "Sistem",
    actions: [
      "room_code.update",
      "profile.verification",
      "profile.role_change",
    ],
  },
];

// Metadata human-readable goster
function renderMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata || Object.keys(metadata).length === 0) return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(metadata)) {
    const label =
      {
        ggd_user_id: "GGD ID",
        duration: "Süre",
        severity: "Şiddet",
        reason: "Sebep",
        nickname: "Nick",
        auto_ban_triggered: "Otomatik ban",
      }[k] ?? k;
    let val = String(v);
    if (k === "duration") {
      val =
        val === "permanent"
          ? "kalıcı"
          : val === "7d"
            ? "7 gün"
            : val === "30d"
              ? "30 gün"
              : val === "90d"
                ? "90 gün"
                : val;
    }
    if (k === "severity") {
      val =
        val === "low"
          ? "hafif"
          : val === "medium"
            ? "orta"
            : val === "high"
              ? "ağır"
              : val;
    }
    if (val.length > 60) val = val.slice(0, 57) + "…";
    parts.push(`${label}: ${val}`);
  }
  return parts.join(" · ");
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; actor?: string }>;
}) {
  const params = await searchParams;
  const groupFilter = params.group ?? "";
  const actorFilter = params.actor ?? "";

  const supabase = await createClient();

  // Tum adminlerin listesini cek (filtre dropdown icin)
  const { data: adminProfiles } = await supabase
    .from("profiles")
    .select("id, nickname, role")
    .in("role", ["owner", "co_owner", "admin", "moderator"])
    .order("nickname", { ascending: true });

  const admins = (adminProfiles ?? []) as Pick<
    Profile,
    "id" | "nickname" | "role"
  >[];

  // Filtreli sorgu
  let q = supabase
    .from("audit_log")
    .select(
      "id, actor_id, action, target_type, target_id, metadata, created_at, actor:profiles!audit_log_actor_id_fkey(nickname, id)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (actorFilter) {
    q = q.eq("actor_id", actorFilter);
  }
  if (groupFilter) {
    const group = ACTION_GROUPS.find((g) => g.key === groupFilter);
    if (group) {
      q = q.in("action", group.actions);
    }
  }

  const { data } = await q;
  const logs = (data ?? []) as unknown as LogRow[];

  const hasFilter = !!groupFilter || !!actorFilter;

  function filterHref(overrides: { group?: string; actor?: string }): string {
    const merged: Record<string, string> = {};
    if (groupFilter && overrides.group === undefined) merged.group = groupFilter;
    if (actorFilter && overrides.actor === undefined) merged.actor = actorFilter;
    if (overrides.group !== undefined && overrides.group !== "")
      merged.group = overrides.group;
    if (overrides.actor !== undefined && overrides.actor !== "")
      merged.actor = overrides.actor;
    const qs = new URLSearchParams(merged).toString();
    return `/admin/audit-log${qs ? "?" + qs : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Audit log"
        title="Admin işlem kayıtları"
        description="Son 200 işlem (filtrelere göre). Tüm admin işlemleri buraya düşer."
        backHref="/admin"
      />

      {/* Filtre paneli */}
      <div className="rounded-2xl border border-ink-900 bg-white p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500 mr-1">
            Tür:
          </span>
          <Link
            href={filterHref({ group: "" })}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              !groupFilter
                ? "bg-ink-900 text-white border-ink-900"
                : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"
            }`}
          >
            Tümü
          </Link>
          {ACTION_GROUPS.map((g) => (
            <Link
              key={g.key}
              href={filterHref({ group: g.key })}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                groupFilter === g.key
                  ? "bg-ink-900 text-white border-ink-900"
                  : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"
              }`}
            >
              {g.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500 mr-1">
            Admin:
          </span>
          <Link
            href={filterHref({ actor: "" })}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              !actorFilter
                ? "bg-ink-900 text-white border-ink-900"
                : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"
            }`}
          >
            Tümü
          </Link>
          {admins.map((a) => (
            <Link
              key={a.id}
              href={filterHref({ actor: a.id })}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                actorFilter === a.id
                  ? "bg-ink-900 text-white border-ink-900"
                  : "bg-white text-ink-700 border-ink-200 hover:border-ink-400"
              }`}
            >
              {a.nickname}
            </Link>
          ))}
        </div>

        {hasFilter && (
          <div className="flex items-center justify-between pt-2 border-t border-ink-200">
            <span className="text-xs text-ink-500">
              {logs.length} sonuç gösteriliyor
            </span>
            <Link
              href="/admin/audit-log"
              className="inline-flex items-center gap-1 text-xs font-medium text-danger-700 hover:text-danger-800"
            >
              <X className="h-3 w-3" />
              Filtreleri temizle
            </Link>
          </div>
        )}
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <ScrollText className="h-8 w-8 mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">
              {hasFilter ? "Bu filtreyle kayıt bulunamadı." : "Henüz kayıt yok."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border border-ink-900 bg-white overflow-hidden">
          <ul className="divide-y divide-ink-200/60">
            {logs.map((log) => {
              const meta = actionLabels[log.action] ?? {
                label: log.action,
                tone: "default" as const,
              };
              const metaText = renderMetadata(
                log.metadata as Record<string, unknown> | null,
              );
              return (
                <li
                  key={log.id}
                  className="px-5 py-4 flex flex-col md:flex-row gap-3 md:items-start"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink-100 text-ink-700 text-sm font-bold shrink-0">
                      {(log.actor?.nickname ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-ink-900">
                          {log.actor?.nickname ?? "Bilinmeyen"}
                        </span>
                        <Badge variant={meta.tone}>{meta.label}</Badge>
                        {log.target_type && (
                          <code className="text-xs text-ink-500 bg-ink-100 px-1.5 py-0.5 rounded">
                            {log.target_type}#{log.target_id}
                          </code>
                        )}
                      </div>
                      {metaText && (
                        <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">
                          {metaText}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-ink-400 font-mono whitespace-nowrap md:pt-1">
                    {formatDateTime(log.created_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
