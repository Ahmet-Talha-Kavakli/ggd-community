# Tasarım Sistemi — GooseCage Pattern Library

Tailwind v4 + Next.js 16 + React 19 üzerinde kurulu, "Apple-vari sıcaklık + modern SaaS" estetiğinde bir tasarım dili. Aşağıdaki rehber kendi projenize bire bir aktarabileceğiniz konseptleri içerir.

**Temel ilke:** kart başına net bir _tone_ (brand/danger/warning/info/neutral), her tone'a özgü pastel watercolor doku, siyah hairline border, yumuşak hover lift, fade-up animasyonlu giriş.

---

## 1. Renk paleti

`globals.css` içinde `@theme inline` ile CSS variable olarak tanımlanır.

```css
@theme inline {
  --color-brand-50:  #ecfdf5;
  --color-brand-100: #d1fae5;
  --color-brand-200: #a7f3d0;
  --color-brand-300: #6ee7b7;
  --color-brand-400: #34d399;
  --color-brand-500: #10b981;
  --color-brand-600: #059669;  /* primary CTA */
  --color-brand-700: #047857;
  --color-brand-800: #065f46;
  --color-brand-900: #064e3b;

  /* Apple-vari nötr — beyaz ağırlıklı, zinc tabanlı */
  --color-ink-50:  #fafafa;
  --color-ink-100: #f4f4f5;
  --color-ink-200: #e4e4e7;
  --color-ink-300: #d4d4d8;
  --color-ink-400: #a1a1aa;
  --color-ink-500: #71717a;
  --color-ink-600: #52525b;
  --color-ink-700: #3f3f46;
  --color-ink-800: #27272a;
  --color-ink-900: #18181b;  /* tüm border'lar */
  --color-ink-950: #09090b;

  --color-danger-500: #ef4444;
  --color-warning-500: #f59e0b;
  /* info için Tailwind'in default sky-* paleti */
}
```

**Kullanım kuralı:** primary aksiyon brand-600, tehlike danger-500, uyarı warning-500, bilgi sky-500. Border'lar **her zaman ink-900** (siyah hairline) — bu projenin imzasıdır.

---

## 2. Tipografi

Sora — gerçek "Apple SF Pro" hissi vermez ama yakın bir geometric sans:

```ts
import { Sora } from "next/font/google";
const sora = Sora({
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});
```

**Heading kuralları** (`globals.css`):

```css
h1, h2, h3, h4, h5, h6 {
  letter-spacing: -0.022em;
  font-weight: 600;
}
h1 {
  letter-spacing: -0.03em;
  font-weight: 700;
}
body {
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

**Hero başlık** ölçeği: `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] sm:leading-[1.02]`.

---

## 3. Tone system + Card pattern (kalp)

Sitedeki çoğu kart ortak bir `TONE_STYLES` map'ten beslenir. `src/lib/card-tones.ts`:

```ts
export type Tone = "brand" | "danger" | "warning" | "info" | "neutral";

export interface ToneStyle {
  stripe: string;      // sol border-l rengi
  iconBg: string;      // ikon avatar gradient
  iconRing: string;    // avatar ring border
  iconColor: string;   // ikon text rengi
  hoverShadow: string; // hover shadow tonlu
  cornerGlow: string;  // hover'da top-right glow
  bigNumber: string;   // dev numara silik renk (3-step kart)
  texture: string;     // watercolor BG (string, inline style)
}
```

Her tone'un `texture` field'ı **el-çizimi pastel leke** ile farklı bir motiftedir:

- **brand** → mint watercolor leke
- **danger** → dağılmış peach-rose noktalar
- **warning** → bulutsu cream-amber blob
- **info** → ince soft blue halkalar
- **neutral** → soluk warm wash

```ts
const BRAND_TEXTURE = `
  radial-gradient(ellipse 70% 55% at 28% 25%, rgba(167, 243, 208, 0.32) 0%, rgba(167, 243, 208, 0.08) 45%, transparent 75%),
  radial-gradient(ellipse 45% 38% at 82% 78%, rgba(190, 219, 200, 0.22) 0%, transparent 70%),
  radial-gradient(ellipse 30% 25% at 90% 18%, rgba(254, 215, 196, 0.14) 0%, transparent 75%)
`;
```

**Premium kart template:**

```tsx
const t = TONE_STYLES[tone];
<div
  className={`relative h-full bg-white rounded-2xl p-7 border border-ink-900 border-l-[3px] ${t.stripe} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] ${t.hoverShadow} hover:-translate-y-0.5 transition-all duration-300`}
  style={{ backgroundImage: t.texture }}
>
  <div
    aria-hidden
    className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${t.cornerGlow} to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
  />
  <div
    className={`relative inline-flex items-center justify-center h-14 w-14 rounded-full bg-linear-to-br ${t.iconBg} ring-1 ${t.iconRing} shadow-sm group-hover:scale-105 transition-all duration-300`}
  >
    <Icon size={26} weight="duotone" className={t.iconColor} />
  </div>
  <h3 className="relative mt-5 text-lg font-semibold tracking-tight text-ink-900">{title}</h3>
  <p className="relative mt-2 text-sm text-ink-600 leading-relaxed">{description}</p>
</div>
```

Önemli detaylar:

- **Border her zaman siyah hairline**: `border border-ink-900` + sol kalın `border-l-[3px] ${t.stripe}`.
- **bg-white opak** (yarı şeffaf değil) — animated background varsa kartların içinden geçmesin.
- **inline style ile texture** — tone'un kendi pastel zeminini ekler.
- **hover'da corner glow** (sağ-üst), kart `-translate-y-0.5` lift.
- **inside content `relative`** — texture + corner glow aria-hidden absolute, content üstte.

---

## 4. Animations

`globals.css`'te tanımlı standard set:

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-fade-up  { animation: fade-up  0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-fade-in  { animation: fade-in  0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }

.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
.stagger-5 { animation-delay: 0.25s; }
.stagger-6 { animation-delay: 0.3s; }
```

**Hover lift** — kartlarda standart:

```css
.lift {
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.3s ease;
}
.lift:hover { transform: translateY(-2px); }
```

**Shine sweep** — CTA butonlarda:

```css
.shine { position: relative; overflow: hidden; }
.shine::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
  background-size: 200% 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
.shine:hover::after { opacity: 1; animation: shimmer 1.5s ease-in-out; }
```

**Reduced motion** her zaman desteklenir:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-up, .animate-fade-in, .animate-scale-in { animation: none; }
  .lift:hover { transform: none; }
}
```

---

## 5. Background (synthwave grid floor)

Anasayfa dahil tüm sayfalar için tek bir animated arka plan — sonsuza akıyor gibi grid floor, ortada glow:

```tsx
// src/components/layout/animated-blob-bg.tsx
export function AnimatedBlobBg() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#fafaf7]">
      <div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(180deg, transparent 0%, black 55%, black 100%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 55%, black 100%)",
          transform: "perspective(900px) rotateX(55deg) translateY(18%) scale(1.7)",
          transformOrigin: "center bottom",
          animation: "grid-forward 2s linear infinite",
        }}
      />
      <div
        className="absolute inset-x-0 top-1/2 h-48 -translate-y-1/2"
        style={{
          background: "radial-gradient(ellipse 70% 100% at 50% 50%, rgba(110, 231, 183, 0.30), transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-white to-transparent" />
    </div>
  );
}
```

```css
@keyframes grid-forward {
  from { background-position: 0 0; }
  to   { background-position: 0 44px; }
}
```

Layout'ta `<body>` ilk çocuğu olarak ekle. Body BG transparent kalmalı ki bu gözüksün.

---

## 6. Glass navigation (sticky header)

Header `glass` class'ı kullanır, **çok güçlü buzlu cam** efekti:

```css
.glass {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: saturate(180%) blur(48px);
  -webkit-backdrop-filter: saturate(180%) blur(48px);
}

/* Header'in altinda 40px fade overlay — yaklasan icerik kademeli buzlanir */
.glass::after {
  content: "";
  position: absolute;
  inset: 100% 0 auto 0;
  height: 40px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%);
  backdrop-filter: blur(16px);
  mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
}
```

Header kullanımı: `<header className="sticky top-0 z-50 glass border-b border-ink-200/60">`.

---

## 7. Button system

```tsx
// Primary
<Button size="lg" className="shine">CTA</Button>

// Outline
<Button size="lg" variant="outline">Secondary</Button>

// Ghost
<Button variant="ghost" size="sm">Tertiary</Button>
```

**Inline chip-button** (link gibi gözüksün ama buton hissi):

```tsx
<Link
  href="..."
  className="inline-flex items-center gap-1.5 rounded-full border border-ink-900 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-900 hover:bg-brand-50 hover:border-brand-700 hover:text-brand-700 transition-colors"
>
  Etiket
  <ArrowRight size={12} weight="bold" />
</Link>
```

**Danger CTA** (Şikayet Et gibi kritik aksiyon):

```tsx
<Link
  href="/sikayet"
  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg font-medium border bg-white text-danger-700 border-danger-300 hover:bg-danger-50 hover:border-danger-500"
>
  <Warning size={14} weight="duotone" />
  Şikayet Et
</Link>
```

---

## 8. Form inputs

```tsx
<input
  className="h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
/>
```

**Select** chevron'lu, custom dropdown indicator:

```tsx
className="h-11 w-full px-3 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=...><polyline points=...></polyline></svg>')] bg-no-repeat bg-position-[right_0.75rem_center] pr-9"
```

**Dosya yükleme dropzone** — dashed border, paperclip ikon + accent renk:

```tsx
<label
  htmlFor="evidence-input"
  className="mt-1 flex items-center gap-3 h-14 px-4 rounded-xl border border-dashed border-ink-300 bg-ink-50/40 cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition-colors text-sm text-ink-600"
>
  <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700 shrink-0">
    <ImageSquare size={18} weight="duotone" />
  </div>
  <span className="flex-1">Foto / video seç (JPG, PNG, MP4, WEBM)</span>
</label>
```

**KRİTİK**: file input'tan dosya state'e kopyalanıyorsa `e.target.value = ""` yapma — input.files'ı boşaltır ve FormData submit'te dosya gitmez. DataTransfer API ile state'i input.files'a senkron tut:

```ts
function syncInputFiles(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  input.files = dt.files;
}
```

---

## 9. ID-Card / Sicil pattern

Kullanıcı durumuna göre tone-renkli üst banner + büyük ikon + bilgi grid + opsiyonel alt bölümler:

```tsx
<div className={`relative overflow-hidden rounded-2xl bg-white border-2 ${cardBorder} shadow-card`}>
  {/* Üst banner — tone gradient */}
  <div className={`relative px-5 py-3 border-b-2 ${banner}`}>
    <div className="absolute inset-0 opacity-25 mix-blend-overlay [background:radial-gradient(80%_60%_at_50%_0%,#ffffff_0%,transparent_60%)]" />
    <div className="relative flex items-center justify-between gap-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em]">SITE · BAŞLIK</p>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
        {stampLabel}
      </span>
    </div>
  </div>

  <div className="flex flex-col sm:flex-row gap-6 p-7">
    {/* Sol: büyük ikon + ID */}
    <div className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 sm:shrink-0 sm:w-36">
      <div className={`grid h-24 w-24 place-items-center rounded-3xl ${iconBg} border-2 ${iconBorder} shadow-sm`}>
        <Icon className={`h-12 w-12 ${iconColor}`} />
      </div>
      {/* ID etiketi */}
    </div>

    {/* Sağ: durum + grid */}
    <div className="flex-1 min-w-0">
      <div className="mb-5 pb-5 border-b border-ink-200">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Durum</p>
        <p className={`text-3xl md:text-4xl font-bold tracking-tight leading-tight ${toneText}`}>{statusLabel}</p>
        <p className="text-sm text-ink-600 mt-1">{statusDesc}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{f.label}</p>
            <p className="text-base font-semibold text-ink-900">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Alt bölümler (geçmiş, kanıtlar...) — border-t-2 border-ink-900 */}
</div>
```

---

## 10. Lightbox / Modal pattern

Tam ekran kanıt göstericisi — body scroll lock + keyboard navigation:

```tsx
<div
  className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
  onClick={onClose}
  role="dialog"
  aria-modal="true"
>
  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
    <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white">
      <X className="h-5 w-5" />
    </button>
  </div>
  <div onClick={(e) => e.stopPropagation()}>
    {/* media */}
  </div>
</div>
```

Önemli: `document.body.style.overflow = "hidden"` ile arka plan scroll'u kilitle, ESC + ok tuşları event listener'la dinle.

---

## 11. Layout primitives

**container-page** — site genelinde tutarlı max-width:

```css
.container-page {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 1.5rem;
}
@media (min-width: 768px) {
  .container-page { padding-inline: 2rem; }
}
```

**Hero wash** — sayfa başlığında soft glow:

```css
.hero-wash {
  background:
    radial-gradient(80% 60% at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
    radial-gradient(60% 40% at 80% 20%, rgba(52, 211, 153, 0.06) 0%, transparent 70%),
    #ffffff;
}
```

---

## 12. Floating dekoratif kartlar (hero)

Boş alanlara dağıtılmış, yumuşak salınımlı küçük bildirim kartları:

```tsx
<div aria-hidden className="pointer-events-none">
  <FloatingCard position="top-[-8%] left-[-12%]" rotation="rotate-[-8deg]" tone="danger" ... />
  <FloatingCard position="bottom-[14%] right-[-20%]" rotation="rotate-[8deg]" tone="info" ... />
</div>
```

**Animation pattern** — outer'da `translateY`, inner'da `rotate` (iki transform farklı element'te, çakışmaz):

```css
@keyframes float-soft {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
.animate-float-soft {
  animation: float-soft 6s ease-in-out infinite;
}
```

`animationDelay` her kart için farklı (`0s`, `0.6s`, `1.2s`, `1.8s`).

---

## 13. Boyut / spacing alışkanlıkları

- **Radius**: `rounded-xl` (small), `rounded-2xl` (card), `rounded-3xl` (hero), `rounded-full` (chip/pill).
- **Padding**: kart için `p-5` (small), `p-7` (medium), `p-8 md:p-10` (large).
- **Gap**: section'lar `py-14 md:py-24`, grid kartları `gap-4 sm:gap-6`.
- **Shadows**: `shadow-soft` (subtil), `shadow-card` (default), `shadow-float` (hero).
- **Border**: kart `border border-ink-900` + sol `border-l-[3px]`. **Asla `border-ink-200` kullanma** ana kart için — siyah hairline imzadır.

---

## 14. Iconography

Phosphor Icons (`@phosphor-icons/react/dist/ssr`) — duotone weight ana stil, bold weight bazı CTA'larda.

```tsx
import { MagnifyingGlass, ShieldCheck, Warning } from "@phosphor-icons/react/dist/ssr";
<MagnifyingGlass size={18} weight="duotone" />
<ArrowRight size={14} weight="bold" />
```

Lucide ikonları da kullanılabilir (`lucide-react`), ama duotone yoktur — sadece outlined.

**Asla emoji kullanma** UI'da — tek istisna pasaport bayrağı (🇹🇷) gibi semantic bilgi.

---

## 15. Empty / loading / error states

```tsx
<EmptyState
  title="Henüz kayıt yok"
  description="İlk eklendiğinde burada görünecek."
  image="/illustration.png"  // ya da
  cta={{ label: "Aksiyona git", href: "/somewhere" }}
/>
```

Her empty state için **dedicated bir illüstrasyon** kullan (boş kutu / uyuyan goose / vs.). Sade ikondan kaçın.

---

## 16. Hover/interactive marks (opsiyonel)

Kart hover'ında başlığın altını çizen veya kelimeyi vurgulayan SVG path animasyonu. Saf "kaybolan-belirir" hissi için `pathLength={1}` + `stroke-dasharray:1; stroke-dashoffset:1 → 0` transition.

(Bu proje sonradan bunu kaldırdı çünkü çok dikkat dağıtıyordu — fakat marketing site için iyi.)

---

## 17. Mobile responsive prensipler

- Hero başlık: `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`.
- Hero resim/video: `hidden lg:block` (mobile'da gizle).
- Footer kolonlar: `grid-cols-2 sm:grid-cols-3 md:grid-cols-[1.4fr_repeat(3,1fr)]`.
- Form input + button: `flex-col sm:flex-row gap-2`.
- Kart içi resim: `h-40 w-40 mx-auto rounded-3xl object-cover` (mobile'da sığsın diye küçük + ortalı).

---

## 18. Renk × tone kombinasyonları

Hızlı referans tablo:

| Anlam       | Tone     | Border       | BG (light)   | Text         | Icon         |
| ----------- | -------- | ------------ | ------------ | ------------ | ------------ |
| OK / member | brand    | border-brand-500 | bg-brand-50  | text-brand-700 | text-brand-700 |
| Ban         | danger   | border-danger-500 | bg-danger-50 | text-danger-700 | text-danger-600 |
| Uyarı       | warning  | border-warning-500 | bg-warning-50 | text-warning-700 | text-warning-600 |
| Bilgi       | info     | border-sky-500 | bg-sky-50    | text-sky-700 | text-sky-700 |
| Default     | neutral  | border-ink-400 | bg-ink-100   | text-ink-700 | text-ink-700 |

---

## 19. Estetik prensipler

1. **Beyaz baskın, renk vurgulu** — UI'nin %80'i beyaz/krem zemin, %20'si tone-renkli accent.
2. **Siyah hairline** — tüm kart border'ları `border-ink-900`. Bu görsel imzadır.
3. **Watercolor texture** — her kartın altında soluk pastel doku (her tone farklı). Tek bir doku değil, çeşitlilik.
4. **Sıcak ama profesyonel** — animasyonlar yumuşak (cubic-bezier(0.16, 1, 0.3, 1)), hızlı (300-600ms), aşırı değil.
5. **Bilgi yoğunluklu kartlar** — etiket + büyük rakam + helper text + ikon. Tek bir bilgi tipi kartı az.
6. **Tone-aware her şey** — hover shadow, corner glow, badge, big number — hepsi tone'a uyar.
7. **Asla yarım yamalak** — bir component yapıyorsan loading/empty/error state'leri, mobile responsive ve dark mode (gerekiyorsa) dahil yap.

---

## 20. Dosya / klasör organizasyonu

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Tüm theme + custom CSS
│   ├── layout.tsx          # Root layout + ClerkProvider
│   ├── icon.png            # File-based favicon (192x192)
│   ├── apple-icon.png      # 180x180
│   ├── manifest.ts         # PWA manifest
│   └── (sayfalar)/
├── components/
│   ├── ui/                 # Genel primitives (button, card, input, badge, ...)
│   ├── layout/             # site-header, site-footer, page-hero, animated-bg
│   ├── brand/              # logo, logo-mark
│   └── (alan)/             # destek, sorgu, admin, home — sayfa-spesifik
├── lib/
│   ├── card-tones.ts       # 🔑 tone system tek dosyada
│   ├── utils.ts            # cn() + date/format helpers
│   ├── supabase/           # client + types
│   ├── auth/               # require-admin, current-user
│   └── actions/            # server actions
└── config/
    └── site.ts             # SITE.name, url, socials, description
```

---

## 21. Gerekli npm paketleri

```json
{
  "@phosphor-icons/react": "^2.x",
  "lucide-react": "^0.x",
  "framer-motion": "^12.x",
  "clsx": "^2.x",
  "tailwind-merge": "^3.x",
  "tailwindcss": "^4.x",
  "next": "^16.x",
  "react": "^19.x"
}
```

`cn` helper:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 22. Hızlı başlangıç checklist (yeni proje için)

- [ ] `@theme inline` ile renk paletini kopyala (ink + brand + danger + warning).
- [ ] Sora font yükle, body class'ına ver.
- [ ] `globals.css` animasyon ve utility class'larını kopyala (fade-up, scale-in, shine, lift, glass, container-page).
- [ ] `card-tones.ts` dosyasını kopyala, projenin alanına göre tone isimlerini değiştir.
- [ ] `AnimatedBlobBg` (grid floor) layout'a ekle.
- [ ] Sticky `glass` header + `border-ink-900` border.
- [ ] İlk kartı premium pattern'le yap, sonra varyasyonlar çıkar.
- [ ] Phosphor icons import et.

---

Bu doc bir başlangıç — gerçek proje ihtiyacına göre adapte et. Tone isimlerini (`brand` → `primary` gibi) ve renkleri (emerald → mavi/mor) projeye göre değiştirebilirsin, **yapı aynı kalır**.
