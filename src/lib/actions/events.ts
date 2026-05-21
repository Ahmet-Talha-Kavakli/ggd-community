"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  requireAdmin,
  requireApprovedMember,
} from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/audit";
import type { AdminActionState } from "./admin-types";

const EVENT_TYPE = [
  "raffle",
  "tournament",
  "community",
  "poll",
  "other",
] as const;
const EVENT_STATUS = [
  "draft",
  "published",
  "ongoing",
  "completed",
  "cancelled",
] as const;

const EventSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter").max(160),
  description: z.string().min(10, "Açıklama en az 10 karakter").max(4000),
  type: z.enum(EVENT_TYPE),
  status: z.enum(EVENT_STATUS),
  starts_at: z
    .string()
    .min(1, "Başlangıç tarihi gerekli")
    .transform((v) => new Date(v).toISOString()),
  ends_at: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v).toISOString() : null)),
  prize: z
    .string()
    .max(240)
    .optional()
    .transform((v) => v?.trim() || null),
  max_participants: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === null || v === "") return null;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
    }),
});

function readEventFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    status: formData.get("status"),
    starts_at: formData.get("starts_at"),
    ends_at: (formData.get("ends_at") as string) || null,
    prize: formData.get("prize"),
    max_participants: formData.get("max_participants"),
  };
}

function readPollOptions(formData: FormData): string[] {
  return formData
    .getAll("poll_option")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0)
    .slice(0, 8);
}

async function syncPollOptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: number,
  type: string,
  labels: string[],
  mode: "create" | "edit",
): Promise<{ ok: boolean; error?: string }> {
  if (type !== "poll") {
    // Eger tip artik poll degilse mevcut options'i sil (sessizce)
    if (mode === "edit") {
      await supabase.from("poll_options").delete().eq("event_id", eventId);
    }
    return { ok: true };
  }
  if (labels.length < 2) {
    return { ok: false, error: "Anket için en az 2 seçenek gerekli." };
  }

  if (mode === "edit") {
    // Mevcut option'lari komple yenile (oylar option_id'ye baglı; degisirse oylar
    // silinir — bilinçli karar, küçük anket icin tolere edilebilir)
    await supabase.from("poll_options").delete().eq("event_id", eventId);
  }

  const rows = labels.map((label, i) => ({
    event_id: eventId,
    label,
    position: i,
  }));
  const { error } = await supabase.from("poll_options").insert(rows);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function createEventAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireAdmin();
  const parsed = EventSchema.safeParse(readEventFormData(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      status: parsed.data.status,
      starts_at: parsed.data.starts_at,
      ends_at: parsed.data.ends_at,
      prize: parsed.data.prize,
      max_participants: parsed.data.max_participants,
      created_by: current.user.id,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  const newId = (data as { id: number } | null)?.id;

  if (newId && parsed.data.type === "poll") {
    const labels = readPollOptions(formData);
    const sync = await syncPollOptions(
      supabase,
      newId,
      parsed.data.type,
      labels,
      "create",
    );
    if (!sync.ok) {
      // Event olusturuldu ama options eksik — admin sonradan duzeltebilir
      return { ok: false, error: sync.error };
    }
  }

  await logAuditEvent({
    actorId: current.user.id,
    action: "event.create",
    targetType: "event",
    targetId: newId,
    metadata: { title: parsed.data.title, status: parsed.data.status },
  });

  revalidatePath("/etkinlikler");
  revalidatePath("/admin/etkinlikler");
  revalidatePath("/");
  redirect(newId ? `/admin/etkinlikler/${newId}` : "/admin/etkinlikler");
}

const UpdateEventSchema = EventSchema.extend({
  id: z.coerce.number().int().positive(),
});

export async function updateEventAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireAdmin();
  const parsed = UpdateEventSchema.safeParse({
    id: formData.get("id"),
    ...readEventFormData(formData),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      status: parsed.data.status,
      starts_at: parsed.data.starts_at,
      ends_at: parsed.data.ends_at,
      prize: parsed.data.prize,
      max_participants: parsed.data.max_participants,
    })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, error: error.message };

  // Poll secenekleri sync (tip degistiyse veya tip poll ise)
  const labels = readPollOptions(formData);
  const sync = await syncPollOptions(
    supabase,
    parsed.data.id,
    parsed.data.type,
    labels,
    "edit",
  );
  if (!sync.ok) return { ok: false, error: sync.error };

  await logAuditEvent({
    actorId: current.user.id,
    action: "event.update",
    targetType: "event",
    targetId: parsed.data.id,
    metadata: { title: parsed.data.title, status: parsed.data.status },
  });

  revalidatePath("/etkinlikler");
  revalidatePath(`/etkinlikler/${parsed.data.id}`);
  revalidatePath("/admin/etkinlikler");
  revalidatePath(`/admin/etkinlikler/${parsed.data.id}`);
  return { ok: true, message: "Etkinlik güncellendi." };
}

export async function deleteEventAction(formData: FormData) {
  const current = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", id);
  await logAuditEvent({
    actorId: current.user.id,
    action: "event.delete",
    targetType: "event",
    targetId: id,
  });
  revalidatePath("/etkinlikler");
  revalidatePath("/admin/etkinlikler");
  redirect("/admin/etkinlikler");
}

// ----------------------------------------------------------------------------
// Üye katılımı
// ----------------------------------------------------------------------------
export async function joinEventAction(formData: FormData) {
  const current = await requireApprovedMember();
  const eventId = Number(formData.get("event_id"));
  if (!eventId) return;

  const supabase = await createClient();

  // Etkinliği kontrol et
  const { data: eventData } = await supabase
    .from("events")
    .select("status, max_participants")
    .eq("id", eventId)
    .maybeSingle();
  const evt = eventData as {
    status: string;
    max_participants: number | null;
  } | null;
  if (!evt) return;
  if (!["published", "ongoing"].includes(evt.status)) return;

  // Kontenjan dolmuş mu?
  if (evt.max_participants != null) {
    const { count } = await supabase
      .from("event_participants")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);
    if ((count ?? 0) >= evt.max_participants) return;
  }

  await supabase.from("event_participants").upsert({
    event_id: eventId,
    user_id: current.user.id,
  });

  revalidatePath("/etkinlikler");
  revalidatePath(`/etkinlikler/${eventId}`);
  revalidatePath(`/admin/etkinlikler/${eventId}`);
}

export async function leaveEventAction(formData: FormData) {
  const current = await requireApprovedMember();
  const eventId = Number(formData.get("event_id"));
  if (!eventId) return;
  const supabase = await createClient();
  await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", current.user.id);
  revalidatePath("/etkinlikler");
  revalidatePath(`/etkinlikler/${eventId}`);
  revalidatePath(`/admin/etkinlikler/${eventId}`);
}

// ----------------------------------------------------------------------------
// Kazanan seçimi (çekiliş için)
// ----------------------------------------------------------------------------
const PickWinnerSchema = z.object({
  event_id: z.coerce.number().int().positive(),
  mode: z.enum(["random", "manual"]),
  user_id: z.string().uuid().optional().nullable(),
});

export async function pickWinnerAction(formData: FormData) {
  const current = await requireAdmin();
  const parsed = PickWinnerSchema.safeParse({
    event_id: formData.get("event_id"),
    mode: formData.get("mode") || "random",
    user_id: (formData.get("user_id") as string) || null,
  });
  if (!parsed.success) return;

  const supabase = await createClient();

  let winnerId: string | null = null;

  if (parsed.data.mode === "manual") {
    if (!parsed.data.user_id) return;
    winnerId = parsed.data.user_id;
  } else {
    const { data: participants } = await supabase
      .from("event_participants")
      .select("user_id")
      .eq("event_id", parsed.data.event_id);
    const rows = (participants ?? []) as { user_id: string }[];
    if (rows.length === 0) return;
    const idx = Math.floor(Math.random() * rows.length);
    winnerId = rows[idx].user_id;
  }

  await supabase
    .from("events")
    .update({ winner_id: winnerId, status: "completed" })
    .eq("id", parsed.data.event_id);

  await logAuditEvent({
    actorId: current.user.id,
    action: "event.pick_winner",
    targetType: "event",
    targetId: parsed.data.event_id,
    metadata: { mode: parsed.data.mode, winner_id: winnerId },
  });

  revalidatePath("/etkinlikler");
  revalidatePath(`/etkinlikler/${parsed.data.event_id}`);
  revalidatePath(`/admin/etkinlikler/${parsed.data.event_id}`);
}

export async function clearWinnerAction(formData: FormData) {
  const current = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("events").update({ winner_id: null }).eq("id", id);
  await logAuditEvent({
    actorId: current.user.id,
    action: "event.clear_winner",
    targetType: "event",
    targetId: id,
  });
  revalidatePath(`/etkinlikler/${id}`);
  revalidatePath(`/admin/etkinlikler/${id}`);
}

// ----------------------------------------------------------------------------
// Poll vote — kullanici oy verir veya degistirir (oy zaten varsa upsert)
// ----------------------------------------------------------------------------
export async function castPollVoteAction(formData: FormData) {
  const current = await requireApprovedMember();
  const eventId = Number(formData.get("event_id"));
  const optionId = Number(formData.get("option_id"));
  if (!eventId || !optionId) return;

  const supabase = await createClient();

  // Option gerçekten bu event'e ait mi (guvenlik)
  const { data: opt } = await supabase
    .from("poll_options")
    .select("event_id")
    .eq("id", optionId)
    .maybeSingle();
  if (!opt || (opt as { event_id: number }).event_id !== eventId) return;

  // Event aktif mi (taslak/iptal'de oy verilmez)
  const { data: ev } = await supabase
    .from("events")
    .select("status, type")
    .eq("id", eventId)
    .maybeSingle();
  const eventRow = ev as { status: string; type: string } | null;
  if (
    !eventRow ||
    eventRow.type !== "poll" ||
    ["draft", "completed", "cancelled"].includes(eventRow.status)
  ) {
    return;
  }

  await supabase.from("poll_votes").upsert(
    {
      event_id: eventId,
      option_id: optionId,
      user_id: current.user.id,
    },
    { onConflict: "event_id,user_id" },
  );

  revalidatePath(`/etkinlikler/${eventId}`);
}
