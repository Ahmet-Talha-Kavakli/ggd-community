import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AnnouncementForm } from "./form";

export const metadata = { title: "Yeni Duyuru" };

export default function YeniDuyuruPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Yeni duyuru"
        title="Duyuru yayınla"
        description="Yayınladığın anda topluluk görür."
        backHref="/admin/duyurular"
      />
      <Card>
        <CardContent className="p-7">
          <AnnouncementForm />
        </CardContent>
      </Card>
    </div>
  );
}
