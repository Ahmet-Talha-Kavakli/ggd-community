import { Card, CardContent } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RedZoneForm } from "./form";

export const metadata = { title: "Yeni Kırmızı Alan Kaydı" };

export default function YeniRedZonePage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Kırmızı Alan"
        title="Hiçbir lobiye girmemeli — yeni kayıt"
        description="Sadece topluluk geneli tehdit oluşturan, tekrar suçlu oyuncular. Bizim banımızdan bağımsız evrensel uyarı listesi."
        backHref="/admin/kirmizi-alan"
      />
      <Card>
        <CardContent className="p-7">
          <RedZoneForm />
        </CardContent>
      </Card>
    </div>
  );
}
