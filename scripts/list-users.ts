/* eslint-disable no-console */
// Tek seferlik: Clerk + Supabase'deki tüm kullanıcıları listeler.

import { createClient } from "@supabase/supabase-js";
import { createClerkClient } from "@clerk/backend";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function main() {
  const { data: clerkUsers } = await clerk.users.getUserList({ limit: 100 });
  console.log(`\n📦 Clerk: ${clerkUsers.length} kullanıcı\n`);
  for (const u of clerkUsers) {
    const primary = u.emailAddresses.find(
      (e) => e.id === u.primaryEmailAddressId,
    );
    console.log(
      `   • ${primary?.emailAddress ?? "(no-email)"}  id=${u.id}  created=${new Date(u.createdAt).toISOString()}`,
    );
  }

  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, clerk_user_id");
  console.log(`\n📦 Supabase profiles:`);
  if (pErr) console.log(`   ❌ HATA: ${pErr.message}`);
  console.log(`   toplam=${profiles?.length ?? 0}\n`);
  for (const p of profiles ?? []) {
    console.log(
      `   • ${p.email}  nickname=${p.nickname}  role=${p.role}  clerk=${p.clerk_user_id ?? "(yok)"}`,
    );
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
