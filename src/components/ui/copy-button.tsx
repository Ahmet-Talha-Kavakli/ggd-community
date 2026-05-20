"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Kopyala",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // no-op
        }
      }}
      aria-label={label}
      className={cn(
        "grid place-items-center rounded-2xl bg-ink-100 hover:bg-ink-200 transition-colors",
        className,
      )}
    >
      {copied ? (
        <Check className="h-5 w-5 text-brand-600" />
      ) : (
        <Copy className="h-5 w-5 text-ink-700" />
      )}
    </button>
  );
}
