import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OdaKoduForm } from "./form";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { RoomCode } from "@/lib/supabase/types";

export const metadata = { title: "Oda Kodu" };

export default async function OdaKoduPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("room_code")
    .select("code, note, map, mode, updated_at, updated_by")
    .eq("id", 1)
    .single();

  const room = data as Pick<
    RoomCode,
    "code" | "note" | "map" | "mode" | "updated_at" | "updated_by"
  > | null;

  let updaterNick: string | null = null;
  if (room?.updated_by) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", room.updated_by)
      .maybeSingle();
    updaterNick = (prof as { nickname: string } | null)?.nickname ?? null;
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Aktif lobi"
        title="Oda Kodu"
        description="Şu an oynamak için açık lobi varsa kodunu buradan paylaş. Anasayfada hemen görünür."
        backHref="/admin"
      />

      <Card>
        <CardContent className="p-7">
          <OdaKoduForm
            initialCode={room?.code ?? ""}
            initialNote={room?.note ?? ""}
            initialMap={room?.map ?? ""}
            initialMode={room?.mode ?? ""}
          />

          {room?.updated_at && (
            <p className="mt-6 text-xs text-ink-500">
              Son güncelleme: {formatDateTime(room.updated_at)}
              {updaterNick && <> · {updaterNick}</>}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-ink-50 border-ink-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-ink-900 text-sm mb-1">
            Lobiyi kapatmak için
          </h3>
          <p className="text-sm text-ink-600 leading-relaxed">
            Oyun bittiğinde kodu boş bırakıp kaydet. Anasayfa otomatik
            &quot;pasif&quot; durumuna geçer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
