import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AnimatedBlobBg } from "@/components/layout/animated-blob-bg";
import { SoundEffects } from "@/components/sound-effects";
import { CookieConsent } from "@/components/cookie-consent";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getUnreadCount,
  getRecentNotifications,
} from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/server";
import type { RoomCode } from "@/lib/supabase/types";
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
    default: `${SITE.name} | Türk Goose Goose Duck Topluluğu — Toksik Oyunculardan Korun`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  category: "gaming",
  classification: "Gaming Community Platform",
  keywords: [
    "Goose Goose Duck",
    "GGD",
    "GGD Türkçe",
    "GGD topluluk",
    "GGD lobi",
    "GooseCage",
    "ban liste",
    "kara liste",
    "uyarı sistemi",
    "şikayet",
    "toksik oyuncu",
    "GGD oyuncu sorgu",
    "GGD User ID sorgu",
    "GGD Türk topluluk",
    "Türkçe Goose Goose Duck",
    "lobi yönetimi",
  ],
  alternates: {
    canonical: SITE.url,
    languages: {
      "tr-TR": SITE.url,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Favicon ve apple-icon icin Next.js file convention kullaniyoruz:
  // src/app/icon.png + src/app/apple-icon.png otomatik HEAD'e eklenir.
  openGraph: {
    type: "website",
    locale: "tr_TR",
    title: `${SITE.name} | Türk Goose Goose Duck Topluluğu`,
    description: SITE.description,
    siteName: SITE.name,
    url: SITE.url,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | Türk GGD Topluluğu`,
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

  // Aktif lobi oda kodu — varsa header'da chip olarak gosterilir
  let activeRoomCode: string | null = null;
  try {
    const adminSb = await createAdminClient();
    const { data } = await adminSb
      .from("room_code")
      .select("code")
      .eq("id", 1)
      .single();
    const room = data as Pick<RoomCode, "code"> | null;
    const trimmed = room?.code?.trim();
    if (trimmed) activeRoomCode = trimmed;
  } catch {
    // sessiz gec — Supabase down olsa bile site cikar
  }

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
        <head>
          {/* Structured data — Google rich results */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "WebSite",
                    "@id": `${SITE.url}#website`,
                    url: SITE.url,
                    name: SITE.name,
                    description: SITE.description,
                    inLanguage: "tr-TR",
                    publisher: { "@id": `${SITE.url}#organization` },
                    potentialAction: {
                      "@type": "SearchAction",
                      target: {
                        "@type": "EntryPoint",
                        urlTemplate: `${SITE.url}/sorgu?q={search_term_string}`,
                      },
                      "query-input": "required name=search_term_string",
                    },
                  },
                  {
                    "@type": "Organization",
                    "@id": `${SITE.url}#organization`,
                    name: SITE.name,
                    url: SITE.url,
                    logo: {
                      "@type": "ImageObject",
                      url: `${SITE.url}/og.png`,
                      width: 1200,
                      height: 630,
                    },
                    description: SITE.description,
                  },
                ],
              }),
            }}
          />
        </head>
        <body className="min-h-full flex flex-col text-ink-900">
          <AnimatedBlobBg />
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
            activeRoomCode={activeRoomCode}
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
