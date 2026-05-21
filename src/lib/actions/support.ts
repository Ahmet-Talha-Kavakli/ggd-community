"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { AdminActionState } from "./admin-types";
import type { SupportCategory } from "@/lib/supabase/types";

const CATEGORIES: SupportCategory[] = [
  "ban_appeal",
  "account_approval",
  "account_issue",
  "bug_report",
  "general",
];

const MAX_FILES = 3;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

const SupportSchema = z.object({
  subject: z.string().min(3, "Konu çok kısa").max(160),
  body: z.string().min(10, "Mesaj çok kısa").max(4000),
  contact_email: z.string().email().optional().or(z.literal("")),
  category: z.enum(CATEGORIES as [SupportCategory, ...SupportCategory[]]),
});

export async function submitSupportAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = SupportSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
    contact_email: formData.get("contact_email") ?? "",
    category: formData.get("category") ?? "general",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const current = await getCurrentUser();

  // Dosyalari topla — sadece login olan kullanici ekleyebilir (storage policy
  // auth.uid() istiyor). Anonim ticket'lar metinle gonderilir.
  const files = formData.getAll("attachments").filter((f): f is File => {
    return typeof f === "object" && f !== null && "size" in f && (f as File).size > 0;
  });

  if (files.length > 0 && !current) {
    return {
      ok: false,
      error: "Dosya eklemek için giriş yapmalısın.",
    };
  }
  if (files.length > MAX_FILES) {
    return { ok: false, error: `En fazla ${MAX_FILES} dosya yükleyebilirsin.` };
  }
  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) {
      return {
        ok: false,
        error: `${f.name} 20MB'tan büyük. Daha küçük bir dosya seç.`,
      };
    }
    if (!ALLOWED_IMAGE.includes(f.type) && !ALLOWED_VIDEO.includes(f.type)) {
      return {
        ok: false,
        error: `${f.name} desteklenmeyen format. JPG, PNG, WEBP, MP4, WEBM kullan.`,
      };
    }
  }

  const supabase = await createClient();

  const { data: ticketData, error: insertError } = await supabase
    .from("support_tickets")
    .insert({
      user_id: current?.user.id ?? null,
      contact_email: parsed.data.contact_email || current?.email || null,
      subject: parsed.data.subject,
      body: parsed.data.body,
      category: parsed.data.category,
      status: "open",
    })
    .select("id")
    .single();

  if (insertError || !ticketData) {
    return {
      ok: false,
      error: insertError?.message ?? "Mesaj kaydedilemedi.",
    };
  }

  const ticketId = (ticketData as { id: number }).id;

  // Dosyalari yukle (best-effort — basarisizsa ticket zaten kaydedildi)
  if (current && files.length > 0) {
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${current.user.id}/${ticketId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("support-attachments")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) continue;

      await supabase.from("support_attachments").insert({
        ticket_id: ticketId,
        storage_path: path,
        media_type: ALLOWED_VIDEO.includes(file.type) ? "video" : "image",
        file_size_bytes: file.size,
      });
    }
  }

  return {
    ok: true,
    message: "Mesajın iletildi. 48 saat içinde dönüş alacaksın.",
  };
}
