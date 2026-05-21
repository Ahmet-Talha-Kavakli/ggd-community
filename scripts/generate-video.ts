/* eslint-disable no-console */
// FAL.AI ile kısa atmosferik videolar üreten one-shot script.
// Kullanım:
//   npx tsx scripts/generate-video.ts hero
//   npx tsx scripts/generate-video.ts sorgu kara-liste uyarilar topluluk
//   npx tsx scripts/generate-video.ts all
//
// Model: fal-ai/bytedance/seedance-2.0/fast/text-to-video (ucuz, hızlı)

import { fal } from "@fal-ai/client";
import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.FAL_API_KEY) {
  console.error("❌ FAL_API_KEY .env.local'de tanımlı değil.");
  process.exit(1);
}

fal.config({ credentials: process.env.FAL_API_KEY });

interface VideoTarget {
  name: string;
  prompt: string;
  outPath: string;
  duration?: "4" | "5" | "6" | "7" | "8" | "10" | "12" | "15";
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "21:9";
  resolution?: "480p" | "720p";
}

const COMMON_STYLE =
  "minimalist Apple advertising aesthetic, clean vector illustration style, " +
  "very subtle motion, slow gentle, no camera movement, looping seamless";

const TARGETS: Record<string, VideoTarget> = {
  hero: {
    name: "Anasayfa hero video (4sn döngü)",
    prompt:
      "A single elegant white goose standing serenely in side profile, " +
      "gently breathing with subtle slow head movement, soft pastel emerald " +
      "green gradient background, peaceful calm meditative mood, " +
      COMMON_STYLE,
    outPath: "public/hero-video.mp4",
    duration: "4",
    aspectRatio: "16:9",
    resolution: "720p",
  },
  sorgu: {
    name: "Sorgu sayfası video — dedektif/büyüteç (4sn döngü)",
    prompt:
      "A single elegant white goose in side profile with a large translucent " +
      "magnifying glass slowly drifting in front of it, subtle reflective " +
      "shimmer on the glass, soft pastel emerald green gradient background, " +
      "investigative detective mood, curious and focused, " + COMMON_STYLE,
    outPath: "public/sorgu-video.mp4",
    duration: "4",
    aspectRatio: "16:9",
    resolution: "720p",
  },
  "kara-liste": {
    name: "Kara Liste sayfası video — kafes/gölge (4sn döngü)",
    prompt:
      "A single elegant white goose in side profile silhouetted behind soft " +
      "vertical cage bars casting gentle shadows, cooler darker slate-emerald " +
      "gradient background, contemplative quiet mood, very subtle breathing " +
      "motion, " + COMMON_STYLE,
    outPath: "public/kara-liste-video.mp4",
    duration: "4",
    aspectRatio: "16:9",
    resolution: "720p",
  },
  uyarilar: {
    name: "Uyarılar sayfası video — amber/dikkat (4sn döngü)",
    prompt:
      "A single elegant white goose standing alert in side profile, soft " +
      "warm amber-yellow gradient background slowly pulsing like a gentle " +
      "warning light, attentive cautious mood, very subtle motion, " +
      COMMON_STYLE,
    outPath: "public/uyarilar-video.mp4",
    duration: "4",
    aspectRatio: "16:9",
    resolution: "720p",
  },
  topluluk: {
    name: "Topluluk sayfası video — grup/sıcak (4sn döngü)",
    prompt:
      "Three elegant white geese standing together side by side in side " +
      "profile, gently breathing with subtle independent head movements, soft " +
      "pastel emerald green gradient background, warm friendly community " +
      "mood, " + COMMON_STYLE,
    outPath: "public/topluluk-video.mp4",
    duration: "4",
    aspectRatio: "16:9",
    resolution: "720p",
  },
  "auth-giris": {
    name: "Giriş sayfası video — yalnız kaz bekleyen (4sn, 1:1)",
    prompt:
      "A single elegant white goose standing serenely waiting in centered " +
      "composition, gently breathing with subtle slow head turn, soft pastel " +
      "emerald green gradient background, contemplative welcoming mood, " +
      "square 1:1 framing, " + COMMON_STYLE,
    outPath: "public/auth-giris-video.mp4",
    duration: "4",
    aspectRatio: "1:1",
    resolution: "720p",
  },
  "auth-kayit": {
    name: "Kayıt sayfası video — davetkar grup (4sn, 1:1)",
    prompt:
      "Three elegant white geese standing close together in square framing, " +
      "subtle independent head movements as if welcoming a new member, soft " +
      "pastel emerald green gradient background, warm inviting community " +
      "mood, square 1:1 composition, " + COMMON_STYLE,
    outPath: "public/auth-kayit-video.mp4",
    duration: "4",
    aspectRatio: "1:1",
    resolution: "720p",
  },
};

async function generate(target: VideoTarget) {
  console.log(`\n🎬 ${target.name} üretiliyor...`);
  console.log(
    `   Süre: ${target.duration ?? "4"}sn, ${target.aspectRatio ?? "16:9"}, ${target.resolution ?? "720p"}`,
  );
  console.log(`   ⏳ Model çağrılıyor (1-3 dakika sürebilir)...`);

  const result = await fal.subscribe(
    "bytedance/seedance-2.0/fast/text-to-video",
    {
      input: {
        prompt: target.prompt,
        duration: target.duration ?? "4",
        aspect_ratio: target.aspectRatio ?? "16:9",
        resolution: target.resolution ?? "720p",
        generate_audio: false,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log(`   📡 ${update.status}...`);
        }
      },
    },
  );

  const data = result.data as { video?: { url: string } };
  const videoUrl = data?.video?.url;
  if (!videoUrl) {
    console.error("Dönen veri:", JSON.stringify(result.data, null, 2));
    throw new Error("Video URL'i dönmedi");
  }

  console.log(`   📥 İndiriliyor: ${videoUrl.slice(0, 80)}...`);

  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error(`İndirme hatası: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const fullPath = path.resolve(target.outPath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buf);

  console.log(
    `   ✅ Kaydedildi: ${target.outPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`,
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      `❌ Hedef belirt. Mevcut: ${Object.keys(TARGETS).join(", ")} veya 'all'`,
    );
    process.exit(1);
  }

  const keys =
    args.length === 1 && args[0] === "all" ? Object.keys(TARGETS) : args;

  for (const key of keys) {
    const target = TARGETS[key];
    if (!target) {
      console.error(`❌ Bilinmeyen hedef: ${key}`);
      console.error(`   Kullan: ${Object.keys(TARGETS).join(", ")} veya 'all'`);
      process.exit(1);
    }
    try {
      await generate(target);
    } catch (err) {
      console.error(`❌ ${target.name} üretiminde hata:`, err);
      process.exit(1);
    }
  }

  console.log("\n✨ Bitti.\n");
}

main();
