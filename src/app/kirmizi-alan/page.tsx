import Link from "next/link";
import Image from "next/image";
import { Skull, Info, Calendar, ShieldAlert, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/layout/page-hero";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { RedZoneEntry } from "@/lib/supabase/types";

export const metadata = {
  title: "Kırmızı Alan",
  description:
    "Hiçbir lobiye girmemesi gereken oyuncular. Sadece bizim banımız değil — topluluk geneli tehdit.",
};
export const revalidate = 60;

export default async function KirmiziAlanPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("red_zone")
    .select(
      "id, ggd_user_id, nickname, main_name, reason, description, source, evidence_url, created_at, is_active",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const entries = (data ?? []) as Pick<
    RedZoneEntry,
    | "id"
    | "ggd_user_id"
    | "nickname"
    | "main_name"
    | "reason"
    | "description"
    | "source"
    | "evidence_url"
    | "created_at"
    | "is_active"
  >[];

  return (
    <>
      {/* Custom hero — kırmızı dramatik */}
      <section className="relative overflow-hidden border-b border-danger-200/50">
        {/* Hazard stripe top */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(45deg,#dc2626_0,#dc2626_8px,#fef2f2_8px,#fef2f2_16px)]"
        />
        <div className="absolute inset-0 bg-linear-to-br from-danger-50/50 via-white to-danger-50/30 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-danger-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative container-page py-12 md:py-16 pt-14 md:pt-20">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="animate-fade-up max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-danger-300 bg-danger-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-danger-700">
                <span className="h-1.5 w-1.5 rounded-full bg-danger-500 animate-pulse" />
                Kırmızı Alan
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-ink-900 leading-[1.05]">
                Hiçbir lobiye{" "}
                <span className="text-danger-600">girmemeliler.</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-ink-600 leading-relaxed">
                Sadece bizim banımız değil — topluluk geneli tehdit oluşturan,
                tekrarlı şiddet/hile/teaming geçmişi olan oyuncular. Eğer bu
                isimlerden birini lobinde görürsen kicklemen önerilir.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-danger-200 text-sm text-danger-700">
                <Info className="h-4 w-4" />
                <span className="font-medium">
                  Toplam{" "}
                  <span className="font-bold">{entries.length}</span> aktif kayıt
                </span>
              </div>
            </div>

            <div className="animate-scale-in stagger-2 relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none mx-auto lg:mx-0 w-full">
              <div className="absolute -inset-8 bg-danger-500/20 blur-3xl rounded-full" />
              <div className="relative overflow-hidden rounded-3xl border border-danger-300/60 shadow-card">
                <Image
                  src="/goose-red-zone.png"
                  alt="Karantina altındaki kaz — kırmızı alan"
                  width={1200}
                  height={1200}
                  className="w-full h-auto block"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hazard stripe bottom */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2 bg-[repeating-linear-gradient(45deg,#dc2626_0,#dc2626_8px,#fef2f2_8px,#fef2f2_16px)]"
        />
      </section>

      <section className="container-page py-14">
        {error && (
          <Card className="border-danger-500/30 bg-danger-50/50">
            <CardContent className="p-5 text-sm text-danger-700">
              Veri çekilirken bir hata oluştu: {error.message}
            </CardContent>
          </Card>
        )}

        {!error && entries.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                title="Kırmızı Alan boş"
                description="Şu anda topluluk geneli tehdit listesi boş. Bu iyi bir haber."
                image="/goose-sleeping.png"
              />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {entries.map((entry, i) => (
            <RedZoneCard key={entry.id} entry={entry} idx={i} />
          ))}
        </div>

        {entries.length > 0 && (
          <div className="mt-12 rounded-2xl border border-ink-200 bg-white p-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-danger-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-ink-900">
                  Bu listeye nasıl giriliyor?
                </h3>
                <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">
                  Kırmızı Alan, yönetim ekibinin manuel olarak eklediği,
                  kanıtlanmış tekrar suçlular için. Yanlış bir isim gördüğünü
                  düşünüyorsan{" "}
                  <Link
                    href="/destek"
                    className="text-brand-700 hover:text-brand-800 font-medium underline-offset-2 hover:underline"
                  >
                    destek
                  </Link>{" "}
                  üzerinden bize bildir.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function RedZoneCard({
  entry,
  idx,
}: {
  entry: Pick<
    RedZoneEntry,
    | "id"
    | "ggd_user_id"
    | "nickname"
    | "main_name"
    | "reason"
    | "description"
    | "source"
    | "evidence_url"
    | "created_at"
  >;
  idx: number;
}) {
  return (
    <div
      className={`animate-fade-up stagger-${Math.min(idx + 1, 6)} relative overflow-hidden rounded-2xl border-2 border-danger-600 shadow-[0_8px_24px_-8px_rgba(220,38,38,0.4)]`}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(45deg,#dc2626_0,#dc2626_8px,#fef2f2_8px,#fef2f2_16px)]"
      />
      <div className="relative bg-white p-6 pt-8">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-danger-600 text-white shadow-lg shadow-danger-500/30 shrink-0">
            <Skull className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-danger-700 bg-danger-50 px-2 py-0.5 rounded">
                Kırmızı Alan
              </span>
              {entry.source && (
                <>
                  <span className="text-[10px] text-ink-400">·</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-500">
                    {entry.source}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-xl font-bold text-ink-900 leading-tight break-all">
              {entry.nickname}
            </h3>
            {(entry.main_name || entry.ggd_user_id) && (
              <p className="text-xs text-ink-500 mt-0.5 font-mono break-all">
                {entry.main_name && <span>{entry.main_name}</span>}
                {entry.main_name && entry.ggd_user_id && (
                  <span className="mx-1.5 text-ink-300">·</span>
                )}
                {entry.ggd_user_id && <span>ID: {entry.ggd_user_id}</span>}
              </p>
            )}
            <p className="mt-3 text-sm font-medium text-danger-700">
              {entry.reason}
            </p>
            {entry.description && (
              <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">
                {entry.description}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-ink-500">
                <Calendar className="h-3 w-3" />
                {formatDate(entry.created_at)}
              </span>
              {entry.evidence_url && (
                <Link
                  href={entry.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-danger-700 hover:text-danger-800"
                >
                  Kanıt
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
