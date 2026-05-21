-- =============================================================================
-- Ban / Warning / Red Zone tablolarina ggd_level kolonu ekle (opsiyonel).
-- Admin form'da "Oyuncunun level'i" girilebilsin diye.
-- Idempotent.
-- =============================================================================

alter table bans add column if not exists ggd_level int check (ggd_level > 0 and ggd_level < 10000);
alter table warnings add column if not exists ggd_level int check (ggd_level > 0 and ggd_level < 10000);
alter table red_zone add column if not exists ggd_level int check (ggd_level > 0 and ggd_level < 10000);
