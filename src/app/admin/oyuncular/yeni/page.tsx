import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PlayerForm } from "../player-form";

export const metadata = { title: "Yeni Oyuncu" };

export default async function YeniOyuncuPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Yeni oyuncu"
        title="Lobi oyuncusu ekle"
        description="Siteye kayıt olmadan lobiye katılan bir oyuncuyu sisteme al. User ID + nick zorunlu; gerisi opsiyonel."
        backHref="/admin/oyuncular"
      />
      <Card>
        <CardContent className="p-7">
          <PlayerForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
