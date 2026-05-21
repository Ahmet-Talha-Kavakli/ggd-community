"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

async function getCurrentProfileId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function markNotificationReadAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  const profileId = await getCurrentProfileId();
  if (!profileId) return;
  const supabase = await createAdminClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("profile_id", profileId);
  revalidatePath("/");
}

export async function markAllNotificationsReadAction() {
  const profileId = await getCurrentProfileId();
  if (!profileId) return;
  const supabase = await createAdminClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", profileId)
    .is("read_at", null);
  revalidatePath("/");
}

export async function deleteNotificationAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  const profileId = await getCurrentProfileId();
  if (!profileId) return;
  const supabase = await createAdminClient();
  await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);
  revalidatePath("/");
}

export async function deleteAllNotificationsAction() {
  const profileId = await getCurrentProfileId();
  if (!profileId) return;
  const supabase = await createAdminClient();
  await supabase
    .from("notifications")
    .delete()
    .eq("profile_id", profileId);
  revalidatePath("/");
}
