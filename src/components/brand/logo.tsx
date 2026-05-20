import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE } from "@/config/site";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  href?: string | null;
}

export function Logo({
  className,
  size = "md",
  showName = true,
  href = "/",
}: LogoProps) {
  const px = size === "sm" ? 28 : size === "lg" ? 48 : 36;
  const textSize = {
    sm: "text-sm",
    md: "text-[15px]",
    lg: "text-lg",
  }[size];

  const inner = (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 font-semibold tracking-tight",
        className,
      )}
    >
      <span
        className="relative overflow-hidden rounded-[10px] shadow-soft shrink-0"
        style={{ width: px, height: px }}
        aria-hidden
      >
        <Image
          src="/logo-icon.png"
          alt="GooseCage"
          width={px * 2}
          height={px * 2}
          priority
          className="w-full h-full object-cover"
        />
      </span>
      {showName && (
        <span className={cn("text-ink-900", textSize)}>{SITE.name}</span>
      )}
    </div>
  );

  if (href === null) return inner;
  return <Link href={href}>{inner}</Link>;
}
