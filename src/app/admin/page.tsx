import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  UserPlus,
  Inbox,
  Megaphone,
  Hash,
  ArrowRight,
  ScrollText,
  Skull,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin Paneli" };

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    members,
    players,
    pendingReports,
    activeBans,
    activeWarnings,
    announcements,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .is("claimed_profile_id", null),
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("bans")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("warnings")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("announcements").select("*", { count: "exact", head: true }),
  ]);

  const pending = pendingReports.count ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-brand-700 uppercase tracking-wider">
          Admin paneli
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
          Genel Bakış
        </h1>
        <p className="mt-2 text-ink-500">
          Tüm işlemler audit log&apos;a kaydedilir.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          icon={Users}
          label="Toplam Üye"
          value={String(members.count ?? 0)}
          tone="brand"
          href="/admin/uyeler"
        />
        <StatCard
          icon={UserPlus}
          label="Lobi Oyuncusu"
          value={String(players.count ?? 0)}
          tone="default"
          href="/admin/oyuncular"
        />
        <StatCard
          icon={Inbox}
          label="Bekleyen Şikayet"
          value={String(pending)}
          tone="warning"
          urgent={pending > 0}
          href="/admin/sikayetler"
        />
        <StatCard
          icon={ShieldCheck}
          label="Aktif Ban"
          value={String(activeBans.count ?? 0)}
          tone="danger"
          href="/admin/kara-liste"
        />
        <StatCard
          icon={AlertTriangle}
          label="Aktif Uyarı"
          value={String(activeWarnings.count ?? 0)}
          tone="default"
          href="/admin/uyarilar"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink-900 mb-4">
          Hızlı işlemler
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            icon={UserPlus}
            title="Oyuncu Ekle"
            desc="Lobide tanıdığın oyuncuyu kayda al"
            href="/admin/oyuncular/yeni"
          />
          <ActionCard
            icon={Hash}
            title="Oda Kodunu Güncelle"
            desc="Anasayfada görünen aktif lobi kodu"
            href="/admin/oda-kodu"
          />
          <ActionCard
            icon={Megaphone}
            title="Duyuru Yayınla"
            desc={`${announcements.count ?? 0} mevcut duyuru`}
            href="/admin/duyurular/yeni"
          />
          <ActionCard
            icon={ShieldCheck}
            title="Ban Ekle"
            desc="Bir oyuncuyu kara listeye al"
            href="/admin/kara-liste/yeni"
          />
          <ActionCard
            icon={AlertTriangle}
            title="Uyarı Ver"
            desc="Bir oyuncuya uyarı kaydet"
            href="/admin/uyarilar/yeni"
          />
          <ActionCard
            icon={Skull}
            title="Kırmızı Alan"
            desc="Evrensel ban listesi yönetimi"
            href="/admin/kirmizi-alan"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-700">
            <ScrollText className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-ink-900">Audit Log</h3>
            <p className="text-sm text-ink-500">
              Tüm admin işlemleri zaman damgalı kayıtlı.
            </p>
          </div>
          <Link href="/admin/audit-log">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">
              Aç <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  urgent,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "brand" | "warning" | "danger" | "default";
  urgent?: boolean;
  href: string;
}) {
  const toneClass = {
    brand: "bg-brand-50 text-brand-700",
    warning: "bg-warning-50 text-warning-600",
    danger: "bg-danger-50 text-danger-600",
    default: "bg-ink-100 text-ink-700",
  }[tone];
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-card hover:border-brand-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div
              className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            {urgent && (
              <Badge variant="danger">
                <span className="h-1.5 w-1.5 rounded-full bg-danger-500 animate-pulse" />
                Eylem gerek
              </Badge>
            )}
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-ink-900">
            {value}
          </p>
          <p className="text-sm text-ink-500 mt-1">{label}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-card hover:border-brand-200 group">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-700 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink-900 text-sm">{title}</h3>
            <p className="text-xs text-ink-500 mt-0.5">{desc}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-ink-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
}
