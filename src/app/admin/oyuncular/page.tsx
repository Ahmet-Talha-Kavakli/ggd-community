import Link from "next/link";
import { Plus, UserPlus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Player } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Oyuncular" };

type PlayerRow = Pick<
  Player,
  | "id"
  | "ggd_user_id"
  | "nickname"
  | "main_name"
  | "level"
  | "keyword"
  | "claimed_profile_id"
  | "created_at"
>;

export default async function AdminOyuncularPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select(
      "id, ggd_user_id, nickname, main_name, level, keyword, claimed_profile_id, created_at",
    )
    .is("claimed_profile_id", null)
    .order("created_at", { ascending: false });

  const players = (data ?? []) as PlayerRow[];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Oyuncular"
        title="Lobi oyuncuları"
        description="Siteye kayıt olmayan, lobide tanıdığımız oyuncular. Kural ihlali yaparlarsa banlayabilir, uyarabilirsin — sicilleri otomatik tutulur."
        backHref="/admin"
        actions={
          <Link href="/admin/oyuncular/yeni">
            <Button>
              <Plus className="h-4 w-4" />
              Oyuncu ekle
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-5 flex items-start gap-4 bg-brand-50/40 border-brand-100">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700 shrink-0">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="text-sm text-ink-700">
            <p className="font-medium text-ink-900">Nasıl çalışıyor?</p>
            <p className="mt-1 text-ink-600 leading-relaxed">
              Lobiye gelen oyunculardan{" "}
              <span className="font-medium">User ID</span> ve{" "}
              <span className="font-medium">anahtar kelime</span> isteyip burada
              kaydet. Ban/uyarı verirken bu kayıt otomatik kullanılır. Oyuncu
              sonradan siteye kayıt olursa, sicili korunarak Üye&apos;ye
              dönüşür.
            </p>
          </div>
        </CardContent>
      </Card>

      {players.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <UserPlus className="h-8 w-8 mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">
              Henüz oyuncu kaydı yok.
            </p>
            <Link
              href="/admin/oyuncular/yeni"
              className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              İlk oyuncuyu ekle →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player }: { player: PlayerRow }) {
  return (
    <Card className="transition-all hover:shadow-card hover:border-brand-200">
      <CardContent className="p-5 flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink-900">{player.nickname}</h3>
            {player.main_name && (
              <span className="text-xs text-ink-500">({player.main_name})</span>
            )}
            <code className="text-xs font-mono text-ink-500 bg-ink-100 px-2 py-0.5 rounded-md">
              {player.ggd_user_id}
            </code>
            {player.level != null && (
              <Badge variant="outline">
                <span className="font-mono">Lv. {player.level}</span>
              </Badge>
            )}
            <Badge variant="outline">Oyuncu</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-500">
            {player.keyword ? (
              <>
                Anahtar kelime:{" "}
                <span className="font-mono text-ink-700">{player.keyword}</span>
                {" · "}
              </>
            ) : null}
            Eklendi: {formatDate(player.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/sorgu?q=${encodeURIComponent(player.ggd_user_id)}`}>
            <Button size="sm" variant="outline">
              <Search className="h-3.5 w-3.5" />
              Sicili
            </Button>
          </Link>
          <Link href={`/admin/oyuncular/${player.id}`}>
            <Button size="sm" variant="outline">
              Düzenle
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
