"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  WarningOctagon,
  ArrowsClockwise,
  House,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Production'da Sentry vb. servise gönderebilirsin
    console.error(error);
  }, [error]);

  return (
    <section className="hero-wash flex-1 flex items-center py-16">
      <div className="container-page">
        <div className="max-w-lg mx-auto text-center animate-fade-up">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-danger-50 text-danger-600 shadow-soft">
            <WarningOctagon size={36} weight="duotone" />
          </div>
          <p className="mt-6 text-xs font-medium text-danger-600 uppercase tracking-[0.2em]">
            Bir şeyler ters gitti
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
            Hata aldık.
          </h1>
          <p className="mt-4 text-ink-500 leading-relaxed">
            Beklenmedik bir sorunla karşılaştık. Tekrar denersen büyük ihtimal
            geçer. Sorun devam ederse destek hattına yazabilirsin.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button onClick={reset}>
              <ArrowsClockwise size={16} weight="bold" />
              Tekrar dene
            </Button>
            <Link href="/">
              <Button variant="outline">
                <House size={16} weight="bold" />
                Anasayfa
              </Button>
            </Link>
          </div>

          {error.digest && (
            <Card className="mt-8 text-left">
              <CardContent className="p-4">
                <p className="text-xs text-ink-500">Hata referansı (destek için):</p>
                <code className="mt-1 block text-xs font-mono text-ink-700 break-all">
                  {error.digest}
                </code>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
