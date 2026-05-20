"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth/require-admin";
import type { AdminActionState } from "./admin-types";

const ProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, "En az 2 karakter")
    .max(24, "En fazla 24 karakter")
    .regex(/^[a-zA-Z0-9_-]+$/, "Sadece harf, rakam, _ ve - kullanabilirsin"),
  ggd_user_id: z
    .string()
    .min(4, "En az 4 karakter")
    .max(32, "En fazla 32 karakter"),
  ggd_main_name: z
    .string()
    .min(2, "En az 2 karakter")
    .max(48, "En fazla 48 karakter"),
  ggd_level: z
    .string()
    .optional()
    .transform((v) => {
      const trimmed = (v ?? "").trim();
      if (!trimmed) return null;
      const n = Number(trimmed);
      return Number.isInteger(n) && n >= 0 && n <= 9999 ? n : null;
    }),
  bio: z.string().max(280).optional().nullable(),
});

export async function updateProfileAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireMember();
  const parsed = ProfileSchema.safeParse({
    nickname: formData.get("nickname"),
    ggd_user_id: formData.get("ggd_user_id"),
    ggd_main_name: formData.get("ggd_main_name"),
    ggd_level: formData.get("ggd_level"),
    bio: formData.get("bio") || null,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();

  // Eğer GGD User ID veya ana isim değiştiyse, doğrulama durumu pending'e dönsün
  const ggdChanged =
    parsed.data.ggd_user_id !== current.profile.ggd_user_id ||
    parsed.data.ggd_main_name !== (current.profile.ggd_main_name ?? "");
  const updates: Record<string, unknown> = {
    nickname: parsed.data.nickname,
    ggd_user_id: parsed.data.ggd_user_id,
    ggd_main_name: parsed.data.ggd_main_name,
    ggd_level: parsed.data.ggd_level,
    bio: parsed.data.bio,
  };
  if (ggdChanged) updates.verification_status = "pending";

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", current.user.id);

  if (error) {
    if (error.message.includes("nickname"))
      return { ok: false, error: "Bu nick zaten alınmış." };
    return { ok: false, error: error.message };
  }

  revalidatePath("/profil");
  revalidatePath("/profil/ayarlar");
  return {
    ok: true,
    message: ggdChanged
      ? "Bilgilerin güncellendi. GGD ID değiştiği için yeniden onay bekleyecek."
      : "Bilgilerin güncellendi.",
  };
}

const PasswordSchema = z
  .object({
    current_password: z.string().min(1, "Mevcut şifreni gir"),
    new_password: z.string().min(8, "En az 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Şifreler eşleşmiyor",
    path: ["confirm_password"],
  })
  .refine((d) => d.new_password !== d.current_password, {
    message: "Yeni şifre eskisi ile aynı olamaz",
    path: ["new_password"],
  });

export async function updatePasswordAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireMember();
  const parsed = PasswordSchema.safeParse({
    current_password: formData.get("current_password"),
    new_password: formData.get("new_password"),
    confirm_password: formData.get("confirm_password"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();

  // Mevcut şifreyi doğrula
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: current.email,
    password: parsed.data.current_password,
  });
  if (verifyError) {
    return {
      ok: false,
      fieldErrors: { current_password: "Mevcut şifre yanlış" },
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Şifren güncellendi." };
}

// Şifre sıfırlama akışı (email link'i ile gelinen sayfada — mevcut şifre yok)
const NewPasswordSchema = z
  .object({
    new_password: z.string().min(8, "En az 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Şifreler eşleşmiyor",
    path: ["confirm_password"],
  });

export async function setNewPasswordAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = NewPasswordSchema.safeParse({
    new_password: formData.get("new_password"),
    confirm_password: formData.get("confirm_password"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Şifren güncellendi." };
}

export async function requestPasswordResetAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const email = (formData.get("email") as string)?.trim();
  if (!email || !email.includes("@")) {
    return { ok: false, fieldErrors: { email: "Geçerli bir email girin" } };
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/sifre-sifirla/yeni`,
  });

  // Her zaman başarılı dön (email var/yok bilgisini sızdırmamak için)
  return {
    ok: true,
    message:
      "Eğer bu email kayıtlı bir hesaba aitse, sıfırlama bağlantısı gönderildi. Spam kutunu da kontrol et.",
  };
}

export async function deleteAccountAction() {
  const current = await requireMember();
  const supabase = await createClient();
  // Profili sil (auth.users hariç — kullanıcı destekten yenileyebilsin)
  await supabase.from("profiles").delete().eq("id", current.user.id);
  await supabase.auth.signOut();
  redirect("/?goodbye=1");
}
