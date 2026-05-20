import { redirect } from "next/navigation";
import { getCurrentUser } from "./current-user";

/**
 * Admin sayfaları için kullanılır. Giriş yoksa /giris, admin değilse /'a yönlendirir.
 */
export async function requireAdmin() {
  const current = await getCurrentUser();
  if (!current) redirect("/giris?next=/admin");
  if (!current.isAdmin) redirect("/");
  return current;
}

/**
 * Üye sayfaları için kullanılır (chat, şikayet gibi). Giriş yoksa /giris'e yönlendirir.
 */
export async function requireMember() {
  const current = await getCurrentUser();
  if (!current) redirect("/giris");
  return current;
}

/**
 * Onaylı üye gerekir.
 */
export async function requireApprovedMember() {
  const current = await requireMember();
  if (!current.isApproved) redirect("/profil");
  return current;
}
