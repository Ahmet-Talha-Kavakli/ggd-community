"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlass, X, Clock } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const RECENT_KEY = "ggc-recent-pages";
const RECENT_LIMIT = 6;

type RecentItem = { path: string; title: string; at: number };

function readRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is RecentItem =>
        x && typeof x.path === "string" && typeof x.title === "string",
    );
  } catch {
    return [];
  }
}

function writeRecent(list: RecentItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_LIMIT)));
  } catch {
    // sessizce gec — localStorage full / disabled
  }
}

function pathToTitle(path: string): string {
  if (path === "/") return "Anasayfa";
  const seg = path.split("/").filter(Boolean)[0] ?? "";
  const map: Record<string, string> = {
    sorgu: "Oyuncu Sorgu",
    "kara-liste": "Kara Liste",
    uyarilar: "Uyarılar",
    "kirmizi-alan": "Kırmızı Alan",
    sikayet: "Şikayet Et",
    topluluk: "Topluluk",
    duyurular: "Duyurular",
    etkinlikler: "Etkinlikler",
    kurallar: "Kurallar",
    yonetim: "Yönetim",
    istatistikler: "İstatistikler",
    destek: "Destek",
    profil: "Profil",
    admin: "Admin",
  };
  return map[seg] ?? seg.replace(/-/g, " ");
}

export function SearchDock() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sayfa degisince mevcut sayfayi recent listesine ekle
  useEffect(() => {
    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api")
    )
      return;
    const list = readRecent();
    const without = list.filter((r) => r.path !== pathname);
    const next: RecentItem[] = [
      { path: pathname, title: pathToTitle(pathname), at: Date.now() },
      ...without,
    ];
    writeRecent(next);
  }, [pathname]);

  // Acilinca recent'leri yukle + input focus
  useEffect(() => {
    if (open) {
      setRecents(readRecent().filter((r) => r.path !== pathname));
      // Animation sonrasi focus
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, pathname]);

  // Disari tiklayinca kapat
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setValue("");
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Escape ile kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setValue("");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/sorgu?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setValue("");
  }

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={cn(
          "flex items-center rounded-full border transition-all duration-300 ease-out overflow-hidden",
          open
            ? "w-72 border-brand-500 bg-white shadow-card"
            : "w-9 border-ink-200 bg-white hover:border-ink-300",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center shrink-0 text-ink-700 hover:text-brand-700 transition-colors"
          aria-label="Ara"
        >
          {open ? (
            <X size={16} weight="bold" />
          ) : (
            <MagnifyingGlass size={16} weight="bold" />
          )}
        </button>
        {open && (
          <form onSubmit={handleSubmit} className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Oyuncu ara veya sayfa adı..."
              className="w-full h-9 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none pr-3"
            />
          </form>
        )}
      </div>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl border border-ink-900 bg-white shadow-float overflow-hidden animate-scale-in origin-top-right z-50">
          {value.trim().length > 0 ? (
            <div className="p-2">
              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-brand-50 text-left transition-colors"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <MagnifyingGlass size={14} weight="bold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900">
                    &quot;{value}&quot; ara
                  </p>
                  <p className="text-xs text-ink-500">
                    Oyuncu sorgu sayfasında ara
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <div className="p-2">
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                Son ziyaret edilenler
              </p>
              {recents.length === 0 ? (
                <p className="px-3 py-4 text-xs text-ink-500 text-center">
                  Henüz sayfa ziyaret etmedin.
                </p>
              ) : (
                <ul className="flex flex-col gap-0.5">
                  {recents.slice(0, RECENT_LIMIT).map((r) => (
                    <li key={r.path}>
                      <Link
                        href={r.path}
                        onClick={() => {
                          setOpen(false);
                          setValue("");
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-ink-50 text-sm text-ink-700 transition-colors"
                      >
                        <Clock
                          size={14}
                          weight="duotone"
                          className="text-ink-400 shrink-0"
                        />
                        <span className="flex-1 min-w-0 truncate">
                          {r.title}
                        </span>
                        <span className="text-xs text-ink-400 font-mono truncate">
                          {r.path}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
