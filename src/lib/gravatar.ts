import crypto from "node:crypto";

/**
 * Gravatar URL üretir. Email yoksa default avatar döner.
 * @param email kullanıcı email'i (boşluksuz, küçük harfli)
 * @param size  px cinsinden boyut (varsayılan 80)
 * @param fallback `identicon`, `monsterid`, `wavatar`, `retro` veya `404`
 */
export function gravatarUrl(
  email: string | null | undefined,
  size = 80,
  fallback: "identicon" | "monsterid" | "wavatar" | "retro" | "404" = "identicon",
) {
  const normalized = (email ?? "").trim().toLowerCase();
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${fallback}`;
}
