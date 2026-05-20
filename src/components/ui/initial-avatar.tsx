import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface InitialAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InitialAvatar({
  name,
  size = "md",
  className,
}: InitialAvatarProps) {
  const sizeCls =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : size === "lg"
        ? "h-14 w-14 text-lg"
        : "h-12 w-12 text-base";

  return (
    <div
      className={cn(
        "grid place-items-center rounded-full font-semibold shrink-0 ring-2 ring-white",
        sizeCls,
        hashColor(name),
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
