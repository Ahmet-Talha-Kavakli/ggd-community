import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { avatarUrl } from "@/lib/avatars";
import { ADMIN_ROLES, type Profile } from "@/lib/supabase/types";

/**
 * Layout ve sunucu component'larında oturum açmış kullanıcının profilini çeker.
 * Anonim ise null döner. Clerk auth → Supabase profile (clerk_user_id ile).
 */
export async function getCurrentUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  // Webhook gecikmesi olabilir; service role ile profil aranır (RLS bypass).
  const supabase = await createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (!profile) return null;

  const p = profile as Profile;
  const isAdmin = ADMIN_ROLES.includes(p.role);
  const canHelp = isAdmin || p.role === "helper";

  return {
    user: { id: p.id, clerkUserId },
    profile: p,
    email: p.email,
    nickname: p.nickname,
    avatarUrl: avatarUrl({
      avatarPath: p.avatar_path,
      email: p.email,
      size: 80,
    }),
    isAdmin,
    canHelp,
    isApproved: p.verification_status === "approved",
  };
}
