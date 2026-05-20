import { findTag } from "@/lib/preset-tags";
import { cn } from "@/lib/utils";

interface TagChipsProps {
  slugs: string[];
  size?: "sm" | "md";
  className?: string;
}

export function TagChips({ slugs, size = "sm", className }: TagChipsProps) {
  if (!slugs || slugs.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {slugs.map((slug) => {
        const tag = findTag(slug);
        if (!tag) {
          return (
            <span
              key={slug}
              className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-0.5 text-xs text-ink-600"
            >
              {slug}
            </span>
          );
        }
        const Icon = tag.icon;
        const toneClass =
          tag.tone === "danger"
            ? "bg-danger-50 text-danger-700 border-danger-500/20"
            : tag.tone === "warning"
              ? "bg-warning-50 text-warning-700 border-warning-500/20"
              : "bg-ink-100 text-ink-700 border-ink-200";

        return (
          <span
            key={slug}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium tracking-tight",
              size === "sm" ? "text-xs" : "text-sm",
              toneClass,
            )}
          >
            <Icon size={size === "sm" ? 11 : 13} weight="duotone" />
            {tag.label}
          </span>
        );
      })}
    </div>
  );
}
