import Link from "next/link";
import { AlertTriangle, Calendar, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TagChips } from "@/components/ui/tag-chips";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { deactivateWarningAction } from "@/lib/actions/admin";
import type { Warning, Profile } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Uyarılar" };

type WarningRow = Warning & {
  issued_by_profile: Pick<Profile, "nickname"> | null;
};

export default async function AdminUyarilarPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("warnings")
    .select(
      "id, ggd_user_id, target_nickname, target_main_name, reason, reason_tags, severity, created_at, issued_by, is_active, issued_by_profile:profiles!warnings_issued_by_fkey(nickname)",
    )
    .order("created_at", { ascending: false });

  const warnings = ((data ?? []) as unknown) as WarningRow[];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Uyarılar"
        title="Uyarı yönetimi"
        description="3 aktif uyarı = otomatik 30 günlük ban önerisi."
        backHref="/admin"
        actions={
          <Link href="/admin/uyarilar/yeni">
            <Button>
              <Plus className="h-4 w-4" />
              Uyarı Ver
            </Button>
          </Link>
        }
      />

      {warnings.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">Henüz uyarı kaydı yok.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {warnings.map((w) => (
          <Card key={w.id} className={!w.is_active ? "opacity-60" : ""}>
            <CardContent className="p-5 flex flex-col md:flex-row gap-4 md:items-center">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-warning-50 text-warning-600 shrink-0">
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
                  <Badge
                    variant={
                      !w.is_active
                        ? "outline"
                        : w.severity === "high"
                          ? "danger"
                          : w.severity === "medium"
                            ? "warning"
                            : "outline"
                    }
                  >
                    {!w.is_active
                      ? "Pasif"
                      : w.severity === "high"
                        ? "Ağır"
                        : w.severity === "medium"
                          ? "Orta"
                          : "Hafif"}
                  </Badge>
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
                    Veren: {w.issued_by_profile?.nickname ?? "—"}
                  </span>
                </div>
              </div>
              {w.is_active && (
                <form action={deactivateWarningAction}>
                  <input type="hidden" name="id" value={w.id} />
                  <Button variant="outline" size="sm" type="submit">
                    Kaldır
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
