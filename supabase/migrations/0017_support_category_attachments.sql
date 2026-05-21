-- =============================================================================
-- Destek formuna kategori + dosya eki ekle
-- - support_tickets.category enum kolonu
-- - support_attachments tablosu (storage path'leri)
-- - support-attachments bucket policy'leri
-- Bucket'i once Supabase Dashboard'dan olustur: support-attachments (Private)
-- =============================================================================

-- Kategori enum'u
create type support_category as enum (
  'ban_appeal',
  'account_approval',
  'account_issue',
  'bug_report',
  'general'
);

alter table support_tickets
  add column if not exists category support_category not null default 'general';

-- Attachment tablosu
create table if not exists support_attachments (
  id bigserial primary key,
  ticket_id bigint not null references support_tickets(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  file_size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists support_attachments_ticket_idx
  on support_attachments(ticket_id);

alter table support_attachments enable row level security;

-- Ticket sahibi (anonim ise yalnizca uploader oturum guvenlik token'i ile)
-- veya admin okur. Bu projede admin gorur, kullanici kendi ekini gorur.
create policy "support_attachments: owner or admin read"
  on support_attachments for select
  using (
    is_admin(auth.uid())
    or exists (
      select 1 from support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );

create policy "support_attachments: owner insert"
  on support_attachments for insert
  with check (
    exists (
      select 1 from support_tickets t
      where t.id = ticket_id
        and (t.user_id = auth.uid() or t.user_id is null)
    )
  );

create policy "support_attachments: admin delete"
  on support_attachments for delete
  using (is_admin(auth.uid()));

-- Storage policy'leri (bucket: support-attachments)
-- Path: {user_id_or_anon}/{ticket_id}/{filename}
create policy "support-attachments: authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'support-attachments'
    and (
      auth.uid() is not null
      and (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy "support-attachments: owner or admin read"
  on storage.objects for select
  using (
    bucket_id = 'support-attachments'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or is_admin(auth.uid())
    )
  );

create policy "support-attachments: admin delete"
  on storage.objects for delete
  using (bucket_id = 'support-attachments' and is_admin(auth.uid()));
