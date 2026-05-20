// Goose Goose Duck oyunundaki harita ve mod presetleri.
// Slug kalıcı, label değişebilir. Yeni map/mod eklemek için sadece bu dosyayı güncelle.

export type GgdMap = {
  slug: string;
  label: string;
  description?: string;
};

export type GgdMode = {
  slug: string;
  label: string;
  description?: string;
};

export const GGD_MAPS: GgdMap[] = [
  { slug: "kaz_sapeli", label: "Kaz Şapeli" },
  { slug: "yesilgaga", label: "Yeşilgaga" },
  { slug: "sahintepe_koyu", label: "Şahintepe Köyü" },
  { slug: "kan_cenneti", label: "Kan Cenneti" },
  { slug: "antik_kumlar", label: "Antik Kumlar" },
  { slug: "bodrum", label: "Bodrum" },
  { slug: "orman_tapinagi", label: "Orman Tapınağı" },
  { slug: "yesilbas_malikanesi", label: "Yeşilbaş Malikanesi" },
  { slug: "nexus_kolonisi", label: "Nexus Kolonisi" },
  { slug: "kara_kugu", label: "Kara Kuğu" },
  { slug: "vv_anakaz", label: "VV Anakaz" },
];

export const GGD_MODES: GgdMode[] = [
  { slug: "klasik", label: "Klasik" },
  { slug: "sirali_tasari", label: "Sıralı (Tasarı)" },
  { slug: "yozlasma", label: "Yozlaşma" },
  { slug: "kaz_avi", label: "Kaz Avı" },
  { slug: "ye_ve_tuy", label: "Ye ve Tüy" },
  { slug: "seker_mi_saka_mi", label: "Şeker mi Şaka mı" },
  { slug: "sohbet", label: "Sohbet" },
  { slug: "tadi_tavuk_gibi", label: "Tadı Tavuk Gibi" },
  { slug: "gorev_yarisi", label: "Görev Yarışı" },
  { slug: "ot_ve_ara", label: "Öt ve Ara" },
];

export function findMap(slug: string | null | undefined): GgdMap | null {
  if (!slug) return null;
  return GGD_MAPS.find((m) => m.slug === slug) ?? null;
}

export function findMode(slug: string | null | undefined): GgdMode | null {
  if (!slug) return null;
  return GGD_MODES.find((m) => m.slug === slug) ?? null;
}
