import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BanForm } from "./form";

export const metadata = { title: "Yeni Ban" };

export default async function YeniBanPage({
  searchParams,
}: {
  searchParams: Promise<{ ggd?: string; nick?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Yeni ban"
        title="Bir oyuncuyu kara listeye al"
        description="Süre seçimi kalıcı veya geçici olabilir. Süre dolunca otomatik düşmez — manuel kaldırılır."
        backHref="/admin/kara-liste"
      />
      <Card>
        <CardContent className="p-7">
          <BanForm
            defaultGgd={params.ggd ?? ""}
            defaultNick={params.nick ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
