import Link from "next/link";
import {
  Plus,
  Trophy,
  CalendarBlank,
  Users,
  Sparkle,
  Gift,
} from "@phosphor-icons/react/dist/ssr";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { Event, EventStatus, EventType } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Etkinlikler" };

const STATUS_META: Record<
  EventStatus,
  { label: string; variant: "outline" | "warning" | "brand" | "danger" }
> = {
  draft: { label: "Taslak", variant: "outline" },
  published: { label: "Yayında", variant: "brand" },
  ongoing: { label: "Devam ediyor", variant: "warning" },
  completed: { label: "Tamamlandı", variant: "outline" },
  cancelled: { label: "İptal", variant: "danger" },
};

const TYPE_META: Record<EventType, { label: string; Icon: typeof Trophy }> = {
  raffle: { label: "Çekiliş", Icon: Gift },
  tournament: { label: "Turnuva", Icon: Trophy },
  community: { label: "Topluluk", Icon: Users },
  other: { label: "Etkinlik", Icon: Sparkle },
};

type EventRow = Pick<
  Event,
  | "id"
  | "title"
  | "type"
  | "status"
  | "starts_at"
  | "ends_at"
  | "prize"
  | "max_participants"
  | "winner_id"
  | "created_at"
>;

export default async function AdminEtkinliklerPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(
      "id, title, type, status, starts_at, ends_at, prize, max_participants, winner_id, created_at",
    )
    .order("created_at", { ascending: false });

  const events = (data ?? []) as EventRow[];

  const counts = new Map<number, number>();
  if (events.length > 0) {
    const { data: parts } = await supabase
      .from("event_participants")
      .select("event_id")
      .in(
        "event_id",
        events.map((e) => e.id),
      );
    for (const row of (parts ?? []) as { event_id: number }[]) {
      counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Etkinlikler"
        title="Etkinlik yönetimi"
        description="Çekiliş, turnuva ve topluluk buluşmaları oluştur. Taslak/yayında olarak kaydet, kazananı sen seç."
        backHref="/admin"
        actions={
          <Link href="/admin/etkinlikler/yeni">
            <Button>
              <Plus className="h-4 w-4" />
              Etkinlik oluştur
            </Button>
          </Link>
        }
      />

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Sparkle size={32} className="mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">
              Henüz etkinlik yok. İlkini oluştur.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {events.map((e) => {
            const status = STATUS_META[e.status];
            const typeMeta = TYPE_META[e.type];
            const TypeIcon = typeMeta.Icon;
            return (
              <Link key={e.id} href={`/admin/etkinlikler/${e.id}`}>
                <Card className="transition-all hover:shadow-card hover:border-brand-200">
                  <CardContent className="p-5 flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-700 shrink-0">
                      <TypeIcon size={18} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant="outline">{typeMeta.label}</Badge>
                        {e.winner_id && (
                          <Badge variant="warning">Kazanan seçildi</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-ink-900">{e.title}</h3>
                      <p className="mt-1 text-xs text-ink-500 inline-flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <CalendarBlank size={11} weight="duotone" />
                          {formatDateTime(e.starts_at)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users size={11} weight="duotone" />
                          {counts.get(e.id) ?? 0}
                          {e.max_participants ? ` / ${e.max_participants}` : ""}
                        </span>
                      </p>
                    </div>
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
