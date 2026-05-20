import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EventForm } from "../event-form";

export const metadata = { title: "Yeni Etkinlik" };

export default async function YeniEtkinlikPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Yeni etkinlik"
        title="Etkinlik oluştur"
        description="Çekiliş, turnuva veya topluluk buluşması ekle. Taslak olarak başlayıp hazır olunca yayına alabilirsin."
        backHref="/admin/etkinlikler"
      />
      <Card>
        <CardContent className="p-7">
          <EventForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
