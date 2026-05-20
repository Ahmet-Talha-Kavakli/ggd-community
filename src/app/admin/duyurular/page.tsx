import Link from "next/link";
import { Megaphone, Pin, Plus, Trash2, Calendar } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { deleteAnnouncementAction } from "@/lib/actions/admin";
import type { Announcement } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Duyurular" };

export default async function AdminDuyurularPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, tag, pinned, published_at")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false });

  const announcements = (data ?? []) as Pick<
    Announcement,
    "id" | "title" | "body" | "tag" | "pinned" | "published_at"
  >[];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Duyurular"
        title="Duyuru yönetimi"
        description="Yayınla, sabitle, sil. Anasayfada da son 3'ü görünür."
        backHref="/admin"
        actions={
          <Link href="/admin/duyurular/yeni">
            <Button>
              <Plus className="h-4 w-4" />
              Yeni Duyuru
            </Button>
          </Link>
        }
      />

      {announcements.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Megaphone className="h-8 w-8 mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">Henüz duyuru yok.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {a.pinned && (
                  <Badge variant="brand">
                    <Pin className="h-3 w-3" />
                    Sabit
                  </Badge>
                )}
                <Badge variant="outline">{a.tag}</Badge>
                <span className="inline-flex items-center gap-1 text-xs text-ink-500 ml-auto">
                  <Calendar className="h-3 w-3" />
                  {formatDateTime(a.published_at)}
                </span>
              </div>
              <h3 className="font-semibold text-ink-900">{a.title}</h3>
              <p className="mt-1 text-sm text-ink-600 line-clamp-2 leading-relaxed">
                {a.body}
              </p>
              <form action={deleteAnnouncementAction} className="mt-4">
                <input type="hidden" name="id" value={a.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-danger-600 hover:bg-danger-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Sil
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
