import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Shuffle, Crown, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createClient } from "@/lib/supabase/server";
import { gravatarUrl } from "@/lib/gravatar";
import { formatDateTime } from "@/lib/utils";
import {
  deleteEventAction,
  pickWinnerAction,
  clearWinnerAction,
} from "@/lib/actions/events";
import { EventForm } from "../event-form";
import type { Event, Profile } from "@/lib/supabase/types";

export const metadata = { title: "Etkinlik Düzenle" };

type EventDetail = Event & {
  winner: Pick<Profile, "id" | "nickname" | "email"> | null;
};

type ParticipantRow = {
  joined_at: string;
  user: Pick<Profile, "id" | "nickname" | "email"> | null;
};

export default async function AdminEtkinlikDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isFinite(eventId)) notFound();

  const supabase = await createClient();
  const [eventRes, participantsRes, pollOptionsRes] = await Promise.all([
    supabase
      .from("events")
      .select(
        "*, winner:profiles!events_winner_id_fkey(id, nickname, email)",
      )
      .eq("id", eventId)
      .maybeSingle(),
    supabase
      .from("event_participants")
      .select(
        "joined_at, user:profiles!event_participants_user_id_fkey(id, nickname, email)",
      )
      .eq("event_id", eventId)
      .order("joined_at", { ascending: true }),
    supabase
      .from("poll_options")
      .select("label, position")
      .eq("event_id", eventId)
      .order("position", { ascending: true }),
  ]);

  const event = eventRes.data as unknown as EventDetail | null;
  if (!event) notFound();

  const pollOptionLabels = (
    (pollOptionsRes.data ?? []) as { label: string; position: number }[]
  ).map((o) => o.label);

  const participants = (participantsRes.data ?? []) as unknown as ParticipantRow[];
  const canPickWinner =
    event.type === "raffle" &&
    participants.length > 0 &&
    !event.winner_id &&
    ["published", "ongoing"].includes(event.status);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Etkinlik"
        title={event.title}
        description={`#${event.id} · ${formatDateTime(event.starts_at)}`}
        backHref="/admin/etkinlikler"
        actions={
          <Link href={`/etkinlikler/${event.id}`}>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4" />
              Public görünüm
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-7">
          <EventForm
            mode="edit"
            defaults={{
              id: event.id,
              title: event.title,
              description: event.description,
              type: event.type,
              status: event.status,
              starts_at: event.starts_at,
              ends_at: event.ends_at,
              prize: event.prize,
              max_participants: event.max_participants,
              poll_options: pollOptionLabels,
            }}
          />
        </CardContent>
      </Card>

      {event.type === "raffle" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-ink-900 mb-1">Kazanan</h3>
            <p className="text-sm text-ink-500 mb-4">
              {event.winner_id
                ? "Bu etkinlik için kazanan belirlendi."
                : participants.length === 0
                  ? "Henüz katılımcı yok — kazanan seçilemez."
                  : "Rastgele çek veya katılımcı listesinden manuel seç."}
            </p>

            {event.winner ? (
              <div className="flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50/50 p-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-warning-100 text-warning-700">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-warning-700 font-medium">
                    Kazanan
                  </p>
                  <p className="text-ink-900 font-semibold">
                    {event.winner.nickname}
                  </p>
                </div>
                <form action={clearWinnerAction}>
                  <input type="hidden" name="id" value={event.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Sıfırla
                  </Button>
                </form>
              </div>
            ) : canPickWinner ? (
              <div className="flex flex-col gap-3">
                <form action={pickWinnerAction}>
                  <input type="hidden" name="event_id" value={event.id} />
                  <input type="hidden" name="mode" value="random" />
                  <Button type="submit">
                    <Shuffle className="h-4 w-4" />
                    Rastgele çek ({participants.length} katılımcı)
                  </Button>
                </form>

                <form action={pickWinnerAction} className="flex gap-2">
                  <input type="hidden" name="event_id" value={event.id} />
                  <input type="hidden" name="mode" value="manual" />
                  <select
                    name="user_id"
                    required
                    defaultValue=""
                    className="flex h-10 flex-1 rounded-lg border border-ink-200 bg-white px-3 text-sm hover:border-ink-300 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="" disabled>
                      Manuel seç...
                    </option>
                    {participants.map(
                      (p) =>
                        p.user && (
                          <option key={p.user.id} value={p.user.id}>
                            {p.user.nickname}
                          </option>
                        ),
                    )}
                  </select>
                  <Button type="submit" variant="outline" size="sm">
                    Seç
                  </Button>
                </form>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-ink-900 mb-3">
            Katılımcılar ({participants.length})
          </h3>
          {participants.length === 0 ? (
            <p className="text-sm text-ink-500">Henüz katılımcı yok.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {participants.map((p, i) => (
                <li
                  key={p.user?.id ?? i}
                  className="flex items-center gap-2.5 rounded-lg border border-ink-200 px-3 py-2"
                >
                  {p.user && (
                    <Image
                      src={gravatarUrl(p.user.email, 64)}
                      alt={p.user.nickname}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full border border-ink-200"
                      unoptimized
                    />
                  )}
                  <span className="text-sm text-ink-700 flex-1">
                    {p.user?.nickname ?? "—"}
                  </span>
                  {event.winner_id === p.user?.id && (
                    <Badge variant="warning">
                      <Crown className="h-3 w-3" />
                      Kazanan
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-danger-200/60">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div>
            <h3 className="font-medium text-ink-900">Etkinliği sil</h3>
            <p className="text-sm text-ink-500 mt-0.5">
              Tüm katılım kayıtları da silinir. Geri alınamaz.
            </p>
          </div>
          <form action={deleteEventAction}>
            <input type="hidden" name="id" value={event.id} />
            <Button type="submit" variant="outline">
              <Trash2 className="h-4 w-4" />
              Sil
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
