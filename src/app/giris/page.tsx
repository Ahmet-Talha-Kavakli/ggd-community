import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Giriş" };

export default async function GirisPage() {
  const { userId } = await auth();
  if (userId) redirect("/");

  return (
    <section className="hero-wash flex-1 py-12 md:py-16 flex items-center">
      <div className="container-page w-full">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center max-w-5xl mx-auto">
          <div className="hidden lg:flex flex-col gap-6 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Tekrar hoş geldin
            </span>
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-ink-900 leading-[1.05]">
              Sürün
              <br />
              <span className="text-brand-600">seni bekliyor.</span>
            </h1>
            <p className="text-base text-ink-500 leading-relaxed max-w-sm">
              Giriş yap, son şikayetleri gör, sohbete katıl ve sağlıklı lobi
              keyfine devam et.
            </p>
            <div className="relative max-w-sm mt-2">
              <div className="absolute -inset-4 bg-brand-500/10 blur-3xl rounded-full" />
              <div className="relative overflow-hidden rounded-2xl border border-brand-200/40 shadow-card aspect-square">
                <video
                  src="/auth-giris-video.mp4"
                  poster="/guard.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="GooseCage — bekleyen kaz"
                  className="w-full h-full object-cover block"
                />
              </div>
            </div>
          </div>

          <div className="animate-fade-up stagger-2 w-full max-w-md mx-auto lg:max-w-none">
            <Card>
              <CardContent className="p-8 md:p-10">
                <div className="mb-7 text-center lg:text-left">
                  <h2 className="text-2xl font-bold tracking-tight text-ink-900 lg:hidden">
                    Tekrar hoş geldin.
                  </h2>
                  <h2 className="hidden lg:block text-xl font-semibold tracking-tight text-ink-900">
                    Giriş yap
                  </h2>
                  <p className="mt-2 text-sm text-ink-500">
                    Topluluğa giriş yap, sohbet et, şikayet aç.
                  </p>
                </div>

                <SignInForm />

                <p className="mt-6 text-center text-sm text-ink-500">
                  Hesabın yok mu?{" "}
                  <Link
                    href="/kayit"
                    className="font-medium text-brand-700 hover:text-brand-800"
                  >
                    Kayıt ol
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
