-- =============================================================================
-- pg_trgm extension + GIN index'leri — fuzzy search "sunu mu demek istediniz?"
-- icin. Levenshtein/similarity benzer isimleri buluyor.
-- Idempotent.
-- =============================================================================

create extension if not exists pg_trgm;

-- Profiles
create index if not exists profiles_nickname_trgm_idx
  on profiles using gin (nickname gin_trgm_ops);
create index if not exists profiles_main_name_trgm_idx
  on profiles using gin (ggd_main_name gin_trgm_ops);

-- Players
create index if not exists players_nickname_trgm_idx
  on players using gin (nickname gin_trgm_ops);
create index if not exists players_main_name_trgm_idx
  on players using gin (main_name gin_trgm_ops);

-- Ban / warning target_nickname trgm (kayitsiz oyuncu da fuzzy match icin)
create index if not exists bans_target_nickname_trgm_idx
  on bans using gin (target_nickname gin_trgm_ops);
create index if not exists warnings_target_nickname_trgm_idx
  on warnings using gin (target_nickname gin_trgm_ops);
