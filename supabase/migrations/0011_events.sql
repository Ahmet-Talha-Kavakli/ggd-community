-- =============================================================================
-- Etkinlikler (events) sistemi.
--
-- Adminler etkinlik oluşturur: çekiliş, turnuva, topluluk buluşması vb.
-- Onaylı üyeler katılabilir. Çekilişlerde admin kazananı manuel veya rastgele
-- seçer.
-- =============================================================================

create type event_type as enum ('raffle', 'tournament', 'community', 'other');
create type event_status as enum (
  'draft',
  'published',
  'ongoing',
  'completed',
  'cancelled'
);

create table events (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) between 3 and 160),
  description text not null check (char_length(description) between 10 and 4000),
  type event_type not null default 'raffle',
  status event_status not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz,
  prize text check (prize is null or char_length(prize) <= 240),
  max_participants integer check (max_participants is null or max_participants > 0),
  winner_id uuid references profiles(id) on delete set null,
  created_by uuid not null references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_status_idx on events (status);
create index events_starts_at_idx on events (starts_at desc);
create index events_created_by_idx on events (created_by);

-- updated_at otomatik güncelle
create or replace function events_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_updated_at
  before update on events
  for each row execute function events_set_updated_at();

-- ----------------------------------------------------------------------------
-- event_participants (üye ↔ etkinlik katılımı)
-- ----------------------------------------------------------------------------
create table event_participants (
  event_id bigint not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index event_participants_user_idx on event_participants (user_id);

-- =============================================================================
-- RLS
-- =============================================================================
alter table events enable row level security;
alter table event_participants enable row level security;

-- events ---------------------------------------------------------------------
-- Yayınlanan etkinlikleri herkes görebilir; taslakları sadece admin
create policy "events read published or admin" on events
  for select using (
    status <> 'draft' or is_admin(auth.uid())
  );

create policy "events admin insert" on events
  for insert with check (is_admin(auth.uid()));

create policy "events admin update" on events
  for update using (is_admin(auth.uid()));

create policy "events admin delete" on events
  for delete using (is_admin(auth.uid()));

-- event_participants ---------------------------------------------------------
-- Katılımları herkes görebilir (kim katıldı şeffaf olsun)
create policy "event_participants read all" on event_participants
  for select using (true);

-- Onaylı üyeler yayınlanan/ongoing etkinliğe kendileri için katılım ekleyebilir
create policy "event_participants self insert" on event_participants
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from profiles
       where id = auth.uid() and verification_status = 'approved'
    )
    and exists (
      select 1 from events e
       where e.id = event_id and e.status in ('published', 'ongoing')
    )
  );

-- Kendi katılımını üye iptal edebilir
create policy "event_participants self delete" on event_participants
  for delete using (auth.uid() = user_id);

-- Admin her zaman silebilir (cleanup/moderation için)
create policy "event_participants admin delete" on event_participants
  for delete using (is_admin(auth.uid()));

-- =============================================================================
-- Realtime
-- =============================================================================
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table event_participants;
