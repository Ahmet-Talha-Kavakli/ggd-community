"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/audit";
import type { AdminActionState } from "./admin-types";

const PlayerSchema = z.object({
  ggd_user_id: z
    .string()
    .min(1, "User ID gerekli")
    .max(32, "User ID 32 karakteri geçemez")
    .transform((v) => v.trim()),
  nickname: z
    .string()
    .min(1, "Oyun içi nick gerekli")
    .max(48)
    .transform((v) => v.trim()),
  main_name: z
    .string()
    .max(48)
    .optional()
    .transform((v) => v?.trim() || null),
  keyword: z
    .string()
    .max(64)
    .optional()
    .transform((v) => v?.trim() || null),
  level: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === null || v === "") return null;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) && n >= 0 && n <= 9999 ? n : null;
    }),
  notes: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => v?.trim() || null),
});

export async function createPlayerAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireAdmin();
  const parsed = PlayerSchema.safeParse({
    ggd_user_id: formData.get("ggd_user_id"),
    nickname: formData.get("nickname"),
    main_name: formData.get("main_name"),
    keyword: formData.get("keyword"),
    level: formData.get("level"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();

  // Aynı User ID ile zaten bir profil veya oyuncu kaydı var mı?
  const [profileMatch, playerMatch] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nickname")
      .eq("ggd_user_id", parsed.data.ggd_user_id)
      .maybeSingle(),
    supabase
      .from("players")
      .select("id, nickname")
      .eq("ggd_user_id", parsed.data.ggd_user_id)
      .maybeSingle(),
  ]);

  if (profileMatch.data) {
    return {
      ok: false,
      error: `Bu User ID zaten siteye kayıtlı bir üyeye ait: ${
        (profileMatch.data as { nickname: string }).nickname
      }`,
    };
  }
  if (playerMatch.data) {
    return {
      ok: false,
      error: `Bu User ID için zaten bir oyuncu kaydı var: ${
        (playerMatch.data as { nickname: string }).nickname
      }`,
    };
  }

  const { data, error } = await supabase
    .from("players")
    .insert({
      ggd_user_id: parsed.data.ggd_user_id,
      nickname: parsed.data.nickname,
      main_name: parsed.data.main_name,
      keyword: parsed.data.keyword,
      level: parsed.data.level,
      notes: parsed.data.notes,
      added_by: current.user.id,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    actorId: current.user.id,
    action: "player.create",
    targetType: "player",
    targetId: (data as { id: string } | null)?.id,
    metadata: {
      ggd_user_id: parsed.data.ggd_user_id,
      nickname: parsed.data.nickname,
    },
  });

  revalidatePath("/admin/oyuncular");
  revalidatePath("/admin");
  revalidatePath("/sorgu");
  redirect("/admin/oyuncular");
}

const UpdatePlayerSchema = PlayerSchema.extend({
  id: z.uuid(),
});

export async function updatePlayerAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireAdmin();
  const parsed = UpdatePlayerSchema.safeParse({
    id: formData.get("id"),
    ggd_user_id: formData.get("ggd_user_id"),
    nickname: formData.get("nickname"),
    main_name: formData.get("main_name"),
    keyword: formData.get("keyword"),
    level: formData.get("level"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update({
      ggd_user_id: parsed.data.ggd_user_id,
      nickname: parsed.data.nickname,
      main_name: parsed.data.main_name,
      keyword: parsed.data.keyword,
      level: parsed.data.level,
      notes: parsed.data.notes,
    })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    actorId: current.user.id,
    action: "player.update",
    targetType: "player",
    targetId: parsed.data.id,
    metadata: {
      ggd_user_id: parsed.data.ggd_user_id,
      nickname: parsed.data.nickname,
    },
  });

  revalidatePath("/admin/oyuncular");
  revalidatePath(`/admin/oyuncular/${parsed.data.id}`);
  revalidatePath("/sorgu");
  return { ok: true, message: "Oyuncu güncellendi." };
}

export async function deletePlayerAction(formData: FormData) {
  const current = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) return;
  await logAuditEvent({
    actorId: current.user.id,
    action: "player.delete",
    targetType: "player",
    targetId: id,
  });
  revalidatePath("/admin/oyuncular");
  revalidatePath("/admin");
  revalidatePath("/sorgu");
  redirect("/admin/oyuncular");
}
