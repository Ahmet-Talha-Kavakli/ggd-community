-- =============================================================================
-- Anket (poll) feature — events tablosuna yeni 'poll' tipi + secenekler ve oylar
-- - event_type enum'a 'poll' ekle
-- - poll_options: anket secenekleri (event_id, label, order)
-- - poll_votes: kullanici oylari (event_id, option_id, user_id)
-- Idempotent.
-- =============================================================================

-- Enum'a poll ekle (PostgreSQL enum'a value ekleme idempotent degil — DO bloku)
do $$ begin
  alter type event_type add value if not exists 'poll';
exception
  when others then null;
end $$;

create table if not exists poll_options (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  label text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists poll_options_event_idx on poll_options(event_id);

create table if not exists poll_votes (
  event_id bigint not null references events(id) on delete cascade,
  option_id bigint not null references poll_options(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
create index if not exists poll_votes_option_idx on poll_votes(option_id);

alter table poll_options enable row level security;
alter table poll_votes enable row level security;

-- Poll options: herkes okur, sadece admin yazar/siler
drop policy if exists "poll_options: public read" on poll_options;
create policy "poll_options: public read"
  on poll_options for select using (true);
drop policy if exists "poll_options: admin write" on poll_options;
create policy "poll_options: admin write"
  on poll_options for insert with check (is_admin(auth.uid()));
drop policy if exists "poll_options: admin delete" on poll_options;
create policy "poll_options: admin delete"
  on poll_options for delete using (is_admin(auth.uid()));

-- Poll votes: herkes okur (anonim sayim), kendi oyunu yazip silebilir
drop policy if exists "poll_votes: public read" on poll_votes;
create policy "poll_votes: public read"
  on poll_votes for select using (true);
drop policy if exists "poll_votes: own insert" on poll_votes;
create policy "poll_votes: own insert"
  on poll_votes for insert with check (auth.uid() = user_id);
drop policy if exists "poll_votes: own update" on poll_votes;
create policy "poll_votes: own update"
  on poll_votes for update using (auth.uid() = user_id);
drop policy if exists "poll_votes: own delete" on poll_votes;
create policy "poll_votes: own delete"
  on poll_votes for delete using (auth.uid() = user_id);
