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
    <footer className="relative mt-24 border-t border-brand-200/50 bg-linear-to-b from-white via-brand-50/40 to-brand-100/40">
      {/* Subtle dekoratif ust serit */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-500/60 to-transparent"
      />

      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-ink-600 max-w-sm leading-relaxed">
              {SITE.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 backdrop-blur px-3 py-1 text-xs font-medium text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              Topluluk canlı
            </span>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-brand-800 mb-4 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-brand-500" />
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <span className="h-px w-0 bg-brand-600 transition-all duration-200 group-hover:w-3" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-brand-200/40 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <p className="text-xs text-ink-600">
            © {new Date().getFullYear()}{" "}
            <span className="font-medium text-ink-800">{SITE.name}</span>. Tüm
            hakları saklıdır.
          </p>
          <p className="text-xs text-ink-500">
            Goose Goose Duck, Gaggle Studios&apos;a aittir. Bu site resmi
            değildir.
          </p>
        </div>
      </div>
    </footer>
  );
}
