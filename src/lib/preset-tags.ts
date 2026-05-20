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
  Clock,
  MicrophoneSlash,
  Question,
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

export const PRESET_TAGS: PresetTag[] = [
  // ─── Ağır ihlaller (genelde ban) ─────────────────────────────────────────
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
    description: "Ban atlatmak veya avantaj için ikinci hesap",
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

  // ─── Orta seviye (ban veya uyarı) ────────────────────────────────────────
  {
    slug: "stream_sniping",
    label: "Stream sniping",
    description: "Yayıncıyı izleyerek meta-game",
    icon: EyeSlash,
    tone: "danger",
    scope: "both",
  },
  {
    slug: "sabotage",
    label: "Takım sabotajı",
    description: "Kasıtlı olarak kendi takımına zarar verme",
    icon: Handshake,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "insult",
    label: "Hakaret",
    description: "Küfür, hakaret, aşağılayıcı dil",
    icon: ChatCenteredText,
    tone: "warning",
    scope: "both",
  },
  {
    slug: "spam_chat",
    label: "Chat spam",
    description: "Yazılı/sözlü sohbette spam",
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
  {
    slug: "rule_violation",
    label: "Kural ihlali",
    description: "Diğer topluluk kurallarını çiğneme",
    icon: Scales,
    tone: "warning",
    scope: "both",
  },

  // ─── Hafif (genelde uyarı) ──────────────────────────────────────────────
  {
    slug: "mic_spam",
    label: "Mikrofon spam",
    description: "Yüksek ses, müzik, gürültü",
    icon: SpeakerHigh,
    tone: "warning",
    scope: "warning",
  },
  {
    slug: "afk",
    label: "AFK",
    description: "Oyun başlamış, oyuncu yok",
    icon: Clock,
    tone: "default",
    scope: "warning",
  },
  {
    slug: "no_mic",
    label: "Mikrofonsuz",
    description: "Oyun mikrofon gerektirirken sessiz oyun",
    icon: MicrophoneSlash,
    tone: "default",
    scope: "warning",
  },
  {
    slug: "didnt_read_rules",
    label: "Kuralları okumamış",
    description: "Yeni gelmiş, kuralları bilmiyor",
    icon: Question,
    tone: "default",
    scope: "warning",
  },
];

export function tagsForScope(scope: "ban" | "warning"): PresetTag[] {
  return PRESET_TAGS.filter((t) => t.scope === scope || t.scope === "both");
}

export function findTag(slug: string): PresetTag | undefined {
  return PRESET_TAGS.find((t) => t.slug === slug);
}
