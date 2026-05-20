"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "./auth-types";

const SignInSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const SignUpSchema = z.object({
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  nickname: z
    .string()
    .min(2, "Nick en az 2 karakter olmalı")
    .max(24, "Nick en fazla 24 karakter")
    .regex(/^[a-zA-Z0-9_-]+$/, "Sadece harf, rakam, _ ve - kullanabilirsin"),
  ggd_user_id: z
    .string()
    .min(4, "GGD ID en az 4 karakter")
    .max(32, "GGD ID en fazla 32 karakter"),
  ggd_main_name: z
    .string()
    .min(2, "Ana isim en az 2 karakter")
    .max(48, "Ana isim en fazla 48 karakter"),
  ggd_level: z
    .string()
    .optional()
    .transform((v) => {
      const trimmed = (v ?? "").trim();
      if (!trimmed) return null;
      const n = Number(trimmed);
      return Number.isInteger(n) && n >= 0 && n <= 9999 ? n : null;
    }),
  accept_rules: z
    .union([z.string(), z.boolean()])
    .refine((v) => v === "on" || v === true, "Kuralları kabul etmelisin"),
});

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: "Email veya şifre hatalı." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = SignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    nickname: formData.get("nickname"),
    ggd_user_id: formData.get("ggd_user_id"),
    ggd_main_name: formData.get("ggd_main_name"),
    ggd_level: formData.get("ggd_level"),
    accept_rules: formData.get("accept_rules"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        nickname: parsed.data.nickname,
        ggd_user_id: parsed.data.ggd_user_id,
        ggd_main_name: parsed.data.ggd_main_name,
        ggd_level:
          parsed.data.ggd_level != null ? String(parsed.data.ggd_level) : "",
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { ok: false, error: "Bu email zaten kayıtlı." };
    }
    return { ok: false, error: "Kayıt sırasında bir hata oluştu." };
  }

  revalidatePath("/", "layout");
  redirect("/kayit/onay-bekleniyor");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogleAction(formData: FormData) {
  const next = (formData.get("next") as string) ?? "/";
  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) {
    redirect("/giris?error=oauth_failed");
  }
  redirect(data.url);
}
