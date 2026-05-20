"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { AdminActionState } from "./admin-types";

const SupportSchema = z.object({
  subject: z.string().min(3, "Konu çok kısa").max(160),
  body: z.string().min(10, "Mesaj çok kısa").max(4000),
  contact_email: z.string().email().optional().or(z.literal("")),
});

export async function submitSupportAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = SupportSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
    contact_email: formData.get("contact_email") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const current = await getCurrentUser();
  const supabase = await createClient();

  const { error } = await supabase.from("support_tickets").insert({
    user_id: current?.user.id ?? null,
    contact_email: parsed.data.contact_email || current?.email || null,
    subject: parsed.data.subject,
    body: parsed.data.body,
    status: "open",
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Mesajın iletildi. 48 saat içinde dönüş alacaksın." };
}
