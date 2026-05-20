-- =============================================================================
-- GGD Level (seviye) — oyuncunun hesap seviyesi
-- Self-reported; 0-9999 arası tamsayı; opsiyonel
-- =============================================================================

alter table profiles
  add column if not exists ggd_level integer
  check (ggd_level is null or (ggd_level >= 0 and ggd_level <= 9999));

create index if not exists profiles_ggd_level_idx on profiles (ggd_level);

-- handle_new_user trigger: yeni kayıttan level'i metadata'dan al
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  level_value integer;
begin
  -- Level'i raw_user_meta_data'dan parse et (boşsa NULL kalır)
  begin
    level_value := nullif(new.raw_user_meta_data->>'ggd_level', '')::integer;
  exception when others then
    level_value := null;
  end;

  insert into profiles (
    id, email, nickname, ggd_user_id, ggd_main_name, ggd_level,
    role, verification_status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', 'oyuncu' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data->>'ggd_user_id', ''),
    new.raw_user_meta_data->>'ggd_main_name',
    level_value,
    'member',
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
