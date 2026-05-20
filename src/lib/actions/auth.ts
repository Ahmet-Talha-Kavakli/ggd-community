"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Clerk sign-out — kullanıcının Clerk session'ını sonlandırır.
 * UserMenu ve profil sayfası form action olarak çağırıyor.
 */
export async function signOutAction() {
  const { sessionId } = await auth();
  if (sessionId) {
    try {
      const clerk = await clerkClient();
      await clerk.sessions.revokeSession(sessionId);
    } catch (err) {
      console.error("session revoke failed:", err);
    }
  }
  revalidatePath("/", "layout");
  redirect("/");
}
