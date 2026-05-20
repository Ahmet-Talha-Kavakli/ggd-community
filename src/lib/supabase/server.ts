import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Sunucu tarafı Supabase client.
//
// Strateji: Clerk auth ile çalıştığımız için RLS yerine app code'da
// auth kontrolü yapılır (requireAdmin / requireMember / requireApprovedMember).
// Bu yüzden server-side çağrılar service role ile yapılır — RLS bypass.
// Client-side (browser) çağrılar zaten anon key ile sınırlandırılmış.
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

// Aynı şey ama isim açıklığı için
export async function createAdminClient() {
  return createClient();
}
