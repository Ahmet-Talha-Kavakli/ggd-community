"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/audit";
import type { AdminActionState } from "./admin-types";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export async function uploadAvatarAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireMember();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Bir resim dosyası seç." };
  }
  if (!ALLOWED.includes(file.type)) {
    return {
      ok: false,
      error: "Sadece JPG, PNG veya WEBP desteklenir.",
    };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Dosya 2MB'ı geçemez." };
  }

  const supabase = await createClient();
  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : "webp";
  const path = `${current.user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return { ok: false, error: `Yüklenemedi: ${uploadError.message}` };
  }

  // Eski avatarı sil (varsa)
  const { data: oldProfile } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", current.user.id)
    .maybeSingle();
  const oldPath = (oldProfile as { avatar_path: string | null } | null)
    ?.avatar_path;
  if (oldPath && oldPath !== path) {
    await supabase.storage.from("avatars").remove([oldPath]);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", current.user.id);

  if (updateError) {
    return { ok: false, error: `Profil güncellenmedi: ${updateError.message}` };
  }

  await logAuditEvent({
    actorId: current.user.id,
    action: "profile.avatar_update",
    targetType: "profile",
    targetId: current.user.id,
  });

  revalidatePath("/profil");
  revalidatePath("/profil/ayarlar");
  revalidatePath("/");
  revalidatePath("/topluluk");
  return { ok: true, message: "Avatar güncellendi." };
}

export async function deleteAvatarAction() {
  const current = await requireMember();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", current.user.id)
    .maybeSingle();
  const oldPath = (profile as { avatar_path: string | null } | null)
    ?.avatar_path;

  if (oldPath) {
    await supabase.storage.from("avatars").remove([oldPath]);
  }

  await supabase
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", current.user.id);

  await logAuditEvent({
    actorId: current.user.id,
    action: "profile.avatar_delete",
    targetType: "profile",
    targetId: current.user.id,
  });

  revalidatePath("/profil");
  revalidatePath("/profil/ayarlar");
  revalidatePath("/");
  revalidatePath("/topluluk");
}
