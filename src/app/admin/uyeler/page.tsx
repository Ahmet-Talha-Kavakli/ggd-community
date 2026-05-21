import Image from "next/image";
import { Users, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSearchInput } from "@/components/admin/admin-search-input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { avatarUrl } from "@/lib/avatars";
import { formatDate } from "@/lib/utils";
import {
  setVerificationStatusAction,
  setUserRoleAction,
} from "@/lib/actions/admin";
import { ROLE_META } from "@/lib/roles";
import type { Profile, UserRole } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Üyeler" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

function escapeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, " ").trim();
}

export default async function AdminUyelerPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const term = q ? escapeSearchTerm(q) : "";

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select(
      "id, email, nickname, ggd_user_id, ggd_main_name, ggd_level, avatar_path, role, verification_status, joined_at",
    );

  if (term) {
    query = query.or(
      `nickname.ilike.%${term}%,email.ilike.%${term}%,ggd_user_id.ilike.%${term}%,ggd_main_name.ilike.%${term}%`,
    );
  }

  const { data } = await query.order("joined_at", { ascending: false });

  const members = (data ?? []) as Pick<
    Profile,
    | "id"
    | "email"
    | "nickname"
    | "ggd_user_id"
    | "ggd_main_name"
    | "ggd_level"
    | "avatar_path"
    | "role"
    | "verification_status"
    | "joined_at"
  >[];

  const pending = members.filter((m) => m.verification_status === "pending");
  const others = members.filter((m) => m.verification_status !== "pending");

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Üyeler"
        title="Üye yönetimi"
        description="Yeni kayıtları onayla, rolleri belirle."
        backHref="/admin"
      />

      <div className="flex flex-col gap-3">
        <AdminSearchInput placeholder="Üye ara — nick, email, GGD ID, ana isim…" />
        {term && (
          <p className="text-xs text-ink-500 px-1">
            <span className="font-medium text-ink-700">
              &quot;{term}&quot;
            </span>{" "}
            için {members.length} sonuç
          </p>
        )}
      </div>

      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-warning-600 mb-3">
            Onay bekleyenler ({pending.length})
          </h2>
          <div className="grid gap-3">
            {pending.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-500 mb-3">
          Tüm üyeler ({others.length})
        </h2>
        {others.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <Users className="h-8 w-8 mx-auto text-ink-300" />
              <p className="mt-3 text-sm text-ink-500">
                {term ? `"${term}" için üye bulunamadı.` : "Henüz üye yok."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {others.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "owner", label: "Kurucu" },
  { value: "co_owner", label: "Eş-Kurucu" },
  { value: "admin", label: "Yönetici" },
  { value: "moderator", label: "Moderatör" },
  { value: "helper", label: "Yardımcı" },
  { value: "trusted", label: "Güvenilir Üye" },
  { value: "member", label: "Üye" },
];

function MemberCard({
  member,
}: {
  member: Pick<
    Profile,
    | "id"
    | "email"
    | "nickname"
    | "ggd_user_id"
    | "ggd_main_name"
    | "ggd_level"
    | "avatar_path"
    | "role"
    | "verification_status"
    | "joined_at"
  >;
}) {
  const isPending = member.verification_status === "pending";
  const isApproved = member.verification_status === "approved";
  const isRejected = member.verification_status === "rejected";
  const roleMeta = ROLE_META[member.role] ?? ROLE_META.member;
  const RoleIcon = roleMeta.icon;

  return (
    <Card>
      <CardContent className="p-5 flex flex-col md:flex-row gap-4 md:items-center">
        <Image
          src={avatarUrl({
            avatarPath: member.avatar_path,
            email: member.email,
            size: 80,
          })}
          alt={member.nickname}
          width={48}
          height={48}
          className="h-12 w-12 rounded-2xl border border-ink-200"
          unoptimized
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink-900">{member.nickname}</h3>
            {member.ggd_main_name && (
              <span className="text-xs text-ink-500">
                ({member.ggd_main_name})
              </span>
            )}
            <code className="text-xs font-mono text-ink-500 bg-ink-100 px-2 py-0.5 rounded-md">
              {member.ggd_user_id || "—"}
            </code>
            {member.ggd_level != null && (
              <Badge variant="outline">
                <span className="font-mono">Lv. {member.ggd_level}</span>
              </Badge>
            )}
            {member.role !== "member" && (
              <Badge variant={roleMeta.badge}>
                <RoleIcon size={12} weight="duotone" />
                {roleMeta.label}
              </Badge>
            )}
            {isApproved && (
              <Badge variant="success">
                <ShieldCheck className="h-3 w-3" />
                Onaylı
              </Badge>
            )}
            {isPending && <Badge variant="warning">Onay bekliyor</Badge>}
            {isRejected && <Badge variant="danger">Reddedildi</Badge>}
          </div>
          <p className="mt-1 text-xs text-ink-500">
            {member.email} · {formatDate(member.joined_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isPending && (
            <>
              <form action={setVerificationStatusAction}>
                <input type="hidden" name="user_id" value={member.id} />
                <input type="hidden" name="status" value="approved" />
                <Button type="submit" size="sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Onayla
                </Button>
              </form>
              <form action={setVerificationStatusAction}>
                <input type="hidden" name="user_id" value={member.id} />
                <input type="hidden" name="status" value="rejected" />
                <Button type="submit" size="sm" variant="outline">
                  <XCircle className="h-3.5 w-3.5" />
                  Reddet
                </Button>
              </form>
            </>
          )}
          {!isPending && (
            <form action={setUserRoleAction} className="flex gap-2 items-center">
              <input type="hidden" name="user_id" value={member.id} />
              <select
                name="role"
                defaultValue={member.role}
                className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm hover:border-ink-300 focus:border-brand-500 focus:outline-none"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="outline">
                Kaydet
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
