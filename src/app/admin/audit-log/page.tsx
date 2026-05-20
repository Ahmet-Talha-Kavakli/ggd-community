import { ScrollText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog, Profile } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Audit Log" };

type LogRow = AuditLog & { actor: Pick<Profile, "nickname"> | null };

const actionLabels: Record<string, { label: string; tone: "brand" | "warning" | "danger" | "default" }> = {
  "ban.create": { label: "Ban verdi", tone: "danger" },
  "ban.deactivate": { label: "Ban kaldırdı", tone: "default" },
  "warning.create": { label: "Uyarı verdi", tone: "warning" },
  "warning.deactivate": { label: "Uyarı kaldırdı", tone: "default" },
  "announcement.create": { label: "Duyuru yayınladı", tone: "brand" },
  "announcement.delete": { label: "Duyuru sildi", tone: "default" },
  "room_code.update": { label: "Oda kodunu güncelledi", tone: "brand" },
  "profile.verification": { label: "Üye doğrulama", tone: "brand" },
  "profile.role_change": { label: "Rol değiştirdi", tone: "brand" },
  "report.investigating": { label: "Şikayete bakıyor", tone: "warning" },
  "report.resolved": { label: "Şikayet çözdü", tone: "brand" },
  "report.rejected": { label: "Şikayet reddetti", tone: "default" },
};

export default async function AuditLogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select(
      "id, actor_id, action, target_type, target_id, metadata, created_at, actor:profiles!audit_log_actor_id_fkey(nickname)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const logs = ((data ?? []) as unknown) as LogRow[];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Audit log"
        title="Admin işlem kayıtları"
        description="Son 200 işlem. Tüm admin işlemleri buraya düşer."
        backHref="/admin"
      />

      {logs.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <ScrollText className="h-8 w-8 mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">Henüz kayıt yok.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border border-ink-200/70 bg-white overflow-hidden">
          <ul className="divide-y divide-ink-200/60">
            {logs.map((log) => {
              const meta = actionLabels[log.action] ?? {
                label: log.action,
                tone: "default" as const,
              };
              return (
                <li key={log.id} className="px-5 py-4 flex flex-col md:flex-row gap-3 md:items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-ink-100 text-ink-600 text-xs font-bold shrink-0">
                      {(log.actor?.nickname ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-ink-900">
                          {log.actor?.nickname ?? "?"}
                        </span>
                        <Badge variant={meta.tone}>{meta.label}</Badge>
                        {log.target_type && (
                          <code className="text-xs text-ink-500 bg-ink-100 px-1.5 py-0.5 rounded">
                            {log.target_type}#{log.target_id}
                          </code>
                        )}
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <pre className="mt-1 text-xs text-ink-500 font-mono overflow-x-auto">
                          {JSON.stringify(log.metadata)}
                        </pre>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-ink-400 font-mono whitespace-nowrap">
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
