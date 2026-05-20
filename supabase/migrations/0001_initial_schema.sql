-- =============================================================================
-- GGD Topluluk — İlk şema
-- Bu dosyayı Supabase Dashboard → SQL Editor → New query'ye yapıştır ve "Run".
-- =============================================================================

-- ENUM tipleri ------------------------------------------------------------------
create type user_role as enum ('owner', 'moderator', 'member');
create type verification_status as enum ('pending', 'approved', 'rejected');
create type ban_duration as enum ('permanent', '7d', '30d', '90d');
create type warning_severity as enum ('low', 'medium', 'high');
create type report_status as enum ('pending', 'investigating', 'resolved', 'rejected');
create type report_category as enum ('insult', 'sabotage', 'cheat', 'spam', 'stream_sniping', 'other');

-- 1) profiles -------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nickname text not null unique check (char_length(nickname) between 2 and 24),
  ggd_user_id text not null,
  role user_role not null default 'member',
  verification_status verification_status not null default 'pending',
  bio text,
  joined_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);
create index profiles_ggd_user_id_idx on profiles (ggd_user_id);
create index profiles_role_idx on profiles (role);
create index profiles_verification_status_idx on profiles (verification_status);

-- 2) bans (kara liste) ---------------------------------------------------------
create table bans (
  id bigint generated always as identity primary key,
  ggd_user_id text not null,
  target_nickname text not null,
  reason text not null,
  duration ban_duration not null default 'permanent',
  expires_at timestamptz,
  banned_by uuid not null references profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index bans_ggd_user_id_idx on bans (ggd_user_id);
create index bans_active_idx on bans (is_active) where is_active = true;

-- 3) warnings (uyarılar) -------------------------------------------------------
create table warnings (
  id bigint generated always as identity primary key,
  ggd_user_id text not null,
  target_nickname text not null,
  reason text not null,
  severity warning_severity not null default 'low',
  issued_by uuid not null references profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index warnings_ggd_user_id_idx on warnings (ggd_user_id);
create index warnings_active_idx on warnings (is_active) where is_active = true;

-- 4) reports (şikayetler) ------------------------------------------------------
create table reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references profiles(id) on delete set null,
  target_ggd_user_id text not null,
  target_nickname text not null,
  category report_category not null,
  description text not null,
  status report_status not null default 'pending',
  resolution_note text,
  resolved_by uuid references profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index reports_reporter_idx on reports (reporter_id);
create index reports_status_idx on reports (status);
create index reports_target_idx on reports (target_ggd_user_id);

-- 5) report_evidence (şikayet kanıtları) ---------------------------------------
create table report_evidence (
  id bigint generated always as identity primary key,
  report_id bigint not null references reports(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  file_size_bytes int,
  created_at timestamptz not null default now()
);
create index report_evidence_report_idx on report_evidence (report_id);

-- 6) channels (chat kanalları) -------------------------------------------------
create table channels (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text,
  locked boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- 7) messages (chat mesajları) -------------------------------------------------
create table messages (
  id bigint generated always as identity primary key,
  channel_id bigint not null references channels(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_channel_created_idx on messages (channel_id, created_at desc);
create index messages_author_idx on messages (author_id);

-- 8) announcements (duyurular) -------------------------------------------------
create table announcements (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  tag text not null default 'genel',
  pinned boolean not null default false,
  author_id uuid not null references profiles(id),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index announcements_published_idx on announcements (published_at desc);
create index announcements_pinned_idx on announcements (pinned) where pinned = true;

-- 9) room_code (aktif lobi oda kodu — tek satırlık tablo) ----------------------
create table room_code (
  id smallint primary key default 1 check (id = 1),
  code text not null default '' check (char_length(code) <= 16),
  note text,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);
insert into room_code (id, code) values (1, '') on conflict do nothing;

-- 10) audit_log (admin işlem kayıtları) ---------------------------------------
create table audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_actor_idx on audit_log (actor_id);
create index audit_log_action_idx on audit_log (action);
create index audit_log_created_idx on audit_log (created_at desc);

-- 11) support_tickets (destek talepleri) ---------------------------------------
create table support_tickets (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete set null,
  contact_email text,
  subject text not null,
  body text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  handled_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index support_tickets_status_idx on support_tickets (status);

-- =============================================================================
-- Yardımcı fonksiyonlar
-- =============================================================================

-- Bir kullanıcı admin mi? (owner veya moderator)
create or replace function is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = uid and role in ('owner', 'moderator')
  );
$$;

-- Yeni auth.user oluşunca otomatik profil oluştur
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, nickname, ggd_user_id, role, verification_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', 'oyuncu' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data->>'ggd_user_id', ''),
    'member',
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table profiles enable row level security;
alter table bans enable row level security;
alter table warnings enable row level security;
alter table reports enable row level security;
alter table report_evidence enable row level security;
alter table channels enable row level security;
alter table messages enable row level security;
alter table announcements enable row level security;
alter table room_code enable row level security;
alter table audit_log enable row level security;
alter table support_tickets enable row level security;

-- profiles ---------------------------------------------------------------------
create policy "profiles read all" on profiles
  for select using (true);

create policy "profile owner update" on profiles
  for update using (auth.uid() = id);

create policy "admin update any profile" on profiles
  for update using (is_admin(auth.uid()));

-- bans -------------------------------------------------------------------------
create policy "bans read all" on bans
  for select using (true);

create policy "bans admin insert" on bans
  for insert with check (is_admin(auth.uid()));

create policy "bans admin update" on bans
  for update using (is_admin(auth.uid()));

create policy "bans admin delete" on bans
  for delete using (is_admin(auth.uid()));

-- warnings ---------------------------------------------------------------------
create policy "warnings read all" on warnings
  for select using (true);

create policy "warnings admin insert" on warnings
  for insert with check (is_admin(auth.uid()));

create policy "warnings admin update" on warnings
  for update using (is_admin(auth.uid()));

create policy "warnings admin delete" on warnings
  for delete using (is_admin(auth.uid()));

-- reports ----------------------------------------------------------------------
create policy "reports read own or admin" on reports
  for select using (auth.uid() = reporter_id or is_admin(auth.uid()));

create policy "reports member insert" on reports
  for insert with check (
    auth.uid() = reporter_id
    and exists (select 1 from profiles where id = auth.uid() and verification_status = 'approved')
  );

create policy "reports admin update" on reports
  for update using (is_admin(auth.uid()));

-- report_evidence --------------------------------------------------------------
create policy "evidence read own or admin" on report_evidence
  for select using (
    exists (
      select 1 from reports r
      where r.id = report_evidence.report_id
        and (r.reporter_id = auth.uid() or is_admin(auth.uid()))
    )
  );

create policy "evidence reporter insert" on report_evidence
  for insert with check (
    exists (
      select 1 from reports r
      where r.id = report_evidence.report_id and r.reporter_id = auth.uid()
    )
  );

-- channels ---------------------------------------------------------------------
create policy "channels read all" on channels
  for select using (true);

create policy "channels admin write" on channels
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- messages ---------------------------------------------------------------------
create policy "messages read approved members" on messages
  for select using (
    exists (select 1 from profiles where id = auth.uid() and verification_status = 'approved')
    or is_admin(auth.uid())
  );

create policy "messages member insert in unlocked" on messages
  for insert with check (
    author_id = auth.uid()
    and (
      is_admin(auth.uid())
      or (
        exists (select 1 from profiles where id = auth.uid() and verification_status = 'approved')
        and not exists (select 1 from channels c where c.id = messages.channel_id and c.locked)
      )
    )
  );

create policy "messages author update own" on messages
  for update using (author_id = auth.uid());

create policy "messages admin delete" on messages
  for delete using (is_admin(auth.uid()));

-- announcements ----------------------------------------------------------------
create policy "announcements read all" on announcements
  for select using (true);

create policy "announcements admin write" on announcements
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- room_code --------------------------------------------------------------------
create policy "room_code read all" on room_code
  for select using (true);

create policy "room_code admin update" on room_code
  for update using (is_admin(auth.uid()));

-- audit_log --------------------------------------------------------------------
create policy "audit_log admin read" on audit_log
  for select using (is_admin(auth.uid()));

-- support_tickets --------------------------------------------------------------
create policy "support_tickets read own or admin" on support_tickets
  for select using (user_id = auth.uid() or is_admin(auth.uid()));

create policy "support_tickets anyone insert" on support_tickets
  for insert with check (true);

create policy "support_tickets admin update" on support_tickets
  for update using (is_admin(auth.uid()));

-- =============================================================================
-- Realtime — chat ve duyurular için
-- =============================================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table announcements;
alter publication supabase_realtime add table room_code;

-- =============================================================================
-- Seed verisi
-- =============================================================================

insert into channels (slug, name, description, locked, position) values
  ('genel',       'genel',       'Topluluk sohbeti, oyun dışı muhabbet', false, 1),
  ('lobi-arama',  'lobi-arama',  'Boş lobi arayanlar buluşur',            false, 2),
  ('sikayet',     'şikayet',     'Şikayet süreçlerinin tartışıldığı kanal', false, 3),
  ('duyuru',      'duyuru',      'Sadece yönetim mesaj atabilir',          true,  4)
on conflict (slug) do nothing;
