/* eslint-disable no-console */
// Bir kullanıcıyı email ile owner yapar.
// Kayıt olduktan sonra çalıştır:
//   npx tsx scripts/make-admin.ts carreinaofficial@gmail.com
//
// Gerekli env: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, CLERK_SECRET_KEY

import { createClient } from "@supabase/supabase-js";
import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";
import { randomUUID } from "node:crypto";

config({ path: ".env.local" });

const email = process.argv[2];
if (!email) {
  console.error("❌ Email gerekli: npx tsx scripts/make-admin.ts <email>");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clerkKey = process.env.CLERK_SECRET_KEY;

if (!supabaseUrl || !supabaseKey || !clerkKey) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLERK_SECRET_KEY gerekli.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const clerk = createClerkClient({ secretKey: clerkKey });

async function main() {
  console.log(`🔍 Clerk'te ${email} aranıyor...`);
  const { data: clerkUsers } = await clerk.users.getUserList({
    emailAddress: [email],
  });

  if (clerkUsers.length === 0) {
    console.error(
      `❌ Clerk'te ${email} bulunamadı. Önce /kayit sayfasından üye ol, sonra tekrar çalıştır.`,
    );
    process.exit(1);
  }

  const clerkUser = clerkUsers[0];
  console.log(`✅ Clerk user bulundu: ${clerkUser.id}`);

  // Önce clerk_user_id ile profil var mı bak (webhook yaratmış olabilir)
  const { data: byClerk } = await supabase
    .from("profiles")
    .select("id, role, nickname")
    .eq("clerk_user_id", clerkUser.id)
    .maybeSingle();

  let profileId: string;

  if (byClerk) {
    profileId = byClerk.id as string;
    console.log(
      `✅ Mevcut profil bulundu (id=${profileId}, role=${byClerk.role}, nickname=${byClerk.nickname})`,
    );

    const { error } = await supabase
      .from("profiles")
      .update({
        role: "owner",
        verification_status: "approved",
      })
      .eq("id", profileId);

    if (error) {
      console.error("❌ Profil güncellenemedi:", error.message);
      process.exit(1);
    }
    console.log(`✅ Role → owner, verification → approved`);
  } else {
    // Webhook çalışmamış olabilir, profil yok. Email ile de bak (eski Supabase auth'tan kalma olabilir)
    const { data: byEmail } = await supabase
      .from("profiles")
      .select("id, role, clerk_user_id, nickname")
      .eq("email", email)
      .maybeSingle();

    if (byEmail) {
      profileId = byEmail.id as string;
      console.log(
        `✅ Email ile profil bulundu (id=${profileId}, role=${byEmail.role}) — Clerk'e bağlanıyor.`,
      );

      const { error } = await supabase
        .from("profiles")
        .update({
          clerk_user_id: clerkUser.id,
          role: "owner",
          verification_status: "approved",
        })
        .eq("id", profileId);

      if (error) {
        console.error("❌ Profil güncellenemedi:", error.message);
        process.exit(1);
      }
      console.log(`✅ clerk_user_id bağlandı, role → owner`);
    } else {
      // Hiç profil yok — sıfırdan yarat
      profileId = randomUUID();
      const nickname =
        clerkUser.username ||
        clerkUser.firstName ||
        email.split("@")[0] ||
        "owner";

      console.log(`📝 Profil yok, sıfırdan yaratılıyor (nickname=${nickname})`);

      const { error } = await supabase.from("profiles").insert({
        id: profileId,
        clerk_user_id: clerkUser.id,
        email,
        nickname,
        ggd_user_id: "",
        role: "owner",
        verification_status: "approved",
      });

      if (error) {
        console.error("❌ Profil yaratılamadı:", error.message);
        process.exit(1);
      }
      console.log(`✅ Yeni profil yaratıldı (id=${profileId})`);
    }
  }

  // Clerk publicMetadata.profile_id güncelle
  try {
    await clerk.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        ...(clerkUser.publicMetadata ?? {}),
        profile_id: profileId,
      },
    });
    console.log(`✅ Clerk publicMetadata.profile_id güncellendi`);
  } catch (err) {
    console.error("⚠️  Clerk metadata güncellenemedi (kritik değil):", err);
  }

  console.log("");
  console.log("🎉 Bitti! Tarayıcıdan çıkış yapıp tekrar giriş yap.");
  console.log("   /yonetim sekmesi artık görünür olacak.");
}

main().catch((err) => {
  console.error("❌ Script hata verdi:", err);
  process.exit(1);
});
