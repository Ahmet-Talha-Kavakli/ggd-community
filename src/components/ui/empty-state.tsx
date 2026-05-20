import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description?: string;
  cta?: { label: string; href: string };
  className?: string;
  image?: string; // public/ altında dosya yolu, örn: "/goose-sleeping.png"
  imageSize?: number; // px (default 180)
}

export function EmptyState({
  title,
  description,
  cta,
  className,
  image = "/empty-state.png",
  imageSize = 180,
}: EmptyStateProps) {
  return (
    <div className={`text-center py-10 px-6 ${className ?? ""}`}>
      <Image
        src={image}
        alt=""
        width={imageSize}
        height={imageSize}
        className="mx-auto opacity-90"
        aria-hidden
      />
      <h3 className="mt-2 font-semibold text-ink-900 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-ink-500 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      )}
      {cta && (
        <Link href={cta.href} className="inline-block mt-5">
          <Button>{cta.label}</Button>
        </Link>
      )}
    </div>
  );
}
