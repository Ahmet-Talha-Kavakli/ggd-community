import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SoundEffects } from "@/components/sound-effects";
import { CookieConsent } from "@/components/cookie-consent";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getUnreadCount,
  getRecentNotifications,
} from "@/lib/notifications";
import { SITE } from "@/config/site";

// Layout auth-aware (getCurrentUser cookie okur), child sayfalar ISR yapsa bile
// header'ın guncel kalmasi icin force-dynamic.
export const dynamic = "force-dynamic";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  keywords: [
    "Goose Goose Duck",
    "GGD",
    "lobi",
    "ban",
    "uyarı",
    "şikayet",
    "topluluk",
    "GooseCage",
  ],
  // Favicon ve apple-icon icin Next.js file convention kullaniyoruz:
  // src/app/icon.png + src/app/apple-icon.png otomatik HEAD'e eklenir.
  openGraph: {
    type: "website",
    locale: "tr_TR",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    siteName: SITE.name,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.tagline,
    images: ["/og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const current = await getCurrentUser();
  const [unreadCount, recentNotifications] = current
    ? await Promise.all([
        getUnreadCount(current.user.id),
        getRecentNotifications(current.user.id, 10),
      ])
    : [0, []];

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#059669",
          colorText: "#18181b",
          colorBackground: "#ffffff",
          fontFamily: "var(--font-sora)",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="tr" className={`${sora.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col text-ink-900 relative">
          {/* Aurora gradient — akıcı yeşil katman (belirgin) */}
          <div
            aria-hidden
            className="fixed inset-0 -z-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, #10b98130 0%, #06b6d445 25%, #10b98135 50%, #34d39945 75%, #10b98130 100%)",
            }}
          />
          {/* Aurora blob accents — büyük yumuşak vurgular */}
          <div
            aria-hidden
            className="fixed inset-0 -z-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 30% 25%, #10b98150 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 70% 75%, #06b6d450 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 80% 20%, #34d39940 0%, transparent 60%)",
            }}
          />
          {/* Topographic izoton hatlar — belirgin */}
          <div
            aria-hidden
            className="fixed inset-0 -z-10 pointer-events-none opacity-45"
            style={{
              backgroundImage:
                "repeating-radial-gradient(circle at 30% 30%, transparent 0, transparent 28px, #047857 28px, #047857 29px), repeating-radial-gradient(circle at 70% 70%, transparent 0, transparent 32px, #047857 32px, #047857 33px)",
            }}
          />

          <SiteHeader
            user={
              current
                ? {
                    email: current.email,
                    nickname: current.nickname,
                    avatarUrl: current.avatarUrl,
                    isAdmin: current.isAdmin,
                  }
                : null
            }
            notifications={{
              unreadCount,
              items: recentNotifications.map((n) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                body: n.body,
                link: n.link,
                read_at: n.read_at,
                created_at: n.created_at,
              })),
            }}
          />
          <main className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
          <SoundEffects />
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  );
}
