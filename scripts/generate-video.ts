/* eslint-disable no-console */
// FAL.AI ile kısa hero videolar üreten one-shot script.
// Kullanım: npx tsx scripts/generate-video.ts [hero|community]
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

const TARGETS: Record<string, VideoTarget> = {
  hero: {
    name: "Anasayfa hero video (4sn döngü)",
    prompt:
      "A single elegant white goose standing serenely in side profile, " +
      "gently breathing with subtle slow head movement, soft pastel emerald " +
      "green gradient background, minimalist Apple advertising aesthetic, " +
      "clean vector illustration style, peaceful calm meditative mood, " +
      "very subtle motion, slow gentle, no camera movement, looping seamless",
    outPath: "public/hero-video.mp4",
    duration: "4",
    aspectRatio: "16:9",
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
  const which = process.argv[2] ?? "hero";

  const keys = which === "all" ? Object.keys(TARGETS) : [which];
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
