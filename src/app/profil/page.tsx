import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  User,
  Settings,
  Bell,
  ShieldCheck,
  FileText,
  LogOut,
  Clock,
  Edit,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/layout/page-hero";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Profilim" };

const MENU = [
  { icon: User, label: "Hesap Bilgileri", href: "/profil" },
  { icon: FileText, label: "Şikayetlerim", href: "/profil/sikayetlerim" },
  { icon: Bell, label: "Bildirimler", href: "/profil/bildirimler" },
  { icon: Settings, label: "Ayarlar", href: "/profil/ayarlar" },
];

const roleLabels: Record<string, string> = {
  owner: "Kurucu",
  co_owner: "Eş-Kurucu",
  admin: "Yönetici",
  moderator: "Moderatör",
  helper: "Yardımcı",
  trusted: "Güvenilir Üye",
  member: "Üye",
};

const verificationLabels: Record<
  string,
  { label: string; variant: "brand" | "warning" | "danger" }
> = {
  approved: { label: "Doğrulanmış", variant: "brand" },
  pending: { label: "Onay bekliyor", variant: "warning" },
  rejected: { label: "Reddedildi", variant: "danger" },
};

export default async function ProfilPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/giris?next=/profil");

  const supabase = await createClient();
  const { count: reportCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("reporter_id", current.user.id);

  const { count: activeWarnings } = await supabase
    .from("warnings")
    .select("*", { count: "exact", head: true })
    .eq("ggd_user_id", current.profile.ggd_user_id)
    .eq("is_active", true);

  const verification = verificationLabels[current.profile.verification_status];

  return (
    <>
      <PageHero
        eyebrow="Profilim"
        title="Hesabını yönet."
        description="Bilgilerini güncelle, şikayetlerini takip et, bildirimleri ayarla."
      />

      <section className="container-page py-14">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <Card>
              <CardContent className="p-3">
                <nav className="flex flex-col gap-1">
                  {MENU.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-100 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  ))}
                  <div className="my-1 mx-3 border-t border-ink-200" />
                  <SignOutButton className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors text-left">
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </SignOutButton>
                </nav>
              </CardContent>
            </Card>
          </aside>

          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="p-7">
                <div className="flex items-center gap-5">
                  <Image
                    src={current.avatarUrl.replace("s=80", "s=160")}
                    alt={current.nickname}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-3xl border border-ink-200"
                    unoptimized
                  />
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-ink-900">
                      {current.nickname}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={verification.variant}>
                        <ShieldCheck className="h-3 w-3" />
                        {verification.label}
                      </Badge>
                      <Badge variant="outline">
                        {roleLabels[current.profile.role] ?? "Üye"}
                      </Badge>
                      <Badge variant="default">
                        <Clock className="h-3 w-3" />
                        {formatDate(current.profile.joined_at)} tarihinde
                        katıldı
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-7">
                <h3 className="text-lg font-semibold tracking-tight text-ink-900 mb-5">
                  Hesap bilgileri
                </h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">
                      Email
                    </dt>
                    <dd className="mt-1 text-ink-900">{current.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">
                      GGD ana ismi
                    </dt>
                    <dd className="mt-1 text-ink-900">
                      {current.profile.ggd_main_name ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">
                      Friend Code / User ID
                    </dt>
                    <dd className="mt-1 font-mono text-ink-900">
                      {current.profile.ggd_user_id || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">
                      GGD Level
                    </dt>
                    <dd className="mt-1 text-ink-900">
                      {current.profile.ggd_level != null ? (
                        <span className="inline-flex items-center gap-1.5 font-mono">
                          <span className="text-brand-700 font-bold">Lv.</span>
                          {current.profile.ggd_level}
                        </span>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">
                      Toplam şikayetim
                    </dt>
                    <dd className="mt-1 text-ink-900">{reportCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-ink-500">
                      Aktif uyarım
                    </dt>
                    <dd className="mt-1 text-ink-900">
                      {activeWarnings && activeWarnings > 0
                        ? `${activeWarnings} uyarı`
                        : "Temiz sicil ✓"}
                    </dd>
                  </div>
                </dl>
                <Link href="/profil/ayarlar">
                  <Button variant="outline" size="sm" className="mt-6">
                    <Edit className="h-3.5 w-3.5" />
                    Bilgileri Düzenle
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {!current.isApproved && (
              <Card className="border-warning-500/30 bg-warning-50/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-warning-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hesabın onay bekliyor
                  </h3>
                  <p className="mt-2 text-sm text-warning-700/90 leading-relaxed">
                    Bir admin GGD User ID&apos;ni doğruladıktan sonra chat,
                    şikayet ve diğer üye özellikleri açılacak. Genelde 24 saat
                    içinde onaylanır.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
