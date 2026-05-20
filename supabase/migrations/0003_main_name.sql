-- =============================================================================
-- GGD iki-isim sistemi
-- - Oyuncunun "ana ismi" (account-level, Friend Code'la sabit) — değişmez
-- - Oyun içi nick (her oyun değişebilir) — şu anki target_nickname zaten bu
-- =============================================================================

-- profiles tablosu: ana isim alanı ekle (nullable, eski kayıtları bozmaz)
alter table profiles add column if not exists ggd_main_name text;

-- bans / warnings / reports: hedef oyuncunun ana ismini de tut
alter table bans     add column if not exists target_main_name text;
alter table warnings add column if not exists target_main_name text;
alter table reports  add column if not exists target_main_name text;

-- Daha iyi sorgulama için indexler
create index if not exists profiles_ggd_main_name_idx on profiles (ggd_main_name);
create index if not exists bans_target_main_name_idx  on bans (target_main_name);

-- Trigger fonksiyonunu güncelle: yeni auth.users → profiles satırında ana ismi de set et
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, nickname, ggd_user_id, ggd_main_name, role, verification_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', 'oyuncu' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data->>'ggd_user_id', ''),
    new.raw_user_meta_data->>'ggd_main_name',
    'member',
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- =============================================================================
-- Notlar
-- - Eski kayıtlarda bu alanlar NULL kalır. Admin paneli "—" gösterir.
-- - Yeni kayıtlardan itibaren her formda ana isim de istenir.
-- - target_nickname artık "oyun içi nick" anlamına gelir (anlık).
-- - target_main_name "ana isim" (kalıcı).
-- - Hedef sorgulamak için en güvenilirinden zayıfına: ggd_user_id > main_name > nickname
-- =============================================================================
