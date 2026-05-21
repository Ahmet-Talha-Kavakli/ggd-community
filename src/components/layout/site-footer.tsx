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

const SOCIAL = [
  { name: "Discord", href: "#", color: "#5865F2" },
  { name: "YouTube", href: "#", color: "#FF0000" },
  { name: "X / Twitter", href: "#", color: "#000000" },
  { name: "Instagram", href: "#", color: "#E4405F" },
  { name: "TikTok", href: "#", color: "#FF0050" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-brand-200/50 bg-linear-to-b from-white via-brand-50/40 to-brand-100/40">
      {/* Üst dekoratif şerit */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-500/60 to-transparent"
      />

      <div className="relative container-page py-12">
        {/* Newsletter signup banner */}
        <div className="rounded-2xl border border-brand-200/70 bg-white/80 backdrop-blur p-6 md:p-8 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="max-w-md">
              <h4 className="text-lg font-semibold text-ink-900">
                Topluluk haberlerinden ilk sen haberdar ol
              </h4>
              <p className="mt-1 text-sm text-ink-600">
                Haftada bir — duyurular, etkinlikler, çekilişler. Spam yok,
                istediğinde abonelikten çık.
              </p>
            </div>
            <form
              action="#"
              method="post"
              className="flex gap-2 shrink-0 w-full md:w-auto"
            >
              <input
                type="email"
                name="email"
                placeholder="ornek@email.com"
                required
                aria-label="Email adresi"
                className="h-10 px-3 rounded-lg border border-ink-200 bg-white text-sm placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 w-full md:w-64"
              />
              <button
                type="submit"
                className="h-10 px-5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium whitespace-nowrap transition-colors shadow-sm"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        {/* Sosyal media chips */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-10 pb-8 border-b border-brand-200/40">
          {SOCIAL.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ink-200 bg-white/70 backdrop-blur hover:bg-white hover:border-ink-300 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-sm font-medium text-ink-700">{s.name}</span>
            </Link>
          ))}
        </div>

        {/* Logo + columns */}
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-ink-600 max-w-sm leading-relaxed">
              {SITE.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/60 backdrop-blur px-3 py-1 text-xs font-medium text-brand-700">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                Topluluk canlı
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/40 backdrop-blur px-3 py-1 text-xs font-medium text-ink-600">
                🇹🇷 Türkçe topluluk
              </span>
            </div>
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

        <div className="mt-12 pt-8 border-t border-brand-200/40 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
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
