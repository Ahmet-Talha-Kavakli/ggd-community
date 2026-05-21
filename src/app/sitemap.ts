import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { createAdminClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/sorgu", priority: 0.9, changeFrequency: "daily" },
    { path: "/kara-liste", priority: 0.9, changeFrequency: "daily" },
    { path: "/uyarilar", priority: 0.9, changeFrequency: "daily" },
    { path: "/kirmizi-alan", priority: 0.85, changeFrequency: "weekly" },
    { path: "/kurallar", priority: 0.7, changeFrequency: "monthly" },
    { path: "/yonetim", priority: 0.6, changeFrequency: "weekly" },
    { path: "/duyurular", priority: 0.8, changeFrequency: "daily" },
    { path: "/etkinlikler", priority: 0.7, changeFrequency: "weekly" },
    { path: "/topluluk", priority: 0.8, changeFrequency: "daily" },
    { path: "/istatistikler", priority: 0.6, changeFrequency: "weekly" },
    { path: "/destek", priority: 0.5, changeFrequency: "monthly" },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Dinamik: topluluk kanallari
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("channels")
      .select("slug, locked")
      .eq("locked", false);

    for (const ch of (data ?? []) as { slug: string }[]) {
      entries.push({
        url: `${base}/topluluk/${ch.slug}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.6,
      });
    }
  } catch {
    // Sessiz gec — Supabase down olsa bile static routes sitemap olusur
  }

  return entries;
}
