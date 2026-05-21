import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Trophy,
  CalendarBlank,
  Users,
  Sparkle,
  Gift,
  Crown,
  SignOut,
  SignIn,
  ChartBar,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/page-hero";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { formatDateTime } from "@/lib/utils";
import { gravatarUrl } from "@/lib/gravatar";
import {
  joinEventAction,
  leaveEventAction,
  castPollVoteAction,
} from "@/lib/actions/events";
import type {
  Event,
  EventStatus,
  EventType,
  Profile,
} from "@/lib/supabase/types";

export const metadata = { title: "Etkinlik" };

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
  poll: { label: "Anket", Icon: ChartBar },
  other: { label: "Etkinlik", Icon: Sparkle },
};

type EventDetail = Event & {
  creator: Pick<Profile, "nickname"> | null;
  winner: Pick<Profile, "id" | "nickname" | "email"> | null;
};

type ParticipantRow = {
  joined_at: string;
  user: Pick<Profile, "id" | "nickname" | "email"> | null;
};

export default async function EtkinlikDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isFinite(eventId)) notFound();

  const supabase = await createClient();
  const [
    eventRes,
    participantsRes,
    pollOptionsRes,
    pollVotesRes,
    current,
  ] = await Promise.all([
    supabase
      .from("events")
      .select(
        "*, creator:profiles!events_created_by_fkey(nickname), winner:profiles!events_winner_id_fkey(id, nickname, email)",
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
      .select("id, label, position")
      .eq("event_id", eventId)
      .order("position", { ascending: true }),
    supabase
      .from("poll_votes")
      .select("option_id, user_id")
      .eq("event_id", eventId),
    getCurrentUser(),
  ]);

  const event = eventRes.data as unknown as EventDetail | null;
  if (!event) notFound();

  const pollOptions = (pollOptionsRes.data ?? []) as {
    id: number;
    label: string;
    position: number;
  }[];
  const pollVotes = (pollVotesRes.data ?? []) as {
    option_id: number;
    user_id: string;
  }[];
  const votesByOption = new Map<number, number>();
  for (const v of pollVotes) {
    votesByOption.set(v.option_id, (votesByOption.get(v.option_id) ?? 0) + 1);
  }
  const userVote = current
    ? pollVotes.find((v) => v.user_id === current.user.id)?.option_id ?? null
    : null;
  const totalVotes = pollVotes.length;

  const participants = (participantsRes.data ?? []) as unknown as ParticipantRow[];
  const status = STATUS_META[event.status];
  const typeMeta = TYPE_META[event.type];
  const TypeIcon = typeMeta.Icon;

  const userParticipating =
    !!current &&
    participants.some((p) => p.user?.id === current.user.id);
  const canJoin =
    !!current &&
    current.isApproved &&
    (event.status === "published" || event.status === "ongoing") &&
    (event.max_participants == null ||
      participants.length < event.max_participants) &&
    !userParticipating;
  const canLeave =
    userParticipating &&
    (event.status === "published" || event.status === "ongoing");
  const isFull =
    event.max_participants != null &&
    participants.length >= event.max_participants;

  return (
    <>
      <PageHero
        eyebrow={typeMeta.label}
        title={event.title}
        description={`${formatDateTime(event.starts_at)}${event.ends_at ? ` — ${formatDateTime(event.ends_at)}` : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Badge variant="outline">
            <TypeIcon size={12} weight="duotone" />
            {typeMeta.label}
          </Badge>
          <Badge variant="outline">
            <Users size={12} weight="duotone" />
            {participants.length}
            {event.max_participants ? ` / ${event.max_participants}` : ""}{" "}
            katılımcı
          </Badge>
        </div>
      </PageHero>

      <section className="container-page py-14">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-5">
            {event.type === "poll" && pollOptions.length > 0 && (
              <PollSection
                eventId={event.id}
                eventStatus={event.status}
                options={pollOptions}
                votesByOption={votesByOption}
                totalVotes={totalVotes}
                userVote={userVote}
                canVote={!!current && current.isApproved}
              />
            )}
            {event.prize && (
              <Card className="border-brand-200 bg-brand-50/60">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                      <Gift size={20} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-brand-700 font-medium">
                        Ödül
                      </p>
                      <p className="mt-1 text-ink-900 font-medium">
                        {event.prize}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6 md:p-8">
                <h2 className="font-semibold text-ink-900 mb-3">
                  Etkinlik detayları
                </h2>
                <p className="text-[15px] text-ink-700 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>

                <dl className="mt-6 grid gap-3 sm:grid-cols-2 text-sm border-t border-ink-100 pt-5">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">
                      Başlangıç
                    </dt>
                    <dd className="mt-0.5 text-ink-900 inline-flex items-center gap-1">
                      <CalendarBlank size={12} weight="duotone" />
                      {formatDateTime(event.starts_at)}
                    </dd>
                  </div>
                  {event.ends_at && (
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-ink-500">
                        Bitiş
                      </dt>
                      <dd className="mt-0.5 text-ink-900">
                        {formatDateTime(event.ends_at)}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">
                      Düzenleyen
                    </dt>
                    <dd className="mt-0.5 text-ink-900">
                      {event.creator?.nickname ?? "—"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {event.winner && (
              <Card className="border-warning-200 bg-warning-50/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-warning-100 text-warning-700">
                      <Crown size={22} weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wider text-warning-700 font-medium">
                        Kazanan
                      </p>
                      <p className="mt-0.5 text-ink-900 font-semibold text-lg">
                        {event.winner.nickname}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="flex flex-col gap-5">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-ink-900 mb-3">Katılım</h3>
                {!current ? (
                  <Link href={`/giris?next=/etkinlikler/${event.id}`}>
                    <Button className="w-full">
                      <SignIn size={16} weight="bold" />
                      Katılmak için giriş yap
                    </Button>
                  </Link>
                ) : !current.isApproved ? (
                  <p className="text-sm text-ink-600">
                    Etkinliğe katılmak için hesabının onaylanması gerekiyor.
                  </p>
                ) : userParticipating ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-brand-800 bg-brand-50 px-3 py-2 rounded-lg">
                      Bu etkinliğe katıldın ✓
                    </p>
                    {canLeave && (
                      <form action={leaveEventAction}>
                        <input
                          type="hidden"
                          name="event_id"
                          value={event.id}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full"
                        >
                          <SignOut size={16} weight="bold" />
                          Katılımdan vazgeç
                        </Button>
                      </form>
                    )}
                  </div>
                ) : canJoin ? (
                  <form action={joinEventAction}>
                    <input type="hidden" name="event_id" value={event.id} />
                    <Button type="submit" className="w-full">
                      <Sparkle size={16} weight="bold" />
                      Etkinliğe katıl
                    </Button>
                  </form>
                ) : isFull ? (
                  <p className="text-sm text-ink-600">
                    Kontenjan dolu — katılım kapalı.
                  </p>
                ) : (
                  <p className="text-sm text-ink-600">
                    {event.status === "completed"
                      ? "Bu etkinlik tamamlandı."
                      : event.status === "cancelled"
                        ? "Bu etkinlik iptal edildi."
                        : "Şu an katılıma kapalı."}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-semibold text-ink-900">Katılımcılar</h3>
                  <span className="text-xs text-ink-500">
                    {participants.length}
                    {event.max_participants
                      ? ` / ${event.max_participants}`
                      : ""}
                  </span>
                </div>
                {participants.length === 0 ? (
                  <p className="text-sm text-ink-500">
                    Henüz kimse katılmadı.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                    {participants.map((p, i) => (
                      <li
                        key={p.user?.id ?? i}
                        className="flex items-center gap-2.5"
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
                        <span className="text-sm text-ink-700">
                          {p.user?.nickname ?? "—"}
                        </span>
                        {event.winner_id === p.user?.id && (
                          <Crown
                            size={14}
                            weight="fill"
                            className="text-warning-600 ml-auto"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}

function PollSection({
  eventId,
  eventStatus,
  options,
  votesByOption,
  totalVotes,
  userVote,
  canVote,
}: {
  eventId: number;
  eventStatus: EventStatus;
  options: { id: number; label: string; position: number }[];
  votesByOption: Map<number, number>;
  totalVotes: number;
  userVote: number | null;
  canVote: boolean;
}) {
  const isClosed =
    eventStatus === "completed" || eventStatus === "cancelled";
  const isLive = eventStatus === "published" || eventStatus === "ongoing";
  const showVoteUI = isLive && canVote;

  return (
    <Card className="border-brand-200">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start gap-3 mb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
            <ChartBar size={20} weight="duotone" />
          </div>
          <div>
            <h2 className="font-semibold text-ink-900">Topluluk anketi</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              {totalVotes} oy{userVote ? " · oyunu verdin" : ""}
              {isClosed && " · anket kapalı"}
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {options.map((opt) => {
            const count = votesByOption.get(opt.id) ?? 0;
            const pct =
              totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = userVote === opt.id;
            const isWinning =
              totalVotes > 0 &&
              count > 0 &&
              count === Math.max(...Array.from(votesByOption.values()));

            return (
              <li key={opt.id}>
                {showVoteUI ? (
                  <form action={castPollVoteAction}>
                    <input type="hidden" name="event_id" value={eventId} />
                    <input type="hidden" name="option_id" value={opt.id} />
                    <button
                      type="submit"
                      className={`relative w-full text-left rounded-xl border-2 px-4 py-3 transition-all overflow-hidden ${
                        isSelected
                          ? "border-brand-500 bg-brand-50 shadow-sm"
                          : "border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/40"
                      }`}
                    >
                      <div
                        aria-hidden
                        className="absolute inset-y-0 left-0 bg-brand-100/60 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex items-center gap-3">
                        <div
                          className={`grid h-5 w-5 place-items-center rounded-full border-2 shrink-0 ${
                            isSelected
                              ? "border-brand-600 bg-brand-600"
                              : "border-ink-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="flex-1 text-sm font-medium text-ink-900">
                          {opt.label}
                        </span>
                        <span className="text-xs font-mono text-ink-700 tabular-nums">
                          {count} · {pct}%
                        </span>
                      </div>
                    </button>
                  </form>
                ) : (
                  <div
                    className={`relative rounded-xl border-2 px-4 py-3 overflow-hidden ${
                      isWinning && isClosed
                        ? "border-brand-500 bg-brand-50"
                        : "border-ink-200 bg-white"
                    }`}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-0 bg-brand-100/60"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center gap-3">
                      {isSelected && (
                        <div className="grid h-5 w-5 place-items-center rounded-full border-2 border-brand-600 bg-brand-600 shrink-0">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                      <span className="flex-1 text-sm font-medium text-ink-900">
                        {opt.label}
                      </span>
                      <span className="text-xs font-mono text-ink-700 tabular-nums">
                        {count} · {pct}%
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {!canVote && isLive && (
          <p className="mt-4 text-xs text-ink-500">
            Oy vermek için giriş yap ve hesabını doğrulat.
          </p>
        )}
        {userVote && showVoteUI && (
          <p className="mt-4 text-xs text-ink-500">
            İstediğin zaman başka bir seçeneğe tıklayarak oyunu değiştirebilirsin.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
