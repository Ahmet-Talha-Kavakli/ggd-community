-- =============================================================================
-- Storage bucket'ları ve policy'leri
-- Önce Supabase Dashboard → Storage'da iki bucket oluştur (UI'dan):
--   1. report-evidence (Private)
--   2. announcement-media (Public)
-- Sonra bu SQL'i çalıştır.
-- =============================================================================

-- report-evidence: sadece şikayeti yazan + adminler okuyabilir
-- Path konvansiyonu: report-evidence/{user_id}/{report_id}/{filename}

create policy "evidence: reporter upload"
  on storage.objects for insert
  with check (
    bucket_id = 'report-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evidence: reporter or admin read"
  on storage.objects for select
  using (
    bucket_id = 'report-evidence'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or is_admin(auth.uid())
    )
  );

create policy "evidence: admin delete"
  on storage.objects for delete
  using (bucket_id = 'report-evidence' and is_admin(auth.uid()));

-- announcement-media: herkes okur, sadece adminler yazar
create policy "announcement-media: public read"
  on storage.objects for select
  using (bucket_id = 'announcement-media');

create policy "announcement-media: admin write"
  on storage.objects for insert
  with check (bucket_id = 'announcement-media' and is_admin(auth.uid()));

create policy "announcement-media: admin delete"
  on storage.objects for delete
  using (bucket_id = 'announcement-media' and is_admin(auth.uid()));
