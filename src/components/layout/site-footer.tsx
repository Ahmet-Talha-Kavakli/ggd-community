import Link from "next/link";
import {
  DiscordLogo,
  YoutubeLogo,
  XLogo,
  InstagramLogo,
  TiktokLogo,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand/logo";
import { SITE } from "@/config/site";

type FooterLink = { href: string; label: string; tone?: "danger" };

const SECTIONS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Topluluk",
    links: [
      { href: "/topluluk", label: "Sohbet" },
      { href: "/duyurular", label: "Duyurular" },
      { href: "/etkinlikler", label: "Etkinlikler" },
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
      { href: "/kirmizi-alan", label: "Kırmızı Alan", tone: "danger" },
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
  {
    name: "Discord",
    href: SITE.socials.discord,
    color: "#5865F2",
    icon: DiscordLogo,
  },
  {
    name: "YouTube",
    href: SITE.socials.youtube,
    color: "#FF0000",
    icon: YoutubeLogo,
  },
  {
    name: "X",
    href: SITE.socials.x,
    color: "#000000",
    icon: XLogo,
  },
  {
    name: "Instagram",
    href: SITE.socials.instagram,
    color: "#E4405F",
    icon: InstagramLogo,
  },
  {
    name: "TikTok",
    href: SITE.socials.tiktok,
    color: "#000000",
    icon: TiktokLogo,
  },
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
        {/* Sosyal media chips */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-10 pb-8 border-b border-brand-200/40">
          {SOCIAL.map((s) => (
            <button
              type="button"
              key={s.name}
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ink-200 bg-white/70 backdrop-blur hover:bg-white hover:border-ink-300 hover:-translate-y-0.5 transition-all shadow-sm group cursor-pointer"
              aria-label={s.name}
            >
              <s.icon
                size={18}
                weight="fill"
                style={{ color: s.color }}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-sm font-medium text-ink-700">{s.name}</span>
            </button>
          ))}
        </div>

        {/* Logo + columns */}
        <div className="grid gap-10 md:gap-12 grid-cols-2 sm:grid-cols-3 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
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
                {section.links.map((l) => {
                  const isDanger = l.tone === "danger";
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={
                          isDanger
                            ? "text-sm text-danger-700 hover:text-danger-800 transition-colors inline-flex items-center gap-1.5 group font-medium"
                            : "text-sm text-ink-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1.5 group"
                        }
                      >
                        <span
                          className={
                            isDanger
                              ? "h-px w-0 bg-danger-600 transition-all duration-200 group-hover:w-3"
                              : "h-px w-0 bg-brand-600 transition-all duration-200 group-hover:w-3"
                          }
                        />
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
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
