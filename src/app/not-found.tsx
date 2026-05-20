import Link from "next/link";
import {
  Compass,
  House,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Sayfa bulunamadı" };

export default function NotFound() {
  return (
    <section className="hero-wash flex-1 flex items-center py-16">
      <div className="container-page">
        <div className="max-w-lg mx-auto text-center animate-fade-up">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-50 text-brand-700 shadow-soft">
            <Compass size={36} weight="duotone" />
          </div>
          <p className="mt-6 text-xs font-medium text-brand-700 uppercase tracking-[0.2em]">
            404
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            Bu sayfayı bulamadık.
          </h1>
          <p className="mt-4 text-ink-500 leading-relaxed">
            Yanlış bir yola saptın gibi görünüyor. Aradığın şey taşınmış,
            silinmiş ya da hiç var olmamış olabilir.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/">
              <Button>
                <House size={16} weight="bold" />
                Anasayfa
              </Button>
            </Link>
            <Link href="/sorgu">
              <Button variant="outline">
                <MagnifyingGlass size={16} weight="bold" />
                Oyuncu Sorgu
              </Button>
            </Link>
          </div>

          <Card className="mt-10 text-left">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2">
                Popüler sayfalar
              </p>
              <div className="grid gap-1.5 text-sm">
                <PageLink href="/kara-liste">Kara Liste</PageLink>
                <PageLink href="/topluluk">Topluluk Sohbeti</PageLink>
                <PageLink href="/kurallar">Lobi Kuralları</PageLink>
                <PageLink href="/destek">Destek</PageLink>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function PageLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2 rounded-lg text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors"
    >
      <span>{children}</span>
      <span className="text-ink-400">→</span>
    </Link>
  );
}
