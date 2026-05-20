/* eslint-disable no-console */
// Siteyi kalabalık göstermek için sahte aktivite üreten one-shot script.
// 400 oyuncu + 80 ban + 120 uyarı + 40 şikayet + 15 duyuru ekler.
//
// Kullanım: npx tsx scripts/seed-fake-activity.ts
//
// Gerekli env: SUPABASE_SERVICE_ROLE_KEY (RLS bypass için), NEXT_PUBLIC_SUPABASE_URL

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ----------------------------------------------------------------------------
// Türkçe nick parçaları
// ----------------------------------------------------------------------------
const PREFIX = [
  "Toxic", "Honk", "Kaz", "Ördek", "Şahin", "Beyaz", "Kara", "Mavi", "Yiğit",
  "Lord", "Bey", "Mr", "Dr", "Pro", "Master", "Hızlı", "Sessiz", "Gizli",
  "Karanlık", "Yağmur", "Şimşek", "Kartal", "Aslan", "Kurt", "Atmaca", "Doruk",
  "Tunç", "Demir", "Çelik", "Alperen", "Tarık", "Berat", "Onur", "Cesur",
  "Volkan", "Burak", "Ozan", "Eren", "Kuzey", "Doğan", "Bora", "Mert",
  "Ali", "Yusuf", "Emir", "Kerem", "Arda", "Toprak", "Selim", "Hakan",
];

const SUFFIX = [
  "_TR", "GGD", "99", "42", "23", "77", "X", "Killer", "Sniper", "Pro",
  "Lord", "King", "Master", "_HD", "Aslan", "Kurt", "Şahin", "Yıldırım",
  "Beyaz", "Mavi", "Honk", "Quack", "Hunter", "Hero", "_07", "_88",
  "TR", "Star", "Ace", "Falcon", "Lion", "Wolf", "Eagle", "Berk",
  "1923", "ist", "Sniper", "Boss", "FENA", "Cengiz",
];

const MAIN_NAME_POOL = [
  "Ahmet K.", "Mehmet Y.", "Ayşe T.", "Fatma D.", "Mustafa B.", "Hüseyin Ç.",
  "İbrahim A.", "Hasan O.", "Ömer P.", "Yusuf S.", "Ali V.", "Hakan E.",
  "Mert Ş.", "Burak K.", "Emir Y.", "Eren T.", "Onur G.", "Doruk M.",
];

const BAN_TAGS = [
  "hakaret", "kufur", "sabotaj", "cheat", "stream_sniping", "spam",
  "trolling", "irkcilik", "kisisel_saldiri",
];

const BAN_REASONS = [
  "Lobide sürekli ağır küfür, üç uyarıya rağmen devam etti.",
  "Kasıtlı görev sabotajı, takım arkadaşlarını sürekli oyundan attı.",
  "Açık cheat kullanımı — wallhack davranışları gözlendi.",
  "Yayıncıyı izleyerek oynama (stream sniping) defalarca.",
  "Reklam spam'i, sürekli Discord/site link paylaşımı.",
  "Kişisel saldırı, taciz edici mesajlar.",
  "Irkçı söylem, kabul edilemez içerikli mesajlar.",
  "Trolling, oyunun akışını bilerek bozma.",
  "Sürekli AFK kalıp lobi süresini boşa harcama.",
  "",
];

const WARN_REASONS = [
  "Hafif küfür, daha kibar olması istendi.",
  "Lobi kurallarına uyum eksikliği, hatırlatma yapıldı.",
  "İlk uyarı — toksik davranış.",
  "Görev sırasında dikkatsizlik, takıma zarar verdi.",
  "Gereksiz spam mesajlar.",
  "Sürekli oyun erken bırakma.",
  "",
];

const REPORT_DESCRIPTIONS = [
  "Lobide bana sürekli hakaret etti, sonunda lobi de bozuldu. Kanıt için ekran görüntüsü ekliyorum.",
  "Cheat kullandığını düşünüyorum — duvarın arkasından attı, hareketleri normal değildi.",
  "Stream sniping yapıyordu, yayında olduğumu söyledim ama görmezden geldi ve takip etmeye devam etti.",
  "Üç tur arka arkaya sabotaj yaptı, takım arkadaşlarını öldürdü. Bilinçliydi.",
  "Sürekli Discord linki spam yapıyor, lobinin akışını bozuyor.",
  "Bana ve diğer oyunculara cinsiyetçi şeyler söyledi.",
  "Lobiden ayrılmak isteyince AFK kaldı ve süreyi boşa harcadı.",
  "Bana özel mesaj atıp tehdit etti, ekran görüntüsü destek isterse paylaşırım.",
];

const REPORT_CATEGORIES = [
  "insult",
  "sabotage",
  "cheat",
  "spam",
  "stream_sniping",
  "other",
];

const ANNOUNCEMENT_TEMPLATES = [
  {
    title: "Cuma akşamı sabit lobi — 21:00",
    body: "Bu cuma 21:00'de büyük bir lobi açıyoruz. Oda kodu admin paneli üzerinden paylaşılacak. Görüşmek üzere!",
    tag: "genel",
  },
  {
    title: "Yeni kural eklendi: stream sniping",
    body: "Bundan sonra yayıncı oyuncuyu izleyerek oynayan üyeler doğrudan 30 günlük ban alacak. Lütfen dikkat edin.",
    tag: "kural",
  },
  {
    title: "Bayram özel çekilişi başladı",
    body: "100₺ Steam kodu çekilişine /etkinlikler sayfasından katılabilirsiniz. Son katılım: cuma akşamı.",
    tag: "etkinlik",
  },
  {
    title: "Discord sunucumuz aktif",
    body: "Toplulukla sesli görüşmek için Discord sunucumuza katılın. Link admin'lerde mevcut.",
    tag: "genel",
  },
  {
    title: "Yeni moderatörümüz var: Hızırşah",
    body: "Topluluğa uzun süredir destek olan Hızırşah artık moderatör. Hayırlı olsun!",
    tag: "ekip",
  },
  {
    title: "Server bakımı — Pazartesi 03:00",
    body: "Pazartesi sabahı 03:00-04:00 arası kısa bir bakım olacak. Site bu sürede yavaşlayabilir.",
    tag: "duyuru",
  },
  {
    title: "Topluluk anketi açıldı",
    body: "Yeni özellikler için anketimiz aktif. Görüşlerin bizim için değerli.",
    tag: "anket",
  },
  {
    title: "Hafta sonu turnuvası",
    body: "Cumartesi-Pazar arası eleme usulü turnuva. Ödül: oyun içi avatar paketi.",
    tag: "etkinlik",
  },
  {
    title: "Yeni kara liste politikası",
    body: "Tüm yeni banlar 3 admin onayı gerektiriyor. Daha şeffaf bir süreç için.",
    tag: "kural",
  },
  {
    title: "Üye onay süreleri kısaldı",
    body: "Yeni kayıt onayları artık 12 saat içinde tamamlanıyor. Bekleme süresi düştü.",
    tag: "duyuru",
  },
  {
    title: "Aktif lobi sistemi yenilendi",
    body: "Artık oda kodunun yanında harita ve maç türü de görünüyor. Admin panelinden seçim yapılıyor.",
    tag: "duyuru",
  },
  {
    title: "Yeni şikayet kategorileri",
    body: "Stream sniping ve takım sabotajı artık ayrı kategoriler. Daha hassas takip için.",
    tag: "kural",
  },
  {
    title: "Yıldız ay aralık ayı raporu",
    body: "Aralık'ta 12 ban, 28 uyarı, 41 şikayet işlendi. Detay /istatistikler sayfasında.",
    tag: "rapor",
  },
  {
    title: "Yardımcı moderatör başvuruları açık",
    body: "Topluluğa katkı vermek isteyenler için yardımcı moderatör başvuruları kabul ediliyor.",
    tag: "ekip",
  },
  {
    title: "Toxic Honk99 kullanıcısı banlandı",
    body: "Üç farklı şikayet ve mevcut iki uyarı sonrası bu kullanıcı kara listeye alındı.",
    tag: "moderasyon",
  },
];

// ----------------------------------------------------------------------------
// Yardımcılar
// ----------------------------------------------------------------------------
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybe<T>(value: T, probability = 0.5): T | null {
  return Math.random() < probability ? value : null;
}

function genNickname(seedIdx: number): string {
  const base = pick(PREFIX) + pick(SUFFIX);
  // Bazılarına sayı ekle, çeşitlilik için seed kullan
  if (seedIdx % 3 === 0) return base + (10 + (seedIdx % 90));
  return base;
}

function randomDate(daysBack: number): string {
  const now = Date.now();
  const ms = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - ms).toISOString();
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  console.log("🔍 Admin profil aranıyor...");
  const { data: adminRow } = await supabase
    .from("profiles")
    .select("id, nickname")
    .in("role", ["owner", "co_owner", "admin", "moderator"])
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let actorId: string | null = (adminRow as { id: string } | null)?.id ?? null;

  if (!actorId) {
    const { data: anyProfile } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();
    actorId = (anyProfile as { id: string } | null)?.id ?? null;
  }

  if (!actorId) {
    console.error(
      "❌ Hiç profil bulunamadı. Önce siteye kayıt ol, sonra script'i çalıştır.",
    );
    process.exit(1);
  }

  console.log(`✅ Actor ID: ${actorId.slice(0, 8)}...`);

  // -------- Players --------
  console.log("\n👥 400 oyuncu üretiliyor...");
  const players = [];
  for (let i = 1; i <= 400; i++) {
    const userId = "F" + String(i).padStart(8, "0");
    players.push({
      ggd_user_id: userId,
      nickname: genNickname(i),
      main_name: maybe(pick(MAIN_NAME_POOL), 0.35),
      keyword: maybe(pick(["kaz", "ördek", "honk", "topluluk"]), 0.25),
      level: maybe(Math.floor(Math.random() * 200) + 1, 0.5),
      notes: maybe("Lobi katılımı sıkı, sıkıntı çıkarmıyor.", 0.1),
      added_by: actorId,
      created_at: randomDate(90),
    });
  }

  // batch insert (500'lük gruplar Supabase için)
  for (let i = 0; i < players.length; i += 200) {
    const chunk = players.slice(i, i + 200);
    const { error } = await supabase.from("players").upsert(chunk, {
      onConflict: "ggd_user_id",
    });
    if (error) {
      console.error(`   ⚠️  ${i}-${i + chunk.length} hata:`, error.message);
    } else {
      console.log(`   ✓ ${i + chunk.length}/400`);
    }
  }

  // -------- Bans --------
  console.log("\n🚫 80 ban üretiliyor...");
  const banDurations = ["permanent", "7d", "30d", "90d"];
  const bansToInsert = [];
  for (let i = 0; i < 80; i++) {
    const player = pick(players);
    const duration = pick(banDurations);
    const expiresAt =
      duration === "permanent"
        ? null
        : new Date(
            Date.now() +
              (duration === "7d" ? 7 : duration === "30d" ? 30 : 90) *
                24 *
                60 *
                60 *
                1000,
          ).toISOString();
    const tagCount = 1 + Math.floor(Math.random() * 2);
    const tags = Array.from({ length: tagCount }, () => pick(BAN_TAGS));
    bansToInsert.push({
      ggd_user_id: maybe(player.ggd_user_id, 0.7),
      target_nickname: player.nickname,
      target_main_name: player.main_name,
      reason: pick(BAN_REASONS),
      reason_tags: Array.from(new Set(tags)),
      duration,
      expires_at: expiresAt,
      banned_by: actorId,
      is_active: Math.random() > 0.15,
      created_at: randomDate(60),
    });
  }
  const { error: banErr } = await supabase.from("bans").insert(bansToInsert);
  if (banErr) console.error("   ⚠️", banErr.message);
  else console.log(`   ✓ 80/80`);

  // -------- Warnings --------
  console.log("\n⚠️  120 uyarı üretiliyor...");
  const severities = ["low", "low", "low", "medium", "medium", "high"];
  const warnTags = ["hakaret", "spam", "trolling", "sabotaj", "afk"];
  const warningsToInsert = [];
  for (let i = 0; i < 120; i++) {
    const player = pick(players);
    const tagCount = 1 + Math.floor(Math.random() * 2);
    const tags = Array.from({ length: tagCount }, () => pick(warnTags));
    warningsToInsert.push({
      ggd_user_id: maybe(player.ggd_user_id, 0.7),
      target_nickname: player.nickname,
      target_main_name: player.main_name,
      reason: pick(WARN_REASONS),
      reason_tags: Array.from(new Set(tags)),
      severity: pick(severities),
      issued_by: actorId,
      is_active: Math.random() > 0.2,
      created_at: randomDate(45),
    });
  }
  const { error: warnErr } = await supabase
    .from("warnings")
    .insert(warningsToInsert);
  if (warnErr) console.error("   ⚠️", warnErr.message);
  else console.log(`   ✓ 120/120`);

  // -------- Reports --------
  console.log("\n📢 40 şikayet üretiliyor...");
  const statuses = ["pending", "pending", "investigating", "resolved", "rejected"];
  const reportsToInsert = [];
  for (let i = 0; i < 40; i++) {
    const player = pick(players);
    const status = pick(statuses);
    reportsToInsert.push({
      reporter_id: actorId,
      target_ggd_user_id: maybe(player.ggd_user_id, 0.5),
      target_nickname: player.nickname,
      target_main_name: player.main_name,
      category: pick(REPORT_CATEGORIES),
      description: pick(REPORT_DESCRIPTIONS),
      status,
      resolution_note:
        status === "resolved" || status === "rejected"
          ? "Karar verildi, ilgili kullanıcı bilgilendirildi."
          : null,
      resolved_by:
        status === "resolved" || status === "rejected" ? actorId : null,
      resolved_at:
        status === "resolved" || status === "rejected"
          ? randomDate(30)
          : null,
      created_at: randomDate(30),
    });
  }
  const { error: repErr } = await supabase
    .from("reports")
    .insert(reportsToInsert);
  if (repErr) console.error("   ⚠️", repErr.message);
  else console.log(`   ✓ 40/40`);

  // -------- Announcements --------
  console.log("\n📣 15 duyuru üretiliyor...");
  const announcementsToInsert = ANNOUNCEMENT_TEMPLATES.map((a, i) => ({
    title: a.title,
    body: a.body,
    tag: a.tag,
    pinned: i < 2,
    author_id: actorId,
    published_at: randomDate(60),
    created_at: randomDate(60),
  }));
  const { error: annErr } = await supabase
    .from("announcements")
    .insert(announcementsToInsert);
  if (annErr) console.error("   ⚠️", annErr.message);
  else console.log(`   ✓ 15/15`);

  console.log("\n✨ Seed tamamlandı!");
  console.log(
    "   /admin/oyuncular, /kara-liste, /uyarilar, /admin/sikayetler, /duyurular sayfalarına bak",
  );
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
