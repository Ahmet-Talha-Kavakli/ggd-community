-- =============================================================================
-- Kirmizi Alan — evrensel ban listesi
-- Bizim lobimizden bagimsiz; hicbir lobiye girmemesi gereken oyuncular.
-- Public read, admin write.
-- Idempotent: tekrar calistirilabilir.
-- =============================================================================

create table if not exists red_zone (
  id bigserial primary key,
  ggd_user_id text,
  nickname text not null,
  main_name text,
  reason text not null,
  description text,
  source text,
  evidence_url text,
  added_by uuid references profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists red_zone_ggd_user_id_idx on red_zone(ggd_user_id);
create index if not exists red_zone_nickname_idx on red_zone(nickname);
create index if not exists red_zone_active_idx on red_zone(is_active);

alter table red_zone enable row level security;

drop policy if exists "red_zone: public read active" on red_zone;
create policy "red_zone: public read active"
  on red_zone for select
  using (is_active = true);

drop policy if exists "red_zone: admin read all" on red_zone;
create policy "red_zone: admin read all"
  on red_zone for select
  using (is_admin(auth.uid()));

drop policy if exists "red_zone: admin insert" on red_zone;
create policy "red_zone: admin insert"
  on red_zone for insert
  with check (is_admin(auth.uid()));

drop policy if exists "red_zone: admin update" on red_zone;
create policy "red_zone: admin update"
  on red_zone for update
  using (is_admin(auth.uid()));

drop policy if exists "red_zone: admin delete" on red_zone;
create policy "red_zone: admin delete"
  on red_zone for delete
  using (is_admin(auth.uid()));
