import {
  Crown,
  Shield,
  HandHeart,
  Star,
  User,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { UserRole } from "@/lib/supabase/types";

interface RoleMeta {
  label: string;
  description: string;
  icon: Icon;
  tone: "owner" | "admin" | "mod" | "helper" | "trusted" | "member";
  badge: "brand" | "outline" | "default";
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  owner: {
    label: "Kurucu",
    description: "Topluluğun kurucusu — her şeye yetkili",
    icon: Crown,
    tone: "owner",
    badge: "brand",
  },
  co_owner: {
    label: "Eş-Kurucu",
    description: "Kurucu kadar yetkili, ekibin omurgası",
    icon: Crown,
    tone: "owner",
    badge: "brand",
  },
  admin: {
    label: "Yönetici",
    description: "Üye, ban, uyarı, duyuru — tam yönetim",
    icon: Shield,
    tone: "admin",
    badge: "brand",
  },
  moderator: {
    label: "Moderatör",
    description: "Günlük şikayet, ban ve uyarı işlerinden sorumlu",
    icon: Shield,
    tone: "mod",
    badge: "brand",
  },
  helper: {
    label: "Yardımcı",
    description: "Şikayetleri inceleyebilir, kararı moderatöre bırakır (deneme dönemi)",
    icon: HandHeart,
    tone: "helper",
    badge: "outline",
  },
  trusted: {
    label: "Güvenilir Üye",
    description: "Uzun süredir aktif, temiz sicil — özel rozet",
    icon: Star,
    tone: "trusted",
    badge: "outline",
  },
  member: {
    label: "Üye",
    description: "Topluluk üyesi",
    icon: User,
    tone: "member",
    badge: "default",
  },
};

export const ROLE_TONE_CLASS: Record<RoleMeta["tone"], string> = {
  owner: "bg-brand-100 text-brand-800 border-brand-200",
  admin: "bg-brand-50 text-brand-700 border-brand-200",
  mod: "bg-brand-50 text-brand-700 border-brand-200",
  helper: "bg-ink-100 text-ink-700 border-ink-200",
  trusted: "bg-warning-50 text-warning-600 border-warning-500/20",
  member: "bg-ink-100 text-ink-600 border-ink-200",
};
