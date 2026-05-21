"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireApprovedMember } from "@/lib/auth/require-admin";
import { analyzeReport } from "@/lib/ai/analyze-report";
import { sendReportReceivedEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import type { AdminActionState } from "./admin-types";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

const ReportSchema = z.object({
  target_ggd_user_id: z
    .string()
    .max(32)
    .optional()
    .transform((v) => v?.trim() || null),
  target_nickname: z.string().min(1, "Oyun içi nick gerekli").max(48),
  target_main_name: z
    .string()
    .max(48)
    .optional()
    .transform((v) => v?.trim() || null),
  category: z.enum([
    "insult",
    "sabotage",
    "cheat",
    "spam",
    "stream_sniping",
    "other",
  ]),
  description: z
    .string()
    .min(20, "Olayı en az 20 karakter ile anlat")
    .max(2000),
});

export async function createReportAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireApprovedMember();

  const parsed = ReportSchema.safeParse({
    target_ggd_user_id: formData.get("target_ggd_user_id"),
    target_nickname: formData.get("target_nickname"),
    target_main_name: formData.get("target_main_name"),
    category: formData.get("category"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const files = formData.getAll("evidence").filter((f): f is File => {
    return typeof f === "object" && f !== null && "size" in f && (f as File).size > 0;
  });

  if (files.length > MAX_FILES) {
    return { ok: false, error: `En fazla ${MAX_FILES} dosya yükleyebilirsin.` };
  }

  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) {
      return {
        ok: false,
        error: `${f.name} 50MB'tan büyük. Daha küçük bir dosya seç.`,
      };
    }
    if (
      !ALLOWED_IMAGE.includes(f.type) &&
      !ALLOWED_VIDEO.includes(f.type)
    ) {
      return {
        ok: false,
        error: `${f.name} desteklenmeyen format. JPG, PNG, WEBP, MP4, WEBM kullan.`,
      };
    }
  }

  const supabase = await createClient();

  const { data: reportData, error: insertError } = await supabase
    .from("reports")
    .insert({
      reporter_id: current.user.id,
      target_ggd_user_id: parsed.data.target_ggd_user_id,
      target_nickname: parsed.data.target_nickname,
      target_main_name: parsed.data.target_main_name,
      category: parsed.data.category,
      description: parsed.data.description,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !reportData) {
    return {
      ok: false,
      error: "Şikayet kaydedilirken hata oluştu: " + (insertError?.message ?? ""),
    };
  }

  const reportId = (reportData as { id: number }).id;

  // Kanıtları yükle
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${current.user.id}/${reportId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("report-evidence")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) continue; // upload başarısızsa sessizce geç, şikayet kaydı durur

    await supabase.from("report_evidence").insert({
      report_id: reportId,
      storage_path: path,
      media_type: ALLOWED_VIDEO.includes(file.type) ? "video" : "image",
      file_size_bytes: file.size,
    });
  }

  // AI ön analizi — başarısızsa sessizce geç (şikayet kaydı zaten oluştu)
  const analysis = await analyzeReport({
    category: parsed.data.category,
    description: parsed.data.description,
    targetNickname: parsed.data.target_nickname,
    hasEvidence: files.length > 0,
  });
  if (analysis) {
    await supabase
      .from("reports")
      .update({
        ai_severity: analysis.severity,
        ai_summary: analysis.summary,
        ai_recommendation: analysis.recommendation,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq("id", reportId);
  }

  // Raporcuya "sikayet alindi" maili — async, hata olsa bile flow durdurmaz
  if (current.email) {
    sendReportReceivedEmail({
      to: current.email,
      reporterNickname: current.nickname,
      targetNickname: parsed.data.target_nickname,
      reportId,
    }).catch((err) =>
      console.error("report received email failed:", err),
    );
  }

  // Raporcuya in-app bildirim
  await createNotification({
    profileId: current.user.id,
    type: "report_received",
    title: `Şikayetin alındı (#${reportId})`,
    body: `${parsed.data.target_nickname} hakkındaki şikayetin yönetime iletildi.`,
    link: "/profil/sikayetlerim",
    payload: { report_id: reportId },
  });

  revalidatePath("/admin/sikayetler");
  revalidatePath("/profil/sikayetlerim");
  redirect("/profil/sikayetlerim?ok=1");
}
