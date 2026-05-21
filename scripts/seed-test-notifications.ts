/* eslint-disable no-console */
// Bir profile'a test bildirimleri ekler.
// Kullanim: npx tsx scripts/seed-test-notifications.ts <email>

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const email = process.argv[2];
if (!email) {
  console.error("❌ Email gerekli: npx tsx scripts/seed-test-notifications.ts <email>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const NOTIFICATIONS = [
  {
    type: "announcement" as const,
    title: "Topluluk artık canlı! 🎉",
    body: "GooseCage'e hoş geldin. İlk duyurularımıza göz at, kanallara katıl.",
    link: "/duyurular",
    minutes_ago: 2,
    read: false,
  },
  {
    type: "warning_received" as const,
    title: "Test uyarı: Spam",
    body: "Bu bir test bildirimi. Gerçek bir uyarı değil — sadece bell sisteminin nasıl göründüğünü gösterir.",
    link: "/uyarilar",
    minutes_ago: 15,
    read: false,
  },
  {
    type: "report_received" as const,
    title: "Şikayetin alındı (#42)",
    body: "ToxicHonk hakkındaki şikayetin yönetime iletildi.",
    link: "/profil/sikayetlerim",
    minutes_ago: 60,
    read: false,
  },
  {
    type: "verification_approved" as const,
    title: "Hesabın onaylandı 🎉",
    body: "Artık tüm topluluk özelliklerini kullanabilirsin.",
    link: "/topluluk",
    minutes_ago: 60 * 6,
    read: true,
  },
  {
    type: "report_resolved" as const,
    title: "Şikayetin haklı bulundu",
    body: "AhmettalhakavakliFake hakkındaki şikayetin sonuçlandı — oyuncu 7 gün banlandı.",
    link: "/profil/sikayetlerim",
    minutes_ago: 60 * 12,
    read: true,
  },
  {
    type: "system" as const,
    title: "Profil resmin güncellendi",
    body: "Yeni avatar başarıyla kaydedildi.",
    link: "/profil",
    minutes_ago: 60 * 24,
    read: true,
  },
];

async function main() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    console.error(`❌ Email '${email}' icin profile bulunamadi.`);
    process.exit(1);
  }

  const p = profile as { id: string; nickname: string };
  console.log(`🔍 Profile: ${p.nickname} (${p.id})`);

  const now = Date.now();
  const rows = NOTIFICATIONS.map((n) => ({
    profile_id: p.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read_at: n.read
      ? new Date(now - n.minutes_ago * 60 * 1000 + 5 * 60 * 1000).toISOString()
      : null,
    created_at: new Date(now - n.minutes_ago * 60 * 1000).toISOString(),
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) {
    console.error("❌ Insert hatasi:", error.message);
    process.exit(1);
  }

  const unread = rows.filter((r) => !r.read_at).length;
  console.log(
    `✅ ${rows.length} test bildirim eklendi (${unread} okunmamis)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
