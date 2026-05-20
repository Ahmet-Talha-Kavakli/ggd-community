"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserCircle,
  SignOut,
  Shield,
  Gear,
  FileText,
} from "@phosphor-icons/react";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface UserMenuProps {
  email: string;
  nickname: string;
  avatarUrl: string;
  isAdmin: boolean;
}

export function UserMenu({ email, nickname, avatarUrl, isAdmin }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Hesap menüsü"
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-ink-100 transition-colors"
      >
        <Image
          src={avatarUrl}
          alt={nickname}
          width={32}
          height={32}
          className="rounded-full border border-ink-200"
          unoptimized
        />
        <span className="text-sm font-medium text-ink-800 hidden sm:inline">
          {nickname}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-ink-200 bg-white shadow-float overflow-hidden animate-scale-in origin-top-right">
          <div className="px-4 py-3 border-b border-ink-200/70">
            <p className="text-sm font-semibold text-ink-900 truncate">
              {nickname}
            </p>
            <p className="text-xs text-ink-500 truncate">{email}</p>
          </div>
          <nav className="py-1.5">
            <MenuLink href="/profil" icon={UserCircle} label="Profilim" />
            <MenuLink
              href="/profil/sikayetlerim"
              icon={FileText}
              label="Şikayetlerim"
            />
            <MenuLink href="/profil/ayarlar" icon={Gear} label="Ayarlar" />
            {isAdmin && (
              <MenuLink
                href="/admin"
                icon={Shield}
                label="Admin Paneli"
                highlight
              />
            )}
          </nav>
          <div className="border-t border-ink-200/70">
            <SignOutButton className="w-full px-4 py-2.5 text-left text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors flex items-center gap-3">
              <SignOut size={16} weight="regular" />
              Çıkış Yap
            </SignOutButton>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  highlight,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "duotone" | "fill" }>;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-ink-100 transition-colors ${
        highlight ? "text-brand-700 font-medium" : "text-ink-700"
      }`}
    >
      <Icon size={16} weight="regular" />
      {label}
    </Link>
  );
}
