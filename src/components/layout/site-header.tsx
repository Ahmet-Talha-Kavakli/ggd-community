"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Anasayfa" },
  { href: "/sorgu", label: "Sorgu" },
  { href: "/kara-liste", label: "Kara Liste" },
  { href: "/uyarilar", label: "Uyarılar" },
  { href: "/kurallar", label: "Kurallar" },
  { href: "/yonetim", label: "Yönetim" },
  { href: "/duyurular", label: "Duyurular" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/topluluk", label: "Topluluk" },
  { href: "/istatistikler", label: "İstatistik" },
  { href: "/destek", label: "Destek" },
];

interface SiteHeaderProps {
  user: {
    email: string;
    nickname: string;
    avatarUrl: string;
    isAdmin: boolean;
  } | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-ink-200/60">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <Logo />

          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap px-2 xl:px-2.5 py-2 text-sm rounded-lg transition-all duration-200",
                    active
                      ? "text-brand-700 bg-brand-50"
                      : "text-ink-600 hover:text-ink-900 hover:bg-ink-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
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
        </div>

        <button
          aria-label="Menü"
          className="lg:hidden grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 transition-colors"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} weight="regular" /> : <List size={20} weight="regular" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink-200/60 bg-white/95 backdrop-blur">
          <div className="container-page py-4 flex flex-col gap-1">
            {NAV.map((item) => {
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
                      ? "text-brand-700 bg-brand-50"
                      : "text-ink-700 hover:bg-ink-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-3 pt-3 border-t border-ink-200/60">
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
