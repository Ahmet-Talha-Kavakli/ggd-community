-- =============================================================================
-- Aliases (eski/diger nick'ler) + audio kanit destegi
-- - bans/warnings/red_zone tablolarina aliases text[] kolonu
-- - ban_evidence/warning_evidence/red_zone_evidence check constraint'ine
--   'audio' eklendi
-- Idempotent.
-- =============================================================================

-- Aliases kolonu — eski/diger nick'ler
alter table bans add column if not exists aliases text[] default '{}'::text[];
alter table warnings add column if not exists aliases text[] default '{}'::text[];
alter table red_zone add column if not exists aliases text[] default '{}'::text[];

-- GIN index'leri — alias ile fuzzy search icin
create index if not exists bans_aliases_idx on bans using gin (aliases);
create index if not exists warnings_aliases_idx on warnings using gin (aliases);
create index if not exists red_zone_aliases_idx on red_zone using gin (aliases);

-- Audio media_type ekle — check constraint guncelle
do $$ begin
  alter table ban_evidence drop constraint if exists ban_evidence_media_type_check;
  alter table ban_evidence add constraint ban_evidence_media_type_check
    check (media_type in ('image', 'video', 'audio'));
exception when others then null;
end $$;

do $$ begin
  alter table warning_evidence drop constraint if exists warning_evidence_media_type_check;
  alter table warning_evidence add constraint warning_evidence_media_type_check
    check (media_type in ('image', 'video', 'audio'));
exception when others then null;
end $$;

do $$ begin
  alter table red_zone_evidence drop constraint if exists red_zone_evidence_media_type_check;
  alter table red_zone_evidence add constraint red_zone_evidence_media_type_check
    check (media_type in ('image', 'video', 'audio'));
exception when others then null;
end $$;
