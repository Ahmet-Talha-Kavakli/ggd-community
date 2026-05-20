import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Warning,
  CheckSquareOffset,
  ChatsCircle,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

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

  const stats = [
    {
      icon: Users,
      label: "Topluluk",
      value: totalMembers.count ?? 0,
      hint: "kayıtlı üye",
      tone: "brand" as const,
      href: "/topluluk",
    },
    {
      icon: ShieldCheck,
      label: "Aktif ban",
      value: totalActiveBans.count ?? 0,
      hint: "şu an kara listede",
      tone: "danger" as const,
      href: "/kara-liste",
    },
    {
      icon: Warning,
      label: "Bu hafta uyarı",
      value: weeklyWarnings.count ?? 0,
      hint: "son 7 günde",
      tone: "warning" as const,
      href: "/uyarilar",
    },
    {
      icon: CheckSquareOffset,
      label: "Şikayet çözüm",
      value: weeklyResolved.count ?? 0,
      hint: "son 7 günde",
      tone: "brand" as const,
      href: "/sikayet",
    },
    {
      icon: ChatsCircle,
      label: "Bu hafta ban",
      value: weeklyBans.count ?? 0,
      hint: "son 7 günde",
      tone: "danger" as const,
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
          className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Tüm istatistikler
          <ArrowUpRight size={14} weight="bold" />
        </Link>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <Link key={s.label} href={s.href}>
            <Card
              className={`animate-fade-up stagger-${Math.min(i + 1, 6)} lift hover:border-brand-200`}
            >
              <CardContent className="p-5">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-xl ${
                    s.tone === "brand"
                      ? "bg-brand-50 text-brand-700"
                      : s.tone === "danger"
                        ? "bg-danger-50 text-danger-600"
                        : "bg-warning-50 text-warning-600"
                  }`}
                >
                  <s.icon size={18} weight="duotone" />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-ink-900 tabular-nums">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-medium text-ink-700">
                  {s.label}
                </p>
                <p className="text-xs text-ink-400">{s.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
