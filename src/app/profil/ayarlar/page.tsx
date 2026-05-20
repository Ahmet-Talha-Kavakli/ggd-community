import { redirect } from "next/navigation";
import { Gear, SpeakerHigh, User } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/layout/page-hero";
import { getCurrentUser } from "@/lib/auth/current-user";
import { avatarUrl } from "@/lib/avatars";
import { SoundToggle } from "@/components/settings/sound-toggle";
import { AvatarUploader } from "@/components/settings/avatar-uploader";
import { ProfileSettingsForm } from "./form";

export const metadata = { title: "Ayarlar" };

export default async function AyarlarPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/giris?next=/profil/ayarlar");

  return (
    <>
      <PageHero
        eyebrow="Ayarlar"
        title="Hesap ayarları."
        description="Profil bilgilerini, şifreni güncelle. Hesabını sil."
      />

      <section className="container-page py-14">
        <div className="grid gap-6">
          <Card className="animate-fade-up">
            <CardContent className="p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <User size={20} weight="duotone" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                  Profil resmi
                </h2>
              </div>
              <AvatarUploader
                currentUrl={avatarUrl({
                  avatarPath: current.profile.avatar_path,
                  email: current.email,
                  size: 192,
                })}
                nickname={current.nickname}
                hasUploaded={!!current.profile.avatar_path}
              />
            </CardContent>
          </Card>

          <Card className="animate-fade-up">
            <CardContent className="p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Gear size={20} weight="duotone" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                  Profil bilgileri
                </h2>
              </div>
              <ProfileSettingsForm
                defaultNickname={current.nickname}
                defaultGgd={current.profile.ggd_user_id}
                defaultMainName={current.profile.ggd_main_name ?? ""}
                defaultLevel={
                  current.profile.ggd_level != null
                    ? String(current.profile.ggd_level)
                    : ""
                }
                defaultBio={current.profile.bio ?? ""}
                email={current.email}
              />
            </CardContent>
          </Card>

          <Card className="animate-fade-up">
            <CardContent className="p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <SpeakerHigh size={20} weight="duotone" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-ink-900">
                  Görünüm & ses
                </h2>
              </div>
              <SoundToggle />
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
