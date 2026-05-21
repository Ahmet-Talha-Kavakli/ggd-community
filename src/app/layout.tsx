import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SoundEffects } from "@/components/sound-effects";
import { CookieConsent } from "@/components/cookie-consent";
import { getCurrentUser } from "@/lib/auth/current-user";
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
        <body className="min-h-full flex flex-col bg-white text-ink-900">
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
