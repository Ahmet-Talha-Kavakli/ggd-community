import Link from "next/link";
import { Calendar, Plus, ShieldOff } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TagChips } from "@/components/ui/tag-chips";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { deactivateBanAction } from "@/lib/actions/admin";
import type { Ban, Profile } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Kara Liste" };

type BanRow = Ban & {
  banned_by_profile: Pick<Profile, "nickname"> | null;
};

export default async function AdminKaraListePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bans")
    .select(
      "id, ggd_user_id, target_nickname, target_main_name, reason, reason_tags, duration, expires_at, created_at, banned_by, is_active, banned_by_profile:profiles!bans_banned_by_fkey(nickname)",
    )
    .order("created_at", { ascending: false });

  const bans = ((data ?? []) as unknown) as BanRow[];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Kara liste"
        title="Banlanmış oyuncular"
        description="Tüm ban kayıtları (aktif + geçmiş)."
        backHref="/admin"
        actions={
          <Link href="/admin/kara-liste/yeni">
            <Button>
              <Plus className="h-4 w-4" />
              Ban Ekle
            </Button>
          </Link>
        }
      />

      {bans.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <ShieldOff className="h-8 w-8 mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">Henüz ban kaydı yok.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {bans.map((ban) => (
          <Card key={ban.id} className={!ban.is_active ? "opacity-60" : ""}>
            <CardContent className="p-5 flex flex-col md:flex-row gap-4 md:items-center">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-danger-50 text-danger-600 shrink-0">
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
                      !ban.is_active
                        ? "outline"
                        : ban.duration === "permanent"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {!ban.is_active
                      ? "Pasif"
                      : ban.duration === "permanent"
                        ? "Kalıcı"
                        : ban.duration}
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
                </div>
              </div>
              {ban.is_active && (
                <form action={deactivateBanAction}>
                  <input type="hidden" name="id" value={ban.id} />
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
