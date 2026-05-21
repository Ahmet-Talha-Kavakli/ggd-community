"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logAuditEvent } from "@/lib/audit";
import {
  sendBanNotificationEmail,
  sendReportResolvedEmail,
  sendVerificationEmail,
  sendWarningNotificationEmail,
} from "@/lib/email";
import {
  createNotification,
  createNotificationsBulk,
} from "@/lib/notifications";
import { createAdminClient } from "@/lib/supabase/server";
import type { AdminActionState } from "./admin-types";
import { GGD_MAPS, GGD_MODES } from "@/lib/ggd-presets";

// =============================================================================
// Oda kodu
// =============================================================================
const MAP_SLUGS = GGD_MAPS.map((m) => m.slug);
const MODE_SLUGS = GGD_MODES.map((m) => m.slug);

const RoomCodeSchema = z.object({
  code: z
    .string()
    .max(16, "Oda kodu en fazla 16 karakter olabilir")
    .regex(/^[A-Z0-9-]*$/i, "Sadece harf, rakam ve tire kullanabilirsin")
    .transform((v) => v.trim().toUpperCase()),
  note: z.string().max(200).optional().nullable(),
  map: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v?.trim() || null)
    .refine((v) => v === null || MAP_SLUGS.includes(v), {
      message: "Geçersiz harita seçimi",
    }),
  mode: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v?.trim() || null)
    .refine((v) => v === null || MODE_SLUGS.includes(v), {
      message: "Geçersiz mod seçimi",
    }),
});

export async function updateRoomCodeAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireAdmin();
  const parsed = RoomCodeSchema.safeParse({
    code: formData.get("code") ?? "",
    note: (formData.get("note") as string) || null,
    map: (formData.get("map") as string) || null,
    mode: (formData.get("mode") as string) || null,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("room_code")
    .update({
      code: parsed.data.code,
      note: parsed.data.note,
      map: parsed.data.map,
      mode: parsed.data.mode,
      updated_by: current.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    actorId: current.user.id,
    action: "room_code.update",
    metadata: {
      code: parsed.data.code,
      note: parsed.data.note,
      map: parsed.data.map,
      mode: parsed.data.mode,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/oda-kodu");
  return { ok: true, message: "Oda kodu güncellendi." };
}

// =============================================================================
// Ban
// =============================================================================
const BanSchema = z.object({
  ggd_user_id: z
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
  reason: z.string().max(500).optional().transform((v) => v?.trim() || ""),
  reason_tags: z.array(z.string().min(1).max(64)).max(20).default([]),
  duration: z.enum(["permanent", "7d", "30d", "90d"]),
});

export async function createBanAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireAdmin();
  const parsed = BanSchema.safeParse({
    ggd_user_id: formData.get("ggd_user_id"),
    target_nickname: formData.get("target_nickname"),
    target_main_name: formData.get("target_main_name"),
    reason: formData.get("reason"),
    reason_tags: formData.getAll("reason_tags").map((v) => String(v)),
    duration: formData.get("duration"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  // En az bir etiket VEYA açıklama gerekli
  if (parsed.data.reason_tags.length === 0 && parsed.data.reason.length < 5) {
    return {
      ok: false,
      fieldErrors: {
        reason: "En az bir etiket seç veya açıklama yaz (5+ karakter)",
      },
    };
  }

  const expiresAt =
    parsed.data.duration === "permanent"
      ? null
      : new Date(
          Date.now() +
            (parsed.data.duration === "7d"
              ? 7
              : parsed.data.duration === "30d"
                ? 30
                : 90) *
              24 *
              60 *
              60 *
              1000,
        ).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bans")
    .insert({
      ggd_user_id: parsed.data.ggd_user_id,
      target_nickname: parsed.data.target_nickname,
      target_main_name: parsed.data.target_main_name,
      reason: parsed.data.reason,
      reason_tags: parsed.data.reason_tags,
      duration: parsed.data.duration,
      expires_at: expiresAt,
      banned_by: current.user.id,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    actorId: current.user.id,
    action: "ban.create",
    targetType: "ban",
    targetId: data?.id,
    metadata: { ggd_user_id: parsed.data.ggd_user_id, duration: parsed.data.duration },
  });

  // Banlanan oyuncu sitemize kayıtlıysa email + in-app bildirim
  if (parsed.data.ggd_user_id) {
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, email, nickname")
      .eq("ggd_user_id", parsed.data.ggd_user_id)
      .maybeSingle();
    const tp = targetProfile as {
      id: string;
      email: string;
      nickname: string;
    } | null;
    if (tp) {
      const durationText =
        parsed.data.duration === "permanent"
          ? "kalıcı"
          : `${parsed.data.duration} süreli`;
      if (tp.email) {
        await sendBanNotificationEmail({
          to: tp.email,
          nickname: tp.nickname,
          reason: parsed.data.reason,
          duration: parsed.data.duration,
        });
      }
      await createNotification({
        profileId: tp.id,
        type: "ban_received",
        title: `Hesabın ${durationText} banlandı`,
        body: parsed.data.reason,
        link: "/destek",
        payload: {
          ban_id: data?.id,
          duration: parsed.data.duration,
        },
      });
    }
  }

  revalidatePath("/kara-liste");
  revalidatePath("/admin/kara-liste");
  redirect("/admin/kara-liste");
}

export async function deactivateBanAction(formData: FormData) {
  const current = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("bans")
    .update({ is_active: false })
    .eq("id", id);
  if (error) return;
  await logAuditEvent({
    actorId: current.user.id,
    action: "ban.deactivate",
    targetType: "ban",
    targetId: id,
  });
  revalidatePath("/kara-liste");
  revalidatePath("/admin/kara-liste");
}

// =============================================================================
// Warning
// =============================================================================
const WarningSchema = z.object({
  ggd_user_id: z
    .string()
    .max(32)
    .optional()
    .transform((v) => v?.trim() || null),
  target_nickname: z.string().min(1).max(48),
  target_main_name: z
    .string()
    .max(48)
    .optional()
    .transform((v) => v?.trim() || null),
  reason: z.string().max(500).optional().transform((v) => v?.trim() || ""),
  reason_tags: z.array(z.string().min(1).max(64)).max(20).default([]),
  severity: z.enum(["low", "medium", "high"]),
});

export async function createWarningAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireAdmin();
  const parsed = WarningSchema.safeParse({
    ggd_user_id: formData.get("ggd_user_id"),
    target_nickname: formData.get("target_nickname"),
    target_main_name: formData.get("target_main_name"),
    reason: formData.get("reason"),
    reason_tags: formData.getAll("reason_tags").map((v) => String(v)),
    severity: formData.get("severity"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  if (parsed.data.reason_tags.length === 0 && parsed.data.reason.length < 5) {
    return {
      ok: false,
      fieldErrors: {
        reason: "En az bir etiket seç veya açıklama yaz (5+ karakter)",
      },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("warnings")
    .insert({
      ggd_user_id: parsed.data.ggd_user_id,
      target_nickname: parsed.data.target_nickname,
      target_main_name: parsed.data.target_main_name,
      reason: parsed.data.reason,
      reason_tags: parsed.data.reason_tags,
      severity: parsed.data.severity,
      issued_by: current.user.id,
      is_active: true,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  // Uyarilan oyuncu sitemize kayitliysa email + in-app bildirim
  if (parsed.data.ggd_user_id) {
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, email, nickname")
      .eq("ggd_user_id", parsed.data.ggd_user_id)
      .maybeSingle();
    const tp = targetProfile as {
      id: string;
      email: string;
      nickname: string;
    } | null;
    if (tp) {
      if (tp.email) {
        await sendWarningNotificationEmail({
          to: tp.email,
          nickname: tp.nickname,
          reason: parsed.data.reason,
          severity: parsed.data.severity,
        });
      }
      await createNotification({
        profileId: tp.id,
        type: "warning_received",
        title: "Bir uyarı aldın",
        body: parsed.data.reason,
        link: "/uyarilar",
        payload: {
          warning_id: data?.id,
          severity: parsed.data.severity,
        },
      });
    }
  }

  await logAuditEvent({
    actorId: current.user.id,
    action: "warning.create",
    targetType: "warning",
    targetId: data?.id,
    metadata: { ggd_user_id: parsed.data.ggd_user_id, severity: parsed.data.severity },
  });

  revalidatePath("/uyarilar");
  revalidatePath("/admin/uyarilar");
  redirect("/admin/uyarilar");
}

export async function deactivateWarningAction(formData: FormData) {
  const current = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("warnings").update({ is_active: false }).eq("id", id);
  await logAuditEvent({
    actorId: current.user.id,
    action: "warning.deactivate",
    targetType: "warning",
    targetId: id,
  });
  revalidatePath("/uyarilar");
  revalidatePath("/admin/uyarilar");
}

// =============================================================================
// Announcement
// =============================================================================
const AnnouncementSchema = z.object({
  title: z.string().min(3).max(160),
  body: z.string().min(10).max(4000),
  tag: z.string().min(1).max(32),
  pinned: z
    .union([z.string(), z.boolean()])
    .transform((v) => v === "on" || v === true),
});

export async function createAnnouncementAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireAdmin();
  const parsed = AnnouncementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    tag: formData.get("tag") || "genel",
    pinned: formData.get("pinned"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title: parsed.data.title,
      body: parsed.data.body,
      tag: parsed.data.tag,
      pinned: parsed.data.pinned,
      author_id: current.user.id,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    actorId: current.user.id,
    action: "announcement.create",
    targetType: "announcement",
    targetId: data?.id,
    metadata: { title: parsed.data.title, pinned: parsed.data.pinned },
  });

  // Tum onayli uyelere in-app duyuru bildirimi (toplu)
  try {
    const admin = await createAdminClient();
    const { data: approvedProfiles } = await admin
      .from("profiles")
      .select("id")
      .eq("verification_status", "approved")
      .neq("id", current.user.id);
    const profileIds = (
      (approvedProfiles ?? []) as { id: string }[]
    ).map((p) => p.id);
    if (profileIds.length > 0) {
      await createNotificationsBulk(profileIds, {
        type: "announcement",
        title: `Yeni duyuru: ${parsed.data.title}`,
        body: parsed.data.body.slice(0, 200),
        link: "/duyurular",
        payload: { announcement_id: data?.id, tag: parsed.data.tag },
      });
    }
  } catch (err) {
    console.error("announcement bulk notification failed:", err);
  }

  revalidatePath("/duyurular");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/duyurular");
  redirect("/admin/duyurular");
}

export async function deleteAnnouncementAction(formData: FormData) {
  const current = await requireAdmin();
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id);
  await logAuditEvent({
    actorId: current.user.id,
    action: "announcement.delete",
    targetType: "announcement",
    targetId: id,
  });
  revalidatePath("/duyurular");
  revalidatePath("/");
  revalidatePath("/admin/duyurular");
}

// =============================================================================
// Üye yönetimi
// =============================================================================
const ApproveSchema = z.object({
  user_id: z.uuid(),
  status: z.enum(["approved", "rejected", "pending"]),
});

export async function setVerificationStatusAction(formData: FormData) {
  const current = await requireAdmin();
  const parsed = ApproveSchema.safeParse({
    user_id: formData.get("user_id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;
  const supabase = await createClient();

  // Profile bilgisini al (email göndermek için)
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, nickname")
    .eq("id", parsed.data.user_id)
    .maybeSingle();

  await supabase
    .from("profiles")
    .update({ verification_status: parsed.data.status })
    .eq("id", parsed.data.user_id);
  await logAuditEvent({
    actorId: current.user.id,
    action: "profile.verification",
    targetType: "profile",
    targetId: parsed.data.user_id,
    metadata: { status: parsed.data.status },
  });

  // Onaylanan veya reddedilen üyeye email + in-app bildirim
  const p = profile as { email: string; nickname: string } | null;
  if (
    p &&
    (parsed.data.status === "approved" || parsed.data.status === "rejected")
  ) {
    if (p.email) {
      await sendVerificationEmail({
        to: p.email,
        nickname: p.nickname,
        status: parsed.data.status,
      });
    }
    await createNotification({
      profileId: parsed.data.user_id,
      type:
        parsed.data.status === "approved"
          ? "verification_approved"
          : "verification_rejected",
      title:
        parsed.data.status === "approved"
          ? "Hesabın onaylandı 🎉"
          : "Üyelik başvurun reddedildi",
      body:
        parsed.data.status === "approved"
          ? "Artık tüm topluluk özelliklerini kullanabilirsin."
          : "Detaylar için destek hattıyla iletişime geç.",
      link:
        parsed.data.status === "approved" ? "/topluluk" : "/destek",
    });
  }

  revalidatePath("/admin/uyeler");
}

const RoleSchema = z.object({
  user_id: z.uuid(),
  role: z.enum([
    "owner",
    "co_owner",
    "admin",
    "moderator",
    "helper",
    "trusted",
    "member",
  ]),
});

export async function setUserRoleAction(formData: FormData) {
  const current = await requireAdmin();
  const parsed = RoleSchema.safeParse({
    user_id: formData.get("user_id"),
    role: formData.get("role"),
  });
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.user_id);
  await logAuditEvent({
    actorId: current.user.id,
    action: "profile.role_change",
    targetType: "profile",
    targetId: parsed.data.user_id,
    metadata: { role: parsed.data.role },
  });
  revalidatePath("/admin/uyeler");
  revalidatePath("/yonetim");
}

// =============================================================================
// Report (şikayet) çözümleme
// =============================================================================
const ResolveReportSchema = z.object({
  report_id: z.coerce.number(),
  status: z.enum(["investigating", "resolved", "rejected"]),
  resolution_note: z.string().max(2000).optional().nullable(),
});

export async function resolveReportAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const current = await requireAdmin();
  const parsed = ResolveReportSchema.safeParse({
    report_id: formData.get("report_id"),
    status: formData.get("status"),
    resolution_note: formData.get("resolution_note") || null,
  });
  if (!parsed.success) return { ok: false, error: "Geçersiz form" };

  const supabase = await createClient();

  // Şikayet sahibini ve hedef bilgisini al (email + in-app icin)
  const { data: reportData } = await supabase
    .from("reports")
    .select(
      "target_nickname, reporter:profiles!reports_reporter_id_fkey(id, email, nickname)",
    )
    .eq("id", parsed.data.report_id)
    .maybeSingle();

  const { error } = await supabase
    .from("reports")
    .update({
      status: parsed.data.status,
      resolution_note: parsed.data.resolution_note ?? null,
      resolved_by: current.user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.report_id);

  if (error) return { ok: false, error: error.message };

  await logAuditEvent({
    actorId: current.user.id,
    action: `report.${parsed.data.status}`,
    targetType: "report",
    targetId: parsed.data.report_id,
    metadata: { resolution_note: parsed.data.resolution_note },
  });

  // Şikayet sahibine email + in-app bildirim
  const r = reportData as unknown as {
    target_nickname: string;
    reporter: { id: string; email: string; nickname: string } | null;
  } | null;
  if (r?.reporter) {
    if (r.reporter.email) {
      await sendReportResolvedEmail({
        to: r.reporter.email,
        reporterNickname: r.reporter.nickname,
        targetNickname: r.target_nickname,
        status: parsed.data.status,
        note: parsed.data.resolution_note ?? null,
      });
    }
    const statusText = {
      resolved: "haklı bulundu",
      rejected: "reddedildi",
      investigating: "inceleniyor",
    }[parsed.data.status];
    await createNotification({
      profileId: r.reporter.id,
      type: "report_resolved",
      title: `Şikayetin ${statusText}`,
      body: `${r.target_nickname} hakkındaki şikayetin sonuçlandı.${
        parsed.data.resolution_note ? ` Not: ${parsed.data.resolution_note}` : ""
      }`,
      link: "/profil/sikayetlerim",
      payload: {
        report_id: parsed.data.report_id,
        status: parsed.data.status,
      },
    });
  }

  revalidatePath("/admin/sikayetler");
  revalidatePath(`/admin/sikayetler/${parsed.data.report_id}`);
  return { ok: true, message: "Şikayet güncellendi." };
}
