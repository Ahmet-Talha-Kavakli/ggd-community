"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

interface AdminSearchInputProps {
  placeholder?: string;
  paramName?: string;
}

export function AdminSearchInput({
  placeholder = "Ara…",
  paramName = "q",
}: AdminSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = params.get(paramName) ?? "";
  const [value, setValue] = useState(initial);

  // Debounce: 250ms input durdugunda URL'i guncelle
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      const trimmed = value.trim();
      if (trimmed) sp.set(paramName, trimmed);
      else sp.delete(paramName);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 250);
    return () => clearTimeout(t);
    // params object reference degisince re-run istemiyoruz, sadece value/paramName
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, paramName]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-9 text-sm placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Aramayı temizle"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
