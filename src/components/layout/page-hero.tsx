import Image from "next/image";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  align = "left",
  className,
  image,
}: PageHeroProps) {
  if (image) {
    return (
      <section className={cn("hero-wash border-b border-ink-200/50", className)}>
        <div className="container-page py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="animate-fade-up max-w-2xl">
              {eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {eyebrow}
                </span>
              )}
              <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 leading-[1.05]">
                {title}
              </h1>
              {description && (
                <p className="mt-4 text-lg text-ink-500 leading-relaxed">
                  {description}
                </p>
              )}
              {children && <div className="mt-7">{children}</div>}
            </div>
            <div className="animate-scale-in stagger-2 relative">
              <div className="absolute -inset-4 bg-brand-500/10 blur-3xl rounded-full" />
              <div className="relative overflow-hidden rounded-3xl border border-brand-200/40 shadow-card">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width ?? 1200}
                  height={image.height ?? 900}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("hero-wash border-b border-ink-200/50", className)}>
      <div
        className={cn(
          "container-page py-16 md:py-24",
          align === "center" && "text-center",
        )}
      >
        <div
          className={cn(
            "max-w-3xl flex flex-col gap-5",
            align === "center" && "mx-auto items-center",
          )}
        >
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              {eyebrow}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 leading-[1.05]">
            {title}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-ink-500 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}
