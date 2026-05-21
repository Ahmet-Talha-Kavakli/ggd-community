import type { Icon } from "@phosphor-icons/react";
import {
  Prohibit,
  EyeSlash,
  ChatCenteredText,
  Handshake,
  TextAa,
  UsersThree,
  Megaphone,
  Warning,
  SpeakerHigh,
  UserCircleDashed,
  Robot,
  Scales,
  Crown,
  MaskHappy,
  MicrophoneStage,
  Bell,
  ArrowsOutCardinal,
  Footprints,
  Knife,
  MusicNotes,
  WaveSawtooth,
} from "@phosphor-icons/react/dist/ssr";

export interface PresetTag {
  slug: string;
  label: string;
  description: string;
  icon: Icon;
  tone: "danger" | "warning" | "default";
  /** Hangi bağlamda göster: ban formu, uyarı formu veya her ikisi */
  scope: "ban" | "warning" | "both";
}

// Goosecage 16 lobi kuralı + evrensel ihlaller. Kural numarası açıklamada.
export const PRESET_TAGS: PresetTag[] = [
  // ─── Kanadalı & Ünlü kuralları (Kural 1, 2, 3, 8, 11) ─────────────────────
  {
    slug: "kanadali_unlu_yalan",
    label: "Kanadalı/Ünlü yalanı",
    description: "Kural 1: Kanadalı veya ünlü yalanı yasak",
    icon: MaskHappy,
    tone: "danger",
    scope: "both",
  },
  {
    slug: "rol_vermeme_zorunlu",
    label: "Rol vermeme (zorunlu)",
    description: "Kural 2 & 7: İstenildiğinde 2 rol vermeme",
    icon: Crown,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "unlu_yapma_ihlali",
    label: "Ünlü yapma ihlali",
    description: "Kural 3: Tur yazmama / 5-7 kişi olmadan ünlü",
    icon: Crown,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "unlu_belli_etme",
    label: "Ünlü ifşa / belli etme",
    description: "Kural 8: Ünlüyü ölünce belli etmek / sormak",
    icon: EyeSlash,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "kanadali_report_asilmamis",
    label: "Kanadalı report → asılmama",
    description: "Kural 11: Kanadalıyı reportlayan asılmak zorunda",
    icon: MaskHappy,
    tone: "warning",
    scope: "both",
  },

  // ─── Oylama & Sohbet düzeni (Kural 5, 7, 10) ─────────────────────────────
  {
    slug: "soz_kesme",
    label: "Söz kesme / bastırma",
    description: "Kural 5: Oylamada söz kesme, izinsiz konuşma",
    icon: ChatCenteredText,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "oylama_duzeni",
    label: "Oylama düzeni ihlali",
    description: "Kural 10: Konuşma sırası kurallarına uymama",
    icon: Scales,
    tone: "warning",
    scope: "warning",
  },

  // ─── Oyun içi davranış (Kural 4, 6, 12, 13, 14) ──────────────────────────
  {
    slug: "bos_info_zil",
    label: "Boş info / zile basma",
    description: "Kural 4: Yalan info/zil (bomba, güvercin vs.)",
    icon: Bell,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "fazla_gezme",
    label: "Fazla gezme (3+/2+)",
    description: "Kural 6: 3+ veya az kişide 2+ gezme yasak",
    icon: ArrowsOutCardinal,
    tone: "warning",
    scope: "warning",
  },
  {
    slug: "takip_darlamak",
    label: "Takip / darlamak",
    description: "Kural 12: Masum takip, darlamak, sıkıştırmak",
    icon: Footprints,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "infosuz_kesme",
    label: "İnfosuz kesme",
    description: "Kural 13: Kesici rolün infosuz masum kesmesi",
    icon: Knife,
    tone: "warning",
    scope: "both",
  },

  // ─── Kalıcı ban (Kural 15) ───────────────────────────────────────────────
  {
    slug: "teaming",
    label: "Teaming",
    description: "Kural 15: KALICI ban — takım kurma",
    icon: Handshake,
    tone: "danger",
    scope: "ban",
  },

  // ─── Ses & Mikrofon (Kural 16) ───────────────────────────────────────────
  {
    slug: "muzik_acma",
    label: "Müzik açma",
    description: "Kural 16: Lobide / oyunda müzik açmak",
    icon: MusicNotes,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "soundpad_yukseltici",
    label: "Soundpad / yükseltici",
    description: "Kural 16: Soundpad veya ses yükseltici",
    icon: WaveSawtooth,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "mic_spam",
    label: "Mikrofon spam / gürültü",
    description: "Yüksek ses, gürültü, sürekli bağırma",
    icon: SpeakerHigh,
    tone: "warning",
    scope: "warning",
  },

  // ─── Evrensel ağır ihlaller (kurallar dışı genel) ────────────────────────
  {
    slug: "cheat",
    label: "Hile / Cheat",
    description: "Mod, cheat veya scripting kullanımı",
    icon: Prohibit,
    tone: "danger",
    scope: "ban",
  },
  {
    slug: "multi_account",
    label: "Çoklu hesap",
    description: "Ban atlatmak için ikinci hesap",
    icon: UsersThree,
    tone: "danger",
    scope: "ban",
  },
  {
    slug: "impersonation",
    label: "Kimlik taklidi",
    description: "Başka oyuncu/admin gibi davranma",
    icon: UserCircleDashed,
    tone: "danger",
    scope: "ban",
  },
  {
    slug: "bot",
    label: "Bot / script",
    description: "Otomatik araç kullanımı",
    icon: Robot,
    tone: "danger",
    scope: "ban",
  },
  {
    slug: "threat_harassment",
    label: "Tehdit / Taciz",
    description: "Kişisel tehdit, taciz veya doxxing",
    icon: Warning,
    tone: "danger",
    scope: "both",
  },
  {
    slug: "stream_sniping",
    label: "Stream sniping",
    description: "Yayıncıyı izleyerek meta-game",
    icon: EyeSlash,
    tone: "danger",
    scope: "both",
  },
  {
    slug: "insult",
    label: "Hakaret / küfür",
    description: "Küfür, hakaret, aşağılayıcı dil",
    icon: ChatCenteredText,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "spam_chat",
    label: "Chat spam",
    description: "Yazılı sohbette spam",
    icon: TextAa,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "ad_promotion",
    label: "Reklam",
    description: "İstenmeyen kanal/Discord/site tanıtımı",
    icon: Megaphone,
    tone: "warning",
    scope: "both",
  },

  // ─── Otomatik (sistem kullanır) ──────────────────────────────────────────
  {
    slug: "uyari-birikimi",
    label: "Uyarı birikimi (otomatik)",
    description: "3 aktif uyarı → otomatik 30g ban",
    icon: MicrophoneStage,
    tone: "danger",
    scope: "ban",
  },
];

export function tagsForScope(scope: "ban" | "warning"): PresetTag[] {
  return PRESET_TAGS.filter(
    (t) => t.scope === scope || t.scope === "both",
  ).filter((t) => t.slug !== "uyari-birikimi");
}

export function findTag(slug: string): PresetTag | undefined {
  return PRESET_TAGS.find((t) => t.slug === slug);
}
