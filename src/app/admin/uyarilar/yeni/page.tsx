import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { WarningForm } from "./form";

export const metadata = { title: "Yeni Uyarı" };

export default async function YeniUyariPage({
  searchParams,
}: {
  searchParams: Promise<{ ggd?: string; nick?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Yeni uyarı"
        title="Bir oyuncuya uyarı ver"
        description="Şiddet seviyesi 3 birikirse otomatik ban önerilir."
        backHref="/admin/uyarilar"
      />
      <Card>
        <CardContent className="p-7">
          <WarningForm
            defaultGgd={params.ggd ?? ""}
            defaultNick={params.nick ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
