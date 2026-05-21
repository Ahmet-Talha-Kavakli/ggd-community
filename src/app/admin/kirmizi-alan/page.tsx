import Link from "next/link";
import { Calendar, Plus, Skull } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  deactivateRedZoneAction,
  deleteRedZoneAction,
} from "@/lib/actions/admin";
import type { RedZoneEntry } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Kırmızı Alan" };

export default async function AdminKirmiziAlanPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("red_zone")
    .select(
      "id, ggd_user_id, nickname, main_name, reason, description, source, evidence_url, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  const entries = (data ?? []) as RedZoneEntry[];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Kırmızı Alan"
        title="Evrensel ban listesi"
        description="Hiçbir lobiye girmemesi gereken oyuncular. Bizim banımızdan bağımsız."
        backHref="/admin"
        actions={
          <Link href="/admin/kirmizi-alan/yeni">
            <Button>
              <Plus className="h-4 w-4" />
              Yeni Kayıt
            </Button>
          </Link>
        }
      />

      {entries.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Skull className="h-8 w-8 mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">
              Henüz Kırmızı Alan kaydı yok.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className={!entry.is_active ? "opacity-60" : ""}
          >
            <CardContent className="p-5 flex flex-col md:flex-row gap-4 md:items-start">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-danger-600 text-white shrink-0 shadow-sm">
                <Skull className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <h3 className="font-semibold text-ink-900 text-base">
                    {entry.nickname}
                  </h3>
                  {entry.main_name && (
                    <span className="text-xs text-ink-500">
                      ana isim:{" "}
                      <span className="font-medium text-ink-700">
                        {entry.main_name}
                      </span>
                    </span>
                  )}
                  {entry.ggd_user_id && (
                    <code className="text-xs font-mono text-ink-500 bg-ink-100 px-2 py-0.5 rounded-md">
                      {entry.ggd_user_id}
                    </code>
                  )}
                  {entry.source && (
                    <Badge variant="outline">{entry.source}</Badge>
                  )}
                  {!entry.is_active && (
                    <Badge variant="outline">Pasif</Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-danger-700">
                  {entry.reason}
                </p>
                {entry.description && (
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                    {entry.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(entry.created_at)}
                  </span>
                  {entry.evidence_url && (
                    <Link
                      href={entry.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-700 hover:text-brand-800 underline-offset-2 hover:underline"
                    >
                      Kanıt linki →
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {entry.is_active && (
                  <form action={deactivateRedZoneAction}>
                    <input type="hidden" name="id" value={entry.id} />
                    <Button variant="outline" size="sm" type="submit">
                      Pasifle
                    </Button>
                  </form>
                )}
                <form action={deleteRedZoneAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <Button variant="outline" size="sm" type="submit">
                    Sil
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
