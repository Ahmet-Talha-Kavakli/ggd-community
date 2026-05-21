// Premium kart tasariminda kullanilan tone-based class set'i.
// PublicStats, FEATURES, 3-step section'lar — hepsi bu helper'i kullanir.
//
// Texture sistemi: her tone, guard.png poster'ındaki gibi yumusak pastel
// arka plan karakterine sahip. Hepsi ayni estetik aile (sulu-boya,
// cocuk kitabi sicakligi) ama her biri farkli bir motif:
//   brand   → watercolor leke (yesil-mint)
//   danger  → soft dagilmis nokta puntalar (peach-rose)
//   warning → bulutsu yayilan blob (cream-amber)
//   info    → ince zarif halkalar (soft blue)
//   neutral → cok soluk grain/wash (warm gri)

export type Tone = "brand" | "danger" | "warning" | "info" | "neutral";

export interface ToneStyle {
  stripe: string; // sol border-l rengi
  iconBg: string; // yuvarlak avatar gradient
  iconRing: string; // avatar ring (border)
  iconColor: string; // icon text rengi
  hoverShadow: string; // hover shadow tonlu
  cornerGlow: string; // top-right corner hover glow
  bigNumber: string; // 3-step kartta dev numara silik renk
  texture: string; // kart arka plani — CSS background-image string'i
}

// Watercolor leke — yumusak yesil-mint pastel firca darbesi
const BRAND_TEXTURE = `
  radial-gradient(ellipse 70% 55% at 28% 25%, rgba(167, 243, 208, 0.32) 0%, rgba(167, 243, 208, 0.08) 45%, transparent 75%),
  radial-gradient(ellipse 45% 38% at 82% 78%, rgba(190, 219, 200, 0.22) 0%, transparent 70%),
  radial-gradient(ellipse 30% 25% at 90% 18%, rgba(254, 215, 196, 0.14) 0%, transparent 75%)
`;

// Dagilmis nokta puntalar — soft peach-rose, organik dağılım
const DANGER_TEXTURE = `
  radial-gradient(circle 60px at 18% 28%, rgba(254, 215, 196, 0.34) 0%, transparent 70%),
  radial-gradient(circle 45px at 78% 22%, rgba(252, 198, 200, 0.28) 0%, transparent 70%),
  radial-gradient(circle 80px at 88% 75%, rgba(254, 207, 196, 0.22) 0%, transparent 75%),
  radial-gradient(circle 50px at 25% 78%, rgba(252, 218, 220, 0.20) 0%, transparent 70%),
  radial-gradient(circle 35px at 55% 50%, rgba(254, 215, 196, 0.14) 0%, transparent 75%)
`;

// Bulutsu yayilan blob — cream-amber, daha "vapor" karakterli
const WARNING_TEXTURE = `
  radial-gradient(ellipse 80% 50% at 20% 78%, rgba(254, 240, 180, 0.34) 0%, rgba(254, 230, 180, 0.10) 45%, transparent 75%),
  radial-gradient(ellipse 55% 40% at 82% 22%, rgba(254, 224, 175, 0.28) 0%, transparent 70%),
  radial-gradient(ellipse 35% 28% at 50% 50%, rgba(254, 215, 160, 0.12) 0%, transparent 75%)
`;

// Ince halkalar — soft blue, dalgalanan koruma hissi
const INFO_TEXTURE = `
  radial-gradient(ellipse 60% 50% at 78% 22%, rgba(186, 219, 234, 0.30) 0%, rgba(186, 219, 234, 0.08) 45%, transparent 75%),
  radial-gradient(circle 100px at 20% 75%, rgba(207, 226, 232, 0.26) 0%, transparent 70%),
  radial-gradient(ellipse 40% 30% at 50% 50%, rgba(196, 222, 232, 0.10) 0%, transparent 75%)
`;

// Cok soluk warm wash — neutral icin neredeyse gorunmez ama yumusatir
const NEUTRAL_TEXTURE = `
  radial-gradient(ellipse 65% 50% at 30% 30%, rgba(228, 220, 208, 0.22) 0%, transparent 72%),
  radial-gradient(ellipse 50% 40% at 78% 78%, rgba(218, 210, 200, 0.18) 0%, transparent 72%)
`;

export const TONE_STYLES: Record<Tone, ToneStyle> = {
  brand: {
    stripe: "border-l-brand-500",
    iconBg: "from-brand-100 via-brand-50 to-white",
    iconRing: "ring-brand-200/60",
    iconColor: "text-brand-700",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(16,185,129,0.22)]",
    cornerGlow: "from-brand-100/40",
    bigNumber: "text-brand-50",
    texture: BRAND_TEXTURE,
  },
  danger: {
    stripe: "border-l-danger-500",
    iconBg: "from-danger-100 via-danger-50 to-white",
    iconRing: "ring-danger-200/60",
    iconColor: "text-danger-600",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(239,68,68,0.22)]",
    cornerGlow: "from-danger-100/40",
    bigNumber: "text-danger-50",
    texture: DANGER_TEXTURE,
  },
  warning: {
    stripe: "border-l-warning-500",
    iconBg: "from-warning-100 via-warning-50 to-white",
    iconRing: "ring-warning-200/60",
    iconColor: "text-warning-600",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(245,158,11,0.22)]",
    cornerGlow: "from-warning-100/40",
    bigNumber: "text-warning-50",
    texture: WARNING_TEXTURE,
  },
  info: {
    stripe: "border-l-sky-500",
    iconBg: "from-sky-100 via-sky-50 to-white",
    iconRing: "ring-sky-200/60",
    iconColor: "text-sky-700",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(14,165,233,0.22)]",
    cornerGlow: "from-sky-100/40",
    bigNumber: "text-sky-50",
    texture: INFO_TEXTURE,
  },
  neutral: {
    stripe: "border-l-ink-400",
    iconBg: "from-ink-100 via-ink-50 to-white",
    iconRing: "ring-ink-200/60",
    iconColor: "text-ink-700",
    hoverShadow: "hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)]",
    cornerGlow: "from-ink-100/40",
    bigNumber: "text-ink-100",
    texture: NEUTRAL_TEXTURE,
  },
};

// Helper: bir kart'a inline style olarak verilecek texture object.
// Kullanım: <div style={getToneTextureStyle("brand")}>
export function getToneTextureStyle(tone: Tone): { backgroundImage: string } {
  return {
    backgroundImage: TONE_STYLES[tone].texture,
  };
}
