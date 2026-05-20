import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SoundEffects } from "@/components/sound-effects";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SITE } from "@/config/site";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
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
    "GooseGuard",
  ],
  icons: {
    icon: [
      { url: "/logo-icon.png", type: "image/png", sizes: "1024x1024" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/logo-icon.png",
  },
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
      </body>
    </html>
  );
}
