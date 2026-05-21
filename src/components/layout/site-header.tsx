"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { List, X, Shield, CaretDown, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import {
  NotificationBell,
  type NotificationItem,
} from "@/components/notifications/notification-bell";
import { Logo } from "@/components/brand/logo";
import { SearchDock } from "@/components/layout/search-dock";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  description?: string;
  tone?: "danger";
};
type NavItem =
  | { href: string; label: string }
  | { label: string; items: NavLink[] };

const NAV: NavItem[] = [
  { href: "/", label: "Anasayfa" },
  {
    label: "Sorgular",
    items: [
      {
        href: "/sorgu",
        label: "Oyuncu Sorgu",
        description: "Nick, ana isim veya ID ile geçmiş",
      },
      {
        href: "/kara-liste",
        label: "Kara Liste",
        description: "Aktif banlanmış oyuncular",
      },
      {
        href: "/uyarilar",
        label: "Uyarılar",
        description: "Bu hafta uyarı alan oyuncular",
      },
      {
        href: "/kirmizi-alan",
        label: "Kırmızı Alan",
        description: "Hiçbir lobiye girmemesi gerekenler",
        tone: "danger",
      },
    ],
  },
  {
    label: "Topluluk",
    items: [
      {
        href: "/topluluk",
        label: "Sohbet",
        description: "Kanallı sohbet sistemi",
      },
      {
        href: "/duyurular",
        label: "Duyurular",
        description: "Yönetimden son haberler",
      },
      {
        href: "/etkinlikler",
        label: "Etkinlikler",
        description: "Turnuvalar ve çekilişler",
      },
    ],
  },
  {
    label: "Bilgi",
    items: [
      {
        href: "/kurallar",
        label: "Kurallar",
        description: "Topluluk kuralları",
      },
      {
        href: "/yonetim",
        label: "Yönetim",
        description: "Yönetim ekibimiz",
      },
      {
        href: "/istatistikler",
        label: "İstatistik",
        description: "Topluluk rakamları",
      },
      {
        href: "/destek",
        label: "Destek",
        description: "AI yardım hattı",
      },
    ],
  },
];

interface SiteHeaderProps {
  user: {
    email: string;
    nickname: string;
    avatarUrl: string;
    isAdmin: boolean;
  } | null;
  notifications?: {
    unreadCount: number;
    items: NotificationItem[];
  };
  activeRoomCode?: string | null;
}

export function SiteHeader({
  user,
  notifications,
  activeRoomCode,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-ink-200/60">
      <div className="container-page flex items-center justify-between h-16 gap-4">
        <div className="flex items-center gap-6">
          <Logo />

          {activeRoomCode && (
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
              aria-label={`Aktif lobi: ${activeRoomCode}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="uppercase tracking-wider">Aktif lobi</span>
              <span className="font-mono tracking-[0.15em] text-brand-800">
                {activeRoomCode}
              </span>
            </Link>
          )}

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              if ("href" in item) {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-all duration-200",
                      active
                        ? "text-brand-700 bg-brand-50 font-medium"
                        : "text-ink-700 hover:text-ink-900 hover:bg-ink-100",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <NavDropdown
                  key={item.label}
                  label={item.label}
                  items={item.items}
                  pathname={pathname}
                />
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* Sikayet Et — kirmizi danger CTA, search'in solunda */}
          <Link
            href="/sikayet"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 border",
              pathname.startsWith("/sikayet")
                ? "bg-danger-50 text-danger-700 border-danger-300"
                : "bg-white text-danger-700 border-danger-300 hover:bg-danger-50 hover:border-danger-500",
            )}
          >
            <Warning size={14} weight="duotone" />
            Şikayet Et
          </Link>
          <SearchDock />
          {user && notifications && (
            <NotificationBell
              unreadCount={notifications.unreadCount}
              items={notifications.items}
            />
          )}
          {user ? (
            <UserMenu {...user} />
          ) : (
            <>
              <Link href="/giris">
                <Button variant="ghost" size="sm">
                  Giriş
                </Button>
              </Link>
              <Link href="/kayit">
                <Button size="sm">Kayıt Ol</Button>
              </Link>
            </>
          )}
          {user?.isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 shadow-sm",
                pathname.startsWith("/admin")
                  ? "bg-brand-700 text-white"
                  : "bg-brand-600 text-white hover:bg-brand-700",
              )}
            >
              <Shield size={14} weight="bold" />
              Admin
            </Link>
          )}
        </div>

        <button
          aria-label="Menü"
          className="lg:hidden grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 transition-colors"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X size={20} weight="regular" />
          ) : (
            <List size={20} weight="regular" />
          )}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink-200/60 bg-white/95 backdrop-blur">
          <div className="container-page py-4 flex flex-col gap-4">
            {NAV.map((item) => {
              if ("href" in item) {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-2.5 text-sm rounded-lg",
                      active
                        ? "text-brand-700 bg-brand-50 font-medium"
                        : "text-ink-700 hover:bg-ink-100",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div key={item.label} className="flex flex-col gap-1">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-brand-700">
                    {item.label}
                  </p>
                  {item.items.map((link) => {
                    const active = pathname.startsWith(link.href);
                    const isDanger = link.tone === "danger";
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg",
                          isDanger
                            ? active
                              ? "text-danger-700 bg-danger-50 font-medium"
                              : "text-danger-700 hover:bg-danger-50"
                            : active
                              ? "text-brand-700 bg-brand-50 font-medium"
                              : "text-ink-700 hover:bg-ink-100",
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              );
            })}

            {/* Mobile: Sikayet Et danger CTA */}
            <Link
              href="/sikayet"
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 font-medium border",
                pathname.startsWith("/sikayet")
                  ? "bg-danger-50 text-danger-700 border-danger-300"
                  : "bg-white text-danger-700 border-danger-300",
              )}
            >
              <Warning size={16} weight="duotone" />
              Şikayet Et
            </Link>

            {user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 font-medium",
                  pathname.startsWith("/admin")
                    ? "bg-brand-700 text-white"
                    : "bg-brand-600 text-white",
                )}
              >
                <Shield size={16} weight="bold" />
                Admin Paneli
              </Link>
            )}
            <div className="mt-2 pt-3 border-t border-ink-200/60">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm text-ink-700">{user.nickname}</span>
                  <Link href="/profil" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm">
                      Profilim
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/giris"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Giriş
                    </Button>
                  </Link>
                  <Link
                    href="/kayit"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Button size="sm" className="w-full">
                      Kayıt Ol
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavDropdown({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavLink[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = items.some((item) => pathname.startsWith(item.href));

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }
  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-all duration-200",
          active
            ? "text-brand-700 bg-brand-50 font-medium"
            : "text-ink-700 hover:text-ink-900 hover:bg-ink-100",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {label}
        <CaretDown
          size={12}
          weight="bold"
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 pt-2 min-w-[260px] z-50">
          <div className="rounded-2xl border border-ink-200 bg-white shadow-float overflow-hidden animate-scale-in origin-top-left">
            <nav className="p-1.5" role="menu">
              {items.map((item) => {
                const itemActive = pathname.startsWith(item.href);
                const isDanger = item.tone === "danger";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className={cn(
                      "block rounded-xl px-3 py-2.5 transition-colors",
                      isDanger
                        ? itemActive
                          ? "bg-danger-50"
                          : "hover:bg-danger-50/60"
                        : itemActive
                          ? "bg-brand-50"
                          : "hover:bg-ink-50",
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isDanger
                          ? "text-danger-700"
                          : itemActive
                            ? "text-brand-700"
                            : "text-ink-900",
                      )}
                    >
                      {item.label}
                    </p>
                    {item.description && (
                      <p
                        className={cn(
                          "mt-0.5 text-xs leading-relaxed",
                          isDanger ? "text-danger-600/80" : "text-ink-500",
                        )}
                      >
                        {item.description}
                      </p>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
