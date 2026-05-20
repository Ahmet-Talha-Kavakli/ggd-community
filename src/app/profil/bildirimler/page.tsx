import { redirect } from "next/navigation";
import Link from "next/link";
import { BellRinging, FileText, Megaphone, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/layout/page-hero";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/utils";
import type { Report, Announcement } from "@/lib/supabase/types";

export const metadata = { title: "Bildirimler" };

export default async function BildirimlerPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/giris?next=/profil/bildirimler");

  const supabase = await createClient();

  const [resolvedReports, recentAnnouncements] = await Promise.all([
    supabase
      .from("reports")
      .select("id, target_nickname, status, resolved_at, resolution_note")
      .eq("reporter_id", current.user.id)
      .in("status", ["resolved", "rejected", "investigating"])
      .order("resolved_at", { ascending: false, nullsFirst: false })
      .limit(10),
    supabase
      .from("announcements")
      .select("id, title, published_at, pinned")
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  const reports = (resolvedReports.data ?? []) as Pick<
    Report,
    "id" | "target_nickname" | "status" | "resolved_at" | "resolution_note"
  >[];
  const announcements = (recentAnnouncements.data ?? []) as Pick<
    Announcement,
    "id" | "title" | "published_at" | "pinned"
  >[];

  const isEmpty = reports.length === 0 && announcements.length === 0;

  return (
    <>
      <PageHero
        eyebrow="Bildirimler"
        title="Senin için olanlar."
        description="Şikayetlerinin sonucu, duyurular ve sana özel uyarılar."
      />

      <section className="container-page py-14">
        {!current.isApproved && (
          <Card className="border-warning-500/30 bg-warning-50/40 mb-6 animate-fade-up">
            <CardContent className="p-5 flex items-center gap-3">
              <ShieldCheck size={20} weight="duotone" className="text-warning-600 shrink-0" />
              <p className="text-sm text-warning-700">
                Hesabın onay bekliyor. Onaylanınca burada bildirim göreceksin.
              </p>
            </CardContent>
          </Card>
        )}

        {isEmpty ? (
          <Card>
            <CardContent className="p-10 text-center max-w-lg mx-auto">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-100 text-ink-700">
                <BellRinging size={22} weight="duotone" />
              </div>
              <h3 className="mt-4 font-semibold text-ink-900">
                Henüz bildirimin yok
              </h3>
              <p className="mt-2 text-sm text-ink-500">
                Bir şikayet açtığında veya yönetimden duyuru geldiğinde burada görüneceksin.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {reports.map((r, i) => (
              <Card key={`r${r.id}`} className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 shrink-0">
                    <FileText size={18} weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink-900 text-sm">
                        Şikayetinin durumu:{" "}
                        <Badge
                          variant={
                            r.status === "resolved"
                              ? "brand"
                              : r.status === "rejected"
                                ? "outline"
                                : "warning"
                          }
                        >
                          {r.status === "resolved"
                            ? "Çözüldü"
                            : r.status === "rejected"
                              ? "Reddedildi"
                              : "İnceleniyor"}
                        </Badge>
                      </p>
                      <span className="text-xs text-ink-400 ml-auto">
                        {r.resolved_at
                          ? relativeTime(r.resolved_at)
                          : "—"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-600">
                      Hedef: <strong>{r.target_nickname}</strong>
                    </p>
                    {r.resolution_note && (
                      <p className="mt-2 text-sm text-ink-500 italic">
                        &ldquo;{r.resolution_note}&rdquo;
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {announcements.map((a, i) => (
              <Link key={`a${a.id}`} href="/duyurular">
                <Card className={`animate-fade-up stagger-${Math.min(i + reports.length + 1, 6)} lift`}>
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 shrink-0">
                      <Megaphone size={18} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-ink-900 text-sm">
                          Yeni duyuru
                        </p>
                        <span className="text-xs text-ink-400 ml-auto">
                          {relativeTime(a.published_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-600 line-clamp-2">
                        {a.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/profil">
            <Button variant="ghost" size="sm">
              ← Profile dön
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
