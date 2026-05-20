import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight",
  {
    variants: {
      variant: {
        default: "bg-ink-100 text-ink-700",
        brand: "bg-brand-100 text-brand-800",
        success: "bg-brand-100 text-brand-800",
        warning: "bg-warning-50 text-warning-600 border border-warning-500/20",
        danger: "bg-danger-50 text-danger-600 border border-danger-500/20",
        outline: "border border-ink-200 text-ink-700",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
