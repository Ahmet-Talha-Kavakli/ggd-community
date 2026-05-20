-- =============================================================================
-- Audit log fix.
--
-- 0001_initial_schema.sql'de audit_log tablosuna RLS açılmış ama insert
-- policy'si eklenmemiş. Bu yüzden tüm logAuditEvent çağrıları sessizce
-- başarısız oluyordu (.insert() error dönüşü kontrol edilmediği için).
-- =============================================================================

create policy "audit_log self insert" on audit_log
  for insert with check (
    actor_id = auth.uid()
    or is_admin(auth.uid())
  );
