// Grid Floor BG — synthwave-soft perspective grid + ortada glow band.
// Fixed positioned, content arkasinda, etkilesimsiz. Tum sayfada gozukur.

export function AnimatedBlobBg() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#fafaf7]"
    >
      {/* Perspective grid floor — kareler sonsuza ileri akar */}
      <div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 55%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 55%, black 100%)",
          transform:
            "perspective(900px) rotateX(55deg) translateY(18%) scale(1.7)",
          transformOrigin: "center bottom",
          animation: "grid-forward 2s linear infinite",
        }}
      />

      {/* Yatay glow band ortada — grid'i parlatir */}
      <div
        className="absolute inset-x-0 top-1/2 h-48 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 50%, rgba(110, 231, 183, 0.30), transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Ust kismi yumusatan beyaz fade — header altinda grid silinir */}
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-white to-transparent" />
    </div>
  );
}
