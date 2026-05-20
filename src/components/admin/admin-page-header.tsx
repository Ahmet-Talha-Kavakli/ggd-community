import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  backHref,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800 mb-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Geri
          </Link>
        )}
        {eyebrow && (
          <p className="text-xs font-medium text-brand-700 uppercase tracking-wider">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-ink-500 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
