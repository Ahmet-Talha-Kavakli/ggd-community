import { createAdminClient } from "@/lib/supabase/server";

export type NotificationType =
  | "verification_approved"
  | "verification_rejected"
  | "warning_received"
  | "ban_received"
  | "report_received"
  | "report_resolved"
  | "announcement"
  | "system";

export interface NotificationInput {
  profileId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  payload?: Record<string, unknown>;
}

export interface Notification {
  id: number;
  profile_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

/**
 * Yeni notification yaratır. Service role ile yazar (RLS bypass).
 * Hata olursa loglanır ama exception fırlatılmaz — caller flow durmaz.
 */
export async function createNotification(
  input: NotificationInput,
): Promise<void> {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("notifications").insert({
      profile_id: input.profileId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      payload: input.payload ?? null,
    });
    if (error) {
      console.error("[notification:insert]", error.message);
    }
  } catch (err) {
    console.error("[notification:exception]", err);
  }
}

/**
 * Bir profile_id listesi için aynı notification'ı toplu yaratır (announcement gibi).
 */
export async function createNotificationsBulk(
  profileIds: string[],
  template: Omit<NotificationInput, "profileId">,
): Promise<void> {
  if (profileIds.length === 0) return;
  try {
    const supabase = await createAdminClient();
    const rows = profileIds.map((pid) => ({
      profile_id: pid,
      type: template.type,
      title: template.title,
      body: template.body ?? null,
      link: template.link ?? null,
      payload: template.payload ?? null,
    }));
    const { error } = await supabase.from("notifications").insert(rows);
    if (error) console.error("[notification:bulk]", error.message);
  } catch (err) {
    console.error("[notification:bulk:exception]", err);
  }
}

export async function getUnreadCount(profileId: string): Promise<number> {
  const supabase = await createAdminClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .is("read_at", null);
  return count ?? 0;
}

export async function getRecentNotifications(
  profileId: string,
  limit = 10,
): Promise<Notification[]> {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Notification[];
}
