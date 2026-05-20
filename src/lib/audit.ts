import { createClient } from "@/lib/supabase/server";

export async function logAuditEvent({
  actorId,
  action,
  targetType,
  targetId,
  metadata,
}: {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string | number;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action,
    target_type: targetType ?? null,
    target_id: targetId != null ? String(targetId) : null,
    metadata: metadata ?? {},
  });
}
