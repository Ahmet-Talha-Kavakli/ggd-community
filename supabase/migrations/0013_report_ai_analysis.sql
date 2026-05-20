-- =============================================================================
-- Şikayet AI ön analizi.
--
-- Yeni şikayet açılınca OpenAI'ye gönderilir, ciddiyet skoru ve önerilen
-- aksiyon çıkarılır. Admin paneli bu skora göre öncelik gösterir.
-- =============================================================================

alter table reports
  add column if not exists ai_severity integer check (
    ai_severity is null or (ai_severity >= 1 and ai_severity <= 5)
  ),
  add column if not exists ai_summary text,
  add column if not exists ai_recommendation text,
  add column if not exists ai_analyzed_at timestamptz;

create index if not exists reports_ai_severity_idx
  on reports (ai_severity desc nulls last);
