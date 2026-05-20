import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Teshis endpoint: tarayicidaki Clerk session ile Supabase profile baglantisini
// inceler. Gercek user_id'yi ve profile durumunu gosterir.
export async function GET() {
  const { userId, sessionId } = await auth();

  if (!userId) {
    return NextResponse.json({ status: "anonymous", sessionId });
  }

  const supabase = await createAdminClient();

  const { data: byClerkId } = await supabase
    .from("profiles")
    .select(
      "id, email, nickname, role, clerk_user_id, verification_status, created_at",
    )
    .eq("clerk_user_id", userId)
    .maybeSingle();

  return NextResponse.json({
    status: "authenticated",
    clerkUserId: userId,
    sessionId,
    profileByClerkId: byClerkId,
    profileExists: Boolean(byClerkId),
  });
}
