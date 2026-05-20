import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SITE } from "@/config/site";

const SECTIONS = [
  {
    title: "Topluluk",
    links: [
      { href: "/topluluk", label: "Sohbet" },
      { href: "/duyurular", label: "Duyurular" },
      { href: "/yonetim", label: "Yönetim" },
      { href: "/kurallar", label: "Kurallar" },
      { href: "/istatistikler", label: "İstatistikler" },
    ],
  },
  {
    title: "Sistem",
    links: [
      { href: "/sorgu", label: "Oyuncu Sorgu" },
      { href: "/kara-liste", label: "Kara Liste" },
      { href: "/uyarilar", label: "Uyarılar" },
      { href: "/sikayet", label: "Şikayet Et" },
    ],
  },
  {
    title: "Hesap",
    links: [
      { href: "/giris", label: "Giriş" },
      { href: "/kayit", label: "Kayıt" },
      { href: "/destek", label: "Destek" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-200/60 bg-ink-50">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-ink-500 max-w-sm leading-relaxed">
              {SITE.description}
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-ink-900 mb-4">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-ink-200/60 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} {SITE.name}. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-ink-400">
            Goose Goose Duck, Gaggle Studios&apos;a aittir. Bu site resmi
            değildir.
          </p>
        </div>
      </div>
    </footer>
  );
}
