import { notFound } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createClient } from "@/lib/supabase/server";
import { deletePlayerAction } from "@/lib/actions/players";
import { PlayerForm } from "../player-form";
import type { Player } from "@/lib/supabase/types";

export const metadata = { title: "Oyuncu Düzenle" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OyuncuDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select(
      "id, ggd_user_id, nickname, main_name, keyword, level, notes, claimed_profile_id",
    )
    .eq("id", id)
    .maybeSingle();

  const player = data as unknown as Pick<
    Player,
    | "id"
    | "ggd_user_id"
    | "nickname"
    | "main_name"
    | "keyword"
    | "level"
    | "notes"
    | "claimed_profile_id"
  > | null;
  if (!player) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Oyuncu"
        title={player.nickname}
        description={`${player.ggd_user_id} kullanıcısının kaydını düzenle veya sil.`}
        backHref="/admin/oyuncular"
        actions={
          <Link href={`/sorgu?q=${encodeURIComponent(player.ggd_user_id)}`}>
            <Button variant="outline">Sicili gör →</Button>
          </Link>
        }
      />

      {player.claimed_profile_id && (
        <Card className="border-brand-200 bg-brand-50/50">
          <CardContent className="p-5 text-sm text-brand-900">
            Bu oyuncu sonradan siteye kayıt oldu, artık Üye olarak görünüyor.
            Kayıt salt-okunur.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-7">
          <PlayerForm
            mode="edit"
            defaults={{
              id: player.id,
              ggd_user_id: player.ggd_user_id,
              nickname: player.nickname,
              main_name: player.main_name,
              keyword: player.keyword,
              level: player.level,
              notes: player.notes,
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-danger-200/60">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div>
            <h3 className="font-medium text-ink-900">Oyuncu kaydını sil</h3>
            <p className="text-sm text-ink-500 mt-0.5">
              Banlar/uyarılar zaten User ID üzerinden ayrı tutuluyor — silinmez.
            </p>
          </div>
          <form action={deletePlayerAction}>
            <input type="hidden" name="id" value={player.id} />
            <Button type="submit" variant="outline">
              <Trash2 className="h-4 w-4" />
              Sil
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
