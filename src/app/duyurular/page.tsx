import { Megaphone, Pin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/layout/page-hero";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Announcement } from "@/lib/supabase/types";

export const metadata = { title: "Duyurular" };

export default async function DuyurularPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, tag, pinned, published_at")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false });

  const announcements = (data ?? []) as Pick<
    Announcement,
    "id" | "title" | "body" | "tag" | "pinned" | "published_at"
  >[];

  return (
    <>
      <PageHero
        eyebrow="Duyurular"
        title="Topluluktan haberler."
        description="Yönetimden gelen güncel duyurular, kural değişiklikleri ve yaklaşan etkinlikler."
        image={{ src: "/goose-megaphone.png", alt: "Duyuru yapan kaz" }}
      />

      <section className="container-page py-14">
        {error && (
          <Card className="border-danger-500/30 bg-danger-50/50 mb-6">
            <CardContent className="p-5 text-sm text-danger-700">
              Veri çekilirken bir hata oluştu: {error.message}
            </CardContent>
          </Card>
        )}

        {!error && announcements.length === 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent>
              <EmptyState
                title="Henüz duyuru yok"
                description="Yönetimden bir duyuru gelince burada gözükecek."
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 max-w-4xl">
          {announcements.map((a) => (
            <Card key={a.id} className={a.pinned ? "border-brand-300" : ""}>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {a.pinned && (
                    <Badge variant="brand">
                      <Pin className="h-3 w-3" />
                      Sabitlenmiş
                    </Badge>
                  )}
                  <Badge variant="outline">{a.tag}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-ink-500 ml-auto">
                    <Calendar className="h-3 w-3" />
                    {formatDate(a.published_at)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-ink-900">
                  {a.title}
                </h2>
                <p className="mt-2 text-[15px] text-ink-600 leading-relaxed whitespace-pre-wrap">
                  {a.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mt-10 rounded-2xl border border-ink-200/70 bg-ink-50 p-6 flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink-200 text-ink-700">
            <Megaphone className="h-5 w-5" />
          </div>
          <p className="text-sm text-ink-600 leading-relaxed">
            Önemli duyuruları kaçırmamak için topluluk üyesi ol — Discord
            sunucumuza katılınca bildirimleri direkt cebine alırsın.
          </p>
        </div>
      </section>
    </>
  );
}
