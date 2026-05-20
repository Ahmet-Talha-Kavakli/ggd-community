import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, sessionId } = await auth();

  if (!userId) {
    return NextResponse.json({ status: "anonymous", sessionId });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;

  const supabase = await createAdminClient();

  const { data: byClerkId } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, clerk_user_id, verification_status")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  const { data: byEmail } = email
    ? await supabase
        .from("profiles")
        .select("id, email, nickname, role, clerk_user_id, verification_status")
        .eq("email", email)
        .maybeSingle()
    : { data: null };

  const diagnosis = byClerkId
    ? "OK_LINKED"
    : byEmail
      ? "ORPHAN_PROFILE_EMAIL_MATCH_FOUND"
      : "NO_PROFILE";

  return NextResponse.json({
    status: "authenticated",
    clerkUserId: userId,
    sessionId,
    clerk: { email, username: user.username },
    profileByClerkId: byClerkId,
    profileByEmail: byEmail,
    diagnosis,
  });
}
