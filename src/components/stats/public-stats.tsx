import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Warning,
  CheckSquareOffset,
  ChatsCircle,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { TONE_STYLES, type Tone } from "@/lib/card-tones";

export async function PublicStatsWidget() {
  const supabase = await createClient();
  const weekAgoIso = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    totalMembers,
    weeklyBans,
    weeklyWarnings,
    weeklyResolved,
    totalActiveBans,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("bans")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgoIso),
    supabase
      .from("warnings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgoIso),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .gte("resolved_at", weekAgoIso)
      .eq("status", "resolved"),
    supabase
      .from("bans")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  const stats: {
    icon: typeof Users;
    label: string;
    value: number;
    hint: string;
    tone: Tone;
    href: string;
  }[] = [
    {
      icon: Users,
      label: "Topluluk",
      value: totalMembers.count ?? 0,
      hint: "kayıtlı üye",
      tone: "brand",
      href: "/topluluk",
    },
    {
      icon: ShieldCheck,
      label: "Aktif ban",
      value: totalActiveBans.count ?? 0,
      hint: "şu an kara listede",
      tone: "danger",
      href: "/kara-liste",
    },
    {
      icon: Warning,
      label: "Bu hafta uyarı",
      value: weeklyWarnings.count ?? 0,
      hint: "son 7 günde",
      tone: "warning",
      href: "/uyarilar",
    },
    {
      icon: CheckSquareOffset,
      label: "Şikayet çözüm",
      value: weeklyResolved.count ?? 0,
      hint: "son 7 günde",
      tone: "info",
      href: "/sikayet",
    },
    {
      icon: ChatsCircle,
      label: "Bu hafta ban",
      value: weeklyBans.count ?? 0,
      hint: "son 7 günde",
      tone: "danger",
      href: "/kara-liste",
    },
  ];

  return (
    <section className="container-page py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-brand-700 uppercase tracking-wider">
            Şeffaflık
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
            Topluluk istatistikleri
          </h2>
        </div>
        <Link
          href="/istatistikler"
          className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-ink-900 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-900 hover:bg-brand-50 hover:border-brand-700 hover:text-brand-700 transition-colors"
        >
          Tüm istatistikler
          <ArrowUpRight size={12} weight="bold" />
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => {
          const t = TONE_STYLES[s.tone];
          return (
            <Link
              key={s.label}
              href={s.href}
              className={`group animate-fade-up stagger-${Math.min(i + 1, 6)}`}
            >
              <div
                className={`relative h-full bg-white rounded-2xl p-5 border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300`}
                style={{ backgroundImage: t.texture }}
              >
                <div
                  aria-hidden
                  className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${t.cornerGlow} to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />
                <div
                  className={`relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-linear-to-br ${t.iconBg} ring-1 ${t.iconRing} shadow-sm group-hover:scale-105 transition-transform duration-300`}
                >
                  <s.icon size={20} weight="duotone" className={t.iconColor} />
                </div>
                <p className="relative mt-4 text-3xl font-bold tracking-tight text-ink-900 tabular-nums">
                  {s.value}
                </p>
                <p className="relative mt-1 text-xs font-medium text-ink-700">
                  {s.label}
                </p>
                <p className="relative text-xs text-ink-400">{s.hint}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
