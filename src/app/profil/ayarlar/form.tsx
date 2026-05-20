"use client";

import { useActionState } from "react";
import { useState } from "react";
import {
  CheckCircle,
  WarningCircle,
  Spinner,
  FloppyDisk,
  Key,
  Trash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import {
  updateProfileAction,
  updatePasswordAction,
  deleteAccountAction,
} from "@/lib/actions/profile";
import { INITIAL_ADMIN_STATE } from "@/lib/actions/admin-types";

export function ProfileSettingsForm({
  defaultNickname,
  defaultGgd,
  defaultMainName,
  defaultLevel,
  defaultBio,
  email,
}: {
  defaultNickname: string;
  defaultGgd: string;
  defaultMainName: string;
  defaultLevel: string;
  defaultBio: string;
  email: string;
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    INITIAL_ADMIN_STATE,
  );
  const [pwState, pwAction, pwPending] = useActionState(
    updatePasswordAction,
    INITIAL_ADMIN_STATE,
  );
  const [confirmDelete, setConfirmDelete] = useState("");

  return (
    <>
      <form action={profileAction} className="flex flex-col gap-5">
        <div>
          <Label>Email</Label>
          <Input value={email} disabled className="opacity-60" />
          <p className="mt-1 text-xs text-ink-500">
            Email değiştirmek için destek hattıyla iletişime geç.
          </p>
        </div>
        <div>
          <Label htmlFor="nickname">Site kullanıcı adın</Label>
          <Input
            id="nickname"
            name="nickname"
            defaultValue={defaultNickname}
            required
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Topluluk içinde görüneceğin nick.
          </p>
          {profileState.fieldErrors?.nickname && (
            <p className="mt-1.5 text-xs text-danger-600">
              {profileState.fieldErrors.nickname}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="ggd_main_name">GGD ana ismin</Label>
          <Input
            id="ggd_main_name"
            name="ggd_main_name"
            defaultValue={defaultMainName}
            placeholder="Hesap-seviyesi ismin"
            required
          />
          <p className="mt-1.5 text-xs text-ink-500">
            GGD&apos;de hesabınla sabit ismin (Friend Code&apos;la birlikte).
            Oyun içi nick&apos;ten farklıdır.
          </p>
          {profileState.fieldErrors?.ggd_main_name && (
            <p className="mt-1.5 text-xs text-danger-600">
              {profileState.fieldErrors.ggd_main_name}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="ggd_user_id">GGD Friend Code / User ID</Label>
          <Input
            id="ggd_user_id"
            name="ggd_user_id"
            defaultValue={defaultGgd}
            className="font-mono"
            required
          />
          {profileState.fieldErrors?.ggd_user_id && (
            <p className="mt-1.5 text-xs text-danger-600">
              {profileState.fieldErrors.ggd_user_id}
            </p>
          )}
          <p className="mt-1.5 text-xs text-warning-600">
            ⚠️ Friend Code veya ana ismini değiştirirsen hesabın yeniden onay
            bekleyecek.
          </p>
        </div>
        <div>
          <Label htmlFor="ggd_level">GGD Level (opsiyonel)</Label>
          <Input
            id="ggd_level"
            name="ggd_level"
            type="number"
            min={0}
            max={9999}
            defaultValue={defaultLevel}
            placeholder="örn. 42"
            className="font-mono w-32"
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Şu anki GGD hesap seviyen. Level atladıkça güncelle.
          </p>
          {profileState.fieldErrors?.ggd_level && (
            <p className="mt-1.5 text-xs text-danger-600">
              {profileState.fieldErrors.ggd_level}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="bio">Bio (opsiyonel)</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={defaultBio}
            maxLength={280}
            placeholder="Kendinden bahset..."
          />
        </div>

        {profileState.error && (
          <Notice tone="danger">{profileState.error}</Notice>
        )}
        {profileState.ok && profileState.message && (
          <Notice tone="brand">{profileState.message}</Notice>
        )}

        <Button type="submit" disabled={profilePending} className="self-start">
          {profilePending ? (
            <>
              <Spinner size={16} className="animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <FloppyDisk size={16} weight="bold" />
              Kaydet
            </>
          )}
        </Button>
      </form>

      <hr className="my-8 border-ink-200" />

      <h3 className="text-lg font-semibold tracking-tight text-ink-900 mb-5 flex items-center gap-2">
        <Key size={20} weight="duotone" className="text-brand-600" />
        Şifre Değiştir
      </h3>

      <form action={pwAction} className="flex flex-col gap-5">
        <div>
          <Label htmlFor="current_password">Mevcut şifre</Label>
          <Input
            id="current_password"
            name="current_password"
            type="password"
            placeholder="Şu anki şifren"
            autoComplete="current-password"
            required
          />
          {pwState.fieldErrors?.current_password && (
            <p className="mt-1.5 text-xs text-danger-600">
              {pwState.fieldErrors.current_password}
            </p>
          )}
          <p className="mt-1.5 text-xs text-ink-500">
            Güvenlik için doğrulama yapıyoruz.
          </p>
        </div>
        <div>
          <Label htmlFor="new_password">Yeni şifre</Label>
          <Input
            id="new_password"
            name="new_password"
            type="password"
            placeholder="En az 8 karakter"
            autoComplete="new-password"
            required
          />
          {pwState.fieldErrors?.new_password && (
            <p className="mt-1.5 text-xs text-danger-600">
              {pwState.fieldErrors.new_password}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="confirm_password">Tekrar yaz</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
          />
          {pwState.fieldErrors?.confirm_password && (
            <p className="mt-1.5 text-xs text-danger-600">
              {pwState.fieldErrors.confirm_password}
            </p>
          )}
        </div>

        {pwState.error && <Notice tone="danger">{pwState.error}</Notice>}
        {pwState.ok && pwState.message && (
          <Notice tone="brand">{pwState.message}</Notice>
        )}

        <Button type="submit" disabled={pwPending} className="self-start">
          {pwPending ? (
            <>
              <Spinner size={16} className="animate-spin" />
              Güncelleniyor...
            </>
          ) : (
            "Şifreyi Güncelle"
          )}
        </Button>
      </form>

      <hr className="my-8 border-danger-200" />

      <h3 className="text-lg font-semibold tracking-tight text-danger-700 mb-3 flex items-center gap-2">
        <Trash size={20} weight="duotone" />
        Tehlikeli bölge
      </h3>
      <p className="text-sm text-ink-600 mb-4 leading-relaxed">
        Hesabını silersen profil, şikayetlerin ve mesajların geri alınamaz.
        Onaylamak için kullanıcı adını aşağıya yaz: <strong>{defaultNickname}</strong>
      </p>
      <div className="flex gap-2 items-center">
        <Input
          value={confirmDelete}
          onChange={(e) => setConfirmDelete(e.target.value)}
          placeholder="Kullanıcı adını yaz"
          className="max-w-xs"
        />
        <form action={deleteAccountAction}>
          <Button
            type="submit"
            variant="danger"
            disabled={confirmDelete !== defaultNickname}
          >
            Hesabımı Sil
          </Button>
        </form>
      </div>
    </>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "brand" | "danger";
  children: React.ReactNode;
}) {
  const cls =
    tone === "brand"
      ? "border-brand-200 bg-brand-50 text-brand-800"
      : "border-danger-500/20 bg-danger-50 text-danger-700";
  const Icon = tone === "brand" ? CheckCircle : WarningCircle;
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${cls}`}
    >
      <Icon size={16} weight="duotone" className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
