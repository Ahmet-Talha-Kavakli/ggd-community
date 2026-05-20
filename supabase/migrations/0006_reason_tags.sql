-- =============================================================================
-- Ban / Uyarı için hazır etiket sistemi
-- Admin tek tıkla ortak sebepleri seçebilir; ayrıca freeform açıklama da yazar.
-- =============================================================================

-- bans tablosu: etiket array'i (boş kalabilir)
alter table bans
  add column if not exists reason_tags text[] not null default '{}';

-- warnings tablosu: aynı
alter table warnings
  add column if not exists reason_tags text[] not null default '{}';

-- Etikete göre sorgulama için GIN index (her bir etikete filtre çekebilmek için)
create index if not exists bans_reason_tags_idx on bans using gin (reason_tags);
create index if not exists warnings_reason_tags_idx on warnings using gin (reason_tags);

-- =============================================================================
-- Notlar:
-- - reason_tags = array of slugs (ör. ['cheat', 'stream_sniping'])
-- - reason kolonu freeform açıklama olarak kalır (opsiyonel ek detay)
-- - UI tarafında etiketler chip olarak gösterilir
-- - Etiket listesi koddadır (src/lib/preset-tags.ts) — DB'de değil
--   Böylece yeni etiket eklemek için migration gerekmez.
-- =============================================================================
