/* eslint-disable no-console */
// Orphan profile'a Clerk user_id baglar.
// Kullanim: npx tsx scripts/link-clerk-id.ts <email> <clerk_user_id>

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const email = process.argv[2];
const clerkUserId = process.argv[3];

if (!email || !clerkUserId) {
  console.error("❌ Kullanim: npx tsx scripts/link-clerk-id.ts <email> <clerk_user_id>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function main() {
  const { data: profile, error: findErr } = await supabase
    .from("profiles")
    .select("id, email, nickname, clerk_user_id")
    .eq("email", email)
    .maybeSingle();

  if (findErr) {
    console.error("❌ Profile arama hatasi:", findErr.message);
    process.exit(1);
  }
  if (!profile) {
    console.error(`❌ Email '${email}' icin profile bulunamadi.`);
    process.exit(1);
  }

  console.log(
    `🔍 Profile bulundu: id=${profile.id}, nickname=${profile.nickname}, mevcut clerk_user_id=${profile.clerk_user_id ?? "(yok)"}`,
  );

  if (profile.clerk_user_id && profile.clerk_user_id !== clerkUserId) {
    console.error(
      `❌ Profile zaten farkli clerk_user_id ile bagli (${profile.clerk_user_id}). Uzerine yazmiyorum.`,
    );
    process.exit(1);
  }

  if (profile.clerk_user_id === clerkUserId) {
    console.log("✅ Zaten dogru bagli, degisiklik yok.");
    process.exit(0);
  }

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ clerk_user_id: clerkUserId })
    .eq("id", profile.id);

  if (updateErr) {
    console.error("❌ Update hatasi:", updateErr.message);
    process.exit(1);
  }

  console.log(`✅ Profile bagland: ${email} → ${clerkUserId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
