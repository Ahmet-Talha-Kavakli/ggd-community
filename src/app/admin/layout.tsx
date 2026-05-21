import Link from "next/link";
import {
  SquaresFour,
  Users,
  UserPlus,
  Tray,
  ShieldCheck,
  Warning,
  Megaphone,
  Hash,
  Scroll,
  Trophy,
  Skull,
} from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/auth/require-admin";

type SidebarItem = {
  href: string;
  label: string;
  icon: typeof SquaresFour;
  exact?: boolean;
  tone?: "danger";
};

const SIDEBAR: SidebarItem[] = [
  { href: "/admin", label: "Genel Bakış", icon: SquaresFour, exact: true },
  { href: "/admin/uyeler", label: "Üyeler", icon: Users },
  { href: "/admin/oyuncular", label: "Oyuncular", icon: UserPlus },
  { href: "/admin/sikayetler", label: "Şikayetler", icon: Tray },
  { href: "/admin/kara-liste", label: "Kara Liste", icon: ShieldCheck },
  { href: "/admin/uyarilar", label: "Uyarılar", icon: Warning },
  {
    href: "/admin/kirmizi-alan",
    label: "Kırmızı Alan",
    icon: Skull,
    tone: "danger",
  },
  { href: "/admin/duyurular", label: "Duyurular", icon: Megaphone },
  { href: "/admin/etkinlikler", label: "Etkinlikler", icon: Trophy },
  { href: "/admin/oda-kodu", label: "Oda Kodu", icon: Hash },
  { href: "/admin/audit-log", label: "Audit Log", icon: Scroll },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex-1 bg-ink-50/60">
      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink-900 bg-white p-2 shadow-soft">
              <nav className="flex flex-col gap-0.5">
                {SIDEBAR.map((item) => {
                  const isDanger = item.tone === "danger";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        isDanger
                          ? "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-danger-700 hover:bg-danger-50 transition-colors"
                          : "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                      }
                    >
                      <item.icon size={16} weight="duotone" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 animate-fade-up">{children}</div>
        </div>
      </div>
    </div>
  );
}
