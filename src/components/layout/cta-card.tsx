import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

interface CtaCardProps {
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  image?: string;
  tone?: "brand" | "ink";
}

// Apple-tarzı geniş CTA kartı, sağ tarafta yarı opak mascot illustrasyon.
// Sayfa altlarında topluluğa, sorguya, kayda yönlendirmek için kullanılır.
export function CtaCard({
  title,
  description,
  primary,
  secondary,
  image = "/goose-friendly.png",
  tone = "brand",
}: CtaCardProps) {
  const isBrand = tone === "brand";
  return (
    <section className="container-page pb-16 md:pb-20">
      <div
        className={`rounded-3xl ${
          isBrand
            ? "bg-linear-to-br from-brand-600 to-brand-700 text-white shadow-card"
            : "bg-ink-900 text-white shadow-card"
        } p-10 md:p-14 relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-20 mix-blend-overlay [background:radial-gradient(80%_60%_at_50%_0%,#ffffff_0%,transparent_60%)]" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none hidden md:block">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover object-right mix-blend-screen"
            aria-hidden
          />
        </div>
        <div className="relative max-w-2xl">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {title}
          </h3>
          <p
            className={`mt-4 text-lg ${isBrand ? "text-brand-50" : "text-ink-300"}`}
          >
            {description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={primary.href}>
              <Button
                size="lg"
                variant="secondary"
                className={
                  isBrand
                    ? "bg-white text-brand-700 hover:bg-brand-50 shine"
                    : "bg-white text-ink-900 hover:bg-ink-100"
                }
              >
                {primary.label}
                <ArrowRight size={16} weight="bold" />
              </Button>
            </Link>
            {secondary && (
              <Link href={secondary.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className={
                    isBrand
                      ? "bg-transparent border-white/30 text-white hover:bg-white/10"
                      : "bg-transparent border-white/30 text-white hover:bg-white/10"
                  }
                >
                  {secondary.label}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
