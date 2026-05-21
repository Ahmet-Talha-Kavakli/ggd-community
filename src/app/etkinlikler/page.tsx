import Link from "next/link";
import {
  Trophy,
  CalendarBlank,
  Users,
  Sparkle,
  ArrowRight,
  Gift,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/layout/page-hero";
import { CtaCard } from "@/components/layout/cta-card";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, relativeTime } from "@/lib/utils";
import type { Event, EventStatus, EventType } from "@/lib/supabase/types";
import { TONE_STYLES, type Tone } from "@/lib/card-tones";

export const metadata = { title: "Etkinlikler" };
export const revalidate = 60;

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

const TYPE_META: Record<
  EventType,
  { label: string; Icon: typeof Trophy }
> = {
  raffle: { label: "Çekiliş", Icon: Gift },
  tournament: { label: "Turnuva", Icon: Trophy },
  community: { label: "Topluluk", Icon: Users },
  other: { label: "Etkinlik", Icon: Sparkle },
};

type EventRow = Pick<
  Event,
  | "id"
  | "title"
  | "description"
  | "type"
  | "status"
  | "starts_at"
  | "ends_at"
  | "prize"
  | "max_participants"
  | "winner_id"
>;

export default async function EtkinliklerPage() {
  const supabase = await createClient();

  // Yalnızca yayınlanan/ongoing/completed etkinlikler (RLS draftı zaten filtreler)
  const { data } = await supabase
    .from("events")
    .select(
      "id, title, description, type, status, starts_at, ends_at, prize, max_participants, winner_id",
    )
    .neq("status", "draft")
    .order("starts_at", { ascending: false });

  const events = (data ?? []) as EventRow[];

  // Katılım sayılarını topla
  const counts = new Map<number, number>();
  if (events.length > 0) {
    const ids = events.map((e) => e.id);
    const { data: participants } = await supabase
      .from("event_participants")
      .select("event_id")
      .in("event_id", ids);
    for (const row of (participants ?? []) as { event_id: number }[]) {
      counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
    }
  }

  const upcoming = events.filter(
    (e) => e.status === "published" || e.status === "ongoing",
  );
  const past = events.filter(
    (e) => e.status === "completed" || e.status === "cancelled",
  );

  return (
    <>
      <PageHero
        eyebrow="Etkinlikler"
        title="Çekilişler, turnuvalar, topluluk buluşmaları."
        description="Yönetimin düzenlediği etkinliklere katıl, kazananları takip et."
        image={{ src: "/goose-trophy.png", alt: "Kupa taşıyan kaz" }}
      />

      <section className="container-page py-14">
        {events.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent>
              <EmptyState
                title="Henüz etkinlik yok"
                description="İlk etkinlik açıldığında burada görünecek. Duyuruları takip et."
                cta={{ label: "Duyurulara git", href: "/duyurular" }}
                image="/goose-celebrating.png"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-10">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-700 mb-4">
                  Yaklaşan & devam edenler ({upcoming.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {upcoming.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      count={counts.get(e.id) ?? 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500 mb-4">
                  Geçmiş etkinlikler ({past.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {past.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      count={counts.get(e.id) ?? 0}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <CtaCard
        title="Bir sonraki çekilişi kaçırma!"
        description="Topluluk üyeleri etkinliklere katılabilir, ödüller kazanabilir. Önce kayıt ol."
        primary={{ label: "Kayıt Ol", href: "/kayit" }}
        secondary={{ label: "Duyurular", href: "/duyurular" }}
        image="/goose-trophy.png"
      />
    </>
  );
}

function statusToTone(status: EventStatus): Tone {
  switch (status) {
    case "ongoing":
      return "warning";
    case "published":
      return "brand";
    case "cancelled":
      return "danger";
    case "completed":
    case "draft":
    default:
      return "neutral";
  }
}

function EventCard({
  event,
  count,
}: {
  event: EventRow;
  count: number;
}) {
  const status = STATUS_META[event.status];
  const typeMeta = TYPE_META[event.type];
  const TypeIcon = typeMeta.Icon;
  const isPast =
    event.status === "completed" || event.status === "cancelled";
  const tone = statusToTone(event.status);
  const t = TONE_STYLES[tone];

  return (
    <Link href={`/etkinlikler/${event.id}`} className="group block h-full">
      <div
        className={`relative h-full overflow-hidden rounded-2xl bg-white border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300 p-6 flex flex-col gap-3`}
        style={{ backgroundImage: t.texture }}
      >
        <div className="relative flex items-start gap-3">
          <div
            className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 bg-linear-to-br ${t.iconBg} ring-1 ${t.iconRing} ${t.iconColor} shadow-sm group-hover:scale-105 transition-transform duration-300`}
          >
            <TypeIcon size={20} weight="duotone" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant={status.variant}>{status.label}</Badge>
              <Badge variant="outline">{typeMeta.label}</Badge>
            </div>
            <h3 className="font-semibold text-ink-900 leading-snug">
              {event.title}
            </h3>
          </div>
        </div>

        {event.prize && (
          <div className="relative rounded-xl bg-white/60 border border-ink-200/60 px-3 py-2 text-sm backdrop-blur-sm">
            <span className={`text-xs font-medium uppercase tracking-wider ${t.iconColor}`}>
              Ödül
            </span>
            <p className="text-ink-800 mt-0.5">{event.prize}</p>
          </div>
        )}

        <p className="relative text-sm text-ink-600 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="relative mt-auto pt-2 flex items-center justify-between text-xs text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarBlank size={12} weight="duotone" />
            {isPast
              ? `Bitti · ${relativeTime(event.starts_at)}`
              : formatDateTime(event.starts_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={12} weight="duotone" />
            {count}
            {event.max_participants ? ` / ${event.max_participants}` : ""}
          </span>
        </div>

        <span className={`relative inline-flex items-center gap-1 text-xs font-medium ${t.iconColor} group-hover:gap-2 transition-all`}>
          Detay <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
