-- =============================================================================
-- Oyuncu (lobby player) sistemi.
--
-- "Üye"    = siteye kayıtlı, profiles tablosunda olan kullanıcı
-- "Oyuncu" = siteye kayıtlı OLMAYAN ama adminin lobiden topladığı bilgilerle
--            kaydettiği oyuncu (User ID + anahtar kelime + opsiyonel notlar).
--
-- Bir Oyuncu sonradan siteye kayıt olursa: aynı ggd_user_id ile profil
-- oluşunca players satırının claimed_profile_id'si set edilir, böylece
-- "Oyuncular" listesinden düşer ama tarihçesi (banlar/uyarılar — zaten
-- ggd_user_id ile çalışıyor) profile devredilir.
-- =============================================================================

create table players (
  id uuid primary key default gen_random_uuid(),
  ggd_user_id text not null unique,
  nickname text not null check (char_length(nickname) between 1 and 48),
  main_name text check (main_name is null or char_length(main_name) <= 48),
  keyword text check (keyword is null or char_length(keyword) <= 64),
  level integer check (level is null or (level >= 0 and level <= 9999)),
  notes text check (notes is null or char_length(notes) <= 2000),
  added_by uuid references profiles(id) on delete set null,
  claimed_profile_id uuid references profiles(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index players_ggd_user_id_idx on players (ggd_user_id);
create index players_unclaimed_idx on players (claimed_profile_id) where claimed_profile_id is null;
create index players_nickname_idx on players (nickname);

-- updated_at otomatik güncelle
create or replace function players_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_updated_at
  before update on players
  for each row execute function players_set_updated_at();

-- Yeni profile oluşunca eşleşen oyuncu kaydını sahiplen (claim)
create or replace function claim_player_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  player_rec players%rowtype;
begin
  if new.ggd_user_id is null or new.ggd_user_id = '' then
    return new;
  end if;

  select * into player_rec from players
   where ggd_user_id = new.ggd_user_id
     and claimed_profile_id is null
   limit 1;

  if found then
    update players
       set claimed_profile_id = new.id,
           claimed_at = now()
     where id = player_rec.id;

    -- Profil eksik alanlarını oyuncu kaydından doldur
    update profiles
       set ggd_main_name = coalesce(new.ggd_main_name, player_rec.main_name),
           ggd_level     = coalesce(new.ggd_level,     player_rec.level)
     where id = new.id;
  end if;

  return new;
end;
$$;

create trigger on_profile_created_claim_player
  after insert on profiles
  for each row execute function claim_player_record();

-- =============================================================================
-- RLS
-- =============================================================================
alter table players enable row level security;

-- Herkes okuyabilir (sicil/karaliste sorgusunda görünmeli)
create policy "players read all" on players
  for select using (true);

create policy "players admin insert" on players
  for insert with check (is_admin(auth.uid()));

create policy "players admin update" on players
  for update using (is_admin(auth.uid()));

create policy "players admin delete" on players
  for delete using (is_admin(auth.uid()));
