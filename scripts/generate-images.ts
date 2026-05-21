/* eslint-disable no-console */
// FAL.AI ile site görsellerini üreten one-shot script.
// Kullanım: npx tsx scripts/generate-images.ts [hero|og|all]

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

interface Target {
  name: string;
  prompt: string;
  width: number;
  height: number;
  outPath: string;
  model?: string;
}

const TARGETS: Record<string, Target> = {
  hero: {
    name: "Hero illustration",
    prompt:
      "Minimalist editorial illustration of a single elegant white goose " +
      "in side profile with a calm expression, soft emerald green gradient " +
      "background, gentle volumetric lighting, clean vector style, " +
      "Apple advertising aesthetic, premium magazine quality, no text, " +
      "negative space, modern flat design with subtle depth, 16:10 aspect",
    width: 1600,
    height: 1000,
    outPath: "public/hero.png",
  },
  og: {
    name: "Open Graph image",
    prompt:
      "Minimalist branded social banner: 'GooseCage' wordmark in clean " +
      "modern sans-serif typography, white text on smooth emerald green " +
      "gradient background, a small elegant white goose silhouette icon " +
      "to the left of the text, premium tech company aesthetic similar " +
      "to Apple or Stripe marketing, generous negative space, professional " +
      "social media share card, 1200x630",
    width: 1200,
    height: 630,
    outPath: "public/og.png",
  },
  empty: {
    name: "Empty state illustration",
    prompt:
      "Minimalist illustration of a single goose feather floating on a " +
      "white background, soft emerald green tints, ultra clean line art, " +
      "Apple aesthetic, peaceful, no text, square composition",
    width: 800,
    height: 800,
    outPath: "public/empty-state.png",
  },
  community: {
    name: "Community illustration (welcome)",
    prompt:
      "Minimalist editorial illustration of three elegant white geese " +
      "standing close together as a peaceful flock, soft emerald green " +
      "gradient background, clean modern vector style, Apple advertising " +
      "aesthetic, welcoming and warm feel, premium magazine quality, " +
      "no text, generous negative space, friendly composition",
    width: 1200,
    height: 900,
    outPath: "public/community.png",
  },
  guard: {
    name: "Guard goose illustration",
    prompt:
      "Minimalist illustration of one tall proud white goose standing " +
      "watchful in side profile, soft emerald green gradient background, " +
      "clean modern vector style, calm but vigilant expression, Apple " +
      "advertising aesthetic, dignified and protective feel, premium " +
      "magazine quality, no text, ample negative space",
    width: 1200,
    height: 900,
    outPath: "public/guard.png",
  },
  flying: {
    name: "Flying goose illustration",
    prompt:
      "Minimalist illustration of a single white goose soaring with " +
      "outstretched wings against a soft emerald green sky with subtle " +
      "gradient, clean modern vector style, Apple advertising aesthetic, " +
      "dynamic but elegant motion, sense of freedom and lightness, " +
      "premium magazine quality, no text, generous negative space, " +
      "wide horizontal composition",
    width: 1600,
    height: 700,
    outPath: "public/flying.png",
  },
  support: {
    name: "Helpful goose (destek)",
    prompt:
      "Minimalist illustration of a white goose sitting calmly with a small " +
      "round speech bubble next to it, soft emerald green gradient " +
      "background, clean modern vector style, friendly helpful expression, " +
      "Apple advertising aesthetic, no text in bubble, premium magazine " +
      "quality, ample negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-support.png",
  },
  search: {
    name: "Searching goose (sorgu)",
    prompt:
      "Minimalist illustration of a single white goose curiously looking " +
      "at something with intent, head tilted slightly, soft emerald green " +
      "gradient background, clean modern vector style, Apple advertising " +
      "aesthetic, detective-like calm expression, premium magazine quality, " +
      "no text, generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-search.png",
  },
  report: {
    name: "Concerned goose (sikayet)",
    prompt:
      "Minimalist illustration of a single white goose looking serious " +
      "and alert in side profile, soft emerald green gradient background, " +
      "clean modern vector style, Apple advertising aesthetic, concerned " +
      "but composed expression, premium magazine quality, no text, " +
      "generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-report.png",
  },
  wise: {
    name: "Wise goose (kurallar)",
    prompt:
      "Minimalist illustration of a single elegant white goose standing " +
      "upright in a dignified pose, soft emerald green gradient background, " +
      "clean modern vector style, Apple advertising aesthetic, wise and " +
      "peaceful feel, premium magazine quality, no text, ample negative " +
      "space",
    width: 1200,
    height: 900,
    outPath: "public/goose-wise.png",
  },
  megaphone: {
    name: "Announcing goose (duyurular)",
    prompt:
      "Minimalist illustration of a single white goose with beak open " +
      "honking proudly upward, soft emerald green gradient background, " +
      "clean modern vector style, Apple advertising aesthetic, announcing " +
      "energetic but elegant feel, premium magazine quality, no text, " +
      "generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-megaphone.png",
  },
  trophy: {
    name: "Trophy goose (etkinlikler)",
    prompt:
      "Minimalist illustration of a single elegant white goose proudly " +
      "lifting a small golden trophy with its wing, soft emerald green " +
      "gradient background, clean modern vector style, Apple advertising " +
      "aesthetic, joyful but dignified celebration mood, premium magazine " +
      "quality, no text, generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-trophy.png",
  },
  warning: {
    name: "Cautious goose (uyarılar)",
    prompt:
      "Minimalist illustration of a single white goose standing alert with " +
      "head tilted slightly to the side as if observing something carefully, " +
      "soft warm amber gradient background with a subtle green tint, clean " +
      "modern vector style, Apple advertising aesthetic, gentle but watchful " +
      "expression, premium magazine quality, no text, generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-warning.png",
  },
  stats: {
    name: "Stats goose (istatistikler)",
    prompt:
      "Minimalist illustration of a single white goose looking up at a few " +
      "small abstract floating bar-chart bars, soft emerald green gradient " +
      "background, clean modern vector style, Apple advertising aesthetic, " +
      "thoughtful curious expression, premium magazine quality, no text, " +
      "generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-stats.png",
  },
  friendly: {
    name: "Friendly waving goose (CTA hero)",
    prompt:
      "Minimalist illustration of a single elegant white goose standing " +
      "in a warm friendly pose with wing lifted as if waving hello, " +
      "soft emerald green gradient background fading to lighter tone, " +
      "clean modern vector style, Apple advertising aesthetic, inviting " +
      "warm welcoming mood, premium magazine quality, no text, generous " +
      "negative space, wide horizontal composition",
    width: 1600,
    height: 900,
    outPath: "public/goose-friendly.png",
  },
  curious: {
    name: "Curious peeking goose (sidebar mascot)",
    prompt:
      "Minimalist illustration of a single white goose peeking from the " +
      "side with head tilted, eyes curious and bright, soft emerald green " +
      "gradient background, clean modern vector style, Apple advertising " +
      "aesthetic, playful inquisitive mood, premium magazine quality, " +
      "no text, generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-curious.png",
  },
  shield: {
    name: "Shield goose (kara liste)",
    prompt:
      "Minimalist illustration of a single tall white goose standing in a " +
      "protective stance with a softly suggested rounded shield emblem " +
      "behind it, soft emerald green gradient background, clean modern " +
      "vector style, Apple advertising aesthetic, calm authoritative feel, " +
      "premium magazine quality, no text, generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-shield.png",
  },
  sleeping: {
    name: "Sleeping goose (empty states — sakin lobi)",
    prompt:
      "Minimalist illustration of a single white goose curled up sleeping " +
      "peacefully with eyes closed and beak tucked under wing, soft pastel " +
      "emerald green gradient background, clean modern vector style, Apple " +
      "advertising aesthetic, serene tranquil cozy mood, premium magazine " +
      "quality, no text, generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-sleeping.png",
  },
  thinking: {
    name: "Thinking goose (sorgu no-result)",
    prompt:
      "Minimalist illustration of a single white goose with head tilted " +
      "thoughtfully looking slightly upward, a small soft question mark icon " +
      "floating gently nearby, soft emerald green gradient background, clean " +
      "modern vector style, Apple advertising aesthetic, contemplative " +
      "inquisitive mood, premium magazine quality, no text, generous " +
      "negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-thinking.png",
  },
  typing: {
    name: "Writing goose (sikayet)",
    prompt:
      "Minimalist illustration of a single white goose standing focused in " +
      "front of a small abstract document or scroll, holding a feather quill " +
      "delicately with its wing as if writing, soft emerald green gradient " +
      "background, clean modern vector style, Apple advertising aesthetic, " +
      "diligent thoughtful mood, premium magazine quality, no text, generous " +
      "negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-typing.png",
  },
  celebrating: {
    name: "Celebrating goose (etkinlikler winner)",
    prompt:
      "Minimalist illustration of a single white goose with wings spread " +
      "joyfully upward as if celebrating victory, small soft abstract " +
      "confetti and sparkles floating around it, soft emerald green gradient " +
      "background, clean modern vector style, Apple advertising aesthetic, " +
      "happy triumphant elegant mood, premium magazine quality, no text, " +
      "generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-celebrating.png",
  },
  sanctuary: {
    name: "Sanctuary goose (CTA — safe community)",
    prompt:
      "Minimalist illustration of a single elegant white goose standing " +
      "calmly inside a soft warm circular embrace of gentle leaves and " +
      "feathers suggesting a cozy nest or sanctuary, soft emerald green " +
      "gradient background, clean modern vector style, Apple advertising " +
      "aesthetic, safe protected welcoming dignified mood, premium magazine " +
      "quality, no text, generous negative space",
    width: 1200,
    height: 900,
    outPath: "public/goose-sanctuary.png",
  },
  "red-zone": {
    name: "Red Zone (Kirmizi Alan) — caged goose",
    prompt:
      "Minimalist editorial illustration of a single white goose standing " +
      "behind soft vertical iron prison bars casting subtle shadow, the goose " +
      "looking calm but isolated in profile, deep crimson and burgundy " +
      "gradient background with subtle warm red tones, clean modern vector " +
      "style, Apple advertising aesthetic, serious quarantine mood without " +
      "being violent or scary, premium magazine quality, no text, no skulls, " +
      "no weapons, generous negative space, square composition, centered " +
      "subject, dignified isolation, dramatic but elegant",
    width: 1200,
    height: 1200,
    outPath: "public/goose-red-zone.png",
  },
  logo: {
    name: "App icon logo (square)",
    prompt:
      "Premium minimalist app icon. Single elegant white goose silhouette " +
      "head and gracefully curved neck in side profile, centered in a " +
      "rounded square with smooth emerald green gradient background. " +
      "Apple iOS app icon style. Vector flat design, clean geometric " +
      "shapes, premium quality. No text, no extra elements. Square 1:1 " +
      "composition, centered, balanced, professional logo aesthetic.",
    width: 1024,
    height: 1024,
    outPath: "public/logo-icon.png",
  },
};

async function generate(target: Target) {
  console.log(`\n🎨 ${target.name} üretiliyor...`);
  console.log(`   Boyut: ${target.width}x${target.height}`);

  // fal-ai/flux/schnell hızlı ve ucuz
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: target.prompt,
      image_size: {
        width: target.width,
        height: target.height,
      },
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true,
    },
    logs: false,
  });

  const data = result.data as {
    images?: { url: string }[];
  };
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) throw new Error("Görsel URL'i dönmedi");

  console.log(`   📥 İndiriliyor: ${imageUrl.slice(0, 80)}...`);

  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`İndirme hatası: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const fullPath = path.resolve(target.outPath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buf);

  console.log(`   ✅ Kaydedildi: ${target.outPath} (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) args.push("hero");

  const keys = args.includes("all") ? Object.keys(TARGETS) : args;
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
    }
  }

  console.log("\n✨ Bitti.\n");
}

main();
