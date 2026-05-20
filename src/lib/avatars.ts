import { gravatarUrl } from "./gravatar";

// Avatars bucket public — Supabase public URL'i direkt kullan
function publicAvatarUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return "";
  return `${base}/storage/v1/object/public/avatars/${path}`;
}

// Kullanıcı kendi avatarını yüklediyse onu, yoksa Gravatar fallback'i döner.
export function avatarUrl(opts: {
  avatarPath?: string | null;
  email?: string | null;
  size?: number;
}): string {
  if (opts.avatarPath) {
    return publicAvatarUrl(opts.avatarPath);
  }
  return gravatarUrl(opts.email, opts.size ?? 80);
}
