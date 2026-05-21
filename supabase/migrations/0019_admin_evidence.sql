-- =============================================================================
-- Admin tarafindan eklenen evidence (foto/video kanit) tablolari:
--   ban_evidence, warning_evidence, red_zone_evidence
-- Hepsi ayni pattern: storage_path + media_type + boyut + zaman.
-- Storage bucket: admin-evidence (Private). Dashboard'dan elle olusturulmali.
-- =============================================================================

create table if not exists ban_evidence (
  id bigserial primary key,
  ban_id bigint not null references bans(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  file_size_bytes bigint,
  created_at timestamptz not null default now()
);
create index if not exists ban_evidence_ban_idx on ban_evidence(ban_id);
alter table ban_evidence enable row level security;

create policy "ban_evidence: public read"
  on ban_evidence for select using (true);
create policy "ban_evidence: admin write"
  on ban_evidence for insert with check (is_admin(auth.uid()));
create policy "ban_evidence: admin delete"
  on ban_evidence for delete using (is_admin(auth.uid()));

create table if not exists warning_evidence (
  id bigserial primary key,
  warning_id bigint not null references warnings(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  file_size_bytes bigint,
  created_at timestamptz not null default now()
);
create index if not exists warning_evidence_warning_idx on warning_evidence(warning_id);
alter table warning_evidence enable row level security;

create policy "warning_evidence: public read"
  on warning_evidence for select using (true);
create policy "warning_evidence: admin write"
  on warning_evidence for insert with check (is_admin(auth.uid()));
create policy "warning_evidence: admin delete"
  on warning_evidence for delete using (is_admin(auth.uid()));

create table if not exists red_zone_evidence (
  id bigserial primary key,
  red_zone_id bigint not null references red_zone(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  file_size_bytes bigint,
  created_at timestamptz not null default now()
);
create index if not exists red_zone_evidence_red_zone_idx on red_zone_evidence(red_zone_id);
alter table red_zone_evidence enable row level security;

create policy "red_zone_evidence: public read active"
  on red_zone_evidence for select
  using (
    exists (
      select 1 from red_zone rz
      where rz.id = red_zone_id and rz.is_active = true
    )
  );
create policy "red_zone_evidence: admin read all"
  on red_zone_evidence for select using (is_admin(auth.uid()));
create policy "red_zone_evidence: admin write"
  on red_zone_evidence for insert with check (is_admin(auth.uid()));
create policy "red_zone_evidence: admin delete"
  on red_zone_evidence for delete using (is_admin(auth.uid()));

-- Storage bucket policy'leri (bucket: admin-evidence, Dashboard'dan once
-- olusturulmali — Private). Path: {ban|warning|red-zone}/{record_id}/{file}
create policy "admin-evidence: admin upload"
  on storage.objects for insert
  with check (bucket_id = 'admin-evidence' and is_admin(auth.uid()));

create policy "admin-evidence: public read"
  on storage.objects for select
  using (bucket_id = 'admin-evidence');

create policy "admin-evidence: admin delete"
  on storage.objects for delete
  using (bucket_id = 'admin-evidence' and is_admin(auth.uid()));
