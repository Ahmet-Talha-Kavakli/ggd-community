// Premium kart tasariminda kullanilan tone-based class set'i.
// PublicStats, FEATURES, 3-step section'lar — hepsi bu helper'i kullanir.

export type Tone = "brand" | "danger" | "warning" | "info" | "neutral";

export interface ToneStyle {
  stripe: string; // sol border-l rengi
  iconBg: string; // yuvarlak avatar gradient
  iconRing: string; // avatar ring (border)
  iconColor: string; // icon text rengi
  hoverShadow: string; // hover shadow tonlu
  cornerGlow: string; // top-right corner hover glow
  bigNumber: string; // 3-step kartta dev numara silik renk
}

export const TONE_STYLES: Record<Tone, ToneStyle> = {
  brand: {
    stripe: "border-l-brand-500",
    iconBg: "from-brand-100 via-brand-50 to-white",
    iconRing: "ring-brand-200/60",
    iconColor: "text-brand-700",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(16,185,129,0.22)]",
    cornerGlow: "from-brand-100/40",
    bigNumber: "text-brand-50",
  },
  danger: {
    stripe: "border-l-danger-500",
    iconBg: "from-danger-100 via-danger-50 to-white",
    iconRing: "ring-danger-200/60",
    iconColor: "text-danger-600",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(239,68,68,0.22)]",
    cornerGlow: "from-danger-100/40",
    bigNumber: "text-danger-50",
  },
  warning: {
    stripe: "border-l-warning-500",
    iconBg: "from-warning-100 via-warning-50 to-white",
    iconRing: "ring-warning-200/60",
    iconColor: "text-warning-600",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(245,158,11,0.22)]",
    cornerGlow: "from-warning-100/40",
    bigNumber: "text-warning-50",
  },
  info: {
    stripe: "border-l-sky-500",
    iconBg: "from-sky-100 via-sky-50 to-white",
    iconRing: "ring-sky-200/60",
    iconColor: "text-sky-700",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(14,165,233,0.22)]",
    cornerGlow: "from-sky-100/40",
    bigNumber: "text-sky-50",
  },
  neutral: {
    stripe: "border-l-ink-400",
    iconBg: "from-ink-100 via-ink-50 to-white",
    iconRing: "ring-ink-200/60",
    iconColor: "text-ink-700",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)]",
    cornerGlow: "from-ink-100/40",
    bigNumber: "text-ink-100",
  },
};
