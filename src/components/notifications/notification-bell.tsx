"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, X, Trash } from "@phosphor-icons/react";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
  deleteAllNotificationsAction,
} from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

interface NotificationBellProps {
  unreadCount: number;
  items: NotificationItem[];
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "az önce";
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} sa önce`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} gün önce`;
  const mo = Math.floor(day / 30);
  return `${mo} ay önce`;
}

export function NotificationBell({
  unreadCount,
  items,
}: NotificationBellProps) {
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
        aria-label="Bildirimler"
        className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-ink-100 transition-colors"
      >
        <Bell size={18} weight="regular" className="text-ink-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 grid min-w-[16px] h-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-ink-200 bg-white shadow-float overflow-hidden animate-scale-in origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200/70">
            <p className="text-sm font-semibold text-ink-900">Bildirimler</p>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <form action={markAllNotificationsReadAction}>
                  <button
                    type="submit"
                    className="text-xs text-brand-700 hover:text-brand-800 font-medium"
                  >
                    Tümünü okundu
                  </button>
                </form>
              )}
              {items.length > 0 && (
                <form action={deleteAllNotificationsAction}>
                  <button
                    type="submit"
                    aria-label="Tümünü sil"
                    className="text-xs text-ink-500 hover:text-danger-600 font-medium inline-flex items-center gap-1"
                  >
                    <Trash size={12} weight="regular" />
                    Sil
                  </button>
                </form>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Bell size={28} weight="duotone" className="mx-auto text-ink-300" />
              <p className="mt-3 text-sm text-ink-500">Henüz bildirim yok</p>
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((n) => {
                const unread = !n.read_at;
                const Wrapper = ({
                  children,
                }: {
                  children: React.ReactNode;
                }) =>
                  n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => setOpen(false)}
                      className="block"
                    >
                      {children}
                    </Link>
                  ) : (
                    <div>{children}</div>
                  );

                return (
                  <li
                    key={n.id}
                    className={cn(
                      "group relative border-b border-ink-100 last:border-b-0",
                      unread && "bg-brand-50/40",
                    )}
                  >
                    <Wrapper>
                      <div className="flex gap-3 px-4 py-3 pr-16 hover:bg-ink-50 transition-colors">
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            unread ? "bg-brand-500" : "bg-transparent",
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 leading-snug">
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="mt-0.5 text-xs text-ink-600 line-clamp-2 leading-relaxed">
                              {n.body}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-ink-400">
                            {timeAgo(n.created_at)}
                          </p>
                        </div>
                      </div>
                    </Wrapper>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur rounded-lg px-1 py-1 shadow-sm border border-ink-200/60">
                      {unread && (
                        <form action={markNotificationReadAction}>
                          <input type="hidden" name="id" value={n.id} />
                          <button
                            type="submit"
                            aria-label="Okundu işaretle"
                            className="grid h-6 w-6 place-items-center rounded text-ink-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                          >
                            <Check size={12} weight="bold" />
                          </button>
                        </form>
                      )}
                      <form action={deleteNotificationAction}>
                        <input type="hidden" name="id" value={n.id} />
                        <button
                          type="submit"
                          aria-label="Sil"
                          className="grid h-6 w-6 place-items-center rounded text-ink-500 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                        >
                          <X size={12} weight="bold" />
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
