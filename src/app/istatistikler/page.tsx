import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Warning,
  Tray,
  ChatsCircle,
  TrendUp,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "İstatistikler" };

export default async function IstatistiklerPage() {
  const supabase = await createClient();
  const now = Date.now();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalMembers,
    monthlyMembers,
    totalBans,
    activeBans,
    weeklyBans,
    totalWarnings,
    activeWarnings,
    weeklyWarnings,
    totalReports,
    pendingReports,
    resolvedThisWeek,
    rejectedThisWeek,
    totalMessages,
    totalAnnouncements,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("joined_at", monthAgo),
    supabase.from("bans").select("*", { count: "exact", head: true }),
    supabase
      .from("bans")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("bans")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase.from("warnings").select("*", { count: "exact", head: true }),
    supabase
      .from("warnings")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("warnings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .gte("resolved_at", weekAgo)
      .eq("status", "resolved"),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .gte("resolved_at", weekAgo)
      .eq("status", "rejected"),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("announcements")
      .select("*", { count: "exact", head: true }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Şeffaflık"
        title="Topluluk istatistikleri."
        description="Tüm rakamlar herkese açık. Şeffaf bir topluluk için."
        image={{ src: "/goose-stats.png", alt: "İstatistik bakan kaz" }}
      />

      <section className="container-page py-14 flex flex-col gap-10">
        <StatGroup
          title="Üyeler"
          icon={Users}
          stats={[
            {
              label: "Toplam üye",
              value: totalMembers.count ?? 0,
              hint: "kayıtlı oyuncu",
            },
            {
              label: "Bu ay yeni",
              value: monthlyMembers.count ?? 0,
              hint: "son 30 günde katılan",
              tone: "brand",
            },
          ]}
        />

        <StatGroup
          title="Banlar"
          icon={ShieldCheck}
          stats={[
            {
              label: "Aktif ban",
              value: activeBans.count ?? 0,
              hint: "şu an kara listede",
              tone: "danger",
            },
            {
              label: "Bu hafta",
              value: weeklyBans.count ?? 0,
              hint: "son 7 günde verilen",
              tone: "warning",
            },
            {
              label: "Toplam",
              value: totalBans.count ?? 0,
              hint: "kuruluştan beri",
            },
          ]}
          link="/kara-liste"
        />

        <StatGroup
          title="Uyarılar"
          icon={Warning}
          stats={[
            {
              label: "Aktif uyarı",
              value: activeWarnings.count ?? 0,
              hint: "geçerli",
              tone: "warning",
            },
            {
              label: "Bu hafta",
              value: weeklyWarnings.count ?? 0,
              hint: "son 7 günde verilen",
              tone: "warning",
            },
            {
              label: "Toplam",
              value: totalWarnings.count ?? 0,
              hint: "kuruluştan beri",
            },
          ]}
          link="/uyarilar"
        />

        <StatGroup
          title="Şikayetler"
          icon={Tray}
          stats={[
            {
              label: "Bekleyen",
              value: pendingReports.count ?? 0,
              hint: "incelenmeyi bekliyor",
              tone: "warning",
            },
            {
              label: "Bu hafta çözülen",
              value: resolvedThisWeek.count ?? 0,
              hint: "aksiyon alındı",
              tone: "brand",
            },
            {
              label: "Bu hafta reddedilen",
              value: rejectedThisWeek.count ?? 0,
              hint: "asılsız/yetersiz",
            },
            {
              label: "Toplam",
              value: totalReports.count ?? 0,
              hint: "kuruluştan beri",
            },
          ]}
        />

        <StatGroup
          title="Aktivite"
          icon={ChatsCircle}
          stats={[
            {
              label: "Toplam mesaj",
              value: totalMessages.count ?? 0,
              hint: "chat'te yazılan",
              tone: "brand",
            },
            {
              label: "Yayınlanan duyuru",
              value: totalAnnouncements.count ?? 0,
              hint: "yönetimden",
            },
          ]}
        />

        <Card className="border-brand-200 bg-brand-50 animate-fade-up">
          <CardContent className="p-6 md:p-7 flex items-start gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700 shrink-0">
              <TrendUp size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-900">
                Bu rakamlar neden önemli?
              </h3>
              <p className="mt-1 text-sm text-brand-800 leading-relaxed">
                Toksisiteyi geri itmenin yolu rakamları görmekten geçer.
                Hangi haftalarda ne kadar şikayet geldi, kaç çözüldü, kaç ban
                verildi — hepsi şeffaf. Yönetimin keyfi davranmasının önüne
                geçer, topluluğa güven verir.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function StatGroup({
  title,
  icon: IconCmp,
  stats,
  link,
}: {
  title: string;
  icon: Icon;
  stats: {
    label: string;
    value: number;
    hint: string;
    tone?: "brand" | "warning" | "danger";
  }[];
  link?: string;
}) {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink-900 flex items-center gap-2">
          <IconCmp size={18} weight="duotone" />
          {title}
        </h2>
        {link && (
          <Link
            href={link}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Detay
            <ArrowUpRight size={14} weight="bold" />
          </Link>
        )}
      </div>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <Card
            key={s.label}
            className={`animate-fade-up stagger-${Math.min(i + 1, 6)} lift`}
          >
            <CardContent className="p-5">
              <p
                className={`text-3xl font-bold tracking-tight tabular-nums ${
                  s.tone === "danger"
                    ? "text-danger-600"
                    : s.tone === "warning"
                      ? "text-warning-600"
                      : s.tone === "brand"
                        ? "text-brand-700"
                        : "text-ink-900"
                }`}
              >
                {s.value}
              </p>
              <p className="mt-1 text-sm font-medium text-ink-800">
                {s.label}
              </p>
              <p className="text-xs text-ink-500">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const revalidate = 60; // 1 dakikada bir cache yenilensin
