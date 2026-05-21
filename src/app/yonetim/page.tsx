import Image from "next/image";
import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_META } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { avatarUrl } from "@/lib/avatars";
import type { Profile } from "@/lib/supabase/types";

export const metadata = { title: "Lobi Yönetimi" };
export const dynamic = "force-dynamic"; // avatar guncel kalsin (cache yok)

export default async function YonetimPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, bio, ggd_level, avatar_path")
    .in("role", ["owner", "co_owner", "admin", "moderator", "helper"])
    .order("joined_at", { ascending: true });

  const team = (data ?? []) as Pick<
    Profile,
    "id" | "email" | "nickname" | "role" | "bio" | "ggd_level" | "avatar_path"
  >[];

  return (
    <>
      <section className="hero-wash border-b border-ink-200/50">
        <div className="container-page py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="animate-fade-up max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Lobi yönetimi
              </span>
              <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-[1.05]">
                Topluluğu
                <br />
                <span className="text-brand-600">koruyan ekip.</span>
              </h1>
              <p className="mt-4 text-lg text-ink-500 leading-relaxed">
                Şikayetleri inceler, uyarıları verir, lobiyi sağlıklı tutmaya
                çalışırlar. Sorunun varsa onlara ulaşabilirsin.
              </p>
            </div>
            <div className="animate-scale-in stagger-2 relative">
              <div className="absolute -inset-4 bg-brand-500/10 blur-3xl rounded-full" />
              <div className="relative overflow-hidden rounded-3xl border border-brand-200/40 shadow-card">
                <Image
                  src="/guard.png"
                  alt="GooseCage yönetimi"
                  width={1200}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        {error && (
          <Card className="border-danger-500/30 bg-danger-50/50 mb-6">
            <CardContent className="p-5 text-sm text-danger-700">
              Veri çekilirken bir hata oluştu: {error.message}
            </CardContent>
          </Card>
        )}

        {!error && team.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center max-w-2xl mx-auto">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-700">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-semibold text-ink-900">
                Henüz yönetim atanmamış
              </h3>
              <p className="mt-2 text-sm text-ink-500">
                Yönetim ekibi atanınca burada gözükecekler.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => {
            const meta = ROLE_META[m.role] ?? ROLE_META.member;
            const RoleIcon = meta.icon;
            return (
              <Card
                key={m.id}
                className={`animate-fade-up stagger-${Math.min(i + 1, 6)} lift`}
              >
                <CardContent className="p-7">
                  <div className="flex items-center gap-4">
                    <Image
                      src={avatarUrl({
                        avatarPath: m.avatar_path,
                        email: m.email,
                        size: 112,
                      })}
                      alt={m.nickname}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-2xl border border-ink-200 object-cover"
                      unoptimized
                    />
                    <div>
                      <h3 className="font-semibold text-ink-900">
                        {m.nickname}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant={meta.badge}>
                          <RoleIcon size={12} weight="duotone" />
                          {meta.label}
                        </Badge>
                        {m.ggd_level != null && (
                          <Badge variant="outline">
                            <span className="font-mono">Lv. {m.ggd_level}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {m.bio && (
                    <p className="mt-5 text-sm text-ink-600 leading-relaxed">
                      {m.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-14 max-w-3xl rounded-2xl border border-ink-900 p-7 bg-ink-50">
          <h3 className="font-semibold text-ink-900 mb-2">
            Moderatör başvurusu
          </h3>
          <p className="text-sm text-ink-600 leading-relaxed">
            Ekibe katılmak ister misin? En az 3 ay aktif üyelik, temiz sicil ve
            haftada en az 8 saat zaman ayırma gerekiyor. Başvurular Discord
            üzerinden alınıyor.
          </p>
        </div>
      </section>
    </>
  );
}
