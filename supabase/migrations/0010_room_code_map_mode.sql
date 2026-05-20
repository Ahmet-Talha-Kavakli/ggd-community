-- =============================================================================
-- Aktif oda kodu satırına Map ve Maç türü kolonları eklendi.
-- Admin paneli hazır bir listeden seçer; anasayfada kod ile birlikte gösterilir.
-- =============================================================================

alter table room_code
  add column if not exists map text,
  add column if not exists mode text;
