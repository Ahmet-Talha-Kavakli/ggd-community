import { createClient } from "@/lib/supabase/server";
import { avatarUrl } from "@/lib/avatars";
import { ADMIN_ROLES, type Profile } from "@/lib/supabase/types";

/**
 * Layout ve sunucu component'larında oturum açmış kullanıcının profilini çeker.
 * Anonim ise null döner.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const p = profile as Profile;
  const isAdmin = ADMIN_ROLES.includes(p.role);
  const canHelp = isAdmin || p.role === "helper";
  return {
    user,
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
