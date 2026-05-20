/* eslint-disable no-console */
// Tek seferlik teşhis: bir email'in Clerk + Supabase'deki durumunu rapor eder.
// Kullanım: npx tsx scripts/diagnose-user.ts <email>

import { createClient } from "@supabase/supabase-js";
import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";

config({ path: ".env.local" });

const email = process.argv[2];
if (!email) {
  console.error("❌ Email gerekli");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function main() {
  console.log(`\n🔍 Email: ${email}\n`);

  const { data: clerkUsers } = await clerk.users.getUserList({
    emailAddress: [email],
  });
  console.log(`📦 Clerk: ${clerkUsers.length} kullanıcı bulundu`);
  for (const u of clerkUsers) {
    console.log(`   • id=${u.id}`);
    console.log(`     username=${u.username ?? "(yok)"}`);
    console.log(`     publicMetadata=${JSON.stringify(u.publicMetadata)}`);
    console.log(`     unsafeMetadata=${JSON.stringify(u.unsafeMetadata)}`);
    console.log(`     createdAt=${new Date(u.createdAt).toISOString()}`);
  }

  const clerkUserId = clerkUsers[0]?.id;

  const { data: byClerk } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, verification_status, clerk_user_id")
    .eq("clerk_user_id", clerkUserId ?? "__none__")
    .maybeSingle();
  console.log(`\n📦 Supabase profile (clerk_user_id ile):`);
  console.log(byClerk ? JSON.stringify(byClerk, null, 2) : "   YOK");

  const { data: byEmail } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, verification_status, clerk_user_id")
    .eq("email", email)
    .maybeSingle();
  console.log(`\n📦 Supabase profile (email ile):`);
  console.log(byEmail ? JSON.stringify(byEmail, null, 2) : "   YOK");

  console.log("\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
