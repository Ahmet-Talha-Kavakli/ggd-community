-- =============================================================================
-- Şikayet kayıtlarında hedef oyuncunun GGD User ID'si opsiyonel hale getirilir.
--
-- Sebep: Şikayet eden üye genelde sadece nick'i bilir; User ID'yi (Friend Code)
-- bilmesi imkânsıza yakındır. Zorunlu tutmak şikayet sistemini kullanılmaz kıldı.
--
-- Hedef oyuncuyu tanımlamak için en az şu doldurulmalı: target_nickname.
-- =============================================================================

alter table reports alter column target_ggd_user_id drop not null;
