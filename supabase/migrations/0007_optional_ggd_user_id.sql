-- =============================================================================
-- Ban / Uyarı kayıtlarında GGD User ID opsiyonel hale getirilir.
--
-- Sebep: Admin'in elinde her zaman Friend Code/User ID olmaz. Oyuncu söylemeden
-- bilinemez. Şimdi sadece oyun içi nick + (opsiyonel) ana isim ile de ban
-- verilebilir.
--
-- Hedef oyuncuyu tanımlamak için en az şu doldurulmalı: target_nickname.
-- ID varsa idealdir ama yoksa kayıt geçerli kalır.
-- =============================================================================

alter table bans alter column ggd_user_id drop not null;
alter table warnings alter column ggd_user_id drop not null;

-- (profiles.ggd_user_id NOT NULL kalır — site üyesi için Friend Code zorunlu)

-- Indexler nullable kolonlarda da çalışır, bir şey yapmaya gerek yok.
