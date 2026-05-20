import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description?: string;
  cta?: { label: string; href: string };
  className?: string;
}

export function EmptyState({
  title,
  description,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <div className={`text-center py-10 px-6 ${className ?? ""}`}>
      <Image
        src="/empty-state.png"
        alt=""
        width={180}
        height={180}
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
