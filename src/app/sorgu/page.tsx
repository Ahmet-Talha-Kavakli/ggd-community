import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Info,
  ShieldOff,
  UserX,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TagChips } from "@/components/ui/tag-chips";
import { PageHero } from "@/components/layout/page-hero";
import { CtaCard } from "@/components/layout/cta-card";
import { TONE_STYLES, type Tone } from "@/lib/card-tones";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Ban, Warning, Profile, Player } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const metadata = { title: "Oyuncu Sorgu" };

type ProfileLite = Pick<
  Profile,
  | "nickname"
  | "ggd_user_id"
  | "ggd_main_name"
  | "ggd_level"
  | "role"
  | "verification_status"
  | "joined_at"
>;
type PlayerLite = Pick<
  Player,
  | "ggd_user_id"
  | "nickname"
  | "main_name"
  | "level"
  | "keyword"
  | "created_at"
>;
type SearchHit =
  | { kind: "member"; row: ProfileLite }
  | { kind: "player"; row: PlayerLite };
type BanLite = Pick<
  Ban,
  | "id"
  | "ggd_user_id"
  | "reason"
  | "reason_tags"
  | "duration"
  | "expires_at"
  | "created_at"
  | "is_active"
  | "target_nickname"
  | "target_main_name"
>;
type WarningLite = Pick<
  Warning,
  | "id"
  | "ggd_user_id"
  | "reason"
  | "reason_tags"
  | "severity"
  | "created_at"
  | "is_active"
  | "target_nickname"
  | "target_main_name"
>;
type ReportLite = {
  id: number;
  target_ggd_user_id: string | null;
  target_nickname: string;
  target_main_name: string | null;
  category: string;
  description: string;
  status: string;
  created_at: string;
};
type EvidenceRow = {
  id: number;
  report_id: number;
  storage_path: string;
  media_type: "image" | "video";
  file_size_bytes: number | null;
};
type EvidenceItem = EvidenceRow & { url: string | null };

interface SearchParamsProps {
  searchParams: Promise<{ q?: string; id?: string }>;
}

export default async function SorguPage({ searchParams }: SearchParamsProps) {
  const params = await searchParams;
  const query = (params.q ?? params.id ?? "").trim();
  const isExactIdLink = !!params.id?.trim() && !params.q;

  return (
    <>
      <PageHero
        eyebrow="Oyuncu sorgu"
        title="Bir oyuncuyu sorgula."
        description="GGD User ID, ana isim veya oyun içi nick — hangisi elindeyse aratabilirsin. Herkese açık, üyelik gerekmez."
        image={{
          src: "/goose-search.png",
          alt: "Arayan kaz",
          videoSrc: "/sorgu-video.mp4",
        }}
      />

      <section className="container-page py-14">
        <div className="max-w-3xl">
          <Card>
            <CardContent className="p-8">
              <form action="/sorgu" method="get" className="flex flex-col gap-5">
                <div>
                  <Label htmlFor="q">Oyuncu ara</Label>
                  <div className="flex gap-2">
                    <Input
                      id="q"
                      name="q"
                      placeholder="Nick, ana isim veya User ID — örn. ToxicHonk veya 123456789"
                      autoComplete="off"
                      defaultValue={isExactIdLink ? "" : query}
                      minLength={2}
                    />
                    <Button type="submit">
                      <Search className="h-4 w-4" />
                      Sorgula
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-ink-500 flex items-start gap-1.5">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    User ID&apos;yi GGD içinde Settings → Account bölümünden
                    bulabilirsin. En az 2 karakter.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {!query && <LegendCards />}
          {query && (
            <SearchDispatcher query={query} preferDetail={isExactIdLink} />
          )}
        </div>
      </section>

      {!query && <SearchMethodsSection />}

      <CtaCard
        title="Sorun mu yaşıyorsun bir oyuncuyla?"
        description="Kanıtınla birlikte şikayet et, yönetim 48 saat içinde değerlendirsin."
        primary={{ label: "Şikayet Et", href: "/sikayet" }}
        secondary={{ label: "Kuralları oku", href: "/kurallar" }}
        image="/goose-report.png"
      />
    </>
  );
}

// ============================================================================
// Dispatcher: query'i alır, profil araması yapar; tek sonuç → detail, çoklu → liste
// ============================================================================

async function SearchDispatcher({
  query,
  preferDetail,
}: {
  query: string;
  preferDetail: boolean;
}) {
  if (query.length < 2) {
    return (
      <div className="mt-8">
        <Card>
          <CardContent className="p-6 text-sm text-ink-600">
            En az 2 karakter girmelisin.
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();

  // Link ile gelen exact ID ise direkt detail göster (eski davranış)
  if (preferDetail) {
    return <DetailView ggdUserId={query} />;
  }

  // Akıllı arama: hem üyeleri hem oyuncuları paralel ara
  const [profiles, players] = await Promise.all([
    searchProfiles(supabase, query),
    searchPlayers(supabase, query),
  ]);

  // ggd_user_id'si profilde varsa player'ı suppress et (zaten claim olmuş)
  const profileIds = new Set(profiles.map((p) => p.ggd_user_id));
  const filteredPlayers = players.filter(
    (p) => !profileIds.has(p.ggd_user_id),
  );

  const hits: SearchHit[] = [
    ...profiles.map<SearchHit>((row) => ({ kind: "member", row })),
    ...filteredPlayers.map<SearchHit>((row) => ({ kind: "player", row })),
  ];

  if (hits.length === 1) {
    return <DetailView ggdUserId={hits[0].row.ggd_user_id} />;
  }

  if (hits.length === 0) {
    // Belki ID exact match (kayıtlı değil ama ban/warning'i var)
    return <DetailView ggdUserId={query} />;
  }

  return <ResultsList hits={hits} query={query} />;
}

// ============================================================================
// Profile search helper — 3 alanda paralel, dedupe
// ============================================================================

async function searchProfiles(
  supabase: SupabaseClient,
  q: string,
): Promise<ProfileLite[]> {
  const escaped = q.replace(/[\\%_]/g, "\\$&");

  const select =
    "nickname, ggd_user_id, ggd_main_name, ggd_level, role, verification_status, joined_at";

  const [byId, byNick, byMain] = await Promise.all([
    supabase.from("profiles").select(select).eq("ggd_user_id", q).limit(1),
    supabase
      .from("profiles")
      .select(select)
      .ilike("nickname", `%${escaped}%`)
      .limit(20),
    supabase
      .from("profiles")
      .select(select)
      .ilike("ggd_main_name", `%${escaped}%`)
      .limit(20),
  ]);

  const map = new Map<string, ProfileLite>();
  for (const list of [byId.data, byNick.data, byMain.data]) {
    for (const row of (list ?? []) as ProfileLite[]) {
      if (!map.has(row.ggd_user_id)) map.set(row.ggd_user_id, row);
    }
  }
  return Array.from(map.values());
}

async function searchPlayers(
  supabase: SupabaseClient,
  q: string,
): Promise<PlayerLite[]> {
  const escaped = q.replace(/[\\%_]/g, "\\$&");
  const select =
    "ggd_user_id, nickname, main_name, level, keyword, created_at";

  const [byId, byNick, byMain] = await Promise.all([
    supabase
      .from("players")
      .select(select)
      .is("claimed_profile_id", null)
      .eq("ggd_user_id", q)
      .limit(1),
    supabase
      .from("players")
      .select(select)
      .is("claimed_profile_id", null)
      .ilike("nickname", `%${escaped}%`)
      .limit(20),
    supabase
      .from("players")
      .select(select)
      .is("claimed_profile_id", null)
      .ilike("main_name", `%${escaped}%`)
      .limit(20),
  ]);

  const map = new Map<string, PlayerLite>();
  for (const list of [byId.data, byNick.data, byMain.data]) {
    for (const row of (list ?? []) as PlayerLite[]) {
      if (!map.has(row.ggd_user_id)) map.set(row.ggd_user_id, row);
    }
  }
  return Array.from(map.values());
}

// ============================================================================
// Multi-result list view
// ============================================================================

function ResultsList({ hits, query }: { hits: SearchHit[]; query: string }) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900">{hits.length}</span>{" "}
          eşleşen oyuncu bulundu — &ldquo;{query}&rdquo;
        </p>
        <p className="text-xs text-ink-500">Detay için tıkla</p>
      </div>

      <div className="grid gap-3">
        {hits.map((h) => {
          const isMember = h.kind === "member";
          const nickname = h.row.nickname;
          const mainName = isMember ? h.row.ggd_main_name : h.row.main_name;
          const level = isMember ? h.row.ggd_level : h.row.level;
          return (
            <Link
              key={`${h.kind}:${h.row.ggd_user_id}`}
              href={`/sorgu?id=${encodeURIComponent(h.row.ggd_user_id)}`}
            >
              <Card className="lift hover:border-brand-200">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-xl font-bold text-base shrink-0 ${
                      isMember
                        ? "bg-brand-100 text-brand-700"
                        : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {nickname.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="font-semibold text-ink-900">
                        {nickname}
                      </h3>
                      {mainName && (
                        <span className="text-xs text-ink-500">
                          ({mainName})
                        </span>
                      )}
                      {level != null && (
                        <Badge variant="outline">
                          <span className="font-mono">Lv. {level}</span>
                        </Badge>
                      )}
                      <Badge variant={isMember ? "brand" : "outline"}>
                        {isMember ? "Üye" : "Oyuncu"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                      <code className="font-mono bg-ink-100 px-1.5 py-0.5 rounded">
                        {h.row.ggd_user_id}
                      </code>
                      <span>·</span>
                      <span>
                        {isMember
                          ? h.row.verification_status === "approved"
                            ? "Onaylı üye"
                            : h.row.verification_status === "pending"
                              ? "Onay bekliyor"
                              : "Reddedilmiş"
                          : "Lobiden eklenmiş"}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-400 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Detail view — tek bir ggd_user_id için full bilgi
// ============================================================================

async function DetailView({ ggdUserId }: { ggdUserId: string }) {
  const supabase = await createClient();
  const query = ggdUserId;
  const escaped = query.replace(/[\\%_]/g, "\\$&");

  const [profileRes, playerRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "nickname, ggd_user_id, ggd_main_name, ggd_level, role, verification_status, joined_at",
      )
      .eq("ggd_user_id", query)
      .maybeSingle(),
    supabase
      .from("players")
      .select(
        "ggd_user_id, nickname, main_name, level, keyword, created_at",
      )
      .eq("ggd_user_id", query)
      .is("claimed_profile_id", null)
      .maybeSingle(),
  ]);

  const profile = profileRes.data as ProfileLite | null;
  const player = profile ? null : (playerRes.data as PlayerLite | null);

  // Canonical match terimleri — eğer profil/oyuncu bulunduysa onların
  // bilgisini de tara, bulunmadıysa raw query ile nick/main name'de ara.
  const matchId =
    profile?.ggd_user_id ?? player?.ggd_user_id ?? query;
  const matchNick = profile?.nickname ?? player?.nickname ?? query;
  const matchMain =
    profile?.ggd_main_name ?? player?.main_name ?? query;

  // Bans, warnings ve reports — id veya nick/main isimle eşle
  const banSelect =
    "id, ggd_user_id, reason, reason_tags, duration, expires_at, created_at, is_active, target_nickname, target_main_name";
  const warnSelect =
    "id, ggd_user_id, reason, reason_tags, severity, created_at, is_active, target_nickname, target_main_name";
  const repSelect =
    "id, target_ggd_user_id, target_nickname, target_main_name, category, description, status, created_at";

  const [bansById, bansByNick, bansByMain, warnsById, warnsByNick, warnsByMain, repsById, repsByNick, repsByMain] = await Promise.all([
    supabase.from("bans").select(banSelect).eq("ggd_user_id", matchId),
    supabase.from("bans").select(banSelect).ilike("target_nickname", matchNick),
    supabase.from("bans").select(banSelect).ilike("target_main_name", matchMain),
    supabase.from("warnings").select(warnSelect).eq("ggd_user_id", matchId),
    supabase.from("warnings").select(warnSelect).ilike("target_nickname", matchNick),
    supabase.from("warnings").select(warnSelect).ilike("target_main_name", matchMain),
    supabase.from("reports").select(repSelect).eq("target_ggd_user_id", matchId),
    supabase.from("reports").select(repSelect).ilike("target_nickname", matchNick),
    supabase.from("reports").select(repSelect).ilike("target_main_name", matchMain),
  ]);

  const dedupe = <T extends { id: number }>(...lists: (T[] | null | undefined)[]): T[] => {
    const map = new Map<number, T>();
    for (const list of lists) {
      for (const row of list ?? []) {
        if (!map.has(row.id)) map.set(row.id, row);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.id - a.id);
  };

  const bans = dedupe<BanLite>(
    bansById.data as BanLite[],
    bansByNick.data as BanLite[],
    bansByMain.data as BanLite[],
  );
  const warnings = dedupe<WarningLite>(
    warnsById.data as WarningLite[],
    warnsByNick.data as WarningLite[],
    warnsByMain.data as WarningLite[],
  );
  const reports = dedupe<ReportLite>(
    repsById.data as ReportLite[],
    repsByNick.data as ReportLite[],
    repsByMain.data as ReportLite[],
  );

  // Bu raporlara ait kanıt URL'leri (signed URL)
  const reportIds = reports.map((r) => r.id);
  let evidenceByReport = new Map<number, EvidenceItem[]>();
  if (reportIds.length > 0) {
    const { data: rawEv } = await supabase
      .from("report_evidence")
      .select("id, report_id, storage_path, media_type, file_size_bytes")
      .in("report_id", reportIds);
    const evRows = (rawEv ?? []) as EvidenceRow[];
    const withUrls = await Promise.all(
      evRows.map(async (e) => {
        const { data } = await supabase.storage
          .from("report-evidence")
          .createSignedUrl(e.storage_path, 60 * 60);
        return { ...e, url: data?.signedUrl ?? null };
      }),
    );
    evidenceByReport = new Map();
    for (const e of withUrls) {
      const list = evidenceByReport.get(e.report_id) ?? [];
      list.push(e);
      evidenceByReport.set(e.report_id, list);
    }
  }

  // Ban / warning evidence — admin-evidence bucket (public read)
  type AdminEvidenceItem = {
    id: number;
    storage_path: string;
    media_type: "image" | "video";
    url: string;
  };

  const buildPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("admin-evidence").getPublicUrl(path);
    return data.publicUrl;
  };

  const banIds = bans.map((b) => b.id);
  let evidenceByBan = new Map<number, AdminEvidenceItem[]>();
  if (banIds.length > 0) {
    const { data: banEv } = await supabase
      .from("ban_evidence")
      .select("id, ban_id, storage_path, media_type")
      .in("ban_id", banIds);
    for (const row of ((banEv ?? []) as {
      id: number;
      ban_id: number;
      storage_path: string;
      media_type: "image" | "video";
    }[])) {
      const list = evidenceByBan.get(row.ban_id) ?? [];
      list.push({
        id: row.id,
        storage_path: row.storage_path,
        media_type: row.media_type,
        url: buildPublicUrl(row.storage_path),
      });
      evidenceByBan.set(row.ban_id, list);
    }
  }

  const warnIds = warnings.map((w) => w.id);
  let evidenceByWarning = new Map<number, AdminEvidenceItem[]>();
  if (warnIds.length > 0) {
    const { data: warnEv } = await supabase
      .from("warning_evidence")
      .select("id, warning_id, storage_path, media_type")
      .in("warning_id", warnIds);
    for (const row of ((warnEv ?? []) as {
      id: number;
      warning_id: number;
      storage_path: string;
      media_type: "image" | "video";
    }[])) {
      const list = evidenceByWarning.get(row.warning_id) ?? [];
      list.push({
        id: row.id,
        storage_path: row.storage_path,
        media_type: row.media_type,
        url: buildPublicUrl(row.storage_path),
      });
      evidenceByWarning.set(row.warning_id, list);
    }
  }

  void escaped; // (multi-query yaklaşımı kullanıldı, escape gerekmedi)
  const activeBan = bans.find((b) => b.is_active);
  const activeWarnings = warnings.filter((w) => w.is_active);

  let status: {
    label: string;
    desc: string;
    tone: "danger" | "warning" | "brand" | "default";
    Icon: React.ComponentType<{ className?: string }>;
  };

  if (activeBan) {
    status = {
      label: "Banlı",
      desc: `Kara listede — ${
        activeBan.duration === "permanent" ? "kalıcı ban" : activeBan.duration
      }`,
      tone: "danger",
      Icon: ShieldOff,
    };
  } else if (activeWarnings.length > 0) {
    status = {
      label: `${activeWarnings.length} aktif uyarı`,
      desc: "Kurallara dikkat etmesi gereken oyuncu",
      tone: "warning",
      Icon: AlertTriangle,
    };
  } else if (profile) {
    status = {
      label: "Kayıtlı üye",
      desc: "Topluluğun bir parçası, temiz sicil",
      tone: "brand",
      Icon: UserCheck,
    };
  } else if (player) {
    status = {
      label: "Lobi oyuncusu",
      desc: "Siteye kayıt yok, lobide tanınıyor — temiz sicil",
      tone: "default",
      Icon: UserCheck,
    };
  } else {
    status = {
      label: "Kayıtsız",
      desc: "Bu User ID ile kayıtlı bir oyuncu, ban veya uyarı bulunamadı",
      tone: "default",
      Icon: UserX,
    };
  }

  // ID-card icin tone bazli renkler — sicil kart estetigi
  const idCardTone = {
    danger: {
      iconBg: "bg-danger-50",
      iconBorder: "border-danger-200",
      iconColor: "text-danger-600",
      stamp: "text-danger-700",
      accent: "text-danger-700",
    },
    warning: {
      iconBg: "bg-warning-50",
      iconBorder: "border-warning-200",
      iconColor: "text-warning-600",
      stamp: "text-warning-700",
      accent: "text-warning-700",
    },
    brand: {
      iconBg: "bg-brand-50",
      iconBorder: "border-brand-200",
      iconColor: "text-brand-700",
      stamp: "text-brand-700",
      accent: "text-brand-700",
    },
    default: {
      iconBg: "bg-ink-100",
      iconBorder: "border-ink-200",
      iconColor: "text-ink-700",
      stamp: "text-ink-700",
      accent: "text-ink-700",
    },
  }[status.tone];

  // En son ban/uyari kaydindan fallback metadata cek (kullanici sicilde
  // bilgi girdiyse goster). Ban/uyari kayitlari target_nickname/main_name
  // tutar, profile/player yoksa bunlardan beslenir.
  const banFallback = bans[0];
  const warnFallback = warnings[0];
  const fallbackNick =
    banFallback?.target_nickname ?? warnFallback?.target_nickname ?? null;
  const fallbackMain =
    banFallback?.target_main_name ?? warnFallback?.target_main_name ?? null;
  const fallbackGgdId =
    banFallback?.ggd_user_id ?? warnFallback?.ggd_user_id ?? null;

  // Query saf numerik ise GGD ID kabul et, degilse nickname/main name kabul et.
  const isQueryNumeric = /^\d+$/.test(query);

  // GGD ID — once profile/player'dan, sonra ban/warning'den, sonra numerik
  // query ise query'den, yoksa "—".
  const resolvedGgdId =
    profile?.ggd_user_id ??
    player?.ggd_user_id ??
    fallbackGgdId ??
    (isQueryNumeric ? query : null);

  // Oyun ici nick — profile/player yoksa ban/warning'den, son care numerik
  // olmayan query (kullanici nick girdiyse).
  const ingameNick =
    profile?.nickname ??
    player?.nickname ??
    fallbackNick ??
    (!isQueryNumeric ? query : null);

  // Ana isim — profile/player'dan, sonra ban/warning'den.
  const mainName =
    profile?.ggd_main_name ?? player?.main_name ?? fallbackMain ?? null;

  const level = profile?.ggd_level ?? player?.level ?? null;

  // Eklenme/Kayit tarihi — profile/player varsa kendi tarihleri, yoksa ilk
  // ban/warning tarihi (siciline ilk girdigi an).
  const firstSeenAt = profile
    ? profile.joined_at
    : player
      ? player.created_at
      : (banFallback?.created_at ?? warnFallback?.created_at ?? null);

  const idFields: { label: string; value: string; danger?: boolean }[] = [
    { label: "Oyun içi nick", value: ingameNick ?? "—" },
    { label: "Ana isim", value: mainName ?? "—" },
    { label: "GGD Level", value: level != null ? `Lv. ${level}` : "—" },
    {
      label: "Kayıt durumu",
      value: profile
        ? "Üye"
        : player
          ? "Lobi oyuncusu"
          : bans.length + warnings.length > 0
            ? "Sicilli (kayıt yok)"
            : "Kayıt yok",
    },
    {
      label: profile ? "Katılım" : player ? "İlk kayıt" : "Sicile eklenme",
      value: firstSeenAt ? formatDate(firstSeenAt) : "—",
    },
    {
      label: "Aktif uyarı",
      value: String(activeWarnings.length),
      danger: activeWarnings.length > 0,
    },
  ];

  // Sicil rozeti label'i — duruma gore kisa metin
  const stampLabel =
    status.tone === "danger"
      ? "Banlı"
      : status.tone === "warning"
        ? "Uyarılı"
        : status.tone === "brand"
          ? "Üye"
          : player
            ? "Oyuncu"
            : "Kayıtsız";

  return (
    <div className="mt-8 flex flex-col gap-5">
      {/* Kimlik kart — GooseCage Oyuncu Sicili (tek buyuk kart) */}
      <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-ink-900 shadow-card">
        {/* Üst şerit */}
        <div className="bg-linear-to-b from-ink-50 to-white px-2 py-1 border-b border-ink-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-400 text-center">
            GooseCage · Oyuncu Sicili
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 p-6">
          {/* Sol: ikon + sicil rozeti + GGD ID */}
          <div className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:shrink-0 sm:w-32">
            <div
              className={`grid h-20 w-20 place-items-center rounded-2xl ${idCardTone.iconBg} border-2 ${idCardTone.iconBorder}`}
            >
              <status.Icon className={`h-10 w-10 ${idCardTone.iconColor}`} />
            </div>
            <div className="flex flex-col items-start sm:items-center gap-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${idCardTone.stamp}`}
              >
                {stampLabel}
              </span>
              <div className="sm:text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  GGD ID
                </p>
                <p
                  className={`font-mono text-xs font-semibold break-all ${
                    resolvedGgdId ? "text-ink-900" : "text-ink-400"
                  }`}
                >
                  {resolvedGgdId ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Sağ: bilgi grid + durum */}
          <div className="flex-1 min-w-0">
            <div className="mb-4 pb-4 border-b border-ink-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                Durum
              </p>
              <p
                className={`text-xl font-bold ${
                  status.tone === "danger"
                    ? "text-danger-700"
                    : status.tone === "warning"
                      ? "text-warning-700"
                      : status.tone === "brand"
                        ? "text-brand-700"
                        : "text-ink-900"
                }`}
              >
                {status.label}
              </p>
              <p className="text-xs text-ink-500 mt-0.5">{status.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {idFields.map((f) => (
                <div key={f.label}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    {f.label}
                  </p>
                  <p
                    className={`font-semibold ${
                      f.danger ? "text-danger-700" : "text-ink-900"
                    }`}
                  >
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ban gecmisi — sicil kartinin icinde alt bolum */}
        {bans.length > 0 && (
          <div className="border-t-2 border-ink-900 bg-ink-50/40 px-6 py-5">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-700">
                Ban geçmişi
              </h3>
              <span className="text-xs font-semibold text-ink-500 tabular-nums">
                {bans.length} kayıt
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {bans.map((b) => {
                const isPermanent = b.duration === "permanent";
                const ring = !b.is_active
                  ? "border-l-ink-200"
                  : isPermanent
                    ? "border-l-danger-500"
                    : "border-l-warning-500";
                return (
                  <li
                    key={b.id}
                    className={`rounded-xl border border-ink-200 border-l-4 bg-white p-4 flex flex-col gap-1.5 ${ring}`}
                  >
                    <div className="flex flex-wrap items-baseline gap-2 text-xs">
                      <span
                        className={
                          b.is_active
                            ? "font-semibold text-danger-600"
                            : "font-medium text-ink-500"
                        }
                      >
                        {b.is_active ? "Aktif" : "Eski"}
                      </span>
                      <span className="text-ink-400">·</span>
                      <span
                        className={
                          isPermanent
                            ? "font-medium text-danger-600"
                            : "font-medium text-warning-600"
                        }
                      >
                        {isPermanent ? "Kalıcı" : b.duration}
                      </span>
                      <span className="text-ink-500 ml-auto">
                        {formatDate(b.created_at)}
                      </span>
                    </div>
                    {b.reason_tags && b.reason_tags.length > 0 && (
                      <TagChips slugs={b.reason_tags} />
                    )}
                    {b.reason && (
                      <p className="text-sm text-ink-700">{b.reason}</p>
                    )}
                    {(evidenceByBan.get(b.id)?.length ?? 0) > 0 && (
                      <EvidenceGrid items={evidenceByBan.get(b.id) ?? []} />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {warnings.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-ink-900 mb-3">
              Uyarı geçmişi ({warnings.length})
            </h3>
            <ul className="flex flex-col gap-3">
              {warnings.map((w) => {
                const sevRing = !w.is_active
                  ? "border-l-ink-200"
                  : w.severity === "high"
                    ? "border-l-danger-500"
                    : w.severity === "medium"
                      ? "border-l-warning-500"
                      : "border-l-ink-300";
                const sevLabel =
                  w.severity === "high"
                    ? "Ağır"
                    : w.severity === "medium"
                      ? "Orta"
                      : "Hafif";
                const sevTone =
                  w.severity === "high"
                    ? "text-danger-600"
                    : w.severity === "medium"
                      ? "text-warning-600"
                      : "text-ink-600";
                return (
                  <li
                    key={w.id}
                    className={`rounded-xl border border-ink-200 border-l-4 p-4 flex flex-col gap-1.5 ${sevRing}`}
                  >
                    <div className="flex flex-wrap items-baseline gap-2 text-xs">
                      <span
                        className={
                          w.is_active
                            ? "font-semibold text-warning-600"
                            : "font-medium text-ink-500"
                        }
                      >
                        {w.is_active ? "Aktif" : "Eski"}
                      </span>
                      <span className="text-ink-400">·</span>
                      <span className={`font-medium ${sevTone}`}>{sevLabel}</span>
                      <span className="text-ink-500 ml-auto">
                        {formatDate(w.created_at)}
                      </span>
                    </div>
                    {w.reason_tags && w.reason_tags.length > 0 && (
                      <TagChips slugs={w.reason_tags} />
                    )}
                    {w.reason && (
                      <p className="text-sm text-ink-700">{w.reason}</p>
                    )}
                    {(evidenceByWarning.get(w.id)?.length ?? 0) > 0 && (
                      <EvidenceGrid items={evidenceByWarning.get(w.id) ?? []} />
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {reports.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-ink-900 mb-3">
              İlgili şikayetler & kanıtlar ({reports.length})
            </h3>
            <ul className="flex flex-col gap-4">
              {reports.map((r) => {
                const evs = evidenceByReport.get(r.id) ?? [];
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-ink-200 p-4 flex flex-col gap-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {r.category === "insult"
                          ? "Hakaret"
                          : r.category === "sabotage"
                            ? "Sabotaj"
                            : r.category === "cheat"
                              ? "Hile"
                              : r.category === "spam"
                                ? "Spam"
                                : r.category === "stream_sniping"
                                  ? "Stream sniping"
                                  : "Diğer"}
                      </Badge>
                      <Badge
                        variant={
                          r.status === "resolved"
                            ? "brand"
                            : r.status === "rejected"
                              ? "outline"
                              : "warning"
                        }
                      >
                        {r.status === "pending"
                          ? "Bekliyor"
                          : r.status === "investigating"
                            ? "İnceleniyor"
                            : r.status === "resolved"
                              ? "Çözüldü"
                              : "Reddedildi"}
                      </Badge>
                      <span className="text-xs text-ink-500 inline-flex items-center gap-1 ml-auto">
                        <Calendar className="h-3 w-3" />
                        {formatDate(r.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-ink-700 whitespace-pre-wrap">
                      {r.description}
                    </p>
                    {evs.length > 0 && (
                      <div className="mt-2 grid gap-2 grid-cols-2 sm:grid-cols-3">
                        {evs.map((e) =>
                          e.url ? (
                            e.media_type === "video" ? (
                              <video
                                key={e.id}
                                src={e.url}
                                controls
                                className="w-full aspect-video bg-black rounded-lg"
                              />
                            ) : (
                              <a
                                key={e.id}
                                href={e.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={e.url}
                                  alt="Kanıt"
                                  className="w-full aspect-video object-cover rounded-lg border border-ink-200"
                                />
                              </a>
                            )
                          ) : (
                            <div
                              key={e.id}
                              className="aspect-video grid place-items-center bg-ink-50 text-ink-400 text-xs rounded-lg"
                            >
                              Yüklenemedi
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {!profile && !player && bans.length === 0 && warnings.length === 0 && reports.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-ink-600">
              Bu User ID kayıtlı değil. Şikayet için{" "}
              <Link
                href="/sikayet"
                className="text-brand-700 font-medium hover:underline"
              >
                buraya tıkla
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SearchMethodsSection() {
  const methods: {
    num: string;
    title: string;
    desc: string;
    image: string;
    alt: string;
    tone: Tone;
  }[] = [
    {
      num: "01",
      title: "GGD User ID",
      desc: "Oyuncunun 9 haneli kimlik numarası. Oyun içi Settings → Account bölümünden alabilirsin. En kesin sonuç verir.",
      image: "/goose-search.png",
      alt: "Sorgulayan kaz",
      tone: "brand",
    },
    {
      num: "02",
      title: "Ana isim",
      desc: "Oyuncunun gerçek/sabit ismi. GGD profilinde değişmez kalan tek alandır. Nick değişse bile bu sabit.",
      image: "/goose-thinking.png",
      alt: "Düşünen kaz",
      tone: "info",
    },
    {
      num: "03",
      title: "Oyun içi nick",
      desc: "Oyuncunun lobide gözüken seçilebilir takma adı. Sık değiştirilebilir — birden fazla sonuç çıkabilir.",
      image: "/goose-curious.png",
      alt: "Meraklı kaz",
      tone: "neutral",
    },
  ];

  return (
    <section className="container-page py-20 md:py-28">
      <div className="max-w-2xl mb-12 animate-fade-up">
        <Badge variant="brand" className="mb-4">
          Sorgu yöntemleri
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
          3 farklı yolla aratabilirsin.
        </h2>
        <p className="text-lg text-ink-500 mt-4 leading-relaxed">
          Elindeki bilgiye göre en uygun yöntemi seç. Sistemimiz akıllıca
          hepsini deneyip en yakın sonucu getirir.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {methods.map((m, i) => {
          const t = TONE_STYLES[m.tone];
          return (
            <div
              key={m.num}
              className={`animate-fade-up stagger-${i + 1} relative overflow-hidden rounded-3xl bg-white/90 p-8 border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300`}
              style={{ backgroundImage: t.texture }}
            >
              <div
                className={`absolute -top-2 right-4 text-[88px] font-bold ${t.bigNumber} leading-none select-none pointer-events-none`}
              >
                {m.num}
              </div>

              <div className="relative h-40 w-40 mx-auto mb-6 rounded-3xl overflow-hidden ring-1 ring-ink-200">
                <Image
                  src={m.image}
                  alt={m.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <h3 className="relative text-xl font-semibold tracking-tight text-ink-900">
                {m.title}
              </h3>
              <p className="relative mt-3 text-sm text-ink-600 leading-relaxed">
                {m.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LegendCards() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      <StatusInfo
        icon={UserCheck}
        tone="brand"
        title="Kayıtlı"
        text="Topluluk üyemiz, kayıtlı oyuncu."
      />
      <StatusInfo
        icon={AlertTriangle}
        tone="warning"
        title="Uyarılı"
        text="Geçmişte uyarı almış oyuncu."
      />
      <StatusInfo
        icon={ShieldCheck}
        tone="danger"
        title="Banlı"
        text="Kara listeye alınmış oyuncu."
      />
    </div>
  );
}

function EvidenceGrid({
  items,
}: {
  items: { id: number; url: string; media_type: "image" | "video" }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((e) => (
        <a
          key={e.id}
          href={e.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block h-20 w-20 rounded-lg overflow-hidden border border-ink-200 bg-ink-50 hover:border-brand-400 transition-colors"
          title={e.media_type === "video" ? "Video kanıtı" : "Foto kanıtı"}
        >
          {e.media_type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={e.url}
              alt="Kanıt"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <video
              src={e.url}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          )}
          {e.media_type === "video" && (
            <span className="absolute bottom-1 right-1 text-[10px] font-bold uppercase bg-black/60 text-white px-1.5 py-0.5 rounded">
              VID
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

function StatusInfo({
  icon: Icon,
  tone,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "brand" | "warning" | "danger";
  title: string;
  text: string;
}) {
  const styles = {
    brand: "bg-brand-50 text-brand-700",
    warning: "bg-warning-50 text-warning-600",
    danger: "bg-danger-50 text-danger-600",
  }[tone];
  return (
    <div className="rounded-2xl border border-ink-900 bg-white p-5 shadow-soft">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${styles}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-xs text-ink-500 leading-relaxed">{text}</p>
    </div>
  );
}
