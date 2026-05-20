"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { PresetTag } from "@/lib/preset-tags";

interface TagSelectorProps {
  name: string;
  tags: PresetTag[];
  defaultSelected?: string[];
  label?: string;
  description?: string;
}

export function TagSelector({
  name,
  tags,
  defaultSelected = [],
  label = "Hazır etiketler",
  description = "İlgili etiketleri seç. Birden fazla seçebilirsin.",
}: TagSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultSelected),
  );

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-ink-800">{label}</p>
          <p className="mt-0.5 text-xs text-ink-500">{description}</p>
        </div>
        {selected.size > 0 && (
          <span className="text-xs font-medium text-brand-700">
            {selected.size} seçildi
          </span>
        )}
      </div>

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => {
          const isSelected = selected.has(tag.slug);
          const toneClass = isSelected
            ? tag.tone === "danger"
              ? "border-danger-500 bg-danger-50 text-danger-700"
              : tag.tone === "warning"
                ? "border-warning-500 bg-warning-50 text-warning-700"
                : "border-brand-500 bg-brand-50 text-brand-800"
            : "border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50";
          const Icon = tag.icon;

          return (
            <button
              key={tag.slug}
              type="button"
              onClick={() => toggle(tag.slug)}
              className={cn(
                "group flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all",
                toneClass,
              )}
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 place-items-center rounded-md shrink-0 transition-colors",
                  isSelected
                    ? "bg-white/80"
                    : "bg-ink-100 group-hover:bg-ink-200",
                )}
              >
                {isSelected ? (
                  <Check size={12} weight="bold" />
                ) : (
                  <Icon size={12} weight="duotone" />
                )}
              </span>
              <span className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{tag.label}</p>
                <p
                  className={cn(
                    "mt-0.5 text-xs leading-snug truncate",
                    isSelected ? "opacity-75" : "text-ink-500",
                  )}
                >
                  {tag.description}
                </p>
              </span>
            </button>
          );
        })}
      </div>

      {/* Form'a iletim için her seçili etiket için bir hidden input */}
      {[...selected].map((slug) => (
        <input key={slug} type="hidden" name={name} value={slug} />
      ))}
    </div>
  );
}
